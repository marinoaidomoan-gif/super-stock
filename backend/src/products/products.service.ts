// src/products/products.service.ts
//
// Logique métier des produits : créer, lister (avec filtres et pagination),
// consulter, modifier, désactiver, et lister les alertes de stock bas.
import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { FindProductsQueryDto } from './dto/find-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './product.entity.js';

// Dans une recherche ILIKE, les caractères % et _ sont des jokers. On les
// "échappe" avec un \ pour qu'ils soient cherchés comme de simples caractères.
const echapper = (texte: string): string => texte.replace(/[\\%_]/g, '\\$&');

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    // Pour vérifier que la catégorie choisie existe.
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    // 404 si la catégorie n'existe pas.
    await this.categoriesService.findOne(dto.categoryId);

    // La référence PROD-001 est fabriquée à partir de l'id du produit, qu'on
    // ne connaît qu'APRÈS l'enregistrement. On procède donc en 2 temps, dans
    // une TRANSACTION (tout réussit ou tout est annulé) :
    //  1) on enregistre le produit avec une référence provisoire unique ;
    //  2) on la remplace par PROD-<id sur 3 chiffres>.
    const id = await this.productsRepository.manager.transaction(
      async (manager) => {
        // quantiteStock n'est pas fourni : la base met 0 par défaut.
        const produit = manager.create(Product, {
          nom: dto.nom,
          reference: `TMP-${randomUUID()}`,
          description: dto.description ?? null,
          unite: dto.unite,
          seuilAlerte: dto.seuilAlerte ?? 0,
          categoryId: dto.categoryId,
        });
        const enregistre = await manager.save(produit);

        // padStart(3, '0') : 1 -> "001", 25 -> "025", 1200 -> "1200".
        await manager.update(Product, enregistre.id, {
          reference: `PROD-${String(enregistre.id).padStart(3, '0')}`,
        });
        return enregistre.id;
      },
    );

    // On relit le produit pour obtenir sa référence finale et sa catégorie.
    return this.findOne(id);
  }

  // Liste paginée avec filtres. Renvoie aussi le total pour que le frontend
  // puisse afficher "page 2 sur 5".
  async findAll(query: FindProductsQueryDto) {
    const { page = 1, limit = 10, recherche, categoryId, enAlerte, actif = true } = query;

    // QueryBuilder : construit une requête SQL pas à pas.
    const requete = this.productsRepository
      .createQueryBuilder('produit')
      .leftJoinAndSelect('produit.category', 'categorie')
      .where('produit.actif = :actif', { actif });

    const texte = recherche?.trim();
    if (texte) {
      requete.andWhere(
        '(produit.nom ILIKE :texte OR produit.reference ILIKE :texte)',
        { texte: `%${echapper(texte)}%` },
      );
    }
    if (categoryId) {
      requete.andWhere('produit.categoryId = :categoryId', { categoryId });
    }
    if (enAlerte === true) {
      requete.andWhere('produit.quantiteStock <= produit.seuilAlerte');
    } else if (enAlerte === false) {
      requete.andWhere('produit.quantiteStock > produit.seuilAlerte');
    }

    // skip = nombre de lignes à sauter ; take = nombre de lignes à garder.
    const [data, total] = await requete
      .orderBy('produit.nom', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Product> {
    const produit = await this.productsRepository.findOne({ where: { id } });
    if (!produit) {
      throw new NotFoundException(`Produit ${id} introuvable.`);
    }
    return produit;
  }

  // Produits actifs en alerte, du PLUS critique au moins critique.
  // Criticité = quantité / seuil (0 = stock vide, 1 = pile au seuil).
  async findAlertes(categoryId?: number): Promise<Product[]> {
    const requete = this.productsRepository
      .createQueryBuilder('produit')
      .leftJoinAndSelect('produit.category', 'categorie')
      .where('produit.actif = :actif', { actif: true })
      .andWhere('produit.quantiteStock <= produit.seuilAlerte');

    if (categoryId) {
      requete.andWhere('produit.categoryId = :categoryId', { categoryId });
    }

    const produits = await requete.getMany();

    // Si le seuil vaut 0, le produit n'est en alerte que s'il est à 0 : il est
    // donc au plus critique (ratio 0).
    const ratio = (p: Product): number =>
      p.seuilAlerte > 0 ? p.quantiteStock / p.seuilAlerte : 0;

    // À ratio égal, on trie par nom.
    return produits.sort((a, b) => ratio(a) - ratio(b) || a.nom.localeCompare(b.nom));
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const produit = await this.findOne(id);

    // PartialType accepte aussi null ; ces champs sont pourtant obligatoires.
    // (La référence n'est plus modifiable : elle n'est plus dans le DTO.)
    if (dto.nom === null || dto.unite === null || dto.categoryId === null) {
      throw new BadRequestException(
        "Le nom, l'unité et la catégorie ne peuvent pas être vides.",
      );
    }

    // Copie les champs reçus dans le produit existant.
    Object.assign(produit, dto);

    // PIÈGE TypeORM : le produit contient l'ancienne catégorie (eager). Si on
    // change seulement categoryId, TypeORM garde l'ANCIENNE catégorie à
    // l'enregistrement. On remplace donc aussi l'objet "category".
    if (dto.categoryId !== undefined) {
      produit.category = await this.categoriesService.findOne(dto.categoryId);
    }

    await this.productsRepository.save(produit);
    return this.findOne(id);
  }

  // DELETE = désactivation (règle R7) : le produit n'est jamais supprimé, ses
  // mouvements restent consultables. On peut le réactiver avec PATCH { actif: true }.
  async remove(id: number): Promise<void> {
    const produit = await this.findOne(id);
    produit.desactiver();
    await this.productsRepository.save(produit);
  }
}
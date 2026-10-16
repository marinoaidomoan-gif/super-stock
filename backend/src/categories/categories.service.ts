// src/categories/categories.service.ts
//
// Logique métier des catégories : créer, lire, modifier, supprimer.
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { estErreurCleEtrangere } from '../common/postgres-errors.js';
import { Category } from './category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
export type CategoryWithCount = Category & { nombreProduits: number };

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  // Vérifie qu'aucune AUTRE catégorie n'a déjà ce nom (règle R8).
  // On compare sans tenir compte des majuscules : "Boissons" et "boissons"
  // sont considérés comme le même nom. (La contrainte unique de la base, elle,
  // distingue les majuscules : c'est pourquoi on contrôle aussi ici.)
  // "idExclu" sert à la modification : une catégorie peut garder son propre nom.
  private async verifierNomDisponible(nom: string, idExclu?: number) {
    const requete = this.categoriesRepository
      .createQueryBuilder('categorie')
      .where('LOWER(categorie.nom) = LOWER(:nom)', { nom });

    if (idExclu !== undefined) {
      requete.andWhere('categorie.id != :idExclu', { idExclu });
    }

    if (await requete.getOne()) {
      // 409 Conflict : la ressource existe déjà.
      throw new ConflictException('Une catégorie portant ce nom existe déjà.');
    }
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    await this.verifierNomDisponible(dto.nom);

    const categorie = this.categoriesRepository.create({
      nom: dto.nom,
      description: dto.description ?? null,
    });
    return this.categoriesRepository.save(categorie);
  }

  // Toutes les catégories (A à Z), avec le nombre de produits rattachés à chacune.
  async findAll(): Promise<CategoryWithCount[]> {
    const { entities, raw } = await this.categoriesRepository
      .createQueryBuilder('categorie')
      .addSelect(
        (sousRequete) =>
          sousRequete
            .select('COUNT(*)')
            .from('produit', 'p')
            .where('p.id_categorie = categorie.id_categorie'),
        'nombre_produits',
      )
      .orderBy('categorie.nom', 'ASC')
      .getRawAndEntities();

    return entities.map((categorie, i) => ({
      ...categorie,
      // COUNT revient en texte depuis PostgreSQL : on le convertit en nombre.
      nombreProduits: Number(raw[i].nombre_produits),
    }));
  }

  async findOne(id: number): Promise<Category> {
    const categorie = await this.categoriesRepository.findOne({ where: { id } });
    if (!categorie) {
      // 404 Not Found
      throw new NotFoundException(`Catégorie ${id} introuvable.`);
    }
    return categorie;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const categorie = await this.findOne(id);

    // PartialType accepte aussi null ; le nom est pourtant obligatoire.
    if (dto.nom === null) {
      throw new BadRequestException('Le nom de la catégorie est obligatoire.');
    }

    // On ne vérifie le nom que s'il est envoyé.
    if (dto.nom !== undefined) {
      await this.verifierNomDisponible(dto.nom, id);
    }

    // Copie les champs reçus dans la catégorie existante, puis enregistre.
    Object.assign(categorie, dto);
    return this.categoriesRepository.save(categorie);
  }

  // Suppression d'une catégorie (règle R6 : interdite si elle contient des
  // produits).
  async remove(id: number): Promise<void> {
    const categorie = await this.findOne(id);

    try {
      await this.categoriesRepository.remove(categorie);
    } catch (erreur) {
      // Un produit pointe encore vers cette catégorie : la clé étrangère
      // (suppression restreinte) bloque la suppression côté PostgreSQL.
      // On transforme cette erreur technique en message clair (409).
      if (estErreurCleEtrangere(erreur)) {
        throw new ConflictException(
          'Impossible de supprimer cette catégorie : elle contient des produits.',
        );
      }
      // Toute autre erreur est inattendue : on la laisse remonter (500).
      throw erreur;
    }
  }
}
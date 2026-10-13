// src/categories/categories.service.ts
//
// Logique métier des catégories : créer, lire, modifier, supprimer.
import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Category } from './category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

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

  // Toutes les catégories, triées par nom (A à Z).
  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { nom: 'ASC' } });
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
      // Code PostgreSQL 23503 = "foreign_key_violation" : un produit pointe
      // encore vers cette catégorie. La clé étrangère (avec suppression
      // restreinte) bloque la suppression, et on la transforme en message clair.
      // Ça fonctionnera automatiquement dès que l'entité Product existera,
      // sans avoir à modifier ce fichier.
      if (
        erreur instanceof QueryFailedError &&
        (erreur.driverError as { code?: string }).code === '23503'
      ) {
        throw new ConflictException(
          'Impossible de supprimer cette catégorie : elle contient des produits.',
        );
      }
      throw erreur;
    }
  }
}
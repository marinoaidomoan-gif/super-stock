// src/suppliers/suppliers.service.ts
//
// Logique métier des fournisseurs : créer, lire, rechercher, modifier, supprimer.
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { estErreurCleEtrangere } from '../common/postgres-errors.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import { Supplier } from './supplier.entity.js';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
  ) {}

  create(dto: CreateSupplierDto): Promise<Supplier> {
    // "?? null" : si un champ facultatif est absent, on enregistre NULL.
    const fournisseur = this.suppliersRepository.create({
      nom: dto.nom,
      telephone: dto.telephone ?? null,
      email: dto.email ?? null,
      adresse: dto.adresse ?? null,
    });
    return this.suppliersRepository.save(fournisseur);
  }

  // Liste triée par nom. Si "recherche" est fournie, on garde seulement les
  // fournisseurs dont le nom CONTIENT ce texte (ILIKE = insensible à la casse).
  // Utile pour la liste déroulante du formulaire d'entrée de stock.
  findAll(recherche?: string): Promise<Supplier[]> {
    const texte = recherche?.trim();
    return this.suppliersRepository.find({
      where: texte ? { nom: ILike(`%${texte}%`) } : {},
      order: { nom: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Supplier> {
    const fournisseur = await this.suppliersRepository.findOne({ where: { id } });
    if (!fournisseur) {
      throw new NotFoundException(`Fournisseur ${id} introuvable.`);
    }
    return fournisseur;
  }

  async update(id: number, dto: UpdateSupplierDto): Promise<Supplier> {
    const fournisseur = await this.findOne(id);

    // PartialType rend tous les champs facultatifs, ce qui accepte aussi
    // "nom": null. Or le nom est obligatoire en base : sans cette vérification,
    // on obtiendrait une erreur 500 au lieu d'un message clair.
    if (dto.nom === null) {
      throw new BadRequestException('Le nom du fournisseur est obligatoire.');
    }

    // Copie les champs reçus (y compris null pour effacer une coordonnée).
    Object.assign(fournisseur, dto);
    return this.suppliersRepository.save(fournisseur);
  }

  async remove(id: number): Promise<void> {
    const fournisseur = await this.findOne(id);

    try {
      await this.suppliersRepository.remove(fournisseur);
    } catch (erreur) {
      // Des mouvements de stock pointent encore vers ce fournisseur : la clé
      // étrangère (suppression restreinte) bloque la suppression, et on garde
      // ainsi l'historique intact. Ça fonctionnera dès que l'entité
      // StockMovement existera.
      if (estErreurCleEtrangere(erreur)) {
        throw new ConflictException(
          'Impossible de supprimer ce fournisseur : il est lié à des mouvements de stock.',
        );
      }
      throw erreur;
    }
  }
}
// src/categories/category.entity.ts
//
// Entité Category = classe "Catégorie" du diagramme de classes.
// Elle devient la table "categorie" dans PostgreSQL.
// Exemples de catégories : Boissons, Produits laitiers, Hygiène...
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categorie')
export class Category {
  // Propriété "id" dans le code, colonne "id_categorie" dans la base (MLD).
  @PrimaryGeneratedColumn({ name: 'id_categorie' })
  id!: number;

  // unique: true : deux catégories ne peuvent pas avoir le même nom (règle R8).
  @Column({ length: 100, unique: true })
  nom!: string;

  // Description facultative : "text" = texte long, nullable = peut être vide.
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

// Remarque : la relation avec les produits (une catégorie contient plusieurs
// produits) sera déclarée dans l'entité Product, avec la clé étrangère
// "id_categorie". On y reviendra à l'étape des produits.
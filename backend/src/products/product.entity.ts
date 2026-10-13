// src/products/product.entity.ts
//
// Entité Product = classe "Produit" du diagramme de classes.
// Elle devient la table "produit" dans PostgreSQL.
import { BadRequestException } from '@nestjs/common';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity.js';
import { decimalTransformer } from '../common/decimal.transformer.js';
import { Unite } from './unite.enum.js';

// Arrondit à 3 décimales (comme la colonne numeric(12,3)). Sans ça,
// JavaScript donne 0.1 + 0.2 = 0.30000000000000004.
const arrondir = (nombre: number): number => Math.round(nombre * 1000) / 1000;

// Contraintes CHECK du MLD : le stock et le seuil ne peuvent pas être négatifs.
@Entity('produit')
@Check(`"quantite_stock" >= 0`)
@Check(`"seuil_alerte" >= 0`)
export class Product {
  @PrimaryGeneratedColumn({ name: 'id_produit' })
  id!: number;

  @Column({ length: 150 })
  nom!: string;

  // Code interne du produit, unique (règle R8).
  @Column({ length: 50, unique: true })
  reference!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // type: 'enum' crée un type énuméré PostgreSQL nommé "unite_produit"
  // (comme dans le MLD) : la base refuse toute autre valeur.
  @Column({ type: 'enum', enum: Unite, enumName: 'unite_produit' })
  unite!: Unite;

  // Quantité en stock. numeric(12,3) : jusqu'à 3 décimales (kg, litres).
  // Démarre à 0 : elle ne change que par les mouvements de stock (règle R1).
  @Column({
    name: 'quantite_stock',
    type: 'numeric',
    precision: 12,
    scale: 3,
    default: 0,
    transformer: decimalTransformer,
  })
  quantiteStock!: number;

  // Seuil d'alerte : le produit est "en alerte" si quantiteStock <= seuilAlerte.
  @Column({
    name: 'seuil_alerte',
    type: 'numeric',
    precision: 12,
    scale: 3,
    default: 0,
    transformer: decimalTransformer,
  })
  seuilAlerte!: number;

  // Suppression logique (règle R7) : on désactive un produit au lieu de le
  // supprimer, pour garder l'historique de ses mouvements.
  @Column({ default: true })
  actif!: boolean;

  // La clé étrangère "id_categorie" est exposée de 2 façons :
  //  - categoryId : le simple numéro (pratique pour filtrer et pour les DTO)
  //  - category   : l'objet Category complet
  // Les deux pointent vers la MÊME colonne de la base.
  @Column({ name: 'id_categorie' })
  categoryId!: number;

  // ManyToOne : plusieurs produits pour une catégorie (cardinalité 1 — 0..*).
  //  - nullable: false : un produit a obligatoirement une catégorie
  //  - onDelete: 'RESTRICT' : on ne peut pas supprimer une catégorie qui
  //    contient des produits (règle R6)
  //  - eager: true : la catégorie est chargée automatiquement avec le produit
  @ManyToOne(() => Category, { nullable: false, onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'id_categorie' })
  category!: Category;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // ===== Méthodes du diagramme de classes =====

  // Vrai si le stock est au niveau du seuil d'alerte, ou en dessous (règle R5).
  estEnAlerte(): boolean {
    return this.quantiteStock <= this.seuilAlerte;
  }

  // Ajoute une quantité au stock (utilisée par les entrées de stock).
  augmenterStock(quantite: number): void {
    this.verifierQuantite(quantite);
    this.quantiteStock = arrondir(this.quantiteStock + quantite);
  }

  // Retire une quantité du stock (utilisée par les sorties de stock).
  // Règle R2 : le stock ne peut jamais devenir négatif.
  diminuerStock(quantite: number): void {
    this.verifierQuantite(quantite);
    if (quantite > this.quantiteStock) {
      throw new BadRequestException(
        `Stock insuffisant pour « ${this.nom} » : ${this.quantiteStock} disponible, ${quantite} demandé.`,
      );
    }
    this.quantiteStock = arrondir(this.quantiteStock - quantite);
  }

  // Suppression logique : le produit n'apparaît plus dans les listes.
  desactiver(): void {
    this.actif = false;
  }

  private verifierQuantite(quantite: number): void {
    if (!(quantite > 0)) {
      throw new BadRequestException('La quantité doit être supérieure à zéro.');
    }
  }

  // JSON.stringify appelle automatiquement toJSON() quand NestJS envoie la
  // réponse : on ajoute ainsi le champ calculé "enAlerte", utile au frontend
  // pour afficher le badge rouge, sans l'enregistrer en base.
  toJSON() {
    return { ...this, enAlerte: this.estEnAlerte() };
  }
}
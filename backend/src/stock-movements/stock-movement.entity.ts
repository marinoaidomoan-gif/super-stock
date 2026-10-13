// src/stock-movements/stock-movement.entity.ts
//
// Entité StockMovement = classe "StockMouvement" du diagramme de classes.
// Elle devient la table "stock_mouvement" dans PostgreSQL.
//
// Un mouvement n'est JAMAIS modifié ni supprimé (règle R4) : c'est la mémoire
// de tout ce qui est entré ou sorti. Pour corriger une erreur, on crée un
// nouveau mouvement inverse (voir creerCorrection). C'est pourquoi il n'y a
// pas de colonne "updated_at" : seule la date de création compte.
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '../common/decimal.transformer.js';
import { Product } from '../products/product.entity.js';
import { Supplier } from '../suppliers/supplier.entity.js';
import { User } from '../users/user.entity.js';
import { Motif } from './motif.enum.js';
import { TypeMouvement } from './type-mouvement.enum.js';

// Les 3 contraintes CHECK du MLD, appliquées directement par PostgreSQL :
//  1) la quantité est strictement positive ;
//  2) le motif doit être cohérent avec le type (ENTREE ou SORTIE) ;
//  3) un fournisseur n'est indiqué que pour une RECEPTION.
// Même si une erreur de programmation passait, la base refuserait la ligne.
@Entity('stock_mouvement')
@Check(`"quantite" > 0`)
@Check(
  `("type" = 'ENTREE' AND "motif" IN ('RECEPTION', 'RETOUR_CLIENT', 'CORRECTION')) OR ` +
    `("type" = 'SORTIE' AND "motif" IN ('VENTE', 'PERTE', 'CASSE', 'CORRECTION'))`,
)
@Check(`"id_fournisseur" IS NULL OR "motif" = 'RECEPTION'`)
export class StockMovement {
  @PrimaryGeneratedColumn({ name: 'id_stock_mouvement' })
  id!: number;

  @Column({ type: 'enum', enum: TypeMouvement, enumName: 'type_mouvement' })
  type!: TypeMouvement;

  // Quantité déplacée (toujours positive : c'est le TYPE qui dit si ça entre
  // ou si ça sort). numeric(12,3) car on peut vendre 2,5 kg.
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 3,
    transformer: decimalTransformer,
  })
  quantite!: number;

  @Column({ type: 'enum', enum: Motif, enumName: 'motif_mouvement' })
  motif!: Motif;

  // Date et heure du mouvement : remplies automatiquement à la création par le
  // serveur (le client ne peut pas tricher sur la date).
  @CreateDateColumn({ name: 'date_mouvement' })
  dateMouvement!: Date;

  @Column({ type: 'text', nullable: true })
  commentaire!: string | null;

  // ----- Produit concerné (obligatoire) -----
  // Comme pour Product : "productId" est le simple numéro, "product" l'objet.
  // Les deux pointent vers la même colonne "id_produit".
  // onDelete: 'RESTRICT' : on ne peut pas supprimer un produit qui a des
  // mouvements (de toute façon on les désactive, règle R7).
  @Column({ name: 'id_produit' })
  productId!: number;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_produit' })
  product!: Product;

  // ----- Utilisateur qui a enregistré le mouvement (obligatoire) -----
  @Column({ name: 'id_utilisateur' })
  userId!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_utilisateur' })
  user!: User;

  // ----- Fournisseur (facultatif : seulement pour une RECEPTION) -----
  // Grâce à RESTRICT, un fournisseur lié à des mouvements ne peut plus être
  // supprimé : le service des fournisseurs renverra alors un 409 clair.
  @Column({ name: 'id_fournisseur', type: 'int', nullable: true })
  supplierId!: number | null;

  @ManyToOne(() => Supplier, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_fournisseur' })
  supplier!: Supplier | null;

  // ===== Méthodes du diagramme de classes =====

  // Applique ce mouvement sur le stock du produit (règles R1 et R2) :
  //  - ENTREE -> augmente la quantité ;
  //  - SORTIE -> diminue la quantité (refus 400 si le stock est insuffisant).
  // Il faut avoir renseigné "this.product" avant d'appeler cette méthode.
  // Elle ne fait QUE modifier l'objet en mémoire : l'enregistrement dans la
  // base est fait par le service, dans une transaction.
  appliquer(): void {
    if (this.type === TypeMouvement.ENTREE) {
      this.product.augmenterStock(this.quantite);
    } else {
      this.product.diminuerStock(this.quantite);
    }
  }

  // Fabrique le mouvement INVERSE de celui-ci (règle R4) :
  //  - une ENTREE est corrigée par une SORTIE, et inversement ;
  //  - même produit, même quantité, motif CORRECTION ;
  //  - le commentaire indique le mouvement corrigé (il n'y a pas de colonne
  //    dédiée dans le MLD) et, si on veut, la raison de la correction.
  // Le nouveau mouvement n'est PAS encore enregistré : c'est le service qui le
  // fera (et qui appelle appliquer() pour mettre le stock à jour).
  creerCorrection(utilisateur: User, raison?: string | null): StockMovement {
    const correction = new StockMovement();
    correction.type =
      this.type === TypeMouvement.ENTREE
        ? TypeMouvement.SORTIE
        : TypeMouvement.ENTREE;
    correction.quantite = this.quantite;
    correction.motif = Motif.CORRECTION;
    correction.productId = this.productId;
    correction.userId = utilisateur.id;
    correction.supplierId = null; // un fournisseur n'a de sens que pour une réception
    correction.commentaire = raison
      ? `Correction du mouvement n°${this.id} — ${raison}`
      : `Correction du mouvement n°${this.id}`;
    return correction;
  }
}
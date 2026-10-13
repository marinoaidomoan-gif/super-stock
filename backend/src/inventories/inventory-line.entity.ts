// src/inventories/inventory-line.entity.ts
//
// Entité InventoryLine = classe "LigneInventaire" du diagramme de classes.
// Elle devient la table "ligne_inventaire" : UNE ligne par produit, dans un
// inventaire donné.
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { decimalTransformer } from '../common/decimal.transformer.js';
import { Product } from '../products/product.entity.js';
import { Inventory } from './inventory.entity.js';

// Arrondit à 3 décimales (comme la colonne numeric(12,3)) pour éviter les
// erreurs de JavaScript du type 0.1 + 0.2 = 0.30000000000000004.
const arrondir = (nombre: number): number => Math.round(nombre * 1000) / 1000;

// @Unique : un produit ne peut apparaître qu'UNE SEULE fois dans un même
// inventaire (règle R15).
@Entity('ligne_inventaire')
@Unique(['inventoryId', 'productId'])
@Check(`"quantite_theorique" >= 0`)
@Check(`"quantite_reelle" IS NULL OR "quantite_reelle" >= 0`)
export class InventoryLine {
  @PrimaryGeneratedColumn({ name: 'id_ligne_inventaire' })
  id!: number;

  // Stock selon le système au moment du lancement de l'inventaire.
  @Column({
    name: 'quantite_theorique',
    type: 'numeric',
    precision: 12,
    scale: 3,
    transformer: decimalTransformer,
  })
  quantiteTheorique!: number;

  // Stock réellement compté. Vide (null) tant que le produit n'est pas compté.
  @Column({
    name: 'quantite_reelle',
    type: 'numeric',
    precision: 12,
    scale: 3,
    nullable: true,
    transformer: decimalTransformer,
  })
  quantiteReelle!: number | null;

  // Écart = quantité réelle - quantité théorique.
  //  - positif : on a TROUVÉ plus que prévu (il faudra une entrée de correction)
  //  - négatif : il MANQUE du stock (il faudra une sortie de correction)
  // Vide tant que le produit n'est pas compté.
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 3,
    nullable: true,
    transformer: decimalTransformer,
  })
  ecart!: number | null;

  // Inventaire auquel appartient la ligne (association "contient").
  @Column({ name: 'id_inventaire' })
  inventoryId!: number;

  @ManyToOne(() => Inventory, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_inventaire' })
  inventory!: Inventory;

  // Produit compté (association "concerne").
  @Column({ name: 'id_produit' })
  productId!: number;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_produit' })
  product!: Product;

  // Enregistre la quantité comptée ET calcule l'écart automatiquement.
  enregistrerQuantiteReelle(quantite: number): void {
    this.quantiteReelle = quantite;
    this.ecart = arrondir(quantite - this.quantiteTheorique);
  }
}
// src/suppliers/supplier.entity.ts
//
// Entité Supplier = classe "Fournisseur" du diagramme de classes.
// Elle devient la table "fournisseur" dans PostgreSQL.
// Un fournisseur est l'entreprise qui livre des produits au supermarché.
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('fournisseur')
export class Supplier {
  // Propriété "id" dans le code, colonne "id_fournisseur" dans la base (MLD).
  @PrimaryGeneratedColumn({ name: 'id_fournisseur' })
  id!: number;

  // Seul le nom est obligatoire.
  @Column({ length: 150 })
  nom!: string;

  // Coordonnées facultatives : nullable: true autorise la valeur NULL.
  // On précise type: 'varchar' car "string | null" n'est pas reconnu seul.
  @Column({ type: 'varchar', length: 30, nullable: true })
  telephone!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  adresse!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

// Remarque : le lien avec les mouvements de stock (un fournisseur livre
// plusieurs fois) sera déclaré dans l'entité StockMovement, avec la clé
// étrangère "id_fournisseur" (facultative : seule une réception en a un).
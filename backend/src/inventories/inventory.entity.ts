// src/inventories/inventory.entity.ts
//
// Entité Inventory = classe "Inventaire" du diagramme de classes.
// Elle devient la table "inventaire" dans PostgreSQL.
// Un inventaire est une opération de comptage : on compare le stock théorique
// (celui du système) au stock réel (compté dans le magasin).
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity.js';
import { StatutInventaire } from './statut-inventaire.enum.js';

// INDEX UNIQUE PARTIEL : PostgreSQL n'autorise qu'UNE SEULE ligne dont le
// statut est EN_COURS. C'est une double sécurité : même si deux personnes
// lançaient un inventaire exactement au même moment, la base en refuserait un.
@Entity('inventaire')
@Index('un_seul_inventaire_en_cours', ['statut'], {
  unique: true,
  where: `"statut" = 'EN_COURS'`,
})
// Contrainte CHECK : un inventaire en cours n'a pas de date de validation,
// un inventaire validé en a une.
@Check(
  `("statut" = 'EN_COURS' AND "date_validation" IS NULL) OR ` +
    `("statut" = 'VALIDE' AND "date_validation" IS NOT NULL)`,
)
export class Inventory {
  @PrimaryGeneratedColumn({ name: 'id_inventaire' })
  id!: number;

  // Date et heure du lancement, remplies automatiquement par le serveur.
  @CreateDateColumn({ name: 'date_inventaire' })
  dateInventaire!: Date;

  @Column({ type: 'text', nullable: true })
  commentaire!: string | null;

  @Column({
    type: 'enum',
    enum: StatutInventaire,
    enumName: 'statut_inventaire',
    default: StatutInventaire.EN_COURS,
  })
  statut!: StatutInventaire;

  // Renseignée seulement quand l'inventaire est validé.
  @Column({ name: 'date_validation', type: 'timestamp', nullable: true })
  dateValidation!: Date | null;

  // Le propriétaire qui a lancé l'inventaire (association "réalise").
  @Column({ name: 'id_utilisateur' })
  userId!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_utilisateur' })
  user!: User;

  // Remarque : on ne déclare PAS ici la liste des lignes (OneToMany). Le lien
  // "Inventaire contient LigneInventaire" est déclaré côté LigneInventaire
  // (clé étrangère id_inventaire), et on lit les lignes avec une requête
  // séparée. Cela évite une dépendance circulaire entre les deux fichiers.

  // Les méthodes du diagramme de classes (generer, enregistrerQuantites,
  // valider) sont écrites dans InventoriesService, car elles manipulent
  // plusieurs produits et plusieurs mouvements dans une transaction.
}
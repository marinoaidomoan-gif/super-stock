// src/users/user.entity.ts
//
// Une "entité" est une classe TypeScript qui décrit une table de la base de
// données. TypeORM lit les décorateurs (@Entity, @Column...) pour créer la
// table (grâce à synchronize: true dans app.module.ts).
//
// Cette classe correspond à la classe mère "User" du diagramme de classes.
// Les sous-classes (Administrateur Système, Gérant, Propriétaire) ne sont pas
// des classes séparées : elles sont représentées par la colonne "role"
// (une seule table "utilisateur", comme dans le MLD).
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.enum.js';

// @Entity('utilisateur') : le nom de la table dans PostgreSQL.
// @Check(...) : contrainte SQL qui interdit toute valeur de "role" autre que
// les 3 rôles prévus (c'est la contrainte CHECK du MLD).
@Entity('utilisateur')
@Check(`"role" IN ('PROPRIETAIRE', 'GERANT', 'ADMINISTRATEUR')`)
export class User {
  // Clé primaire auto-incrémentée. La propriété s'appelle "id" dans le code,
  // mais la colonne s'appelle "id_utilisateur" dans la base (comme dans le MLD).
  // Le "!" dit à TypeScript : "cette propriété sera remplie par TypeORM,
  // ne te plains pas qu'elle n'est pas initialisée".
  @PrimaryGeneratedColumn({ name: 'id_utilisateur' })
  id!: number;

  @Column({ length: 100 })
  nom!: string;

  // unique: true : deux utilisateurs ne peuvent pas avoir le même email
  // (l'email sert d'identifiant de connexion).
  @Column({ length: 150, unique: true })
  email!: string;

  // Mot de passe HACHÉ (jamais en clair : on le hachera avec bcrypt plus tard).
  // select: false : par défaut, quand on lit un utilisateur, ce champ n'est PAS
  // renvoyé. Ça évite de l'envoyer par erreur au frontend. On le demandera
  // explicitement uniquement lors de la connexion.
  @Column({ name: 'mot_de_passe', length: 255, select: false })
  motDePasse!: string;

  // Facultatif : nullable: true autorise la valeur NULL dans la base.
  // Il faut préciser type: 'varchar' car le type "string | null" n'est pas
  // reconnu automatiquement par TypeORM.
  @Column({ type: 'varchar', length: 30, nullable: true })
  telephone!: string | null;

  // Le rôle est enregistré en texte (varchar). La contrainte @Check ci-dessus
  // garantit qu'il vaut PROPRIETAIRE, GERANT ou ADMINISTRATEUR.
  @Column({ type: 'varchar', length: 20 })
  role!: Role;

  // Un compte désactivé ne peut plus se connecter. Actif par défaut.
  @Column({ default: true })
  actif!: boolean;

  // Dates techniques remplies automatiquement par TypeORM
  // (colonnes created_at et updated_at).
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
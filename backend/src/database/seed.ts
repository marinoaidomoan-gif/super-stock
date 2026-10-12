// src/database/seed.ts
//
// Script de "seed" : il crée les comptes de départ (un par rôle) pour
// pouvoir se connecter dès le premier lancement. Il se lance à la main avec
// "npm run seed" et peut être relancé sans danger : un compte déjà présent
// est simplement ignoré (il n'y a jamais de doublon).
//
// On ne démarre pas le serveur HTTP : "createApplicationContext" charge
// seulement les modules (base de données, services), ce qui suffit ici.
import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { Role } from '../users/role.enum.js';
import { UsersService } from '../users/users.service.js';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const config = app.get(ConfigService);
    const usersService = app.get(UsersService);

    // Mot de passe commun aux comptes de démonstration, modifiable dans le
    // .env avec SEED_PASSWORD. À CHANGER avant toute mise en ligne réelle.
    const motDePasse = config.get<string>('SEED_PASSWORD', 'SuperStock2026');

    const comptes: CreateUserDto[] = [
      {
        nom: 'Propriétaire SuperStock',
        email: 'proprietaire@superstock.bj',
        motDePasse,
        role: Role.PROPRIETAIRE,
      },
      {
        nom: 'Gérant SuperStock',
        email: 'gerant@superstock.bj',
        motDePasse,
        role: Role.GERANT,
      },
      {
        nom: 'Administrateur Système',
        email: 'admin@superstock.bj',
        motDePasse,
        role: Role.ADMINISTRATEUR,
      },
    ];

    for (const compte of comptes) {
      try {
        // On réutilise UsersService.create : le mot de passe est donc haché
        // avec bcrypt exactement comme pour un vrai compte.
        await usersService.create(compte);
        console.log(`✔ Compte créé : ${compte.email} (${compte.role})`);
      } catch (erreur) {
        // ConflictException = l'email existe déjà : ce n'est pas une erreur.
        if (erreur instanceof ConflictException) {
          console.log(`= Déjà présent : ${compte.email}`);
        } else {
          throw erreur;
        }
      }
    }
  } finally {
    // On ferme proprement la connexion à la base, sinon le script ne se
    // termine pas.
    await app.close();
  }
}

seed().catch((erreur) => {
  console.error('Échec du seed :', erreur);
  process.exit(1);
});
// src/users/users.module.ts
//
// Un module regroupe tout ce qui concerne une fonctionnalité (ici : les
// utilisateurs). Pour l'instant il ne contient que l'entité ; on ajoutera le
// service et le contrôleur dans les prochains fichiers.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity.js';

@Module({
  // forFeature([User]) : enregistre l'entité User auprès de TypeORM.
  // Grâce à autoLoadEntities: true dans app.module.ts, la table "utilisateur"
  // sera créée automatiquement au démarrage de l'application.
  imports: [TypeOrmModule.forFeature([User])],

  // On exporte TypeOrmModule pour que les autres modules (ex. Auth) puissent
  // utiliser le repository de User en important UsersModule.
  exports: [TypeOrmModule],
})
export class UsersModule {}
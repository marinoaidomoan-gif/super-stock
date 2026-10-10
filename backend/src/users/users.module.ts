// src/users/users.module.ts
//
// Un module regroupe tout ce qui concerne une fonctionnalité (ici : les
// utilisateurs). Pour l'instant il ne contient que l'entité ; on ajoutera le
// service et le contrôleur dans les prochains fichiers.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity.js';
import { UsersService } from './users.service.js';

@Module({
  // Enregistre l'entité User (table "utilisateur") auprès de TypeORM.
  imports: [TypeOrmModule.forFeature([User])],

  // NOUVEAU : déclare le service pour que NestJS puisse l'instancier.
  providers: [UsersService],

  // NOUVEAU : on exporte UsersService pour que d'autres modules (Auth, seed)
  // puissent l'utiliser en important UsersModule.
  exports: [UsersService],
})
export class UsersModule {}
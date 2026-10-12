// src/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { Category } from './category.entity.js';

@Module({
  // Enregistre l'entité Category (table "categorie") auprès de TypeORM.
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  // Exporté : le module des produits aura besoin de vérifier les catégories.
  exports: [CategoriesService],
})
export class CategoriesModule {}
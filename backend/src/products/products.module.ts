// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module.js';
import { Product } from './product.entity.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [
    // Enregistre l'entité Product (table "produit") auprès de TypeORM.
    TypeOrmModule.forFeature([Product]),
    // Pour utiliser CategoriesService (exporté par CategoriesModule).
    CategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  // Exporté : le module des mouvements de stock et celui des inventaires
  // auront besoin de lire et de mettre à jour les produits.
  exports: [ProductsService],
})
export class ProductsModule {}
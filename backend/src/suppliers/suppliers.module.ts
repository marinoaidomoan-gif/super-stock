// src/suppliers/suppliers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './supplier.entity.js';
import { SuppliersController } from './suppliers.controller.js';
import { SuppliersService } from './suppliers.service.js';

@Module({
  // Enregistre l'entité Supplier (table "fournisseur") auprès de TypeORM.
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  // Exporté : le module des mouvements de stock devra vérifier le fournisseur
  // choisi lors d'une entrée.
  exports: [SuppliersService],
})
export class SuppliersModule {}
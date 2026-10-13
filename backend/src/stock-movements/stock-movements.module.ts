// src/stock-movements/stock-movements.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovement } from './stock-movement.entity.js';
import { StockMovementsController } from './stock-movements.controller.js';
import { StockMovementsService } from './stock-movements.service.js';

@Module({
  // Enregistre l'entité StockMovement (table "stock_mouvement").
  // Product, Supplier et User sont déjà enregistrés par leurs propres modules.
  imports: [TypeOrmModule.forFeature([StockMovement])],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
  // Exporté : le module des inventaires créera des corrections de stock.
  exports: [StockMovementsService],
})
export class StockMovementsModule {}
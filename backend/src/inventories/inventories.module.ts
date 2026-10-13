// src/inventories/inventories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoriesController } from './inventories.controller.js';
import { InventoriesService } from './inventories.service.js';
import { InventoryLine } from './inventory-line.entity.js';
import { Inventory } from './inventory.entity.js';

@Module({
  // Enregistre les deux entités (tables "inventaire" et "ligne_inventaire").
  // Product, StockMovement et User sont déjà enregistrés par leurs modules.
  imports: [TypeOrmModule.forFeature([Inventory, InventoryLine])],
  controllers: [InventoriesController],
  providers: [InventoriesService],
})
export class InventoriesModule {}
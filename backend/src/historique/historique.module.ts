import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity.js';
import { StockMovement } from '../stock-movements/stock-movement.entity.js';
import { User } from '../users/user.entity.js';
import { HistoriqueController } from './historique.controller.js';
import { HistoriqueService } from './historique.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Product, StockMovement, User])],
  controllers: [HistoriqueController],
  providers: [HistoriqueService],
})
export class HistoriqueModule {}
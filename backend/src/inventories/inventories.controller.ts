// src/inventories/inventories.controller.ts
//
// Routes /api/inventories. Réservées au PROPRIÉTAIRE (règle R13) :
// @Roles(Role.PROPRIETAIRE) sur le contrôleur. Le gérant n'hérite pas des
// droits du propriétaire (seulement l'inverse) : il reçoit un 403.
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/role.enum.js';
import { User } from '../users/user.entity.js';
import { CreateInventoryDto } from './dto/create-inventory.dto.js';
import { FindInventoriesQueryDto } from './dto/find-inventories-query.dto.js';
import { SaveCountsDto } from './dto/save-counts.dto.js';
import { InventoriesService } from './inventories.service.js';

@Roles(Role.PROPRIETAIRE)
@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  // POST /api/inventories : lance un inventaire (génère les lignes).
  @Post()
  create(@Body() dto: CreateInventoryDto, @CurrentUser() user: User) {
    return this.inventoriesService.create(dto, user);
  }

  // GET /api/inventories?page=1&limit=10&statut=VALIDE : historique des inventaires.
  @Get()
  findAll(@Query() query: FindInventoriesQueryDto) {
    return this.inventoriesService.findAll(query);
  }

  // GET /api/inventories/3 : détail avec toutes les lignes.
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoriesService.findOne(id);
  }

  // PATCH /api/inventories/3/quantites : enregistre les quantités comptées.
  @Patch(':id/quantites')
  enregistrerQuantites(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveCountsDto,
  ) {
    return this.inventoriesService.enregistrerQuantites(id, dto);
  }

  // POST /api/inventories/3/valider : valide et crée les corrections de stock.
  @Post(':id/valider')
  @HttpCode(HttpStatus.OK)
  valider(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.inventoriesService.valider(id, user);
  }

  // DELETE /api/inventories/3 : annule un inventaire non validé (204).
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  annuler(@Param('id', ParseIntPipe) id: number) {
    return this.inventoriesService.annuler(id);
  }
}
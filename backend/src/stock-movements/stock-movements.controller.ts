// src/stock-movements/stock-movements.controller.ts
//
// Routes /api/stock-movements, réservées au gérant et au propriétaire
// (héritage des droits). L'administrateur reçoit un 403 (règle R12).
//
// Il n'y a volontairement AUCUNE route PATCH ni DELETE : un mouvement ne se
// modifie pas, il se corrige (règle R4).
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/role.enum.js';
import { User } from '../users/user.entity.js';
import { CorrectStockMovementDto } from './dto/correct-stock-movement.dto.js';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto.js';
import { FindStockMovementsQueryDto } from './dto/find-stock-movements-query.dto.js';
import { StockMovementsService } from './stock-movements.service.js';

@Roles(Role.GERANT)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly movementsService: StockMovementsService) {}

  // POST /api/stock-movements : enregistre une entrée ou une sortie.
  // @CurrentUser() donne l'utilisateur connecté (lu dans le jeton).
  @Post()
  create(@Body() dto: CreateStockMovementDto, @CurrentUser() user: User) {
    return this.movementsService.create(dto, user);
  }

  // GET /api/stock-movements?page=1&limit=10&productId=3&type=SORTIE...
  // Le gérant voit TOUS les mouvements (décision du projet).
  @Get()
  findAll(@Query() query: FindStockMovementsQueryDto) {
    return this.movementsService.findAll(query);
  }

  // GET /api/stock-movements/auteurs
  @Get('auteurs')
  auteurs() {
    return this.movementsService.findAuteurs();
  }

  // GET /api/stock-movements/12
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movementsService.findOne(id);
  }

  // POST /api/stock-movements/12/correction : crée le mouvement inverse.
  @Post(':id/correction')
  corriger(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CorrectStockMovementDto,
    @CurrentUser() user: User,
  ) {
    return this.movementsService.corriger(id, dto, user);
  }
}
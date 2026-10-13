// src/suppliers/suppliers.controller.ts
//
// Routes /api/suppliers.
//  - LECTURE (liste, détail) : gérant et propriétaire. Le gérant en a besoin
//    pour choisir un fournisseur lors d'une entrée de stock.
//  - ÉCRITURE (créer, modifier, supprimer) : propriétaire SEUL.
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
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/role.enum.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import { SuppliersService } from './suppliers.service.js';

// @Roles(Role.GERANT) sur le contrôleur = valable pour toutes les routes
// (le propriétaire y a accès par héritage). L'administrateur reçoit un 403.
@Roles(Role.GERANT)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // POST /api/suppliers
  // Un @Roles posé sur une MÉTHODE l'emporte sur celui du contrôleur :
  // ici seul le PROPRIETAIRE passe, le gérant reçoit 403 (le gérant n'hérite
  // pas des droits du propriétaire, seulement l'inverse).
  @Roles(Role.PROPRIETAIRE)
  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  // GET /api/suppliers  ou  GET /api/suppliers?recherche=sob
  // @Query('recherche') lit le paramètre placé après le "?" dans l'adresse.
  @Get()
  findAll(@Query('recherche') recherche?: string) {
    return this.suppliersService.findAll(recherche);
  }

  // GET /api/suppliers/2
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  // PATCH /api/suppliers/2 : modification partielle (propriétaire seul)
  @Roles(Role.PROPRIETAIRE)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, dto);
  }

  // DELETE /api/suppliers/2 : suppression (propriétaire seul)
  // 204 No Content : la suppression a réussi, il n'y a rien à renvoyer.
  @Roles(Role.PROPRIETAIRE)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.remove(id);
  }
}
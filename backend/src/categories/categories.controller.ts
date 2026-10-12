// src/categories/categories.controller.ts
//
// Routes /api/categories. Reçoit les requêtes et appelle le service.
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
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/role.enum.js';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

// @Roles(Role.GERANT) sur le contrôleur : toutes les routes sont réservées au
// GÉRANT. Grâce à la hiérarchie des droits (RolesGuard), le PROPRIETAIRE y a
// accès aussi. L'administrateur système n'y a pas accès (403).
@Roles(Role.GERANT)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // POST /api/categories
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  // GET /api/categories
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // GET /api/categories/2
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  // PATCH /api/categories/2 : modification partielle
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  // DELETE /api/categories/2
  // 204 No Content : la suppression a réussi et il n'y a rien à renvoyer.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
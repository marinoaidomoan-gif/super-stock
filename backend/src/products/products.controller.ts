// src/products/products.controller.ts
//
// Routes /api/products, réservées au gérant (et au propriétaire, par héritage).
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
import { CreateProductDto } from './dto/create-product.dto.js';
import { FindProductsQueryDto } from './dto/find-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsService } from './products.service.js';

@Roles(Role.GERANT)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // POST /api/products
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // GET /api/products?page=1&limit=10&recherche=eau&categoryId=1&enAlerte=true
  // @Query() lit tous les paramètres de l'adresse et les valide avec le DTO.
  @Get()
  findAll(@Query() query: FindProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  // GET /api/products/alertes/stock-bas?categoryId=1
  // Le frontend s'en servira pour la page des alertes et le badge de l'en-tête.
  // ParseIntPipe({ optional: true }) : le paramètre peut être absent.
  @Get('alertes/stock-bas')
  alertes(
    @Query('categoryId', new ParseIntPipe({ optional: true }))
    categoryId?: number,
  ) {
    return this.productsService.findAlertes(categoryId);
  }

  // GET /api/products/3
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // PATCH /api/products/3 : modification partielle (ou réactivation avec actif: true)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  // DELETE /api/products/3 : DÉSACTIVE le produit (204 = rien à renvoyer).
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
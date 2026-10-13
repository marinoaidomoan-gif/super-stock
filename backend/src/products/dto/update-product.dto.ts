// src/products/dto/update-product.dto.ts
//
// Pour modifier un produit : mêmes règles que la création, mais tous les
// champs deviennent facultatifs (PartialType). On ajoute "actif", qui permet
// de RÉACTIVER un produit désactivé.
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateProductDto } from './create-product.dto.js';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsBoolean({ message: 'Le champ "actif" doit être true ou false.' })
  actif?: boolean;
}
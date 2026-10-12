// src/categories/dto/update-category.dto.ts
//
// Pour modifier une catégorie, on réutilise les règles de CreateCategoryDto
// mais tous les champs deviennent facultatifs (PartialType) : on peut ne
// changer que la description, par exemple.
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto.js';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
// src/categories/dto/create-category.dto.ts
//
// Données attendues pour créer une catégorie. La validation est automatique
// (ValidationPipe de main.ts) : en cas d'erreur, réponse 400 avec les messages.
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  // Les espaces au début et à la fin sont supprimés avant la validation.
  // Ainsi "   " (que des espaces) devient "" et est refusé par @IsNotEmpty.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Le nom doit être un texte.' })
  @IsNotEmpty({ message: 'Le nom de la catégorie est obligatoire.' })
  @MaxLength(100, { message: 'Le nom ne doit pas dépasser 100 caractères.' })
  nom!: string;

  // Facultatif : le champ peut être absent.
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'La description doit être un texte.' })
  @MaxLength(500, { message: 'La description ne doit pas dépasser 500 caractères.' })
  description?: string;
}
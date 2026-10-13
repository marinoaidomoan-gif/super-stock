// src/inventories/dto/create-inventory.dto.ts
//
// Données pour lancer un inventaire : seulement un commentaire facultatif
// (ex. « Inventaire de fin de mois »).
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

const videEnNull = ({ value }: TransformFnParams): unknown => {
  if (typeof value !== 'string') return value;
  const texte = value.trim();
  return texte === '' ? null : texte;
};

export class CreateInventoryDto {
  @Transform(videEnNull)
  @IsOptional()
  @IsString({ message: 'Le commentaire doit être un texte.' })
  @MaxLength(500, {
    message: 'Le commentaire ne doit pas dépasser 500 caractères.',
  })
  commentaire?: string | null;
}
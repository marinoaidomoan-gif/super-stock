// src/stock-movements/dto/correct-stock-movement.dto.ts
//
// Données attendues pour corriger un mouvement : seulement la RAISON
// (facultative). Tout le reste est déduit du mouvement d'origine.
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

const videEnNull = ({ value }: TransformFnParams): unknown => {
  if (typeof value !== 'string') return value;
  const texte = value.trim();
  return texte === '' ? null : texte;
};

export class CorrectStockMovementDto {
  @Transform(videEnNull)
  @IsOptional()
  @IsString({ message: 'Le commentaire doit être un texte.' })
  @MaxLength(400, {
    message: 'Le commentaire ne doit pas dépasser 400 caractères.',
  })
  commentaire?: string | null;
}
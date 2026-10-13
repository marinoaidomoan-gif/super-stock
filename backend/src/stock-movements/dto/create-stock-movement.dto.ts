// src/stock-movements/dto/create-stock-movement.dto.ts
//
// Données attendues pour enregistrer un mouvement. Remarques :
//  - la date n'est pas demandée : le serveur la met lui-même ;
//  - l'utilisateur n'est pas demandé : c'est celui du jeton (connexion) ;
//  - le motif CORRECTION est refusé ici (voir le service) : pour corriger, on
//    passe par la route de correction, qui garde la trace du mouvement corrigé.
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Motif } from '../motif.enum.js';
import { TypeMouvement } from '../type-mouvement.enum.js';

// Champ facultatif : un texte vide devient null (la base enregistre NULL).
const videEnNull = ({ value }: TransformFnParams): unknown => {
  if (typeof value !== 'string') return value;
  const texte = value.trim();
  return texte === '' ? null : texte;
};

export class CreateStockMovementDto {
  @IsEnum(TypeMouvement, { message: 'Le type doit être ENTREE ou SORTIE.' })
  type!: TypeMouvement;

  // Identifiant du produit concerné (obligatoire).
  @IsInt({ message: 'Le produit est obligatoire (identifiant numérique).' })
  @Min(1, { message: 'Le produit est obligatoire (identifiant numérique).' })
  productId!: number;

  // 3 décimales maximum (comme la colonne numeric(12,3)), strictement positive.
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'La quantité doit être un nombre (3 décimales maximum).' },
  )
  @IsPositive({ message: 'La quantité doit être supérieure à zéro.' })
  @Max(999999999, { message: 'La quantité est trop grande.' })
  quantite!: number;

  @IsEnum(Motif, {
    message:
      'Le motif doit être RECEPTION, RETOUR_CLIENT, VENTE, PERTE ou CASSE.',
  })
  motif!: Motif;

  // Fournisseur (facultatif) : seulement pour une RECEPTION.
  // @IsOptional laisse passer l'absence ET la valeur null.
  @IsOptional()
  @IsInt({ message: 'Le fournisseur doit être un identifiant numérique.' })
  @Min(1, { message: 'Le fournisseur doit être un identifiant numérique.' })
  supplierId?: number | null;

  @Transform(videEnNull)
  @IsOptional()
  @IsString({ message: 'Le commentaire doit être un texte.' })
  @MaxLength(500, {
    message: 'Le commentaire ne doit pas dépasser 500 caractères.',
  })
  commentaire?: string | null;
}
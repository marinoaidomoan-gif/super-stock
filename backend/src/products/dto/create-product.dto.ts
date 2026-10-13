// src/products/dto/create-product.dto.ts
//
// Données attendues pour créer un produit.
// Remarque : il n'y a PAS de quantiteStock ici. Un produit démarre à 0 et son
// stock évolue uniquement par les mouvements d'entrée et de sortie.
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Unite } from '../unite.enum.js';

// Supprime les espaces au début et à la fin.
const nettoyer = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

// Pour la référence : espaces supprimés + MAJUSCULES. "eau-15" et "EAU-15"
// deviennent la même référence, ce qui garantit l'unicité (règle R8).
const enMajuscules = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

// Champ facultatif : un texte vide devient null (la base enregistre NULL).
const videEnNull = ({ value }: TransformFnParams): unknown => {
  if (typeof value !== 'string') return value;
  const texte = value.trim();
  return texte === '' ? null : texte;
};

export class CreateProductDto {
  @Transform(nettoyer)
  @IsString({ message: 'Le nom doit être un texte.' })
  @IsNotEmpty({ message: 'Le nom du produit est obligatoire.' })
  @MaxLength(150, { message: 'Le nom ne doit pas dépasser 150 caractères.' })
  nom!: string;

  @Transform(enMajuscules)
  @IsString({ message: 'La référence doit être un texte.' })
  @IsNotEmpty({ message: 'La référence est obligatoire.' })
  @MaxLength(50, { message: 'La référence ne doit pas dépasser 50 caractères.' })
  reference!: string;

  @Transform(videEnNull)
  @IsOptional()
  @IsString({ message: 'La description doit être un texte.' })
  description?: string | null;

  // @IsEnum : la valeur doit faire partie de l'énumération Unite.
  @IsEnum(Unite, {
    message: "L'unité doit être PIECE, KG, LITRE, CARTON ou SACHET.",
  })
  unite!: Unite;

  // Seuil d'alerte facultatif : 0 par défaut (alerte seulement à stock nul).
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: "Le seuil d'alerte doit être un nombre (3 décimales maximum)." },
  )
  @Min(0, { message: "Le seuil d'alerte ne peut pas être négatif." })
  @Max(999999999, { message: "Le seuil d'alerte est trop grand." })
  seuilAlerte?: number;

  // Identifiant de la catégorie du produit (obligatoire).
  @IsInt({ message: 'La catégorie est obligatoire (identifiant numérique).' })
  @Min(1, { message: 'La catégorie est obligatoire (identifiant numérique).' })
  categoryId!: number;
}
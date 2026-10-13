// src/suppliers/dto/create-supplier.dto.ts
//
// Données attendues pour créer un fournisseur.
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Transformation pour les champs FACULTATIFS : supprime les espaces, et un
// champ envoyé vide ("") devient null. Ainsi, un formulaire dont on a laissé
// un champ vide n'est pas refusé, et la base enregistre NULL (pas du texte vide).
// À la modification, envoyer "" (ou null) permet aussi d'EFFACER la valeur.
const videEnNull = ({ value }: TransformFnParams): unknown => {
  if (typeof value !== 'string') return value;
  const texte = value.trim();
  return texte === '' ? null : texte;
};

// Même chose pour l'email, avec en plus des minuscules.
const emailVideEnNull = ({ value }: TransformFnParams): unknown => {
  const resultat = videEnNull({ value } as TransformFnParams);
  return typeof resultat === 'string' ? resultat.toLowerCase() : resultat;
};

export class CreateSupplierDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Le nom doit être un texte.' })
  @IsNotEmpty({ message: 'Le nom du fournisseur est obligatoire.' })
  @MaxLength(150, { message: 'Le nom ne doit pas dépasser 150 caractères.' })
  nom!: string;

  // @IsOptional : si le champ est absent OU null, les autres validations
  // sont ignorées.
  @Transform(videEnNull)
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être un texte.' })
  @MaxLength(30, { message: 'Le téléphone ne doit pas dépasser 30 caractères.' })
  telephone?: string | null;

  @Transform(emailVideEnNull)
  @IsOptional()
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  @MaxLength(150, { message: "L'email ne doit pas dépasser 150 caractères." })
  email?: string | null;

  @Transform(videEnNull)
  @IsOptional()
  @IsString({ message: "L'adresse doit être un texte." })
  @MaxLength(255, { message: "L'adresse ne doit pas dépasser 255 caractères." })
  adresse?: string | null;
}
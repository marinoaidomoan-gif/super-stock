// src/products/dto/find-products-query.dto.ts
//
// Paramètres acceptés dans l'adresse de la liste des produits, après le "?" :
//   /api/products?page=2&limit=10&recherche=eau&categoryId=1&enAlerte=true
// Dans une adresse, TOUT est du texte : @Type(() => Number) convertit en
// nombre, et versBooleen convertit "true" / "false" en vrai booléen.
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const versBooleen = ({ value }: TransformFnParams): unknown => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value; // autre valeur : la validation @IsBoolean la refusera
};

export class FindProductsQueryDto {
  // Numéro de la page (1 par défaut).
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La page doit être un nombre entier.' })
  @Min(1, { message: 'La page doit être au moins 1.' })
  page?: number = 1;

  // Nombre de produits par page (10 par défaut, 100 maximum).
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit être un nombre entier.' })
  @Min(1, { message: 'La limite doit être au moins 1.' })
  @Max(100, { message: 'La limite ne peut pas dépasser 100.' })
  limit?: number = 10;

  // Texte cherché dans le nom ou la référence.
  @IsOptional()
  @IsString({ message: 'La recherche doit être un texte.' })
  recherche?: string;

  // Garder seulement les produits d'une catégorie.
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La catégorie doit être un nombre entier.' })
  @Min(1, { message: 'La catégorie doit être un identifiant valide.' })
  categoryId?: number;

  // true : seulement les produits en alerte ; false : seulement les autres.
  @IsOptional()
  @Transform(versBooleen)
  @IsBoolean({ message: 'enAlerte doit être true ou false.' })
  enAlerte?: boolean;

  // Produits actifs (par défaut) ou désactivés (actif=false).
  @IsOptional()
  @Transform(versBooleen)
  @IsBoolean({ message: 'actif doit être true ou false.' })
  actif?: boolean;
}
// src/stock-movements/dto/find-stock-movements-query.dto.ts
//
// Paramètres acceptés dans l'adresse de la liste des mouvements :
//   /api/stock-movements?page=1&limit=10&productId=3&type=SORTIE
//        &motif=VENTE&userId=2&dateDebut=2026-10-01&dateFin=2026-10-31
// Dans une adresse tout est du texte : @Type(() => Number) convertit en nombre.
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { Motif } from '../motif.enum.js';
import { TypeMouvement } from '../type-mouvement.enum.js';

// Format de date attendu : AAAA-MM-JJ (ex. 2026-10-31).
const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class FindStockMovementsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La page doit être un nombre entier.' })
  @Min(1, { message: 'La page doit être au moins 1.' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit être un nombre entier.' })
  @Min(1, { message: 'La limite doit être au moins 1.' })
  @Max(100, { message: 'La limite ne peut pas dépasser 100.' })
  limit?: number = 10;

  // Garder seulement les mouvements d'un produit.
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Le produit doit être un identifiant numérique.' })
  @Min(1, { message: 'Le produit doit être un identifiant valide.' })
  productId?: number;

  @IsOptional()
  @IsEnum(TypeMouvement, { message: 'Le type doit être ENTREE ou SORTIE.' })
  type?: TypeMouvement;

  @IsOptional()
  @IsEnum(Motif, { message: 'Le motif demandé est inconnu.' })
  motif?: Motif;

  // Garder seulement les mouvements enregistrés par un utilisateur.
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "L'utilisateur doit être un identifiant numérique." })
  @Min(1, { message: "L'utilisateur doit être un identifiant valide." })
  userId?: number;

  // Intervalle de dates, bornes comprises (AAAA-MM-JJ).
  @IsOptional()
  @Matches(FORMAT_DATE, { message: 'dateDebut doit être au format AAAA-MM-JJ.' })
  dateDebut?: string;

  @IsOptional()
  @Matches(FORMAT_DATE, { message: 'dateFin doit être au format AAAA-MM-JJ.' })
  dateFin?: string;
}
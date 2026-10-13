// src/inventories/dto/find-inventories-query.dto.ts
//
// Paramètres de la liste des inventaires :
//   /api/inventories?page=1&limit=10&statut=VALIDE
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { StatutInventaire } from '../statut-inventaire.enum.js';

export class FindInventoriesQueryDto {
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

  @IsOptional()
  @IsEnum(StatutInventaire, {
    message: 'Le statut doit être EN_COURS ou VALIDE.',
  })
  statut?: StatutInventaire;
}
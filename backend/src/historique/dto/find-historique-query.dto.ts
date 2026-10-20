import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class FindHistoriqueQueryDto {
  // Nombre maximum d'événements renvoyés (100 par défaut).
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit être un nombre entier.' })
  @Min(1, { message: 'La limite doit être au moins 1.' })
  @Max(200, { message: 'La limite ne peut pas dépasser 200.' })
  limit?: number = 100;
}
// src/inventories/dto/save-counts.dto.ts
//
// Données pour enregistrer les quantités comptées. Le frontend peut envoyer
// plusieurs produits d'un coup, et peut enregistrer en plusieurs fois :
//   { "lignes": [ { "productId": 3, "quantiteReelle": 48 },
//                 { "productId": 5, "quantiteReelle": 12.5 } ] }
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// Une ligne de comptage : un produit et la quantité trouvée.
export class CountLineDto {
  @IsInt({ message: 'Le produit doit être un identifiant numérique.' })
  @Min(1, { message: 'Le produit doit être un identifiant valide.' })
  productId!: number;

  // 0 est autorisé : le produit est introuvable en rayon, stock réel = 0.
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'La quantité comptée doit être un nombre (3 décimales maximum).' },
  )
  @Min(0, { message: 'La quantité comptée ne peut pas être négative.' })
  @Max(999999999, { message: 'La quantité comptée est trop grande.' })
  quantiteReelle!: number;
}

export class SaveCountsDto {
  // @ValidateNested({ each: true }) : valide CHAQUE élément du tableau avec
  // les règles de CountLineDto. @Type indique à class-transformer de fabriquer
  // des CountLineDto à partir du JSON reçu (sinon les règles ne s'appliquent pas).
  @IsArray({ message: 'Les lignes doivent être une liste.' })
  @ArrayMinSize(1, { message: 'Envoyez au moins une ligne de comptage.' })
  @ArrayMaxSize(1000, { message: 'Trop de lignes envoyées en une fois (1000 maximum).' })
  @ValidateNested({ each: true })
  @Type(() => CountLineDto)
  lignes!: CountLineDto[];
}
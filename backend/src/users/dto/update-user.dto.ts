// src/users/dto/update-user.dto.ts
//
// DTO pour MODIFIER un utilisateur. On ne réécrit pas toutes les règles : on
// réutilise celles de CreateUserDto grâce aux "mapped types" de NestJS :
//  - OmitType(..., ['motDePasse']) : retire le champ motDePasse (on ne change
//    pas le mot de passe par cette route ; ce sera une fonction à part).
//  - PartialType(...) : rend tous les champs facultatifs, pour pouvoir
//    modifier seulement ce qu'on envoie (ex. juste le rôle).
// Les règles de validation (email valide, rôle autorisé...) sont conservées.
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['motDePasse'] as const),
) {}
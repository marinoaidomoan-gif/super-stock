// src/users/dto/create-user.dto.ts
//
// Un DTO (Data Transfer Object) décrit la forme des données que le frontend
// doit envoyer pour créer un utilisateur. Les décorateurs de "class-validator"
// vérifient ces données AUTOMATIQUEMENT (grâce au ValidationPipe de main.ts) :
// si une règle n'est pas respectée, NestJS répond tout seul par une erreur 400
// avec le message indiqué, et le code du contrôleur n'est même pas exécuté.
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../role.enum.js';

export class CreateUserDto {
  // @Transform : nettoie la valeur AVANT la validation (supprime les espaces
  // au début et à la fin). Il fonctionne grâce à "transform: true" dans main.ts.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Le nom doit être un texte.' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @MaxLength(100, { message: 'Le nom ne doit pas dépasser 100 caractères.' })
  nom!: string;

  // On met l'email en minuscules : "Marie@Mail.com" et "marie@mail.com"
  // doivent être considérés comme le même compte (l'email est unique).
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  @MaxLength(150, { message: "L'email ne doit pas dépasser 150 caractères." })
  email!: string;

  // Mot de passe en clair, tel que saisi dans le formulaire.
  // Il sera haché avec bcrypt dans le service, jamais enregistré tel quel.
  @IsString({ message: 'Le mot de passe doit être un texte.' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  motDePasse!: string;

  // @IsOptional : le champ peut être absent, et dans ce cas les autres
  // validations ne s'appliquent pas.
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être un texte.' })
  @MaxLength(30, { message: 'Le téléphone ne doit pas dépasser 30 caractères.' })
  telephone?: string;

  // @IsEnum : la valeur doit être l'une des valeurs de l'enum Role.
  @IsEnum(Role, {
    message: 'Le rôle doit être PROPRIETAIRE, GERANT ou ADMINISTRATEUR.',
  })
  role!: Role;
}
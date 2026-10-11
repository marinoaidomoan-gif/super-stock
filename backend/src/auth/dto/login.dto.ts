// src/auth/dto/login.dto.ts
//
// Données attendues pour se connecter : un email et un mot de passe.
// Comme pour CreateUserDto, la validation est faite automatiquement.
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // On normalise l'email (espaces retirés, minuscules) comme à la création
  // du compte, sinon "Admin@..." ne retrouverait pas "admin@...".
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  email!: string;

  // Ici on ne vérifie PAS la longueur minimale : on vérifie seulement que le
  // champ est rempli. La comparaison avec le mot de passe haché se fait
  // dans le service.
  @IsString({ message: 'Le mot de passe doit être un texte.' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  motDePasse!: string;
}
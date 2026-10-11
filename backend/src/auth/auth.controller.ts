// src/auth/auth.controller.ts
//
// Routes d'authentification :
//   POST /api/auth/login : se connecter (ouverte à tous)
//   GET  /api/auth/me    : profil de l'utilisateur connecté (protégée)
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { User } from '../users/user.entity.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from './public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Public : sinon personne ne pourrait se connecter (il faut un jeton pour
  // entrer, mais on n'en a pas encore !).
  // @HttpCode(200) : un POST renvoie 201 (créé) par défaut. Une connexion ne
  // crée rien, donc on répond 200 (OK).
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Le frontend appellera cette route au chargement pour savoir qui est connecté.
  @Get('me')
  me(@CurrentUser() user: User) {
    return user;
  }
}
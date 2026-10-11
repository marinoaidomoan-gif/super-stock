// src/users/users.controller.ts
//
// Un "contrôleur" reçoit les requêtes HTTP, vérifie les données (via les DTO)
// et appelle le service. Il ne contient pas de logique métier.
//
// @Controller('users') : toutes les routes de ce fichier commencent par
// "users". Avec le préfixe global "api" de main.ts, l'adresse complète est
// donc http://localhost:3000/api/users
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  // NestJS injecte automatiquement UsersService (déclaré dans users.module.ts).
  constructor(private readonly usersService: UsersService) {}

  // POST /api/users : crée un utilisateur.
  // @Body() récupère le JSON envoyé. Comme le type est CreateUserDto, le
  // ValidationPipe de main.ts le vérifie AVANT d'entrer dans cette méthode.
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // GET /api/users/stats : chiffres clés des comptes.
  // ATTENTION À L'ORDRE : cette route doit être écrite AVANT "GET :id".
  // Sinon NestJS prendrait le mot "stats" pour un id et renverrait une erreur.
  @Get('stats')
  stats() {
    return this.usersService.stats();
  }

  // GET /api/users : liste de tous les utilisateurs.
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET /api/users/3 : un utilisateur par son id.
  // @Param('id') lit la valeur de ":id" dans l'adresse.
  // ParseIntPipe la convertit en nombre, et refuse (400) si ce n'est pas un
  // nombre, par exemple /api/users/abc.
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // PATCH /api/users/3/activer : active ou désactive le compte.
  @Patch(':id/activer')
  basculerActif(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.basculerActif(id);
  }

  // PATCH /api/users/3 : modifie nom, email, téléphone ou rôle.
  // PATCH = modification partielle : on n'envoie que les champs à changer.
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }
}
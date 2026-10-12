// src/auth/roles.guard.ts
//
// Guard qui vérifie le RÔLE de l'utilisateur connecté.
// Il s'exécute APRÈS JwtAuthGuard : à ce moment-là, la requête contient déjà
// l'utilisateur (request.user), rempli par JwtStrategy.
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../users/role.enum.js';
import { User } from '../users/user.entity.js';
import { ROLES_KEY } from './roles.decorator.js';

// HIÉRARCHIE DES DROITS (règle R11) : le propriétaire hérite de tous les droits
// du gérant. Pour chaque rôle, on liste tous les rôles dont il a les droits.
// Ainsi, une route réservée au GERANT est aussi ouverte au PROPRIETAIRE,
// mais pas l'inverse. L'administrateur n'hérite de personne.
const ROLES_EFFECTIFS: Record<Role, Role[]> = {
  [Role.PROPRIETAIRE]: [Role.PROPRIETAIRE, Role.GERANT],
  [Role.GERANT]: [Role.GERANT],
  [Role.ADMINISTRATEUR]: [Role.ADMINISTRATEUR],
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // On lit la liste des rôles posée par @Roles(...). Un @Roles écrit sur une
    // route prime sur celui écrit sur le contrôleur.
    const rolesRequis = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Pas de @Roles : la route demande seulement d'être connecté.
    if (!rolesRequis || rolesRequis.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: User }>();
    if (!user) {
      throw new ForbiddenException("Vous n'avez pas le droit d'effectuer cette action.");
    }

    // L'utilisateur a accès si au moins un des rôles requis fait partie de
    // ses rôles effectifs (son rôle + ceux dont il hérite).
    const autorise = rolesRequis.some((role) =>
      ROLES_EFFECTIFS[user.role].includes(role),
    );
    if (!autorise) {
      // 403 Forbidden : on sait qui vous êtes (connecté), mais c'est interdit.
      throw new ForbiddenException("Vous n'avez pas le droit d'effectuer cette action.");
    }
    return true;
  }
}
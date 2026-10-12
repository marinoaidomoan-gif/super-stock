// src/auth/roles.decorator.ts
//
// Décorateur qui indique QUELS RÔLES ont le droit d'utiliser une route.
// Exemple : @Roles(Role.GERANT) au-dessus d'une route = réservée au gérant
// (et au propriétaire, qui hérite des droits du gérant, voir roles.guard.ts).
import { SetMetadata } from '@nestjs/common';
import { Role } from '../users/role.enum.js';

// Clé sous laquelle la liste des rôles est rangée, puis relue par le guard.
export const ROLES_KEY = 'roles';

// "...roles" : on peut donner plusieurs rôles, ex. @Roles(Role.GERANT, Role.ADMINISTRATEUR)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
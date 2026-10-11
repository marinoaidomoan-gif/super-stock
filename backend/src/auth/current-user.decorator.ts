// src/auth/current-user.decorator.ts
//
// Décorateur pratique pour récupérer l'utilisateur connecté dans un
// contrôleur : au lieu de manipuler "request.user", on écrit simplement
// (@CurrentUser() user: User).
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../users/user.entity.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    // "request.user" est rempli par JwtStrategy.validate().
    const request = context.switchToHttp().getRequest<{ user: User }>();
    return request.user;
  },
);
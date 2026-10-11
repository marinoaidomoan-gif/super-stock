// src/auth/jwt-auth.guard.ts
//
// Un "guard" décide si une requête a le droit d'atteindre la route.
// Celui-ci exige un jeton JWT valide, sauf si la route est marquée @Public().
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Reflector permet de lire les métadonnées posées par @Public().
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // On regarde si la route (ou son contrôleur) porte @Public().
    const estPublique = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (estPublique) {
      return true; // route ouverte : on laisse passer
    }

    // Sinon, on lance la vérification du jeton (stratégie "jwt").
    // Jeton absent, invalide ou expiré : réponse 401 automatique.
    return super.canActivate(context);
  }
}
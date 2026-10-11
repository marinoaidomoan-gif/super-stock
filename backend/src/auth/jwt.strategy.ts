// src/auth/jwt.strategy.ts
//
// Une "stratégie" Passport explique comment VÉRIFIER un jeton reçu.
// Elle est appelée automatiquement par le guard à chaque requête protégée.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../users/role.enum.js';
import { UsersService } from '../users/users.service.js';

// Forme du contenu du jeton (voir auth.service.ts).
export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      // Le jeton est lu dans l'en-tête HTTP : Authorization: Bearer <jeton>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Un jeton expiré est refusé (durée définie par JWT_EXPIRES_IN).
      ignoreExpiration: false,
      // Même clé secrète que pour la signature.
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Appelée seulement si la signature et la date du jeton sont valides.
  // Ce qu'elle renvoie est placé dans "request.user".
  async validate(payload: JwtPayload) {
    // On relit l'utilisateur dans la base à chaque requête. Ainsi, si le
    // compte est désactivé ou si son rôle change, c'est pris en compte
    // immédiatement, sans attendre l'expiration du jeton.
    const user = await this.usersService.findOne(payload.sub).catch(() => null);

    if (!user || !user.actif) {
      throw new UnauthorizedException('Session invalide. Reconnectez-vous.');
    }
    return user;
  }
}
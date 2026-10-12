// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { JwtStrategy } from './jwt.strategy.js';
import { RolesGuard } from './roles.guard.js';


@Module({
  imports: [
    // Pour utiliser UsersService (exporté par UsersModule).
    UsersModule,
    PassportModule,

    // Configure la signature des jetons avec les valeurs du .env.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // getOrThrow : si JWT_SECRET manque dans le .env, l'application
        // refuse de démarrer (mieux qu'une clé vide, dangereuse).
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // Durée de vie du jeton (ex. "1d" = 1 jour). Le "as" sert
          // uniquement à contenter le typage de la bibliothèque.
          expiresIn: config.get<string>(
            'JWT_EXPIRES_IN',
            '1d',
          ) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,

    // APP_GUARD = guard GLOBAL : il s'applique à TOUTES les routes de
    // l'application, sans avoir à l'écrire sur chaque contrôleur.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
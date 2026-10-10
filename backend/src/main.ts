import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Toutes les routes de l'API commencent par /api (ex. /api/products)
  app.setGlobalPrefix('api');

  // Autorise le frontend React (Vite) à appeler l'API
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:5173'),
    credentials: true,
  });

  // Valide automatiquement les données reçues grâce aux DTO :
  // - whitelist : supprime les champs non déclarés dans le DTO
  // - forbidNonWhitelisted : refuse la requête si un champ inconnu est envoyé
  // - transform : convertit les données vers les types du DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = parseInt(config.get<string>('PORT', '3000'), 10);
  await app.listen(port);
  console.log(`API SuperStock démarrée sur http://localhost:${port}/api`);
}

void bootstrap();
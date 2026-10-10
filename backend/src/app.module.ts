import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';


@Module({
  imports: [
    // Charge le fichier .env et rend les variables accessibles partout
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Connexion à PostgreSQL : les valeurs viennent du .env via ConfigService
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME', 'superstock_db'),
        // Charge automatiquement les entités déclarées avec
        // TypeOrmModule.forFeature([...]) dans chaque module
        autoLoadEntities: true,
        // Crée / met à jour les tables à partir des entités.
        // À utiliser uniquement en développement.
        synchronize: true,
      }),
    }),
    // à chaque nouveau module créé, on l'ajoute ici
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
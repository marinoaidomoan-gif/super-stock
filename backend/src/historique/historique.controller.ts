import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { User } from '../users/user.entity.js';
import { FindHistoriqueQueryDto } from './dto/find-historique-query.dto.js';
import { HistoriqueService } from './historique.service.js';

// Pas de @Roles : tous les utilisateurs connectés y ont accès.
// C'est le service qui filtre le contenu selon le rôle.
@Controller('historique')
export class HistoriqueController {
  constructor(private readonly historiqueService: HistoriqueService) {}

  // GET /api/historique?limit=100
  @Get()
  findAll(@Query() query: FindHistoriqueQueryDto, @CurrentUser() user: User) {
    return this.historiqueService.findAll(user.role, query.limit);
  }
}
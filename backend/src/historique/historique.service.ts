// Fil d'activité : rassemble les événements récents (mouvements, produits créés,
// comptes créés) en une seule liste, du plus récent au plus ancien.
// Le service décide de ce que chaque rôle a le droit de voir.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity.js';
import { StockMovement } from '../stock-movements/stock-movement.entity.js';
import { TypeMouvement } from '../stock-movements/type-mouvement.enum.js';
import { Role } from '../users/role.enum.js';
import { User } from '../users/user.entity.js';

type Source = 'mouvements' | 'produits' | 'utilisateurs';

export interface Evenement {
  id: string;
  type: 'movement-in' | 'movement-out' | 'product' | 'user';
  date: Date;
  nom: string; // produit ou utilisateur concerné
  detail: string; // référence du produit ou email
  extra: string | null; // catégorie, motif ou rôle
  quantite: number | null;
  unite: string | null;
  auteur: string | null;
}

// Ce que chaque rôle voit. L'administrateur n'a pas accès aux pages de stock, mais
// il peut CONSULTER l'activité (lecture seule) ; seul lui voit en plus les comptes.
const SOURCES_PAR_ROLE: Record<Role, Source[]> = {
  [Role.PROPRIETAIRE]: ['mouvements', 'produits'],
  [Role.GERANT]: ['mouvements', 'produits'],
  [Role.ADMINISTRATEUR]: ['mouvements', 'produits', 'utilisateurs'],
};

@Injectable()
export class HistoriqueService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementsRepository: Repository<StockMovement>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(role: Role, limit = 100): Promise<Evenement[]> {
    const sources = SOURCES_PAR_ROLE[role] ?? [];

    const [mouvements, produits, utilisateurs] = await Promise.all([
      sources.includes('mouvements') ? this.mouvements(limit) : [],
      sources.includes('produits') ? this.produits(limit) : [],
      sources.includes('utilisateurs') ? this.utilisateurs(limit) : [],
    ]);

    return [...mouvements, ...produits, ...utilisateurs]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  private async mouvements(limit: number): Promise<Evenement[]> {
    const lignes = await this.movementsRepository
      .createQueryBuilder('mouvement')
      .leftJoinAndSelect('mouvement.product', 'produit')
      .leftJoin('mouvement.user', 'utilisateur')
      .addSelect(['utilisateur.id', 'utilisateur.nom'])
      .orderBy('mouvement.dateMouvement', 'DESC')
      .addOrderBy('mouvement.id', 'DESC')
      .take(limit)
      .getMany();

    return lignes.map((m) => ({
      id: `mv-${m.id}`,
      type: m.type === TypeMouvement.ENTREE ? 'movement-in' : 'movement-out',
      date: m.dateMouvement,
      nom: m.product.nom,
      detail: m.product.reference,
      extra: m.motif,
      quantite: m.quantite,
      unite: m.product.unite,
      auteur: m.user?.nom ?? null,
    }));
  }

  private async produits(limit: number): Promise<Evenement[]> {
    const lignes = await this.productsRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return lignes.map((p) => ({
      id: `prod-${p.id}`,
      type: 'product',
      date: p.createdAt,
      nom: p.nom,
      detail: p.reference,
      extra: p.category?.nom ?? null,
      quantite: null,
      unite: null,
      auteur: null, // la table produit ne garde pas son créateur
    }));
  }

  private async utilisateurs(limit: number): Promise<Evenement[]> {
    const lignes = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return lignes.map((u) => ({
      id: `user-${u.id}`,
      type: 'user',
      date: u.createdAt,
      nom: u.nom,
      detail: u.email,
      extra: u.role,
      quantite: null,
      unite: null,
      auteur: null,
    }));
  }
}
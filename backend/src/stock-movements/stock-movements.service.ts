// src/stock-movements/stock-movements.service.ts
//
// Logique métier des mouvements de stock : enregistrer une entrée ou une
// sortie, corriger un mouvement, lister l'historique.
//
// RÈGLES APPLIQUÉES ICI :
//  R1 une entrée augmente le stock, une sortie le diminue ;
//  R2 le stock ne devient jamais négatif (via Product.diminuerStock) ;
//  R3 mouvement + mise à jour du stock dans UNE SEULE transaction ;
//  R4 un mouvement n'est jamais modifié ni supprimé (correction = mouvement inverse) ;
//  R12 réservé au gérant et au propriétaire (le contrôleur s'en charge).
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Product } from '../products/product.entity.js';
import { Supplier } from '../suppliers/supplier.entity.js';
import { User } from '../users/user.entity.js';
import { CorrectStockMovementDto } from './dto/correct-stock-movement.dto.js';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto.js';
import { FindStockMovementsQueryDto } from './dto/find-stock-movements-query.dto.js';
import { Motif, MOTIFS_AUTORISES } from './motif.enum.js';
import { StockMovement } from './stock-movement.entity.js';

// Transforme "2026-10-31" en date, ou refuse si elle n'existe pas
// (ex. 2026-02-30, que le format AAAA-MM-JJ laisserait passer).
function lireDate(texte: string, nomChamp: string): Date {
  const date = new Date(`${texte}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${nomChamp} n'est pas une date valide.`);
  }
  return date;
}

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementsRepository: Repository<StockMovement>,
    // DataSource : la connexion à la base. Elle permet d'ouvrir une
    // TRANSACTION (voir dataSource.transaction plus bas).
    private readonly dataSource: DataSource,
  ) {}

  // Requête de base pour LIRE un mouvement avec son produit, son fournisseur
  // et son utilisateur. Pour l'utilisateur, on ne sélectionne que id, nom et
  // rôle : l'email et le téléphone n'ont pas à être envoyés dans l'historique.
  private requeteDeLecture() {
    return this.movementsRepository
      .createQueryBuilder('mouvement')
      .leftJoinAndSelect('mouvement.product', 'produit')
      .leftJoin('mouvement.user', 'utilisateur')
      .addSelect(['utilisateur.id', 'utilisateur.nom', 'utilisateur.role'])
      .leftJoinAndSelect('mouvement.supplier', 'fournisseur');
  }

  // Charge un produit en le VERROUILLANT jusqu'à la fin de la transaction.
  // Pourquoi ? Si deux sorties arrivent en même temps sur le même produit, sans
  // verrou elles liraient toutes les deux "stock = 10" et pourraient toutes
  // les deux retirer 8. Avec le verrou, la deuxième attend la première.
  // loadEagerRelations: false : PostgreSQL refuse un verrou sur une requête
  // qui contient une jointure (ici la catégorie, chargée automatiquement).
  private async verrouillerProduit(
    manager: EntityManager,
    productId: number,
  ): Promise<Product> {
    const produit = await manager.findOne(Product, {
      where: { id: productId },
      lock: { mode: 'pessimistic_write' },
      loadEagerRelations: false,
    });
    if (!produit) {
      throw new NotFoundException(`Produit ${productId} introuvable.`);
    }
    if (!produit.actif) {
      throw new ConflictException(
        `Le produit « ${produit.nom} » est désactivé : réactivez-le avant d'enregistrer un mouvement.`,
      );
    }
    return produit;
  }

  // ===== Enregistrer un mouvement (entrée ou sortie) =====
  async create(dto: CreateStockMovementDto, user: User): Promise<StockMovement> {
    // 1) Vérifications de cohérence, AVANT de toucher à la base.
    if (dto.motif === Motif.CORRECTION) {
      throw new BadRequestException(
        'Pour corriger un mouvement, utilisez la route de correction (POST /stock-movements/:id/correction).',
      );
    }
    if (!MOTIFS_AUTORISES[dto.type].includes(dto.motif)) {
      throw new BadRequestException(
        `Le motif ${dto.motif} n'est pas autorisé pour une ${dto.type === 'ENTREE' ? 'entrée' : 'sortie'}.`,
      );
    }
    if (dto.supplierId != null && dto.motif !== Motif.RECEPTION) {
      throw new BadRequestException(
        'Un fournisseur ne peut être indiqué que pour une réception.',
      );
    }

    // 2) TRANSACTION (règle R3) : tout ce qui est dans cette fonction réussit
    // ENSEMBLE ou échoue ENSEMBLE. Si la sortie dépasse le stock (400), rien
    // n'est enregistré : ni le mouvement, ni le changement de stock.
    const idMouvement = await this.dataSource.transaction(async (manager) => {
      const produit = await this.verrouillerProduit(manager, dto.productId);

      if (dto.supplierId != null) {
        const fournisseur = await manager.findOne(Supplier, {
          where: { id: dto.supplierId },
        });
        if (!fournisseur) {
          throw new NotFoundException(
            `Fournisseur ${dto.supplierId} introuvable.`,
          );
        }
      }

      const mouvement = manager.create(StockMovement, {
        type: dto.type,
        quantite: dto.quantite,
        motif: dto.motif,
        commentaire: dto.commentaire ?? null,
        productId: produit.id,
        userId: user.id,
        supplierId: dto.supplierId ?? null,
      });
      mouvement.product = produit;

      // Met à jour la quantité du produit EN MÉMOIRE (lève 400 si le stock
      // est insuffisant pour une sortie).
      mouvement.appliquer();

      // Puis on enregistre : d'abord le produit modifié, ensuite le mouvement.
      await manager.save(produit);
      await manager.save(mouvement);
      return mouvement.id;
    });

    // 3) On relit le mouvement avec ses relations pour la réponse.
    return this.findOne(idMouvement);
  }

  // ===== Corriger un mouvement (règle R4) =====
  // On n'efface rien : on enregistre un mouvement INVERSE.
  // Limite connue : le MLD n'a pas de colonne pour relier la correction au
  // mouvement d'origine (le lien est dans le commentaire). On ne peut donc pas
  // empêcher de corriger deux fois le même mouvement : attention à ne pas le faire.
  async corriger(
    id: number,
    dto: CorrectStockMovementDto,
    user: User,
  ): Promise<StockMovement> {
    const idCorrection = await this.dataSource.transaction(async (manager) => {
      const original = await manager.findOne(StockMovement, { where: { id } });
      if (!original) {
        throw new NotFoundException(`Mouvement ${id} introuvable.`);
      }

      const produit = await this.verrouillerProduit(manager, original.productId);

      // Fabrique le mouvement inverse, puis l'applique sur le stock.
      // Si le stock est devenu insuffisant (ex. on corrige une entrée dont une
      // partie a déjà été vendue), diminuerStock refuse avec un 400 clair.
      const correction = original.creerCorrection(user, dto.commentaire);
      correction.product = produit;
      correction.appliquer();

      await manager.save(produit);
      await manager.save(correction);
      return correction.id;
    });

    return this.findOne(idCorrection);
  }

  // ===== Liste paginée avec filtres (historique) =====
  // Les plus récents d'abord.
  async findAll(query: FindStockMovementsQueryDto) {
    const {
      page = 1,
      limit = 10,
      productId,
      type,
      motif,
      userId,
      dateDebut,
      dateFin,
    } = query;

    const requete = this.requeteDeLecture();

    if (productId) {
      requete.andWhere('mouvement.productId = :productId', { productId });
    }
    if (type) {
      requete.andWhere('mouvement.type = :type', { type });
    }
    if (motif) {
      requete.andWhere('mouvement.motif = :motif', { motif });
    }
    if (userId) {
      requete.andWhere('mouvement.userId = :userId', { userId });
    }
    if (dateDebut) {
      // À partir de 00h00 du jour de début (inclus).
      requete.andWhere('mouvement.dateMouvement >= :debut', {
        debut: lireDate(dateDebut, 'dateDebut'),
      });
    }
    if (dateFin) {
      // Jusqu'au jour de fin INCLUS : on prend "avant 00h00 du lendemain".
      const fin = lireDate(dateFin, 'dateFin');
      fin.setDate(fin.getDate() + 1);
      requete.andWhere('mouvement.dateMouvement < :fin', { fin });
    }

    const [data, total] = await requete
      .orderBy('mouvement.dateMouvement', 'DESC')
      .addOrderBy('mouvement.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<StockMovement> {
    const mouvement = await this.requeteDeLecture()
      .where('mouvement.id = :id', { id })
      .getOne();
    if (!mouvement) {
      throw new NotFoundException(`Mouvement ${id} introuvable.`);
    }
    return mouvement;
  }
}
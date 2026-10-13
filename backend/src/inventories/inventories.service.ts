// src/inventories/inventories.service.ts
//
// Logique métier des inventaires (méthodes du diagramme de classes) :
//  - create()                = generer()               : lance l'inventaire
//  - enregistrerQuantites()  = enregistrerQuantites()  : saisie du comptage
//  - valider()               = valider()               : crée les corrections
//  - annuler()               : abandonne un inventaire non validé
//
// Règles : R13 (réservé au propriétaire, vérifié par le contrôleur),
// R14 (un inventaire validé ne change plus), R15 (un produit une seule fois).
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Product } from '../products/product.entity.js';
import { Motif } from '../stock-movements/motif.enum.js';
import { StockMovement } from '../stock-movements/stock-movement.entity.js';
import { TypeMouvement } from '../stock-movements/type-mouvement.enum.js';
import { User } from '../users/user.entity.js';
import { CreateInventoryDto } from './dto/create-inventory.dto.js';
import { FindInventoriesQueryDto } from './dto/find-inventories-query.dto.js';
import { SaveCountsDto } from './dto/save-counts.dto.js';
import { InventoryLine } from './inventory-line.entity.js';
import { Inventory } from './inventory.entity.js';
import { StatutInventaire } from './statut-inventaire.enum.js';

// Compteurs affichés par le frontend : "12 produits comptés sur 40, 3 écarts".
export interface Resume {
  nbLignes: number;
  nbComptees: number;
  nbEcarts: number;
}

@Injectable()
export class InventoriesService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoriesRepository: Repository<Inventory>,
    @InjectRepository(InventoryLine)
    private readonly linesRepository: Repository<InventoryLine>,
    // DataSource : sert à ouvrir des transactions (tout réussit ou tout échoue).
    private readonly dataSource: DataSource,
  ) {}

  // Charge un inventaire en le VERROUILLANT jusqu'à la fin de la transaction :
  // si on clique deux fois sur "Valider", la 2e demande attend la 1re, puis
  // constate que l'inventaire est déjà validé.
  private async verrouillerInventaire(
    manager: EntityManager,
    id: number,
  ): Promise<Inventory> {
    const inventaire = await manager.findOne(Inventory, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
    if (!inventaire) {
      throw new NotFoundException(`Inventaire ${id} introuvable.`);
    }
    return inventaire;
  }

  // Règle R14 : seul un inventaire EN COURS peut être modifié, validé ou annulé.
  private exigerEnCours(inventaire: Inventory): void {
    if (inventaire.statut !== StatutInventaire.EN_COURS) {
      throw new ConflictException(
        'Cet inventaire est déjà validé : il ne peut plus être modifié ni annulé.',
      );
    }
  }

  private resumer(lignes: InventoryLine[]): Resume {
    return {
      nbLignes: lignes.length,
      nbComptees: lignes.filter((l) => l.quantiteReelle !== null).length,
      nbEcarts: lignes.filter((l) => l.ecart !== null && l.ecart !== 0).length,
    };
  }

  // ===== LANCER un inventaire (generer) =====
  async create(dto: CreateInventoryDto, user: User) {
    const id = await this.dataSource.transaction(async (manager) => {
      // 1) On VERROUILLE tous les produits actifs. Si un mouvement de stock est
      // en train d'être enregistré, on attend qu'il soit terminé : la photo
      // du stock est ainsi exacte.
      // (order id ASC : toujours le même ordre de verrouillage, pour éviter
      // que deux opérations s'attendent mutuellement.)
      const produits = await manager.find(Product, {
        where: { actif: true },
        order: { id: 'ASC' },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });

      // 2) Un seul inventaire en cours à la fois. La vérification est faite
      // APRÈS le verrouillage pour être fiable.
      const enCours = await manager.count(Inventory, {
        where: { statut: StatutInventaire.EN_COURS },
      });
      if (enCours > 0) {
        throw new ConflictException(
          'Un inventaire est déjà en cours : validez-le ou annulez-le avant d’en lancer un autre.',
        );
      }
      if (produits.length === 0) {
        throw new BadRequestException('Aucun produit actif à inventorier.');
      }

      // 3) On crée l'inventaire...
      const inventaire = await manager.save(
        manager.create(Inventory, {
          commentaire: dto.commentaire ?? null,
          statut: StatutInventaire.EN_COURS,
          userId: user.id,
        }),
      );

      // 4) ... et UNE LIGNE par produit : quantité théorique = stock actuel,
      // quantité réelle et écart vides (pas encore comptés).
      const lignes = produits.map((produit) =>
        manager.create(InventoryLine, {
          inventoryId: inventaire.id,
          productId: produit.id,
          quantiteTheorique: produit.quantiteStock,
          quantiteReelle: null,
          ecart: null,
        }),
      );
      // chunk : enregistre par paquets de 500 lignes (utile si le magasin a
      // des milliers de produits).
      await manager.save(lignes, { chunk: 500 });

      return inventaire.id;
    });

    return this.findOne(id);
  }

  // ===== ENREGISTRER les quantités comptées (enregistrerQuantites) =====
  // On peut l'appeler plusieurs fois : chaque appel met à jour les produits
  // envoyés, les autres ne bougent pas.
  async enregistrerQuantites(id: number, dto: SaveCountsDto) {
    await this.dataSource.transaction(async (manager) => {
      const inventaire = await this.verrouillerInventaire(manager, id);
      this.exigerEnCours(inventaire);

      const idsProduits = dto.lignes.map((l) => l.productId);
      if (new Set(idsProduits).size !== idsProduits.length) {
        throw new BadRequestException(
          'Un même produit apparaît plusieurs fois dans la liste envoyée.',
        );
      }

      const lignes = await manager.find(InventoryLine, {
        where: { inventoryId: id, productId: In(idsProduits) },
      });
      if (lignes.length !== idsProduits.length) {
        throw new BadRequestException(
          'Certains produits envoyés ne font pas partie de cet inventaire.',
        );
      }

      // On range les lignes par produit pour les retrouver facilement.
      const parProduit = new Map(lignes.map((l) => [l.productId, l]));
      for (const saisie of dto.lignes) {
        // enregistrerQuantiteReelle calcule aussi l'écart.
        parProduit.get(saisie.productId)?.enregistrerQuantiteReelle(
          saisie.quantiteReelle,
        );
      }
      await manager.save(lignes);
    });

    return this.findOne(id);
  }

  // ===== VALIDER l'inventaire (valider) =====
  // Pour chaque produit dont l'écart n'est pas nul, on crée un mouvement de
  // CORRECTION : une ENTRÉE si on a trouvé plus que prévu, une SORTIE s'il
  // manque du stock. Après validation, le stock du système = le stock compté.
  async valider(id: number, user: User) {
    await this.dataSource.transaction(async (manager) => {
      const inventaire = await this.verrouillerInventaire(manager, id);
      this.exigerEnCours(inventaire);

      const lignes = await manager.find(InventoryLine, {
        where: { inventoryId: id },
      });

      // Tous les produits doivent avoir été comptés.
      const nonComptees = lignes.filter((l) => l.quantiteReelle === null).length;
      if (nonComptees > 0) {
        throw new BadRequestException(
          `${nonComptees} produit(s) n'ont pas encore été comptés : saisissez toutes les quantités avant de valider.`,
        );
      }

      // On verrouille les produits concernés (toujours par id croissant).
      const produits = await manager.find(Product, {
        where: { id: In(lignes.map((l) => l.productId)) },
        order: { id: 'ASC' },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });
      const parId = new Map(produits.map((p) => [p.id, p]));

      const mouvements: StockMovement[] = [];
      for (const ligne of lignes) {
        const produit = parId.get(ligne.productId);
        if (!produit) {
          throw new ConflictException(
            `Le produit ${ligne.productId} n'existe plus : annulez cet inventaire et relancez-en un.`,
          );
        }

        // Sécurité : le stock ne doit pas avoir bougé depuis le lancement
        // (les mouvements sont suspendus pendant un inventaire).
        if (Math.abs(produit.quantiteStock - ligne.quantiteTheorique) > 0.0005) {
          throw new ConflictException(
            `Le stock de « ${produit.nom} » a changé depuis le lancement de l'inventaire (${ligne.quantiteTheorique} puis ${produit.quantiteStock}). Annulez cet inventaire et relancez-en un.`,
          );
        }

        const ecart = ligne.ecart ?? 0;
        if (ecart === 0) {
          continue; // aucun écart : rien à corriger
        }

        // Écart positif = on a trouvé plus que prévu : ENTRÉE.
        // Écart négatif = il manque du stock : SORTIE.
        const mouvement = manager.create(StockMovement, {
          type: ecart > 0 ? TypeMouvement.ENTREE : TypeMouvement.SORTIE,
          quantite: Math.abs(ecart),
          motif: Motif.CORRECTION,
          commentaire: `Inventaire n°${id} : stock théorique ${ligne.quantiteTheorique}, stock compté ${ligne.quantiteReelle}`,
          productId: produit.id,
          userId: user.id,
          supplierId: null,
        });
        mouvement.product = produit;
        // Met à jour la quantité du produit (même méthode que pour une
        // entrée ou une sortie normale).
        mouvement.appliquer();
        mouvements.push(mouvement);
      }

      // Enregistrement : produits (stock corrigé) puis mouvements.
      await manager.save(produits);
      await manager.save(mouvements);

      // Enfin, l'inventaire passe à VALIDE : il ne bougera plus (règle R14).
      inventaire.statut = StatutInventaire.VALIDE;
      inventaire.dateValidation = new Date();
      await manager.save(inventaire);
    });

    return this.findOne(id);
  }

  // ===== ANNULER un inventaire non validé =====
  // Supprime l'inventaire et ses lignes : le stock n'a jamais été touché, et
  // les mouvements de stock sont de nouveau autorisés.
  async annuler(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const inventaire = await this.verrouillerInventaire(manager, id);
      this.exigerEnCours(inventaire);

      // Les lignes d'abord (clé étrangère), puis l'inventaire.
      await manager.delete(InventoryLine, { inventoryId: id });
      await manager.delete(Inventory, { id });
    });
  }

  // ===== LISTE des inventaires, avec un résumé pour chacun =====
  async findAll(query: FindInventoriesQueryDto) {
    const { page = 1, limit = 10, statut } = query;

    const requete = this.inventoriesRepository
      .createQueryBuilder('inventaire')
      .leftJoin('inventaire.user', 'utilisateur')
      .addSelect(['utilisateur.id', 'utilisateur.nom']);

    if (statut) {
      requete.where('inventaire.statut = :statut', { statut });
    }

    const [inventaires, total] = await requete
      .orderBy('inventaire.dateInventaire', 'DESC')
      .addOrderBy('inventaire.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Résumé de chaque inventaire de la page, calculé en UNE requête SQL
    // groupée (plutôt qu'une requête par inventaire).
    const resumes = new Map<number, Resume>();
    if (inventaires.length > 0) {
      const lignes = await this.linesRepository
        .createQueryBuilder('ligne')
        .select('ligne.inventoryId', 'inventoryId')
        .addSelect('COUNT(*)', 'nbLignes')
        .addSelect('COUNT(ligne.quantiteReelle)', 'nbComptees')
        .addSelect('COUNT(*) FILTER (WHERE ligne.ecart <> 0)', 'nbEcarts')
        .where('ligne.inventoryId IN (:...ids)', {
          ids: inventaires.map((i) => i.id),
        })
        .groupBy('ligne.inventoryId')
        .getRawMany<{
          inventoryId: number | string;
          nbLignes: string;
          nbComptees: string;
          nbEcarts: string;
        }>();

      // COUNT revient en texte depuis PostgreSQL : on convertit en nombre.
      for (const l of lignes) {
        resumes.set(Number(l.inventoryId), {
          nbLignes: Number(l.nbLignes),
          nbComptees: Number(l.nbComptees),
          nbEcarts: Number(l.nbEcarts),
        });
      }
    }

    const data = inventaires.map((inventaire) => ({
      ...inventaire,
      resume: resumes.get(inventaire.id) ?? {
        nbLignes: 0,
        nbComptees: 0,
        nbEcarts: 0,
      },
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ===== DÉTAIL d'un inventaire : en-tête + toutes les lignes =====
  async findOne(id: number) {
    const inventaire = await this.inventoriesRepository
      .createQueryBuilder('inventaire')
      .leftJoin('inventaire.user', 'utilisateur')
      .addSelect(['utilisateur.id', 'utilisateur.nom'])
      .where('inventaire.id = :id', { id })
      .getOne();
    if (!inventaire) {
      throw new NotFoundException(`Inventaire ${id} introuvable.`);
    }

    // Lignes avec quelques infos du produit (nom, référence, unité), triées
    // par nom de produit.
    const lignes = await this.linesRepository
      .createQueryBuilder('ligne')
      .leftJoin('ligne.product', 'produit')
      .addSelect(['produit.id', 'produit.nom', 'produit.reference', 'produit.unite'])
      .where('ligne.inventoryId = :id', { id })
      .orderBy('produit.nom', 'ASC')
      .getMany();

    return { ...inventaire, resume: this.resumer(lignes), lignes };
  }
}
// src/users/users.service.ts
//
// Un "service" contient la LOGIQUE MÉTIER : ce que l'application fait
// réellement (créer, lire, modifier...). Le contrôleur ne
// fera que recevoir les requêtes HTTP et appeler ce service.
import { ConflictException,Injectable,NotFoundException,BadRequestException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { Role } from './role.enum.js';
import { User } from './user.entity.js';

// Nombre de "tours" de calcul de bcrypt : plus il est grand, plus le hachage
// est lent (donc plus sûr contre les attaques). 10 est la valeur usuelle.
const SALT_ROUNDS = 10;

// @Injectable : permet à NestJS de créer ce service et de l'injecter ailleurs.
@Injectable()
export class UsersService {
  // Injection de dépendance : NestJS nous donne le "repository" de User,
  // l'objet TypeORM qui sait lire et écrire dans la table "utilisateur".
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Crée un utilisateur (réservé à l'administrateur, règle R10).
  async create(dto: CreateUserDto): Promise<User> {
    // 1) L'email doit être unique. 409 Conflict = "cette ressource existe déjà".
    const existant = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existant) {
      throw new ConflictException('Un compte avec cet email existe déjà.');
    }

    // 2) On hache le mot de passe : on enregistre l'empreinte, jamais le texte.
    const motDePasseHache = await bcrypt.hash(dto.motDePasse, SALT_ROUNDS);

    // 3) On prépare puis on enregistre l'utilisateur.
    const user = this.usersRepository.create({
      ...dto,
      motDePasse: motDePasseHache,
      telephone: dto.telephone ?? null,
    });
    const enregistre = await this.usersRepository.save(user);

    // 4) save() renvoie l'objet avec le mot de passe haché. On le relit pour
    // obtenir la version "propre" (select: false cache le mot de passe).
    return this.findOne(enregistre.id);
  }

  // Liste de tous les utilisateurs, triés par nom.
  findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { nom: 'ASC' } });
  }

  // Un utilisateur par son id. 404 Not Found s'il n'existe pas.
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${id} introuvable.`);
    }
    return user;
  }

  // Utilisé UNIQUEMENT pour la connexion (module Auth, étape suivante).
  // Comme le mot de passe a "select: false", il faut le demander explicitement
  // avec addSelect(). Renvoie null si l'email n'existe pas.
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.motDePasse')
      .where('user.email = :email', { email })
      .getOne();
  }

  // Modifie un utilisateur (nom, email, téléphone, rôle).
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // PartialType accepte aussi null ; ces champs sont pourtant obligatoires.
    if (dto.nom === null || dto.email === null || dto.role === null) {
      throw new BadRequestException(
        'Le nom, l\'email et le rôle ne peuvent pas être vides.',
      );
    }

    // Si l'email change, on vérifie qu'il n'est pas déjà pris par quelqu'un.
    if (dto.email && dto.email !== user.email) {
      const dejaPris = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (dejaPris) {
        throw new ConflictException('Un compte avec cet email existe déjà.');
      }
    }

    // Object.assign copie les champs reçus dans l'utilisateur existant.
    Object.assign(user, dto);
    await this.usersRepository.save(user);
    return this.findOne(id);
  }

  // Active ou désactive un compte (inverse la valeur actuelle de "actif").
  // Un compte désactivé ne peut plus se connecter (règle R9).
  async basculerActif(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.actif = !user.actif;
    return this.usersRepository.save(user);
  }

  // Chiffres clés des comptes, pour les cartes du tableau de bord de
  // l'administrateur : total, actifs, désactivés et répartition par rôle.
  async stats() {
    const total = await this.usersRepository.count();
    const actifs = await this.usersRepository.count({ where: { actif: true } });

    // Requête SQL groupée : SELECT role, COUNT(*) FROM utilisateur GROUP BY role
    const lignes = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'total')
      .groupBy('user.role')
      .getRawMany<{ role: Role; total: string }>();

    // On part de 0 pour chaque rôle, afin qu'un rôle absent s'affiche à 0.
    const parRole: Record<Role, number> = {
      [Role.PROPRIETAIRE]: 0,
      [Role.GERANT]: 0,
      [Role.ADMINISTRATEUR]: 0,
    };
    for (const ligne of lignes) {
      // COUNT(*) revient en texte depuis PostgreSQL : on le convertit en nombre.
      parRole[ligne.role] = Number(ligne.total);
    }

    return { total, actifs, inactifs: total - actifs, parRole };
  }
}
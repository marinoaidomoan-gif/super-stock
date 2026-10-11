// src/auth/auth.service.ts
//
// Logique de la connexion : vérifier l'email et le mot de passe, puis
// fabriquer le jeton JWT que le frontend enverra avec chaque requête.
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // 1) On cherche l'utilisateur AVEC son mot de passe haché
    // (normalement caché par select: false).
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    // 2) bcrypt.compare compare le mot de passe saisi avec l'empreinte
    // enregistrée. On ne peut pas "déchiffrer" l'empreinte : on re-hache le
    // mot de passe saisi et on compare les deux.
    const motDePasseValide = user
      ? await bcrypt.compare(dto.motDePasse, user.motDePasse)
      : false;

    // 3) Même message si l'email n'existe pas OU si le mot de passe est faux.
    // Ainsi, un pirate ne peut pas savoir quels emails existent.
    if (!user || !motDePasseValide) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    // 4) Règle R9 : un compte désactivé ne peut plus se connecter.
    // On le vérifie APRÈS le mot de passe, pour ne pas révéler l'existence
    // d'un compte à quelqu'un qui n'a pas le bon mot de passe.
    if (!user.actif) {
      throw new ForbiddenException(
        "Ce compte est désactivé. Contactez l'administrateur.",
      );
    }

    // 5) Le "payload" est le contenu du jeton : on y met l'id, l'email et le
    // rôle. Le jeton est signé avec JWT_SECRET : si quelqu'un le modifie, la
    // signature ne correspond plus et il est refusé.
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    // 6) On renvoie le jeton et le profil SANS le mot de passe.
    const profil = await this.usersService.findOne(user.id);
    return { access_token: accessToken, user: profil };
  }
}
// src/auth/public.decorator.ts
//
// Par défaut, TOUTES les routes seront protégées (guard global). Ce décorateur
// sert à marquer les rares routes ouvertes à tous, comme la connexion.
// On a choisi "protégé par défaut" car c'est plus sûr : si on oublie un
// décorateur, la route reste fermée au lieu d'être ouverte par erreur.
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Utilisation : @Public() juste au-dessus d'une route.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
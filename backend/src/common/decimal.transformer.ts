// src/common/decimal.transformer.ts
//
// PostgreSQL renvoie les colonnes "numeric" (nombres décimaux précis) sous
// forme de TEXTE : "12.500" au lieu de 12.5. Ce "transformer" convertit
// automatiquement la valeur en nombre quand TypeORM la lit dans la base.
// On le réutilisera pour les quantités des mouvements et des inventaires.
import { ValueTransformer } from 'typeorm';

export const decimalTransformer: ValueTransformer = {
  // Vers la base : la valeur est envoyée telle quelle.
  to: (valeur: number | null | undefined) => valeur,

  // Depuis la base : texte -> nombre (null reste null).
  from: (valeur: string | null | undefined) =>
    valeur === null || valeur === undefined ? valeur : parseFloat(valeur),
};
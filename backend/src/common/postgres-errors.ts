// src/common/postgres-errors.ts
//
// Outil pour reconnaître une erreur PostgreSQL de type "clé étrangère".
// Quand on supprime une ligne encore référencée par une autre table (ex. une
// catégorie qui contient des produits), PostgreSQL refuse et renvoie un code.
//
// POURQUOI PAS "erreur instanceof QueryFailedError" ?
// Dans un projet ESM, la bibliothèque TypeORM peut être chargée en deux
// exemplaires. L'erreur est alors fabriquée par un exemplaire, mais testée
// contre l'autre : "instanceof" répond faux et l'erreur n'est pas reconnue.
// Lire directement le code d'erreur fonctionne dans tous les cas.

// 23503 = foreign_key_violation (erreur de clé étrangère)
// 23001 = restrict_violation (ancienne forme, pour ON DELETE RESTRICT)
const CODES_CLE_ETRANGERE = ['23503', '23001'];

export function estErreurCleEtrangere(erreur: unknown): boolean {
  if (typeof erreur !== 'object' || erreur === null) {
    return false;
  }

  // TypeORM enveloppe l'erreur du pilote "pg" : le code se trouve dans
  // "driverError.code", et parfois directement dans "code".
  const e = erreur as { code?: unknown; driverError?: { code?: unknown } };
  const code = e.driverError?.code ?? e.code;

  return typeof code === 'string' && CODES_CLE_ETRANGERE.includes(code);
}
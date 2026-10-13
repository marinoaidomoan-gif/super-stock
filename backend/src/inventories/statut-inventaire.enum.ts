// src/inventories/statut-inventaire.enum.ts
//
// État d'un inventaire. Il deviendra le type énuméré PostgreSQL
// "statut_inventaire".
export enum StatutInventaire {
  // L'inventaire est lancé : on compte, on peut enregistrer les quantités
  // réelles, annuler, ou valider. Les mouvements de stock sont suspendus.
  EN_COURS = 'EN_COURS',

  // L'inventaire est validé : les corrections de stock ont été créées.
  // Il ne peut plus jamais être modifié ni annulé.
  VALIDE = 'VALIDE',
}
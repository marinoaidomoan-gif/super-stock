// src/users/role.enum.ts
//
export enum Role {
  // Dirige le supermarché. Il hérite de tous les droits du gérant et peut en
  // plus gérer les fournisseurs, consulter l'historique et faire l'inventaire.
  PROPRIETAIRE = 'PROPRIETAIRE',

  // Responsable du stock au quotidien : produits, catégories, entrées/sorties,
  // corrections et alertes.
  GERANT = 'GERANT',

  // Administrateur système : gère uniquement les comptes utilisateurs
  // (il n'a aucun droit de modification sur le stock).
  ADMINISTRATEUR = 'ADMINISTRATEUR',
}
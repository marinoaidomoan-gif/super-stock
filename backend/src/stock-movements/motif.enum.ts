// src/stock-movements/motif.enum.ts
//
// Motif d'un mouvement de stock : POURQUOI le stock a changé.
// Il deviendra le type énuméré PostgreSQL "motif_mouvement".
import { TypeMouvement } from './type-mouvement.enum.js';

export enum Motif {
  RECEPTION = 'RECEPTION', // livraison d'un fournisseur (entrée)
  RETOUR_CLIENT = 'RETOUR_CLIENT', // un client rend un produit (entrée)
  VENTE = 'VENTE', // produit vendu (sortie)
  PERTE = 'PERTE', // produit perdu ou volé (sortie)
  CASSE = 'CASSE', // produit abîmé (sortie)
  CORRECTION = 'CORRECTION', // annule un mouvement par erreur (entrée ou sortie)
}

// Motifs autorisés selon le type de mouvement (même règle que la contrainte
// CHECK du MLD). Par exemple, on ne peut pas faire une SORTIE pour "RECEPTION".
export const MOTIFS_AUTORISES: Record<TypeMouvement, Motif[]> = {
  [TypeMouvement.ENTREE]: [
    Motif.RECEPTION,
    Motif.RETOUR_CLIENT,
    Motif.CORRECTION,
  ],
  [TypeMouvement.SORTIE]: [
    Motif.VENTE,
    Motif.PERTE,
    Motif.CASSE,
    Motif.CORRECTION,
  ],
};
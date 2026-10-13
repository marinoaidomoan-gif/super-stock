// src/products/unite.enum.ts
//
// Unités de vente possibles d'un produit (énumération "Unite" du diagramme
// de classes). Elle deviendra un type énuméré PostgreSQL "unite_produit".
export enum Unite {
  PIECE = 'PIECE',
  KG = 'KG',
  LITRE = 'LITRE',
  CARTON = 'CARTON',
  SACHET = 'SACHET',
}
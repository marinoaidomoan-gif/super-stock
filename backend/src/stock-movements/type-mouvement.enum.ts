// src/stock-movements/type-mouvement.enum.ts
//
// Type d'un mouvement de stock (énumération "TypeMouvement" du diagramme de
// classes). Il deviendra le type énuméré PostgreSQL "type_mouvement".
export enum TypeMouvement {
  // Du stock ENTRE dans le magasin : la quantité du produit augmente.
  ENTREE = 'ENTREE',
  // Du stock SORT du magasin : la quantité du produit diminue.
  SORTIE = 'SORTIE',
}
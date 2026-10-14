// Statut affiché : rupture (stock à 0), stock bas (au seuil ou dessous), sinon en stock.
// "enAlerte" est calculé par le backend (quantité <= seuil).
export function getStockStatus(product) {
  if (product.quantiteStock <= 0) return 'out'
  if (product.enAlerte) return 'low'
  return 'ok'
}
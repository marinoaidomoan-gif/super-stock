import { getErrorMessage } from '@/lib/errors'

// Motifs proposés selon le type. CORRECTION n'y figure pas : il passe par l'action « Corriger ».
export const MOTIFS_BY_TYPE = {
  ENTREE: ['RECEPTION', 'RETOUR_CLIENT'],
  SORTIE: ['VENTE', 'PERTE', 'CASSE'],
}

// Unités qui ne se fractionnent pas (le serveur accepte des décimales, pas l'interface).
export const INTEGER_UNITS = ['PIECE', 'CARTON', 'SACHET']

// Nombre positif, 3 décimales maximum (comme la colonne numeric(12,3)).
export const QUANTITY_REGEX = /^\d{1,9}(\.\d{1,3})?$/

// 409 : le serveur explique précisément la cause (inventaire en cours, produit désactivé,
// mouvement déjà corrigé). On affiche son message plutôt qu'un texte générique.
// Il est en français : pour le traduire, le backend devrait renvoyer des codes d'erreur.
export function getMovementError(error, t) {
  if (error?.response?.status === 409) {
    return error.response.data?.message || t('movements.errors.conflict')
  }
  return getErrorMessage(error, t)
}
// locale : 'fr' ou 'en' (i18n.resolvedLanguage)
export const formatNumber = (value, locale) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(value)

export const formatDateTime = (value, locale) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

// src/lib/format.js
//
// Fonctions d'affichage partagées : nombres, dates, lecture d'une quantité
// saisie par l'utilisateur.

// Arrondit à 3 décimales, comme la base de données (numeric(12,3)).
// Évite les erreurs de JavaScript du type 0.1 + 0.2 = 0.30000000000000004.
export const arrondir3 = (nombre) => Math.round(nombre * 1000) / 1000

// Quantité lisible selon la langue : 1 250,5 (fr) ou 1,250.5 (en).
export function formatQuantite(valeur, langue = 'fr') {
  if (valeur === null || valeur === undefined) return '—'
  return new Intl.NumberFormat(langue, { maximumFractionDigits: 3 }).format(valeur)
}

// Écart avec son signe : +12, -3 (et "0" sans signe).
export function formatEcart(valeur, langue = 'fr') {
  if (valeur === null || valeur === undefined) return '—'
  return new Intl.NumberFormat(langue, {
    maximumFractionDigits: 3,
    signDisplay: 'exceptZero',
  }).format(valeur)
}

// Date et heure lisibles selon la langue, à partir d'un texte ISO du backend.
export function formatDate(valeur, langue = 'fr') {
  if (!valeur) return '—'
  return new Intl.DateTimeFormat(langue, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(valeur))
}

// Une quantité saisie : 1 à 9 chiffres, puis éventuellement une virgule ou un
// point suivi de 1 à 3 chiffres (comme le backend : 3 décimales maximum).
const MOTIF_QUANTITE = /^\d{1,9}([.,]\d{1,3})?$/

// Transforme le texte saisi ("12,5") en nombre (12.5).
// Renvoie null si le texte n'est pas une quantité valide ("abc", "1,2345", "-3").
export function lireQuantite(texte) {
  const propre = String(texte ?? '').trim()
  if (!MOTIF_QUANTITE.test(propre)) return null
  return Number(propre.replace(',', '.'))
}
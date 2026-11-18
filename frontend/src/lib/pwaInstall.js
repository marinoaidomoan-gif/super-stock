// src/lib/pwaInstall.js
//
// Garde en mémoire la "proposition d'installation" du navigateur.
//
// POURQUOI UN FICHIER À PART ? Le navigateur envoie l'évènement
// "beforeinstallprompt" UNE SEULE FOIS, souvent très tôt après le chargement.
// Si on l'écoutait seulement dans un composant (le bouton), on le raterait dès
// que le composant s'affiche un peu plus tard. Ici, on l'écoute dès le démarrage
// de l'application (ce fichier est importé dans main.jsx), on le met de côté,
// et les composants viennent le consulter quand ils en ont besoin.

// Appli déjà installée ? "standalone" = ouverte dans sa propre fenêtre
// (navigator.standalone : cas particulier de Safari sur iPhone).
const estDejaInstallee = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

// État partagé. On le REMPLACE à chaque changement (jamais on ne le modifie) :
// c'est ce que demande useSyncExternalStore pour détecter les changements.
let etat = {
  evenement: null, // l'évènement "beforeinstallprompt" mis de côté
  installee: estDejaInstallee(),
}

// Liste des composants qui veulent être prévenus d'un changement.
const abonnes = new Set()
const notifier = () => abonnes.forEach((prevenir) => prevenir())

// Le navigateur propose l'installation : on met l'évènement de côté.
// preventDefault() empêche la mini-bannière automatique du navigateur : on
// affichera NOTRE bouton, au bon endroit.
window.addEventListener('beforeinstallprompt', (evenement) => {
  evenement.preventDefault()
  etat = { ...etat, evenement }
  notifier()
})

// L'utilisateur vient d'installer l'application.
window.addEventListener('appinstalled', () => {
  etat = { evenement: null, installee: true }
  notifier()
})

// ----- Fonctions utilisées par le hook useInstallPrompt -----

export function sAbonner(prevenir) {
  abonnes.add(prevenir)
  return () => abonnes.delete(prevenir)
}

export const lireEtat = () => etat

// Affiche la fenêtre d'installation du navigateur.
// Renvoie "accepted" ou "dismissed" selon le choix de l'utilisateur.
export async function lancerInstallation() {
  const { evenement } = etat
  if (!evenement) return null

  await evenement.prompt()
  const { outcome } = await evenement.userChoice

  // L'évènement n'est utilisable qu'UNE fois : on le jette. S'il a refusé,
  // le navigateur en renverra peut-être un autre plus tard.
  etat = { ...etat, evenement: null }
  notifier()
  return outcome
}
// src/hooks/useInstallPrompt.js
//
// Dit si on peut proposer d'installer l'application :
//   const { peutInstaller, aideIOS, installer } = useInstallPrompt()
//
// - peutInstaller : Chrome, Edge, Android... proposent l'installation en un
//                   clic (évènement beforeinstallprompt) ;
// - aideIOS       : sur iPhone / iPad, il n'y a PAS d'installation en un clic.
//                   Il faut passer par "Partager > Sur l'écran d'accueil" : on
//                   affichera une petite aide.
import { useSyncExternalStore } from 'react'
import { lancerInstallation, lireEtat, sAbonner } from '@/lib/pwaInstall.js'

// iPhone, iPad, iPod. (Les iPad récents se présentent comme un Mac, mais ont
// un écran tactile : c'est ce que teste la 2e condition.)
const estIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export function useInstallPrompt() {
  // useSyncExternalStore : lit un état qui vit EN DEHORS de React (celui de
  // pwaInstall.js) et réaffiche le composant quand il change.
  const etat = useSyncExternalStore(sAbonner, lireEtat, lireEtat)

  return {
    peutInstaller: Boolean(etat.evenement) && !etat.installee,
    aideIOS: estIOS() && !etat.installee,
    installee: etat.installee,
    installer: lancerInstallation,
  }
}
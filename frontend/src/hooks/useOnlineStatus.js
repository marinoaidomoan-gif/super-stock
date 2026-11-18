// src/hooks/useOnlineStatus.js
//
// Dit si l'appareil est connecté au réseau :
//   const enLigne = useOnlineStatus()   // true ou false
//
// Limite à connaître : "en ligne" veut dire "connecté à un réseau" (Wi-Fi,
// données mobiles), pas forcément "le serveur répond". C'est pour ça que les
// appels à l'API gèrent AUSSI leurs propres erreurs réseau.
import { useSyncExternalStore } from 'react'

function sAbonner(prevenir) {
  window.addEventListener('online', prevenir)
  window.addEventListener('offline', prevenir)
  return () => {
    window.removeEventListener('online', prevenir)
    window.removeEventListener('offline', prevenir)
  }
}

export function useOnlineStatus() {
  return useSyncExternalStore(
    sAbonner,
    () => navigator.onLine, // valeur actuelle
    () => true, // valeur côté serveur (inutile ici, exigée par React)
  )
}
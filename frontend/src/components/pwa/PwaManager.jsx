// src/components/pwa/PwaManager.jsx
//
// Ne dessine rien à l'écran : il enregistre le service worker et affiche des
// messages (toasts) quand il se passe quelque chose :
//   - "Nouvelle version disponible" avec les boutons Actualiser / Plus tard ;
//   - "Application prête pour le hors-ligne" la toute première fois.
import { useEffect } from 'react'
// Module "virtuel" fabriqué par vite-plugin-pwa : il n'existe pas comme fichier,
// le plugin l'injecte au moment du build.
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

// Identifiant fixe du toast : si on le réaffiche, il REMPLACE l'ancien au lieu
// de s'empiler (et on peut le fermer par son identifiant).
const ID_MISE_A_JOUR = 'pwa-mise-a-jour'

// Le navigateur vérifie les mises à jour au chargement de la page. Pour une
// application qu'on laisse ouverte toute la journée, on re-vérifie chaque heure.
const UNE_HEURE = 60 * 60 * 1000

export default function PwaManager() {
  const { t } = useTranslation()

  const {
    // [valeur, fonction pour la changer]
    needRefresh: [needRefresh, setNeedRefresh], // une nouvelle version attend
    offlineReady: [offlineReady, setOfflineReady], // le cache est prêt
    updateServiceWorker, // applique la nouvelle version
  } = useRegisterSW({
    onRegisteredSW(_adresse, enregistrement) {
      if (!enregistrement) return
      setInterval(() => {
        // Inutile (et source d'erreur) de chercher une mise à jour hors ligne.
        if (navigator.onLine) {
          enregistrement.update().catch(() => {})
        }
      }, UNE_HEURE)
    },
    onRegisterError(erreur) {
      console.error("Erreur d'enregistrement du service worker :", erreur)
    },
  })

  // ----- Une nouvelle version est prête -----
  useEffect(() => {
    if (!needRefresh) {
      toast.dismiss(ID_MISE_A_JOUR)
      return
    }

    toast(t('pwa.updateTitle'), {
      id: ID_MISE_A_JOUR,
      description: t('pwa.updateText'),
      // Infinity : le toast reste affiché tant que l'utilisateur n'a pas choisi.
      duration: Infinity,
      action: {
        label: t('pwa.refresh'),
        // true : active la nouvelle version ET recharge la page.
        onClick: () => updateServiceWorker(true),
      },
      cancel: {
        label: t('pwa.later'),
        // On masque le message ; la nouvelle version s'activera toute seule à la
        // prochaine ouverture de l'application.
        onClick: () => setNeedRefresh(false),
      },
    })
  }, [needRefresh, t, updateServiceWorker, setNeedRefresh])

  // ----- L'application peut fonctionner hors ligne (affiché une seule fois) -----
  useEffect(() => {
    if (!offlineReady) return
    toast.success(t('pwa.offlineReady'))
    setOfflineReady(false)
  }, [offlineReady, t, setOfflineReady])

  return null
}
// src/components/pwa/OfflineBanner.jsx
//
// Bandeau fixe en haut de l'écran :
//   - ORANGE quand l'appareil perd la connexion ;
//   - VERT pendant 3 secondes quand elle revient.
// Au retour du réseau, React Query recharge de lui-même les données
// périmées (refetchOnReconnect est activé par défaut).
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Wifi, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '@/hooks/useOnlineStatus.js'
import { cn } from '@/lib/utils'

export default function OfflineBanner() {
  const { t } = useTranslation()
  const enLigne = useOnlineStatus()

  const [reconnecte, setReconnecte] = useState(false)
  // useRef : retient une valeur entre deux affichages SANS en provoquer un.
  // Ici : "a-t-on été hors ligne ?", pour ne pas afficher "Connexion rétablie"
  // au simple chargement de la page.
  const etaitHorsLigne = useRef(false)

  useEffect(() => {
    if (!enLigne) {
      etaitHorsLigne.current = true
      setReconnecte(false)
      return undefined
    }

    if (etaitHorsLigne.current) {
      etaitHorsLigne.current = false
      setReconnecte(true)
      // Le message vert disparaît seul après 3 secondes.
      const minuteur = setTimeout(() => setReconnecte(false), 3000)
      return () => clearTimeout(minuteur)
    }
    return undefined
  }, [enLigne])

  const visible = !enLigne || reconnecte

  return (
    // AnimatePresence : joue l'animation de SORTIE avant de retirer le bandeau.
    <AnimatePresence>
      {visible && (
        <motion.div
          // "key" différent selon l'état : le bandeau se re-joue quand on passe
          // de l'orange au vert.
          key={enLigne ? 'en-ligne' : 'hors-ligne'}
          role="status"
          aria-live="polite" // les lecteurs d'écran annoncent le changement
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            'fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-center text-sm font-medium text-white shadow-md print:hidden',
            enLigne ? 'bg-emerald-600' : 'bg-amber-600',
          )}
        >
          {enLigne ? (
            <Wifi className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <WifiOff className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{enLigne ? t('pwa.backOnline') : t('pwa.offlineBanner')}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
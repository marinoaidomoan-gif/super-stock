import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Logo from '@/components/common/Logo'

// Durée totale du splash avant disparition (en ms).
// 1200 ms = le temps de voir le logo + la petite animation.
const SPLASH_DURATION = 1200

export default function SplashScreen({ onDone }) {
  const { t } = useTranslation()
  const shouldReduce = useReducedMotion()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      // On attend la fin de l'animation de sortie (400ms) avant de prévenir le parent.
      setTimeout(() => onDone?.(), 450)
    }, SPLASH_DURATION)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 grid place-items-center bg-emerald-950 dark:bg-emerald-950"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Halos émeraude en arrière-plan */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute left-1/4 top-1/4 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 size-96 translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center gap-8">
            {/* Logo avec animation de pulsation */}
            <motion.div
              animate={
                shouldReduce
                  ? undefined
                  : {
                      scale: [1, 1.08, 1],
                      opacity: [1, 0.75, 1],
                    }
              }
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="[&_span:last-child]:text-white"
            >
              <Logo />
            </motion.div>

            {/* Barre de chargement animée */}
            <div className="h-1 w-40 overflow-hidden rounded-full bg-emerald-900/60">
              <motion.div
                className="h-full w-1/3 rounded-full bg-emerald-400"
                animate={
                  shouldReduce
                    ? { x: '0%' }
                    : { x: ['-100%', '300%'] }
                }
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
              {t('common.loading')}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
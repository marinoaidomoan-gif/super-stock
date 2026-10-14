// src/components/landing/Hero.jsx
//
// Section d'accueil : titre, sous-titre, deux boutons et la maquette qui
// flotte avec un effet de parallaxe.
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import LoginButton from '@/components/common/LoginButton.jsx'
import { allerA } from '@/lib/scroll.js'
import DashboardMockup from './DashboardMockup.jsx'

// ENTRÉE EN SÉQUENCE : le conteneur déclenche ses enfants l'un après l'autre
// (staggerChildren = 0,12 s de décalage entre chaque élément).
const conteneur = {
  cache: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const element = {
  cache: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  const { t } = useTranslation()
  const ref = useRef(null)

  // PARALLAXE : scrollYProgress va de 0 (haut de la section) à 1 (section
  // sortie de l'écran). On en déduit un décalage vertical : la maquette descend
  // moins vite que la page, et les halos de couleur encore plus.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const decalageMaquette = useTransform(scrollYProgress, [0, 1], [0, 90])
  const decalageHalos = useTransform(scrollYProgress, [0, 1], [0, 160])

  return (
    <section ref={ref} className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
      {/* Halos de couleur en arrière-plan (décoratifs) */}
      <motion.div
        aria-hidden="true"
        style={{ y: decalageHalos }}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-20 right-0 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -left-20 top-40 size-72 rounded-full bg-teal-400/15 blur-3xl" />
      </motion.div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
        <motion.div
          variants={conteneur}
          initial="cache"
          animate="visible"
          className="space-y-6 text-center lg:text-left"
        >
          <motion.span
            variants={element}
            className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            {t('landing.hero.badge')}
          </motion.span>

          <motion.h1
            variants={element}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t('landing.hero.titleStart')}{' '}
            {/* Texte dégradé : bg-clip-text + text-transparent */}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              {t('landing.hero.titleAccent')}
            </span>
          </motion.h1>

          <motion.p
            variants={element}
            className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0"
          >
            {t('landing.hero.subtitle')}
          </motion.p>

          <motion.div
            variants={element}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <LoginButton size="lg" />
            <Button
              variant="outline"
              size="lg"
              onClick={() => allerA('fonctionnalites')}
              className="transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 active:scale-95"
            >
              {t('landing.hero.discover')}
            </Button>
          </motion.div>
        </motion.div>

        {/* Maquette : parallaxe (décalage au défilement) + flottement continu */}
        <motion.div style={{ y: decalageMaquette }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <DashboardMockup />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
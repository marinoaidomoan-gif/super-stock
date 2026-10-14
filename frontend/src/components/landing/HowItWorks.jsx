// src/components/landing/HowItWorks.jsx
//
// "Comment ça marche" : 3 étapes numérotées reliées par une ligne.
import { motion } from 'framer-motion'
import { ArrowLeftRight, FolderTree, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Reveal } from './motion.jsx'

const ETAPES = [
  { id: 'one', numero: '01', Icone: FolderTree },
  { id: 'two', numero: '02', Icone: ArrowLeftRight },
  { id: 'three', numero: '03', Icone: TrendingUp },
]

export default function HowItWorks() {
  const { t } = useTranslation()

  return (
    <section id="comment-ca-marche" className="scroll-mt-20 bg-muted/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t('landing.how.title')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('landing.how.subtitle')}</p>
        </Reveal>

        <div className="relative grid gap-10 md:grid-cols-3">
          {/* Ligne qui relie les 3 cercles (visible à partir de "md") */}
          <div
            aria-hidden="true"
            className="absolute inset-x-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent md:block"
          />

          {ETAPES.map(({ id, numero, Icone }, index) => (
            <Reveal key={id} delay={index * 0.15} className="relative text-center">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="mx-auto grid size-16 place-items-center rounded-full border-2 border-emerald-500 bg-background text-emerald-500 shadow-lg shadow-emerald-500/10"
              >
                <Icone className="size-6" aria-hidden="true" />
              </motion.div>
              <p className="mt-4 text-sm font-semibold text-emerald-500">{numero}</p>
              <h3 className="mt-1 text-lg font-semibold">
                {t(`landing.how.steps.${id}.title`)}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                {t(`landing.how.steps.${id}.text`)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
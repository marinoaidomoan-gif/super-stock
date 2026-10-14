// src/components/landing/Features.jsx
//
// Les 6 fonctionnalités, sous forme de cartes qui apparaissent en cascade au
// défilement. Au survol : la carte s'élève et sa bordure devient émeraude.
import { motion } from 'framer-motion'
import {
  ArrowLeftRight,
  BellRing,
  ClipboardCheck,
  Package,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Reveal } from './motion.jsx'

// "id" sert à retrouver les textes : landing.features.items.<id>.title / .text
const FONCTIONNALITES = [
  { id: 'products', Icone: Package },
  { id: 'movements', Icone: ArrowLeftRight },
  { id: 'inventory', Icone: ClipboardCheck },
  { id: 'alerts', Icone: BellRing },
  { id: 'roles', Icone: ShieldCheck },
  { id: 'stats', Icone: TrendingUp },
]

export default function Features() {
  const { t } = useTranslation()

  return (
    // id = cible du lien du menu ; scroll-mt-20 évite que la barre fixe masque le titre.
    <section id="fonctionnalites" className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t('landing.features.title')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('landing.features.subtitle')}</p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FONCTIONNALITES.map(({ id, Icone }, index) => (
            // delay croissant : les cartes arrivent l'une après l'autre.
            <Reveal key={id} delay={index * 0.08}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group h-full rounded-xl border bg-card p-6 transition-colors hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                {/* L'icône tourne légèrement au survol de la carte. */}
                <div className="mb-4 grid size-11 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <Icone className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-semibold">
                  {t(`landing.features.items.${id}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`landing.features.items.${id}.text`)}
                </p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
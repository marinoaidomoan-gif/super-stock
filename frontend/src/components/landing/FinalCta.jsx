// src/components/landing/FinalCta.jsx
//
// Dernier appel à l'action avant le pied de page.
import { useTranslation } from 'react-i18next'
import LoginButton from '@/components/common/LoginButton.jsx'
import { Reveal } from './motion.jsx'

export default function FinalCta() {
  const { t } = useTranslation()

  return (
    <section className="px-4 py-20 md:py-28">
      <Reveal>
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-500 px-6 py-14 text-center text-white shadow-2xl shadow-emerald-500/20">
          {/* Cercles décoratifs */}
          <div aria-hidden="true" className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10" />
          <div aria-hidden="true" className="absolute -bottom-12 -left-12 size-56 rounded-full bg-white/10" />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t('landing.cta.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">{t('landing.cta.subtitle')}</p>
            <div className="mt-8 flex justify-center">
              {/* Bouton blanc sur fond émeraude : ces classes remplacent celles par défaut. */}
              <LoginButton
                size="lg"
                className="bg-white text-emerald-700 shadow-none hover:bg-white/90"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
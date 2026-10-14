// src/components/landing/Stats.jsx
//
// Compteurs animés. Ce sont de VRAIS chiffres du produit (pas de chiffres
// inventés) : 3 rôles, 8 modules, 2 langues, et 100 % des mouvements tracés
// (un mouvement n'est jamais modifié ni supprimé).
// Chaque carte a une bordure en dégradé : le conteneur extérieur est coloré
// avec 1 px de padding, et la carte intérieure le recouvre sauf sur le bord.
import { useTranslation } from 'react-i18next'
import { AnimatedCounter, Reveal } from './motion.jsx'

const CHIFFRES = [
  { id: 'roles', valeur: 3, suffixe: '' },
  { id: 'modules', valeur: 8, suffixe: '' },
  { id: 'languages', valeur: 2, suffixe: '' },
  { id: 'traced', valeur: 100, suffixe: ' %' },
]

export default function Stats() {
  const { t } = useTranslation()

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t('landing.stats.title')}
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CHIFFRES.map(({ id, valeur, suffixe }, index) => (
            <Reveal key={id} delay={index * 0.1}>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/60 via-emerald-500/10 to-transparent p-px transition-transform duration-300 hover:-translate-y-1">
                <div className="rounded-[15px] bg-card p-6 text-center">
                  <p className="text-4xl font-bold text-emerald-500 md:text-5xl">
                    <AnimatedCounter valeur={valeur} suffixe={suffixe} />
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(`landing.stats.${id}`)}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
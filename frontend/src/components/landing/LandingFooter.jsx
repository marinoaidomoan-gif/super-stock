// src/components/landing/LandingFooter.jsx
//
// Pied de page : logo, navigation, réseaux sociaux (s'il y en a), copyright.
import { useTranslation } from 'react-i18next'
import Logo from '@/components/common/Logo.jsx'
import { allerA } from '@/lib/scroll.js'

const LIENS = [
  { id: 'fonctionnalites', cle: 'landing.nav.features' },
  { id: 'comment-ca-marche', cle: 'landing.nav.how' },
  { id: 'a-propos', cle: 'landing.nav.about' },
  { id: 'contact', cle: 'landing.nav.contact' },
]

// ⚠️ À REMPLIR avec tes vrais comptes, par exemple :
//   { nom: 'GitHub', href: 'https://github.com/ton-compte' }
// Tant que la liste est vide, la colonne "Suivez-nous" n'apparaît pas.
const LIENS_SOCIAUX = []

export default function LandingFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{t('landing.footer.tagline')}</p>
        </div>

        <nav aria-label={t('landing.footer.navigation')}>
          <h3 className="mb-3 text-sm font-semibold">{t('landing.footer.navigation')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {LIENS.map((lien) => (
              <li key={lien.id}>
                <a
                  href={`#${lien.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    allerA(lien.id)
                  }}
                  className="transition-colors hover:text-emerald-500"
                >
                  {t(lien.cle)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {LIENS_SOCIAUX.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t('landing.footer.follow')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {LIENS_SOCIAUX.map((lien) => (
                <li key={lien.nom}>
                  <a
                    href={lien.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-emerald-500"
                  >
                    {lien.nom}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} SuperStock. {t('landing.footer.rights')}
          </p>
          <p>{t('landing.footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  )
}
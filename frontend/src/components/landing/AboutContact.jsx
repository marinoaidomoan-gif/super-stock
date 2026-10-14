// src/components/landing/AboutContact.jsx
//
// Sections "À propos" et "Contact" (cibles des liens du menu).
import { Mail, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Reveal } from './motion.jsx'

// ⚠️ À REMPLACER par tes vraies informations de contact.
const CONTACT = {
  email: 'contact@exemple.com',
  adresse: 'Votre adresse ici',
}

export default function AboutContact() {
  const { t } = useTranslation()

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-2">
        <Reveal>
          <div id="a-propos" className="scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">{t('landing.about.title')}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t('landing.about.text')}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div id="contact" className="scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">{t('landing.contact.title')}</h2>
            <p className="mt-4 text-muted-foreground">{t('landing.contact.text')}</p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs text-muted-foreground">
                    {t('landing.contact.email')}
                  </span>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="font-medium transition-colors hover:text-emerald-500"
                  >
                    {CONTACT.email}
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <MapPin className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs text-muted-foreground">
                    {t('landing.contact.address')}
                  </span>
                  <span className="font-medium">{CONTACT.adresse}</span>
                </span>
              </li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
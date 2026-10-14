// src/components/landing/LandingNavbar.jsx
//
// Barre de navigation fixe en haut de la landing page : logo, liens vers les
// sections, langue, thème et bouton de connexion. Sur mobile, les liens sont
// dans un menu "hamburger".
// Effets : verre dépoli (glassmorphism) et barre plus compacte dès qu'on défile.
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.jsx'
import LoginButton from '@/components/common/LoginButton.jsx'
import Logo from '@/components/common/Logo.jsx'
import ThemeToggle from '@/components/common/ThemeToggle.jsx'
import { allerA, remonterEnHaut } from '@/lib/scroll.js'
import { cn } from '@/lib/utils'

// id = identifiant de la section dans la page ; cle = texte traduit du lien.
const LIENS = [
  { id: 'fonctionnalites', cle: 'landing.nav.features' },
  { id: 'comment-ca-marche', cle: 'landing.nav.how' },
  { id: 'a-propos', cle: 'landing.nav.about' },
  { id: 'contact', cle: 'landing.nav.contact' },
]

export default function LandingNavbar() {
  const { t } = useTranslation()
  const [defile, setDefile] = useState(false)
  const [menuOuvert, setMenuOuvert] = useState(false)

  // Surveille le défilement : au-delà de 16 px, la barre devient compacte.
  useEffect(() => {
    const surDefilement = () => setDefile(window.scrollY > 16)
    surDefilement()
    window.addEventListener('scroll', surDefilement, { passive: true })
    return () => window.removeEventListener('scroll', surDefilement)
  }, [])

  // Clic sur un lien : défilement doux vers la section, et fermeture du menu mobile.
  function aller(evenement, id) {
    evenement.preventDefault()
    setMenuOuvert(false)
    allerA(id)
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        defile || menuOuvert
          ? 'border-b bg-background/70 shadow-sm backdrop-blur-xl'
          : 'bg-transparent',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300',
          defile ? 'h-14' : 'h-20',
        )}
      >
        <button
          type="button"
          onClick={remonterEnHaut}
          aria-label="SuperStock"
          className="rounded-md focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <Logo />
        </button>

        {/* Liens : cachés sur mobile (hidden), visibles dès la taille "md". */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {LIENS.map((lien) => (
            <a
              key={lien.id}
              href={`#${lien.id}`}
              onClick={(e) => aller(e, lien.id)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-emerald-500"
            >
              {t(lien.cle)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="ml-1 hidden md:block">
            <LoginButton size="sm" />
          </div>

          {/* Bouton hamburger : visible seulement sur mobile. */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
            aria-expanded={menuOuvert}
            aria-label={menuOuvert ? t('landing.nav.closeMenu') : t('landing.nav.openMenu')}
          >
            {menuOuvert ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Menu mobile : se déroule en douceur. */}
      <AnimatePresence>
        {menuOuvert && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden md:hidden"
            aria-label="Navigation mobile"
          >
            <div className="flex flex-col gap-1 px-4 pb-4">
              {LIENS.map((lien) => (
                <a
                  key={lien.id}
                  href={`#${lien.id}`}
                  onClick={(e) => aller(e, lien.id)}
                  className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted"
                >
                  {t(lien.cle)}
                </a>
              ))}
              <LoginButton className="mt-2 w-full" />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
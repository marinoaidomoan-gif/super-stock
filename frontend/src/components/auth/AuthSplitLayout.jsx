import { useTranslation } from 'react-i18next'
import LoginIllustration from '@/components/auth/LoginIllustration'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'
import Logo from '@/components/common/Logo'

export default function AuthSplitLayout({ children }) {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8">
      {/* Halos émeraude en arrière-plan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-emerald-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-emerald-400/10 blur-3xl"
      />

      {/* Actions en haut à droite */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Carte principale */}
      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-emerald-500/5 md:grid-cols-2">
        {/* Partie gauche : illustration */}
        <div className="relative hidden flex-col justify-between p-8 md:flex">
          <Logo />
          <LoginIllustration className="mx-auto h-auto w-full max-w-md text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs text-muted-foreground">
            {t('auth.login.brandTagline')}
          </p>
        </div>

        {/* Partie droite : formulaire */}
        <div className="relative flex flex-col justify-center bg-emerald-950 p-8 text-emerald-50 md:p-10 dark:bg-emerald-950/95">
          {/* Petite décoration */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, white 0, transparent 40%), radial-gradient(circle at 80% 80%, white 0, transparent 30%)',
            }}
          />

          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  )
}
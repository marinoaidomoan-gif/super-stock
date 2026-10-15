import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import LoginIllustration from '@/components/auth/LoginIllustration'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'
import Logo from '@/components/common/Logo'

// Trois blobs émeraude qui flottent lentement en arrière-plan.
// Chacun a sa propre trajectoire et sa propre durée : visuellement ils ne
// se synchronisent jamais, ce qui donne un effet organique.
const BLOBS = [
  {
    size: 520,
    className: 'bg-emerald-500/30',
    animate: {
      x: ['-20%', '10%', '-10%', '-20%'],
      y: ['-30%', '10%', '20%', '-30%'],
    },
    duration: 22,
    initial: { left: '-10%', top: '-15%' },
  },
  {
    size: 420,
    className: 'bg-emerald-400/25',
    animate: {
      x: ['0%', '-25%', '15%', '0%'],
      y: ['0%', '35%', '-20%', '0%'],
    },
    duration: 28,
    initial: { right: '-10%', bottom: '-10%' },
  },
  {
    size: 360,
    className: 'bg-teal-400/20',
    animate: {
      x: ['0%', '35%', '-25%', '0%'],
      y: ['0%', '-30%', '25%', '0%'],
    },
    duration: 34,
    initial: { left: '40%', top: '45%' },
  },
]

function LoginBackground() {
  const shouldReduce = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Dégradé de base très léger */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-emerald-50/50 dark:from-emerald-950/40 dark:via-background dark:to-emerald-950/30" />

      {/* Blobs animés */}
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${blob.className}`}
          style={{
            width: blob.size,
            height: blob.size,
            ...blob.initial,
          }}
          animate={shouldReduce ? undefined : blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grain subtil pour éviter l'effet "trop lisse" */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}

export default function AuthSplitLayout({ children }) {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8">
      {/* Fond animé (remplace les anciens halos statiques) */}
      <LoginBackground />

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

        {/* Partie droite : formulaire (fond vert foncé, toujours sombre) */}
        <div className="relative flex flex-col justify-center bg-emerald-950 p-8 text-emerald-50 md:p-10 dark:bg-emerald-950/95">
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
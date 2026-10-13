import { motion } from 'framer-motion'
import { Boxes } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'

export default function AuthLayout({ children }) {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Halos émeraude : ils donnent de la matière à l'effet verre dépoli */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md rounded-2xl border border-white/30 bg-white/60 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
      >
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Boxes className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-tight">{t('common.appName')}</span>
        </div>
        {children}
      </motion.main>
    </div>
  )
}
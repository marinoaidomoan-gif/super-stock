import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function InfoBanner() {
  const { t } = useTranslation()
  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-medium text-emerald-900 dark:text-emerald-200">
          {t('users.banner.title')}
        </p>
        <p className="text-sm text-emerald-800/80 dark:text-emerald-200/70">
          {t('users.banner.subtitle')}
        </p>
      </div>
    </div>
  )
}
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PageLoader() {
  const { t } = useTranslation()

  return (
    <div role="status" className="grid min-h-screen place-items-center bg-background text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  )
}
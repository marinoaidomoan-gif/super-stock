import { CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function OverviewToolbar() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage

  const today = new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="overview-toolbar">
      <div className="section-caption">
        <span className="live-dot" />
        <strong>{t('dashboard.overview')}</strong>
        <span className="caption-divider" />
        <span>{t('dashboard.updatedRealtime')}</span>
      </div>
      <div className="date-chip">
        <CalendarDays size={14} />
        {today}
      </div>
    </div>
  )
}
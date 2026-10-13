import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'

export default function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t('dashboard.welcome', { name: user.nom ?? user.email })}
      </h1>
      <p className="text-muted-foreground">{t('dashboard.role', { role: t(`roles.${user.role}`) })}</p>
    </div>
  )
}
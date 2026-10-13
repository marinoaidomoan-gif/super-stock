import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export default function Dashboard() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-end gap-2 p-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </header>
      <div className="mx-auto max-w-xl space-y-4 p-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('dashboard.welcome', { name: user.nom ?? user.email })}
        </h1>
        <p className="text-muted-foreground">{t('dashboard.role', { role: user.role })}</p>
        <Button variant="outline" onClick={logout}>
          {t('auth.logout')}
        </Button>
      </div>
    </main>
  )
}
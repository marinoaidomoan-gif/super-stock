import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from "@/components/common/ThemeToggle"

export default function App() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-end gap-2 p-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </header>
      <div className="grid place-items-center pt-24">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('common.appName')}</h1>
          <Button onClick={() => toast.error(t('errors.network'))}>{t('common.retry')}</Button>
        </div>
      </div>
    </main>
  )
}
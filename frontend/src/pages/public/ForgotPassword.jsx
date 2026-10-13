import { ArrowLeft, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'

export default function ForgotPassword() {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <div className="space-y-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t('auth.forgot.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('auth.forgot.message')}</p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">
            <ArrowLeft aria-hidden="true" />
            {t('auth.forgot.back')}
          </Link>
        </Button>
      </div>
    </AuthLayout>
  )
}
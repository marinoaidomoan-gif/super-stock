import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation } from 'react-router-dom'
import PageLoader from '@/components/common/PageLoader'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/errors'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { t } = useTranslation()
  const { user, isLoading, login } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', motDePasse: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const mutation = useMutation({ mutationFn: login })

  if (isLoading) return <PageLoader />
  // Déjà connecté (ou connexion réussie) : on part vers la page demandée, sinon le dashboard.
  if (user) return <Navigate to={location.state?.from?.pathname ?? '/dashboard'} replace />

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const validate = () => {
    const errors = {}
    if (!form.email.trim()) errors.email = t('auth.errors.emailRequired')
    else if (!EMAIL_REGEX.test(form.email.trim())) errors.email = t('auth.errors.emailInvalid')
    if (!form.motDePasse) errors.motDePasse = t('auth.errors.passwordRequired')
    return errors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    mutation.mutate({ email: form.email.trim(), motDePasse: form.motDePasse })
  }

  return (
    <AuthLayout>
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('auth.login.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.login.email')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t('auth.login.emailPlaceholder')}
            value={form.email}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (
            <p id="email-error" className="text-sm text-destructive">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="motDePasse">{t('auth.login.password')}</Label>
          <div className="relative">
            <Input
              id="motDePasse"
              name="motDePasse"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="pr-10"
              value={form.motDePasse}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.motDePasse)}
              aria-describedby={fieldErrors.motDePasse ? 'password-error' : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
          {fieldErrors.motDePasse && (
            <p id="password-error" className="text-sm text-destructive">{fieldErrors.motDePasse}</p>
          )}
        </div>

        {mutation.isError && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {getErrorMessage(mutation.error, t, {
              401: 'auth.invalidCredentials',
              403: 'auth.accountDisabled',
            })}
          </p>
        )}

        <Button type="submit" className="w-full transition-transform active:scale-[0.98]" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {t('auth.login.submit')}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link
          to="/forgot-password"
          className="text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('auth.login.forgot')}
        </Link>
      </div>
    </AuthLayout>
  )
}
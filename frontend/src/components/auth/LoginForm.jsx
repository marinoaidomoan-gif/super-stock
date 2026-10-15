import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getErrorMessage } from '@/lib/errors'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginForm({ onLogin, isPending, error }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ email: '', motDePasse: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const validate = () => {
    const errors = {}
    if (!form.email.trim()) errors.email = t('auth.errors.emailRequired')
    else if (!EMAIL_REGEX.test(form.email.trim()))
      errors.email = t('auth.errors.emailInvalid')
    if (!form.motDePasse) errors.motDePasse = t('auth.errors.passwordRequired')
    return errors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    onLogin({ email: form.email.trim(), motDePasse: form.motDePasse })
  }

  // Styles adaptés au fond sombre
  const inputClass =
    'h-11 rounded-xl border-emerald-800/60 bg-emerald-900/40 text-emerald-50 placeholder:text-emerald-200/40 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/30'
  const labelClass = 'text-sm font-medium text-emerald-100'

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {t('auth.login.title')}
        </h1>
        <p className="text-sm text-emerald-200/70">{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>
            {t('auth.login.email')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t('auth.login.emailPlaceholder')}
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email && (
            <p className="text-sm text-rose-300">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="motDePasse" className={labelClass}>
            {t('auth.login.password')}
          </Label>
          <div className="relative">
            <Input
              id="motDePasse"
              name="motDePasse"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`${inputClass} pr-10`}
              value={form.motDePasse}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.motDePasse)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-emerald-200 hover:bg-emerald-800/50 hover:text-emerald-50"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')
              }
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
          {fieldErrors.motDePasse && (
            <p className="text-sm text-rose-300">{fieldErrors.motDePasse}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-emerald-200/80 underline-offset-4 hover:text-emerald-100 hover:underline"
          >
            {t('auth.login.forgot')}
          </Link>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-xl bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-400/20 transition-all hover:bg-emerald-300 active:scale-[0.98]"
        >
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {t('auth.login.submit')}
        </Button>
      </form>
    </div>
  )
}
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FieldError from '@/components/common/FieldError'
import { useUpdatePassword } from '@/hooks/useUpdateProfile'
import { getErrorMessage } from '@/lib/errors'

export default function SecurityCard() {
  const { t } = useTranslation()
  const mutation = useUpdatePassword()
  const [form, setForm] = useState({
    actuel: '',
    nouveau: '',
    confirmation: '',
  })
  const [errors, setErrors] = useState({})

  const setField = (name, value) =>
    setForm((current) => ({ ...current, [name]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const next = {}
    if (!form.actuel) next.actuel = t('settings.security.errors.currentRequired')
    if (!form.nouveau) next.nouveau = t('settings.security.errors.newRequired')
    else if (form.nouveau.length < 6)
      next.nouveau = t('settings.security.errors.newTooShort')
    if (form.nouveau !== form.confirmation)
      next.confirmation = t('settings.security.errors.mismatch')

    setErrors(next)
    if (Object.keys(next).length > 0) return

    mutation.mutate(
      { motDePasseActuel: form.actuel, nouveauMotDePasse: form.nouveau },
      {
        onSuccess: () => {
          setForm({ actuel: '', nouveau: '', confirmation: '' })
        },
        onError: (error) => toast.error(getErrorMessage(error, t)),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.security.title')}</CardTitle>
        <CardDescription>{t('settings.security.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sec-actuel">{t('settings.security.current')}</Label>
            <Input
              id="sec-actuel"
              type="password"
              autoComplete="current-password"
              value={form.actuel}
              onChange={(event) => setField('actuel', event.target.value)}
              disabled={mutation.isPending}
            />
            <FieldError id="sec-actuel-error" message={errors.actuel} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sec-nouveau">{t('settings.security.new')}</Label>
            <Input
              id="sec-nouveau"
              type="password"
              autoComplete="new-password"
              value={form.nouveau}
              onChange={(event) => setField('nouveau', event.target.value)}
              disabled={mutation.isPending}
            />
            <FieldError id="sec-nouveau-error" message={errors.nouveau} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sec-confirmation">
              {t('settings.security.confirmation')}
            </Label>
            <Input
              id="sec-confirmation"
              type="password"
              autoComplete="new-password"
              value={form.confirmation}
              onChange={(event) => setField('confirmation', event.target.value)}
              disabled={mutation.isPending}
            />
            <FieldError id="sec-confirmation-error" message={errors.confirmation} />
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button type="submit" onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound aria-hidden="true" />
          )}
          {t('settings.security.submit')}
        </Button>
      </CardFooter>
    </Card>
  )
}
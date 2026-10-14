import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import FieldError from '@/components/common/FieldError'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers'
import { getErrorMessage } from '@/lib/errors'
import { ROLES } from '@/lib/roles'
import { EMAIL_REGEX } from '@/lib/validation'

const ROLE_OPTIONS = [ROLES.PROPRIETAIRE, ROLES.GERANT, ROLES.ADMINISTRATEUR]

export default function UserFormDialog({ open, onOpenChange, user }) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? t('users.form.editTitle') : t('users.form.createTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('users.form.helper')}
          </DialogDescription>
        </DialogHeader>
        <UserForm user={user} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function UserForm({ user, onDone }) {
  const { t } = useTranslation()
  const isEdit = Boolean(user)
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const mutation = isEdit ? updateMutation : createMutation

  const [form, setForm] = useState({
    nom: user?.nom ?? '',
    email: user?.email ?? '',
    telephone: user?.telephone ?? '',
    role: user?.role ?? ROLES.GERANT,
    motDePasse: '',
  })
  const [errors, setErrors] = useState({})

  const setField = (name, value) =>
    setForm((current) => ({ ...current, [name]: value }))

  const validate = () => {
    const next = {}
    const nom = form.nom.trim()
    const email = form.email.trim()

    if (!nom) next.nom = t('users.form.errors.nameRequired')
    else if (nom.length > 100) next.nom = t('users.form.errors.nameTooLong')

    if (!email) next.email = t('users.form.errors.emailRequired')
    else if (!EMAIL_REGEX.test(email)) next.email = t('users.form.errors.emailInvalid')

    if (form.telephone.trim().length > 30)
      next.telephone = t('users.form.errors.phoneTooLong')

    if (!form.role) next.role = t('users.form.errors.roleRequired')

    if (!isEdit) {
      if (!form.motDePasse) next.motDePasse = t('users.form.errors.passwordRequired')
      else if (form.motDePasse.length < 6)
        next.motDePasse = t('users.form.errors.passwordTooShort')
    }

    return next
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload = {
      nom: form.nom.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim() || null,
      role: form.role,
    }
    if (!isEdit) payload.motDePasse = form.motDePasse

    const options = {
      onSuccess: () => {
        toast.success(t(isEdit ? 'users.toast.updated' : 'users.toast.created'))
        onDone()
      },
      onError: (error) => toast.error(getErrorMessage(error, t)),
    }

    if (isEdit) updateMutation.mutate({ id: user.id, ...payload }, options)
    else createMutation.mutate(payload, options)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-nom">{t('users.form.name')}</Label>
        <Input
          id="user-nom"
          value={form.nom}
          onChange={(e) => setField('nom', e.target.value)}
          maxLength={100}
          aria-invalid={Boolean(errors.nom)}
        />
        <FieldError id="user-nom-error" message={errors.nom} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-email">{t('users.form.email')}</Label>
        <Input
          id="user-email"
          type="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          maxLength={150}
          aria-invalid={Boolean(errors.email)}
        />
        <FieldError id="user-email-error" message={errors.email} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-telephone">{t('users.form.phone')}</Label>
        <Input
          id="user-telephone"
          type="tel"
          value={form.telephone}
          onChange={(e) => setField('telephone', e.target.value)}
          maxLength={30}
          aria-invalid={Boolean(errors.telephone)}
        />
        <FieldError id="user-telephone-error" message={errors.telephone} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-role">{t('users.form.role')}</Label>
        <Select value={form.role} onValueChange={(v) => setField('role', v)}>
          <SelectTrigger id="user-role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {t(`roles.${r}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError id="user-role-error" message={errors.role} />
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="user-password">{t('users.form.password')}</Label>
          <Input
            id="user-password"
            type="password"
            value={form.motDePasse}
            onChange={(e) => setField('motDePasse', e.target.value)}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.motDePasse)}
          />
          <FieldError id="user-password-error" message={errors.motDePasse} />
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={mutation.isPending}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {t('common.save')}
        </Button>
      </DialogFooter>
    </form>
  )
}
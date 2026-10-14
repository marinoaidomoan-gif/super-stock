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
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useSuppliers'
import { getErrorMessage } from '@/lib/errors'
import { EMAIL_REGEX } from '@/lib/validation'

function TextField({ id, label, error, ...inputProps }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

// supplier = null : création. supplier = objet : modification.
export default function SupplierFormDialog({ open, onOpenChange, supplier }) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {supplier ? t('suppliers.form.editTitle') : t('suppliers.form.createTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('suppliers.form.helper')}</DialogDescription>
        </DialogHeader>
        {/* Démonté à la fermeture : le formulaire repart à neuf à chaque ouverture. */}
        <SupplierForm supplier={supplier} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function SupplierForm({ supplier, onDone }) {
  const { t } = useTranslation()
  const isEdit = Boolean(supplier)
  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()
  const mutation = isEdit ? updateMutation : createMutation

  const [form, setForm] = useState({
    nom: supplier?.nom ?? '',
    telephone: supplier?.telephone ?? '',
    email: supplier?.email ?? '',
    adresse: supplier?.adresse ?? '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const validate = () => {
    const next = {}
    const nom = form.nom.trim()
    const email = form.email.trim()

    if (!nom) next.nom = t('suppliers.form.errors.nameRequired')
    else if (nom.length > 150) next.nom = t('suppliers.form.errors.nameTooLong')

    if (form.telephone.trim().length > 30) next.telephone = t('suppliers.form.errors.phoneTooLong')

    if (email) {
      if (!EMAIL_REGEX.test(email)) next.email = t('suppliers.form.errors.emailInvalid')
      else if (email.length > 150) next.email = t('suppliers.form.errors.emailTooLong')
    }

    if (form.adresse.trim().length > 255) next.adresse = t('suppliers.form.errors.addressTooLong')
    return next
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // Un champ vide devient null : c'est ce qui permet d'effacer une coordonnée.
    const payload = {
      nom: form.nom.trim(),
      telephone: form.telephone.trim() || null,
      email: form.email.trim() || null,
      adresse: form.adresse.trim() || null,
    }

    const options = {
      onSuccess: () => {
        toast.success(t(isEdit ? 'suppliers.toast.updated' : 'suppliers.toast.created'))
        onDone()
      },
      onError: (error) => toast.error(getErrorMessage(error, t)),
    }

    if (isEdit) updateMutation.mutate({ id: supplier.id, ...payload }, options)
    else createMutation.mutate(payload, options)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <TextField
        id="supplier-nom"
        name="nom"
        label={t('suppliers.form.name')}
        value={form.nom}
        onChange={handleChange}
        placeholder={t('suppliers.form.namePlaceholder')}
        maxLength={150}
        error={errors.nom}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="supplier-telephone"
          name="telephone"
          type="tel"
          autoComplete="tel"
          label={t('suppliers.form.phone')}
          value={form.telephone}
          onChange={handleChange}
          maxLength={30}
          error={errors.telephone}
        />
        <TextField
          id="supplier-email"
          name="email"
          type="email"
          autoComplete="email"
          label={t('suppliers.form.email')}
          value={form.email}
          onChange={handleChange}
          maxLength={150}
          error={errors.email}
        />
      </div>
      <TextField
        id="supplier-adresse"
        name="adresse"
        autoComplete="street-address"
        label={t('suppliers.form.address')}
        value={form.adresse}
        onChange={handleChange}
        maxLength={255}
        error={errors.adresse}
      />

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
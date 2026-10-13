import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories'
import { getErrorMessage } from '@/lib/errors'

// category = null : création. category = objet : modification.
export default function CategoryFormDialog({ open, onOpenChange, category }) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? t('categories.form.editTitle') : t('categories.form.createTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('categories.form.helper')}</DialogDescription>
        </DialogHeader>
        {/* Le formulaire est démonté à la fermeture : il repart à neuf à chaque ouverture. */}
        <CategoryForm category={category} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function CategoryForm({ category, onDone }) {
  const { t } = useTranslation()
  const isEdit = Boolean(category)
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const mutation = isEdit ? updateMutation : createMutation

  const [form, setForm] = useState({
    nom: category?.nom ?? '',
    description: category?.description ?? '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nom = form.nom.trim()
    const description = form.description.trim()

    const nextErrors = {}
    if (!nom) nextErrors.nom = t('categories.form.nameRequired')
    else if (nom.length > 100) nextErrors.nom = t('categories.form.nameTooLong')
    if (description.length > 500) nextErrors.description = t('categories.form.descriptionTooLong')

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // description vide : on envoie null pour l'effacer côté serveur.
    const payload = { nom, description: description || null }

    const options = {
      onSuccess: () => {
        toast.success(t(isEdit ? 'categories.toast.updated' : 'categories.toast.created'))
        onDone()
      },
      onError: (error) => {
        // 409 = ce nom existe déjà : on l'affiche sous le champ concerné.
        if (error.response?.status === 409) {
          setErrors({ nom: t('categories.errors.nameExists') })
        } else {
          toast.error(getErrorMessage(error, t))
        }
      },
    }

    if (isEdit) updateMutation.mutate({ id: category.id, ...payload }, options)
    else createMutation.mutate(payload, options)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category-nom">{t('categories.form.name')}</Label>
        <Input
          id="category-nom"
          name="nom"
          value={form.nom}
          onChange={handleChange}
          placeholder={t('categories.form.namePlaceholder')}
          maxLength={100}
          aria-invalid={Boolean(errors.nom)}
          aria-describedby={errors.nom ? 'category-nom-error' : undefined}
        />
        {errors.nom && (
          <p id="category-nom-error" className="text-sm text-destructive">
            {errors.nom}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-description">{t('categories.form.description')}</Label>
        <Textarea
          id="category-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'category-description-error' : undefined}
        />
        {errors.description && (
          <p id="category-description-error" className="text-sm text-destructive">
            {errors.description}
          </p>
        )}
      </div>

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
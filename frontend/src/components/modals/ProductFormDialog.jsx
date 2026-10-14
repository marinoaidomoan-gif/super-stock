import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCategories } from '@/hooks/useCategories'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { getErrorMessage } from '@/lib/errors'

const UNITS = ['PIECE', 'KG', 'LITRE', 'CARTON', 'SACHET']
// Nombre positif, 3 décimales maximum (comme la colonne numeric(12,3)).
const THRESHOLD_REGEX = /^\d{1,9}(\.\d{1,3})?$/

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  )
}

// product = null : création. product = objet : modification.
export default function ProductFormDialog({ open, onOpenChange, product }) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {product ? t('products.form.editTitle') : t('products.form.createTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('products.form.helper')}</DialogDescription>
        </DialogHeader>
        {/* Démonté à la fermeture : le formulaire repart à neuf à chaque ouverture. */}
        <ProductForm product={product} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function ProductForm({ product, onDone }) {
  const { t } = useTranslation()
  const isEdit = Boolean(product)
  const { data: categories = [] } = useCategories()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const mutation = isEdit ? updateMutation : createMutation

  const [form, setForm] = useState({
    nom: product?.nom ?? '',
    categoryId: product ? String(product.categoryId) : '',
    unite: product?.unite ?? '',
    seuilAlerte: product ? String(product.seuilAlerte) : '0',
    description: product?.description ?? '',
  })
  const [errors, setErrors] = useState({})

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }))
  const handleChange = (event) => setField(event.target.name, event.target.value)

  const validate = () => {
    const next = {}
    const nom = form.nom.trim()
    if (!nom) next.nom = t('products.form.errors.nameRequired')
    else if (nom.length > 150) next.nom = t('products.form.errors.nameTooLong')
    if (!form.categoryId) next.categoryId = t('products.form.errors.categoryRequired')
    if (!form.unite) next.unite = t('products.form.errors.unitRequired')
    if (!THRESHOLD_REGEX.test(form.seuilAlerte.trim())) {
      next.seuilAlerte = t('products.form.errors.thresholdInvalid')
    }
    if (form.description.trim().length > 1000) {
      next.description = t('products.form.errors.descriptionTooLong')
    }
    return next
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // Pas de quantité ni de référence : le serveur les gère (le DTO les refuserait).
    const payload = {
      nom: form.nom.trim(),
      categoryId: Number(form.categoryId),
      unite: form.unite,
      seuilAlerte: Number(form.seuilAlerte),
      description: form.description.trim() || null,
    }

    const options = {
      onSuccess: () => {
        toast.success(t(isEdit ? 'products.toast.updated' : 'products.toast.created'))
        onDone()
      },
      onError: (error) => toast.error(getErrorMessage(error, t)),
    }

    if (isEdit) updateMutation.mutate({ id: product.id, ...payload }, options)
    else createMutation.mutate(payload, options)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {isEdit ? (
        <p className="text-sm text-muted-foreground">
          {t('products.form.reference')} : <span className="font-mono">{product.reference}</span>
        </p>
      ) : (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          {t('products.form.initialStockInfo')}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="product-nom">{t('products.form.name')}</Label>
        <Input
          id="product-nom"
          name="nom"
          value={form.nom}
          onChange={handleChange}
          placeholder={t('products.form.namePlaceholder')}
          maxLength={150}
          aria-invalid={Boolean(errors.nom)}
          aria-describedby={errors.nom ? 'product-nom-error' : undefined}
        />
        <FieldError id="product-nom-error" message={errors.nom} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="product-category">{t('products.form.category')}</Label>
          <Select value={form.categoryId} onValueChange={(value) => setField('categoryId', value)}>
            <SelectTrigger
              id="product-category"
              className="w-full"
              aria-invalid={Boolean(errors.categoryId)}
              aria-describedby={errors.categoryId ? 'product-category-error' : undefined}
            >
              <SelectValue placeholder={t('products.form.categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="product-category-error" message={errors.categoryId} />
          {categories.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {t('products.form.noCategories')}{' '}
              <Link to="/categories" className="text-primary underline-offset-4 hover:underline">
                {t('products.form.manageCategories')}
              </Link>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-unite">{t('products.form.unit')}</Label>
          <Select value={form.unite} onValueChange={(value) => setField('unite', value)}>
            <SelectTrigger
              id="product-unite"
              className="w-full"
              aria-invalid={Boolean(errors.unite)}
              aria-describedby={errors.unite ? 'product-unite-error' : undefined}
            >
              <SelectValue placeholder={t('products.form.unitPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {t(`units.${unit}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="product-unite-error" message={errors.unite} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product-seuil">{t('products.form.threshold')}</Label>
        <Input
          id="product-seuil"
          name="seuilAlerte"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.001"
          value={form.seuilAlerte}
          onChange={handleChange}
          aria-invalid={Boolean(errors.seuilAlerte)}
          aria-describedby={errors.seuilAlerte ? 'product-seuil-error' : 'product-seuil-hint'}
        />
        <p id="product-seuil-hint" className="text-xs text-muted-foreground">
          {t('products.form.thresholdHint')}
        </p>
        <FieldError id="product-seuil-error" message={errors.seuilAlerte} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="product-description">{t('products.form.description')}</Label>
        <Textarea
          id="product-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'product-description-error' : undefined}
        />
        <FieldError id="product-description-error" message={errors.description} />
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
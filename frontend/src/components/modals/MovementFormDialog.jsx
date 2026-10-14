import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import FieldError from '@/components/common/FieldError'
import ProductCombobox from '@/components/common/ProductCombobox'
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
import { useCreateMovement } from '@/hooks/useMovements'
import { formatNumber } from '@/lib/format'
import { getMovementError, INTEGER_UNITS, MOTIFS_BY_TYPE, QUANTITY_REGEX } from '@/lib/movements'

export default function MovementFormDialog({ open, onOpenChange, initialValues = {}, onSuccess }) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('movements.form.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('movements.form.helper')}</DialogDescription>
        </DialogHeader>
        {/* Démonté à la fermeture : le formulaire repart à neuf à chaque ouverture. */}
        <MovementForm initialValues={initialValues} onDone={() => onOpenChange(false)} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
}

function MovementForm({ initialValues, onDone, onSuccess }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const mutation = useCreateMovement()

  const [form, setForm] = useState({
    type: initialValues.type ?? 'ENTREE',
    product: initialValues.product ?? null,
    quantite: '',
    motif: initialValues.motif ?? '',
    commentaire: '',
  })
  const [errors, setErrors] = useState({})

  const unit = form.product?.unite
  const unitLabel = unit ? t(`units.${unit}`) : ''
  const integerOnly = INTEGER_UNITS.includes(unit)

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }))

  // Changer de type : on garde le motif seulement s'il existe aussi pour le nouveau type.
  const changeType = (type) =>
    setForm((current) => ({
      ...current,
      type,
      motif: MOTIFS_BY_TYPE[type].includes(current.motif) ? current.motif : '',
    }))

  const validate = () => {
    const next = {}
    const quantity = form.quantite.trim()

    if (!form.product) next.product = t('movements.form.errors.productRequired')

    if (!QUANTITY_REGEX.test(quantity) || Number(quantity) <= 0) {
      next.quantite = t('movements.form.errors.quantityInvalid')
    } else if (integerOnly && !Number.isInteger(Number(quantity))) {
      next.quantite = t('movements.form.errors.quantityInteger')
    } else if (form.type === 'SORTIE' && form.product && Number(quantity) > form.product.quantiteStock) {
      // Vérification de confort : le serveur reste l'autorité (règle R2).
      next.quantite = t('movements.form.errors.insufficientStock', {
        available: formatNumber(form.product.quantiteStock, locale),
        unit: unitLabel,
      })
    }

    if (!form.motif) next.motif = t('movements.form.errors.reasonRequired')
    if (form.commentaire.trim().length > 500) {
      next.commentaire = t('movements.form.errors.commentTooLong')
    }
    return next
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // Pas de date ni d'utilisateur : le serveur les renseigne.
    mutation.mutate(
      {
        type: form.type,
        productId: form.product.id,
        quantite: Number(form.quantite.trim()),
        motif: form.motif,
        commentaire: form.commentaire.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success(t('movements.toast.created'))
          onSuccess?.()
          onDone()
        },
        onError: (error) => toast.error(getMovementError(error, t)),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="movement-type">{t('movements.form.type')}</Label>
          <Select value={form.type} onValueChange={changeType}>
            <SelectTrigger id="movement-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENTREE">{t('movements.types.ENTREE')}</SelectItem>
              <SelectItem value="SORTIE">{t('movements.types.SORTIE')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="movement-motif">{t('movements.form.reason')}</Label>
          <Select value={form.motif} onValueChange={(value) => setField('motif', value)}>
            <SelectTrigger
              id="movement-motif"
              className="w-full"
              aria-invalid={Boolean(errors.motif)}
              aria-describedby={errors.motif ? 'movement-motif-error' : undefined}
            >
              <SelectValue placeholder={t('movements.form.reasonPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {MOTIFS_BY_TYPE[form.type].map((motif) => (
                <SelectItem key={motif} value={motif}>
                  {t(`movements.motifs.${motif}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="movement-motif-error" message={errors.motif} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="movement-product">{t('movements.form.product')}</Label>
        <ProductCombobox
          id="movement-product"
          value={form.product}
          onChange={(product) => setField('product', product)}
          placeholder={t('movements.form.productPlaceholder')}
          invalid={Boolean(errors.product)}
          describedBy={errors.product ? 'movement-product-error' : undefined}
        />
        {form.product && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {t('movements.form.currentStock', {
              quantity: formatNumber(form.product.quantiteStock, locale),
              unit: unitLabel,
            })}
          </p>
        )}
        <FieldError id="movement-product-error" message={errors.product} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="movement-quantite">
          {t('movements.form.quantity')}
          {unitLabel && ` (${unitLabel})`}
        </Label>
        <Input
          id="movement-quantite"
          type="number"
          inputMode={integerOnly ? 'numeric' : 'decimal'}
          min="0"
          step={integerOnly ? '1' : '0.001'}
          value={form.quantite}
          onChange={(event) => setField('quantite', event.target.value)}
          aria-invalid={Boolean(errors.quantite)}
          aria-describedby={errors.quantite ? 'movement-quantite-error' : undefined}
        />
        <FieldError id="movement-quantite-error" message={errors.quantite} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="movement-commentaire">{t('movements.form.comment')}</Label>
        <Textarea
          id="movement-commentaire"
          value={form.commentaire}
          onChange={(event) => setField('commentaire', event.target.value)}
          rows={3}
          aria-invalid={Boolean(errors.commentaire)}
          aria-describedby={errors.commentaire ? 'movement-commentaire-error' : undefined}
        />
        <FieldError id="movement-commentaire-error" message={errors.commentaire} />
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
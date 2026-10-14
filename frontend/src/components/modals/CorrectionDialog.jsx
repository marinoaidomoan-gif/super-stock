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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCorrectMovement } from '@/hooks/useMovements'
import { formatNumber } from '@/lib/format'
import { getMovementError } from '@/lib/movements'

export default function CorrectionDialog({ open, onOpenChange, movement }) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('movements.correction.title')}</DialogTitle>
          <DialogDescription>{t('movements.correction.description')}</DialogDescription>
        </DialogHeader>
        {movement && <CorrectionForm movement={movement} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function CorrectionForm({ movement, onDone }) {
  const { t, i18n } = useTranslation()
  const mutation = useCorrectMovement()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  // Le mouvement inverse : une entrée est corrigée par une sortie, et inversement.
  const inverseType = movement.type === 'ENTREE' ? 'SORTIE' : 'ENTREE'

  const handleSubmit = (event) => {
    event.preventDefault()
    if (reason.trim().length > 400) {
      setError(t('movements.correction.reasonTooLong'))
      return
    }
    setError('')

    mutation.mutate(
      { id: movement.id, commentaire: reason.trim() || null },
      {
        onSuccess: () => {
          toast.success(t('movements.toast.corrected'))
          onDone()
        },
        onError: (err) => toast.error(getMovementError(err, t)),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <p className="rounded-md bg-muted px-3 py-2 text-sm">
        {t('movements.correction.inverse', {
          type: t(`movements.types.${inverseType}`).toLowerCase(),
          quantity: formatNumber(movement.quantite, i18n.resolvedLanguage),
          unit: t(`units.${movement.product?.unite}`),
          product: movement.product?.nom,
        })}
      </p>

      <div className="space-y-2">
        <Label htmlFor="correction-reason">{t('movements.correction.reason')}</Label>
        <Textarea
          id="correction-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'correction-reason-error' : undefined}
        />
        <FieldError id="correction-reason-error" message={error} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={mutation.isPending}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {t('movements.correction.confirm')}
        </Button>
      </DialogFooter>
    </form>
  )
}
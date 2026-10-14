// src/components/inventory/LaunchInventoryCard.jsx
//
// Carte affichée quand AUCUN inventaire n'est en cours : explique le principe
// et propose de lancer un inventaire (avec un commentaire facultatif).
import { useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLancerInventaire } from '@/hooks/useInventories.js'
import { messageErreur } from '@/services/api.js'

export default function LaunchInventoryCard() {
  const { t } = useTranslation()
  const lancer = useLancerInventaire()
  const [ouvert, setOuvert] = useState(false)
  const [commentaire, setCommentaire] = useState('')

  function confirmer() {
    // "|| undefined" : un commentaire vide n'est pas envoyé.
    lancer.mutate(commentaire.trim() || undefined, {
      onSuccess: () => {
        toast.success(t('inventory.toast.launched'))
        setOuvert(false)
        setCommentaire('')
      },
      // Ex. : "Un inventaire est déjà en cours..." (409)
      onError: (erreur) => toast.error(messageErreur(erreur)),
    })
  }

  return (
    <>
      <div className="rounded-xl border bg-card p-8 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
          <ClipboardCheck className="size-7" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold">{t('inventory.launch.title')}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          {t('inventory.launch.text')}
        </p>
        <Button
          className="mt-6 bg-emerald-500 text-white hover:bg-emerald-600"
          onClick={() => setOuvert(true)}
        >
          {t('inventory.launch.button')}
        </Button>
      </div>

      {/* Fenêtre de lancement : on ne peut pas la fermer pendant l'envoi. */}
      <Dialog open={ouvert} onOpenChange={(valeur) => !lancer.isPending && setOuvert(valeur)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('inventory.launch.dialogTitle')}</DialogTitle>
            <DialogDescription>{t('inventory.launch.dialogText')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="commentaire-inventaire">{t('inventory.launch.commentLabel')}</Label>
            <Textarea
              id="commentaire-inventaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder={t('inventory.launch.commentPlaceholder')}
              maxLength={500}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOuvert(false)} disabled={lancer.isPending}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-emerald-500 text-white hover:bg-emerald-600"
              onClick={confirmer}
              disabled={lancer.isPending}
            >
              {lancer.isPending ? t('common.pleaseWait') : t('inventory.launch.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
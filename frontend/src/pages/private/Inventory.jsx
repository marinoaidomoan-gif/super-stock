// src/pages/private/Inventory.jsx
//
// Page /inventaire (propriétaire seul). Elle choisit ce qu'elle affiche :
//  - un inventaire est en cours  -> le panneau de comptage ;
//  - aucun inventaire en cours   -> la carte "Lancer un inventaire" ;
// puis, dans tous les cas, l'historique des inventaires validés.
import { ClipboardCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CountingPanel from '@/components/inventory/CountingPanel.jsx'
import InventoryHistory from '@/components/inventory/InventoryHistory.jsx'
import LaunchInventoryCard from '@/components/inventory/LaunchInventoryCard.jsx'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useInventaireEnCours } from '@/hooks/useInventories.js'

export default function Inventory() {
  const { t } = useTranslation()
  const { data: enCours, isLoading, isError, refetch } = useInventaireEnCours()

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
          <ClipboardCheck className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('inventory.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('inventory.subtitle')}</p>
        </div>
      </header>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : isError ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-muted-foreground">{t('inventory.loadError')}</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : enCours ? (
        <CountingPanel inventaireId={enCours.id} />
      ) : (
        <LaunchInventoryCard />
      )}

      <InventoryHistory />
    </div>
  )
}
import { useState } from 'react'
import { Check, PackagePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EmptyState from '@/components/common/EmptyState'
import PageHeader from '@/components/common/PageHeader'
import StockBadge from '@/components/common/StockBadge'
import MovementFormDialog from '@/components/modals/MovementFormDialog'
import AnimatedRow from '@/components/tables/AnimatedRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAlerts } from '@/hooks/useAlerts'
import { useCategories } from '@/hooks/useCategories'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function Alerts() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const [categoryId, setCategoryId] = useState('all')

  const { data: categories = [] } = useCategories()
  const {
    data: alerts = [],
    isLoading,
    isError,
    isPlaceholderData,
    refetch,
  } = useAlerts({ categoryId: categoryId === 'all' ? undefined : Number(categoryId) })

  // Produit à réapprovisionner : ouvre le formulaire de mouvement (entrée, réception).
  const [restockState, setRestockState] = useState({ open: false, product: null })

  return (
    <>
      <PageHeader title={t('alerts.title')} description={t('alerts.subtitle')}>
        {alerts.length > 0 && (
          <Badge
            variant="secondary"
            className="border-transparent bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
          >
            {t('layout.alertsCount', { count: alerts.length })}
          </Badge>
        )}
      </PageHeader>

      <div className="mb-4 max-w-xs space-y-1.5">
        <Label htmlFor="alerts-category" className="text-xs text-muted-foreground">
          {t('alerts.filters.category')}
        </Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger id="alerts-category" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('alerts.filters.allCategories')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div role="status" className="space-y-2">
          <span className="sr-only">{t('common.loading')}</span>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{t('alerts.errors.loadFailed')}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Check}
          title={t('alerts.empty.title')}
          description={
            categoryId === 'all' ? t('alerts.empty.description') : t('alerts.empty.noResultsDescription')
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')} aria-busy={isPlaceholderData}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('alerts.columns.product')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('alerts.columns.category')}</TableHead>
                  <TableHead className="text-right">{t('alerts.columns.stock')}</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">{t('alerts.columns.threshold')}</TableHead>
                  <TableHead>{t('alerts.columns.status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((product, index) => (
                  <AnimatedRow key={product.id} index={index}>
                    <TableCell>
                      <p className="font-medium">{product.nom}</p>
                      <p className="font-mono text-xs text-muted-foreground">{product.reference}</p>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {product.category?.nom}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      {formatNumber(product.quantiteStock, locale)}
                      <span className="ml-1 text-xs text-muted-foreground">{t(`units.${product.unite}`)}</span>
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                      {formatNumber(product.seuilAlerte, locale)}
                    </TableCell>
                    <TableCell>
                      <StockBadge product={product} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => setRestockState({ open: true, product })}
                        aria-label={t('alerts.restockLabel', { name: product.nom })}
                      >
                        <PackagePlus aria-hidden="true" />
                        {t('alerts.restock')}
                      </Button>
                    </TableCell>
                  </AnimatedRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <MovementFormDialog
        open={restockState.open}
        onOpenChange={(open) => setRestockState((current) => ({ ...current, open }))}
        initialValues={{ product: restockState.product, type: 'ENTREE', motif: 'RECEPTION' }}
      />
    </>
  )
}
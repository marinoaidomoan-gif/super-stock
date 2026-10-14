import { useState } from 'react'
import { ArrowLeftRight, Plus, Search, Undo2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EmptyState from '@/components/common/EmptyState'
import MovementTypeBadge from '@/components/common/MovementTypeBadge'
import PageHeader from '@/components/common/PageHeader'
import ProductCombobox from '@/components/common/ProductCombobox'
import CorrectionDialog from '@/components/modals/CorrectionDialog'
import MovementFormDialog from '@/components/modals/MovementFormDialog'
import AnimatedRow from '@/components/tables/AnimatedRow'
import Pagination from '@/components/tables/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useMovementAuthors, useMovements } from '@/hooks/useMovements'
import { formatDateTime, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10
const DEFAULT_FILTERS = {
  type: 'all',
  product: null,
  userId: 'all',
  dateDebut: '',
  dateFin: '',
  page: 1,
}

function FilterField({ label, htmlFor, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

export default function Movements() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const params = {
    page: filters.page,
    limit: PAGE_SIZE,
    type: filters.type === 'all' ? undefined : filters.type,
    productId: filters.product?.id,
    userId: filters.userId === 'all' ? undefined : Number(filters.userId),
    dateDebut: filters.dateDebut || undefined,
    dateFin: filters.dateFin || undefined,
  }

  const { data, isLoading, isError, isPlaceholderData, refetch } = useMovements(params)
  const { data: authors = [] } = useMovementAuthors()
  const movements = data?.data ?? []

  const [createOpen, setCreateOpen] = useState(false)
  const [correctionState, setCorrectionState] = useState({ open: false, movement: null })

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.product !== null ||
    filters.userId !== 'all' ||
    filters.dateDebut !== '' ||
    filters.dateFin !== ''

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }))

  return (
    <>
      <PageHeader title={t('movements.title')} description={t('movements.subtitle')}>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden="true" />
          {t('movements.add')}
        </Button>
      </PageHeader>

      <div className="mb-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FilterField label={t('movements.filters.type')} htmlFor="filter-type">
            <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
              <SelectTrigger id="filter-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('movements.filters.allTypes')}</SelectItem>
                <SelectItem value="ENTREE">{t('movements.types.ENTREE')}</SelectItem>
                <SelectItem value="SORTIE">{t('movements.types.SORTIE')}</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label={t('movements.filters.product')} htmlFor="filter-product">
            <ProductCombobox
              id="filter-product"
              value={filters.product}
              onChange={(product) => updateFilter('product', product)}
              placeholder={t('movements.filters.allProducts')}
              allowClear
              clearLabel={t('movements.filters.allProducts')}
            />
          </FilterField>

          <FilterField label={t('movements.filters.user')} htmlFor="filter-user">
            <Select value={filters.userId} onValueChange={(value) => updateFilter('userId', value)}>
              <SelectTrigger id="filter-user" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('movements.filters.allUsers')}</SelectItem>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={String(author.id)}>
                    {author.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label={t('movements.filters.dateFrom')} htmlFor="filter-date-from">
            <Input
              id="filter-date-from"
              type="date"
              value={filters.dateDebut}
              max={filters.dateFin || undefined}
              onChange={(event) => updateFilter('dateDebut', event.target.value)}
            />
          </FilterField>

          <FilterField label={t('movements.filters.dateTo')} htmlFor="filter-date-to">
            <Input
              id="filter-date-to"
              type="date"
              value={filters.dateFin}
              min={filters.dateDebut || undefined}
              onChange={(event) => updateFilter('dateFin', event.target.value)}
            />
          </FilterField>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
              {t('movements.filters.reset')}
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div role="status" className="space-y-2">
          <span className="sr-only">{t('common.loading')}</span>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{t('movements.errors.loadFailed')}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : movements.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={Search}
            title={t('movements.empty.noResultsTitle')}
            description={t('movements.empty.noResultsDescription')}
          >
            <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
              {t('movements.filters.reset')}
            </Button>
          </EmptyState>
        ) : (
          <EmptyState
            icon={ArrowLeftRight}
            title={t('movements.empty.title')}
            description={t('movements.empty.description')}
          >
            <Button onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              {t('movements.add')}
            </Button>
          </EmptyState>
        )
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')} aria-busy={isPlaceholderData}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('movements.columns.date')}</TableHead>
                  <TableHead>{t('movements.columns.product')}</TableHead>
                  <TableHead>{t('movements.columns.type')}</TableHead>
                  <TableHead className="text-right">{t('movements.columns.quantity')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('movements.columns.reason')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('movements.columns.user')}</TableHead>
                  <TableHead className="hidden xl:table-cell">{t('movements.columns.comment')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement, index) => (
                  <AnimatedRow key={movement.id} index={index}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDateTime(movement.dateMouvement, locale)}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{movement.product?.nom}</p>
                      <p className="font-mono text-xs text-muted-foreground">{movement.product?.reference}</p>
                    </TableCell>
                    <TableCell>
                      <MovementTypeBadge type={movement.type} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      <span
                        className={cn(
                          'font-medium',
                          movement.type === 'ENTREE'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400',
                        )}
                      >
                        {movement.type === 'ENTREE' ? '+' : '−'}
                        {formatNumber(movement.quantite, locale)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {t(`units.${movement.product?.unite}`)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {t(`movements.motifs.${movement.motif}`)}
                      {movement.supplier?.nom && (
                        <p className="truncate text-xs text-muted-foreground">
                          {t('movements.supplier', { name: movement.supplier.nom })}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{movement.user?.nom}</TableCell>
                    <TableCell className="hidden max-w-64 xl:table-cell">
                      <p className="truncate text-muted-foreground" title={movement.commentaire ?? undefined}>
                        {movement.commentaire || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        {/* Une correction ne se corrige pas : pour annuler une erreur, on crée un nouveau mouvement. */}
                        {movement.motif !== 'CORRECTION' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCorrectionState({ open: true, movement })}
                            aria-label={t('movements.actions.correct', { id: movement.id })}
                          >
                            <Undo2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </AnimatedRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            limit={data.limit}
            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          />
        </div>
      )}

      <MovementFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        // Les mouvements récents sont en première page : on y retourne après un ajout.
        onSuccess={() => setFilters((current) => ({ ...current, page: 1 }))}
      />

      <CorrectionDialog
        open={correctionState.open}
        movement={correctionState.movement}
        onOpenChange={(open) => setCorrectionState((current) => ({ ...current, open }))}
      />
    </>
  )
}
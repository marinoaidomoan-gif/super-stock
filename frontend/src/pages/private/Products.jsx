import { useState } from 'react'
import { Archive, ArchiveRestore, Eye, Package, Pencil, Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import PageHeader from '@/components/common/PageHeader'
import StockBadge from '@/components/common/StockBadge'
import ProductDetailsDialog from '@/components/modals/ProductDetailsDialog'
import ProductFormDialog from '@/components/modals/ProductFormDialog'
import AnimatedRow from '@/components/tables/AnimatedRow'
import Pagination from '@/components/tables/Pagination'
import SortableHead from '@/components/tables/SortableHead'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useCategories } from '@/hooks/useCategories'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDeactivateProduct, useProducts, useReactivateProduct } from '@/hooks/useProducts'
import { getErrorMessage } from '@/lib/errors'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10
const DEFAULT_FILTERS = {
  categoryId: 'all',
  status: 'all', // all | ok | alert
  view: 'active', // active | inactive
  sortBy: 'nom',
  sortOrder: 'ASC',
  page: 1,
}

export default function Products() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const [searchParams] = useSearchParams()

  // La recherche de l'en-tête arrive par l'adresse (/produits?search=...).
  const urlSearch = searchParams.get('search') ?? ''
  const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch)
  const [searchInput, setSearchInput] = useState(urlSearch)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  // Une nouvelle recherche venue de l'en-tête remplace le champ (ajustement pendant le rendu).
  if (urlSearch !== lastUrlSearch) {
    setLastUrlSearch(urlSearch)
    setSearchInput(urlSearch)
    setFilters((current) => ({ ...current, page: 1 }))
  }

  const search = useDebouncedValue(searchInput, 300).trim()

  const params = {
    page: filters.page,
    limit: PAGE_SIZE,
    recherche: search || undefined,
    categoryId: filters.categoryId === 'all' ? undefined : Number(filters.categoryId),
    enAlerte: filters.status === 'alert' ? true : filters.status === 'ok' ? false : undefined,
    actif: filters.view === 'active',
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  }

  const { data, isLoading, isError, isPlaceholderData, refetch } = useProducts(params)
  const { data: categories = [] } = useCategories()
  const deactivateMutation = useDeactivateProduct()
  const reactivateMutation = useReactivateProduct()

  const products = data?.data ?? []

  const [formState, setFormState] = useState({ open: false, product: null })
  const [detailsState, setDetailsState] = useState({ open: false, product: null })
  const [deactivateState, setDeactivateState] = useState({ open: false, product: null })

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    filters.categoryId !== 'all' ||
    filters.status !== 'all' ||
    filters.view !== 'active'

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }))

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value)
    setFilters((current) => ({ ...current, page: 1 }))
  }

  const handleSort = (column) =>
    setFilters((current) => ({
      ...current,
      sortBy: column,
      sortOrder: current.sortBy === column && current.sortOrder === 'ASC' ? 'DESC' : 'ASC',
      page: 1,
    }))

  const resetFilters = () => {
    setSearchInput('')
    setFilters(DEFAULT_FILTERS)
  }

  // Si la dernière ligne d'une page disparaît de la liste, on recule d'une page.
  const afterRowLeavesList = () => {
    if (products.length === 1 && filters.page > 1) {
      setFilters((current) => ({ ...current, page: current.page - 1 }))
    }
  }

  const confirmDeactivate = () => {
    deactivateMutation.mutate(deactivateState.product.id, {
      onSuccess: () => {
        toast.success(t('products.toast.deactivated'))
        setDeactivateState((current) => ({ ...current, open: false }))
        afterRowLeavesList()
      },
      onError: (error) => {
        setDeactivateState((current) => ({ ...current, open: false }))
        toast.error(getErrorMessage(error, t))
      },
    })
  }

  const reactivate = (product) => {
    reactivateMutation.mutate(product.id, {
      onSuccess: () => {
        toast.success(t('products.toast.reactivated'))
        afterRowLeavesList()
      },
      onError: (error) => toast.error(getErrorMessage(error, t)),
    })
  }

  const sortProps = { sortBy: filters.sortBy, sortOrder: filters.sortOrder, onSort: handleSort }

  return (
    <>
      <PageHeader title={t('products.title')} description={t('products.subtitle')}>
        <Button onClick={() => setFormState({ open: true, product: null })}>
          <Plus aria-hidden="true" />
          {t('products.add')}
        </Button>
      </PageHeader>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_repeat(3,minmax(0,12rem))]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder={t('products.filters.search')}
            aria-label={t('products.filters.search')}
            className="pl-8"
          />
        </div>

        <Select value={filters.categoryId} onValueChange={(value) => updateFilter('categoryId', value)}>
          <SelectTrigger className="w-full" aria-label={t('products.filters.category')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('products.filters.allCategories')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
          <SelectTrigger className="w-full" aria-label={t('products.filters.status')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('products.filters.allStatuses')}</SelectItem>
            <SelectItem value="ok">{t('products.filters.inStock')}</SelectItem>
            <SelectItem value="alert">{t('products.filters.lowStock')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.view} onValueChange={(value) => updateFilter('view', value)}>
          <SelectTrigger className="w-full" aria-label={t('products.filters.view')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t('products.filters.active')}</SelectItem>
            <SelectItem value="inactive">{t('products.filters.inactive')}</SelectItem>
          </SelectContent>
        </Select>
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
          <p className="text-sm text-destructive">{t('products.errors.loadFailed')}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : products.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={Search}
            title={t('products.empty.noResultsTitle')}
            description={t('products.empty.noResultsDescription')}
          >
            <Button variant="outline" onClick={resetFilters}>
              {t('products.filters.reset')}
            </Button>
          </EmptyState>
        ) : (
          <EmptyState
            icon={Package}
            title={t('products.empty.title')}
            description={t('products.empty.description')}
          >
            <Button onClick={() => setFormState({ open: true, product: null })}>
              <Plus aria-hidden="true" />
              {t('products.add')}
            </Button>
          </EmptyState>
        )
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')} aria-busy={isPlaceholderData}>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead column="reference" label={t('products.columns.reference')} {...sortProps} />
                  <SortableHead column="nom" label={t('products.columns.name')} {...sortProps} />
                  <TableHead className="hidden md:table-cell">{t('products.columns.category')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('products.columns.unit')}</TableHead>
                  <SortableHead
                    column="quantiteStock"
                    label={t('products.columns.quantity')}
                    className="text-right"
                    {...sortProps}
                  />
                  <TableHead className="hidden text-right lg:table-cell">
                    {t('products.columns.threshold')}
                  </TableHead>
                  <TableHead>{t('products.columns.status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <AnimatedRow key={product.id} index={index}>
                    <TableCell className="font-mono text-xs">{product.reference}</TableCell>
                    <TableCell className="font-medium">{product.nom}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {product.category?.nom}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{t(`units.${product.unite}`)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(product.quantiteStock, locale)}
                      <span className="ml-1 text-xs text-muted-foreground lg:hidden">
                        {t(`units.${product.unite}`)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums text-muted-foreground lg:table-cell">
                      {formatNumber(product.seuilAlerte, locale)}
                    </TableCell>
                    <TableCell>
                      <StockBadge product={product} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDetailsState({ open: true, product })}
                          aria-label={t('products.actions.details', { name: product.nom })}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setFormState({ open: true, product })}
                          aria-label={t('products.actions.edit', { name: product.nom })}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        {product.actif ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeactivateState({ open: true, product })}
                            aria-label={t('products.actions.deactivate', { name: product.nom })}
                          >
                            <Archive className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => reactivate(product)}
                            disabled={reactivateMutation.isPending}
                            aria-label={t('products.actions.reactivate', { name: product.nom })}
                          >
                            <ArchiveRestore className="size-4" />
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

      <ProductFormDialog
        open={formState.open}
        product={formState.product}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
      />

      <ProductDetailsDialog
        open={detailsState.open}
        product={detailsState.product}
        onOpenChange={(open) => setDetailsState((current) => ({ ...current, open }))}
      />

      <ConfirmDialog
        open={deactivateState.open}
        onOpenChange={(open) => setDeactivateState((current) => ({ ...current, open }))}
        title={t('products.deactivate.title')}
        description={t('products.deactivate.description', { name: deactivateState.product?.nom })}
        confirmLabel={t('products.deactivate.confirm')}
        onConfirm={confirmDeactivate}
        isPending={deactivateMutation.isPending}
      />
    </>
  )
}
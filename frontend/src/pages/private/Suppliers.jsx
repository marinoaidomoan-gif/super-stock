import { useState } from 'react'
import { Pencil, Plus, Search, Trash2, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import PageHeader from '@/components/common/PageHeader'
import SupplierFormDialog from '@/components/modals/SupplierFormDialog'
import AnimatedRow from '@/components/tables/AnimatedRow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDeleteSupplier, useSuppliers } from '@/hooks/useSuppliers'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

const LINK_CLASS = 'text-primary underline-offset-4 hover:underline'

export default function Suppliers() {
  const { t } = useTranslation()
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 300).trim()

  const {
    data: suppliers = [],
    isLoading,
    isError,
    isPlaceholderData,
    refetch,
  } = useSuppliers({ recherche: search || undefined })
  const deleteMutation = useDeleteSupplier()

  const [formState, setFormState] = useState({ open: false, supplier: null })
  const [deleteState, setDeleteState] = useState({ open: false, supplier: null })

  const openForm = (supplier = null) => setFormState({ open: true, supplier })

  const requestDelete = (supplier) => {
    // Le serveur refuse aussi : cette vérification évite juste un aller-retour.
    if ((supplier.nombreApprovisionnements ?? 0) > 0) {
      toast.error(t('suppliers.errors.hasMovements'))
      return
    }
    setDeleteState({ open: true, supplier })
  }

  const confirmDelete = () => {
    deleteMutation.mutate(deleteState.supplier.id, {
      onSuccess: () => {
        toast.success(t('suppliers.toast.deleted'))
        setDeleteState((current) => ({ ...current, open: false }))
      },
      onError: (error) => {
        setDeleteState((current) => ({ ...current, open: false }))
        toast.error(getErrorMessage(error, t, { 409: 'suppliers.errors.hasMovements' }))
      },
    })
  }

  return (
    <>
      <PageHeader title={t('suppliers.title')} description={t('suppliers.subtitle')}>
        <Button onClick={() => openForm()}>
          <Plus aria-hidden="true" />
          {t('suppliers.add')}
        </Button>
      </PageHeader>

      <div className="relative mb-4 max-w-sm">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t('suppliers.search')}
          aria-label={t('suppliers.search')}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div role="status" className="space-y-2">
          <span className="sr-only">{t('common.loading')}</span>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{t('suppliers.errors.loadFailed')}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : suppliers.length === 0 ? (
        search ? (
          <EmptyState
            icon={Search}
            title={t('suppliers.empty.noResultsTitle')}
            description={t('suppliers.empty.noResultsDescription')}
          />
        ) : (
          <EmptyState
            icon={Truck}
            title={t('suppliers.empty.title')}
            description={t('suppliers.empty.description')}
          >
            <Button onClick={() => openForm()}>
              <Plus aria-hidden="true" />
              {t('suppliers.add')}
            </Button>
          </EmptyState>
        )
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')} aria-busy={isPlaceholderData}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('suppliers.columns.name')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('suppliers.columns.phone')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('suppliers.columns.email')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('suppliers.columns.address')}</TableHead>
                  <TableHead>{t('suppliers.columns.deliveries')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier, index) => (
                  <AnimatedRow key={supplier.id} index={index}>
                    <TableCell className="font-medium">{supplier.nom}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {supplier.telephone ? (
                        <a href={`tel:${supplier.telephone.replace(/\s+/g, '')}`} className={LINK_CLASS}>
                          {supplier.telephone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {supplier.email ? (
                        <a href={`mailto:${supplier.email}`} className={LINK_CLASS}>
                          {supplier.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="hidden max-w-64 truncate text-muted-foreground lg:table-cell">
                      {supplier.adresse || '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {t('suppliers.deliveriesCount', { count: supplier.nombreApprovisionnements ?? 0 })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openForm(supplier)}
                          aria-label={t('suppliers.actions.edit', { name: supplier.nom })}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => requestDelete(supplier)}
                          aria-label={t('suppliers.actions.delete', { name: supplier.nom })}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </AnimatedRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <SupplierFormDialog
        open={formState.open}
        supplier={formState.supplier}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
      />

      <ConfirmDialog
        open={deleteState.open}
        onOpenChange={(open) => setDeleteState((current) => ({ ...current, open }))}
        title={t('suppliers.delete.title')}
        description={t('suppliers.delete.description', { name: deleteState.supplier?.nom })}
        confirmLabel={t('suppliers.delete.confirm')}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  )
}
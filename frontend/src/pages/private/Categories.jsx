import { useState } from 'react'
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import PageHeader from '@/components/common/PageHeader'
import CategoryFormDialog from '@/components/modals/CategoryFormDialog'
import AnimatedRow from '@/components/tables/AnimatedRow'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCategories, useDeleteCategory } from '@/hooks/useCategories'
import { getErrorMessage } from '@/lib/errors'

export default function Categories() {
  const { t } = useTranslation()
  const { data: categories, isLoading, isError, refetch } = useCategories()
  const deleteMutation = useDeleteCategory()

  // On garde la catégorie ciblée même après la fermeture : le texte ne change pas
  // pendant l'animation de fermeture.
  const [formState, setFormState] = useState({ open: false, category: null })
  const [deleteState, setDeleteState] = useState({ open: false, category: null })

  const openForm = (category = null) => setFormState({ open: true, category })

  const requestDelete = (category) => {
    // Règle R6 : pas de suppression si la catégorie contient des produits
    // (le serveur la refuse aussi : cette vérification évite juste un aller-retour).
    if ((category.nombreProduits ?? 0) > 0) {
      toast.error(t('categories.errors.hasProducts'))
      return
    }
    setDeleteState({ open: true, category })
  }

  const confirmDelete = () => {
    deleteMutation.mutate(deleteState.category.id, {
      onSuccess: () => {
        toast.success(t('categories.toast.deleted'))
        setDeleteState((current) => ({ ...current, open: false }))
      },
      onError: (error) => {
        setDeleteState((current) => ({ ...current, open: false }))
        toast.error(getErrorMessage(error, t, { 409: 'categories.errors.hasProducts' }))
      },
    })
  }

  return (
    <>
      <PageHeader title={t('categories.title')} description={t('categories.subtitle')}>
        <Button onClick={() => openForm()}>
          <Plus aria-hidden="true" />
          {t('categories.add')}
        </Button>
      </PageHeader>

      {isLoading ? (
        <div role="status" className="space-y-2">
          <span className="sr-only">{t('common.loading')}</span>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{t('categories.errors.loadFailed')}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title={t('categories.empty.title')}
          description={t('categories.empty.description')}
        >
          <Button onClick={() => openForm()}>
            <Plus aria-hidden="true" />
            {t('categories.add')}
          </Button>
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('categories.columns.name')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('categories.columns.description')}</TableHead>
                <TableHead>{t('categories.columns.products')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, index) => (
                <AnimatedRow key={category.id} index={index}>
                  <TableCell className="font-medium">{category.nom}</TableCell>
                  <TableCell className="hidden max-w-sm truncate text-muted-foreground md:table-cell">
                    {category.description || '—'}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {t('categories.productsCount', { count: category.nombreProduits ?? 0 })}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openForm(category)}
                        aria-label={`${t('common.edit')} ${category.nom}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => requestDelete(category)}
                        aria-label={`${t('common.delete')} ${category.nom}`}
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
      )}

      <CategoryFormDialog
        open={formState.open}
        category={formState.category}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
      />

      <ConfirmDialog
        open={deleteState.open}
        onOpenChange={(open) => setDeleteState((current) => ({ ...current, open }))}
        title={t('categories.delete.title')}
        description={t('categories.delete.description', { name: deleteState.category?.nom })}
        confirmLabel={t('categories.delete.confirm')}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  )
}
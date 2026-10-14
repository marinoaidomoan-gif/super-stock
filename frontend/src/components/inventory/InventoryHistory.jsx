// src/components/inventory/InventoryHistory.jsx
//
// Historique des inventaires VALIDÉS, paginé par 5, avec un lien vers le
// détail de chacun.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import { useHistoriqueInventaires } from '@/hooks/useInventories.js'
import { formatDate } from '@/lib/format.js'

export default function InventoryHistory() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useHistoriqueInventaires(page)

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{t('inventory.history.title')}</h2>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : isError ? (
        <p className="text-sm text-muted-foreground">{t('inventory.loadError')}</p>
      ) : data.data.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          {t('inventory.history.empty')}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('inventory.history.launchedAt')}</TableHead>
                  <TableHead>{t('inventory.history.launchedBy')}</TableHead>
                  <TableHead>{t('inventory.history.validatedAt')}</TableHead>
                  <TableHead className="text-right">{t('inventory.history.products')}</TableHead>
                  <TableHead className="text-right">{t('inventory.history.differences')}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((inventaire) => (
                  <TableRow key={inventaire.id}>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-medium">#{inventaire.id}</span>{' '}
                      <span className="text-muted-foreground">
                        {formatDate(inventaire.dateInventaire, i18n.language)}
                      </span>
                    </TableCell>
                    <TableCell>{inventaire.user?.nom ?? '—'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(inventaire.dateValidation, i18n.language)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {inventaire.resume.nbLignes}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {inventaire.resume.nbEcarts}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/inventaire/${inventaire.id}`}>{t('inventory.history.view')}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination : visible seulement s'il y a plus d'une page. */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-end gap-3 text-sm">
              <span className="text-muted-foreground">
                {t('inventory.history.page', { page: data.page, total: data.totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                {t('common.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
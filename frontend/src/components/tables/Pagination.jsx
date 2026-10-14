import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  const { t } = useTranslation()
  if (total === 0) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <nav
      aria-label={t('pagination.label')}
      className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row"
    >
      <p className="text-sm tabular-nums text-muted-foreground">
        {t('pagination.summary', { from, to, total })}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft aria-hidden="true" />
          {t('pagination.previous')}
        </Button>
        <span className="text-sm tabular-nums" aria-current="page">
          {t('pagination.page', { page, totalPages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          {t('pagination.next')}
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
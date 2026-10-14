import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { getStockStatus } from '@/lib/stock'
import { cn } from '@/lib/utils'

const STYLES = {
  ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  low: 'bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300',
  out: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
}

export default function StockBadge({ product }) {
  const { t } = useTranslation()
  const status = getStockStatus(product)

  return (
    <Badge variant="secondary" className={cn('border-transparent', STYLES[status])}>
      {t(`products.status.${status}`)}
    </Badge>
  )
}
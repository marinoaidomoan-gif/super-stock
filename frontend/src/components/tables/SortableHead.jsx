import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export default function SortableHead({ column, label, sortBy, sortOrder, onSort, className }) {
  const { t } = useTranslation()
  const isActive = sortBy === column
  const Icon = !isActive ? ArrowUpDown : sortOrder === 'ASC' ? ArrowUp : ArrowDown
  const ariaSort = !isActive ? 'none' : sortOrder === 'ASC' ? 'ascending' : 'descending'

  return (
    <TableHead aria-sort={ariaSort} className={className}>
      <button
        type="button"
        onClick={() => onSort(column)}
        aria-label={t('products.sort.by', { column: label })}
        className={cn(
          '-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive && 'text-foreground',
        )}
      >
        {label}
        <Icon className="size-3.5" aria-hidden="true" />
      </button>
    </TableHead>
  )
}
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const FILTERS = [
  { value: 'all', labelKey: 'history.filters.all' },
  { value: 'movement-in', labelKey: 'history.filters.in' },
  { value: 'movement-out', labelKey: 'history.filters.out' },
  { value: 'inventory', labelKey: 'history.filters.inventory' },
  { value: 'product', labelKey: 'history.filters.product' },
  { value: 'user', labelKey: 'history.filters.user' },
]

export default function HistoryFilters({ value, onChange, isAdmin }) {
  const { t } = useTranslation()

  const visibleFilters = isAdmin
    ? FILTERS
    : FILTERS.filter((f) => f.value !== 'user')

  return (
    <div className="flex flex-wrap gap-2">
      {visibleFilters.map((f) => (
        <Button
          key={f.value}
          variant={value === f.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(f.value)}
          className={cn('rounded-full', value === f.value && 'shadow-sm')}
        >
          {t(f.labelKey)}
        </Button>
      ))}
    </div>
  )
}
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function StatusBadge({ active }) {
  const { t } = useTranslation()
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1.5 border-transparent',
        active
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          active ? 'bg-emerald-600' : 'bg-gray-500',
        )}
      />
      {t(active ? 'users.status.active' : 'users.status.inactive')}
    </Badge>
  )
}
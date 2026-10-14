import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STYLES = {
  ENTREE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  SORTIE: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
}

export default function MovementTypeBadge({ type }) {
  const { t } = useTranslation()
  const Icon = type === 'ENTREE' ? ArrowDownToLine : ArrowUpFromLine

  return (
    <Badge variant="secondary" className={cn('gap-1 border-transparent', STYLES[type])}>
      <Icon className="size-3" aria-hidden="true" />
      {t(`movements.types.${type}`)}
    </Badge>
  )
}
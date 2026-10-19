import { useTranslation } from 'react-i18next'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  Package,
  UserPlus,
} from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

const STYLES = {
  'movement-in': {
    icon: ArrowDownToLine,
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400',
    label: 'history.types.in',
  },
  'movement-out': {
    icon: ArrowUpFromLine,
    color: 'text-rose-600 bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400',
    label: 'history.types.out',
  },
  inventory: {
    icon: ClipboardCheck,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400',
    label: 'history.types.inventory',
  },
  product: {
    icon: Package,
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400',
    label: 'history.types.product',
  },
  user: {
    icon: UserPlus,
    color: 'text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400',
    label: 'history.types.user',
  },
}

export default function HistoryEventCard({ event }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const style = STYLES[event.type]
  const Icon = style.icon

  return (
    <div className="flex gap-3">
      <span
        className={cn(
          'mt-0.5 grid size-9 shrink-0 place-items-center rounded-full',
          style.color,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 rounded-lg border bg-card p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-medium">{event.title}</p>
          <time className="text-xs text-muted-foreground">
            {formatDateTime(event.date.toISOString(), locale)}
          </time>
        </div>
        {event.subtitle && (
          <p className="text-sm text-muted-foreground">{event.subtitle}</p>
        )}
        {event.meta && (
          <p className="mt-1 text-xs text-muted-foreground/70 font-mono">
            {event.meta}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-muted px-1.5 py-0.5 font-medium">
            {t(style.label)}
          </span>
          {event.author && event.author !== '—' && (
            <span>{t('history.by', { name: event.author })}</span>
          )}
        </div>
      </div>
    </div>
  )
}
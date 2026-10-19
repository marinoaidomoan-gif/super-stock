import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { History as HistoryIcon, RotateCw } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import PageHeader from '@/components/common/PageHeader'
import HistoryFilters from '@/components/history/HistoryFilters'
import HistoryTimeline from '@/components/history/HistoryTimeline'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useHistory } from '@/hooks/useHistory'
import { ROLES } from '@/lib/roles'

export default function Historique() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isAdmin = user?.role === ROLES.ADMINISTRATEUR

  const { events, isLoading, isError, refetch } = useHistory()
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return events
    return events.filter((e) => e.type === filter)
  }, [events, filter])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <PageHeader
        title={t('history.title')}
        description={t('history.subtitle')}
      >
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RotateCw className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
          {t('history.refresh')}
        </Button>
      </PageHeader>

      <HistoryFilters value={filter} onChange={setFilter} isAdmin={isAdmin} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={HistoryIcon}
          title={t('errors.server')}
          description={t('errors.network')}
        >
          <Button variant="outline" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title={t('history.empty.title')}
          description={t('history.empty.description')}
        />
      ) : (
        <HistoryTimeline events={filtered} />
      )}
    </motion.div>
  )
}
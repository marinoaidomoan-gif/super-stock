import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Package, TriangleAlert, Wallet, ArrowLeftRight, Plus, ArrowRight } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatCard from '@/components/dashboard/StatCard'
import OverviewToolbar from '@/components/dashboard/OverviewToolbar'
import MovementsAreaChart from '@/components/dashboard/MovementsAreaChart'
import CategoriesDonut from '@/components/dashboard/CategoriesDonut'
import RecentMovementsTable from '@/components/dashboard/RecentMovementsTable'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import TopProductsChart from '@/components/dashboard/TopProductsChart'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/hooks/useDashboardData'
import { formatNumber } from '@/lib/format'
import { ROLES } from '@/lib/roles'

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const { user } = useAuth()
  const { data, isLoading, isError } = useDashboardData()

  const isAdmin = user?.role === ROLES.ADMINISTRATEUR
  const isOwner = user?.role === ROLES.PROPRIETAIRE

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={TriangleAlert}
        title={t('errors.server')}
        description={t('errors.network')}
      />
    )
  }

  const { stats, charts, categories, topProducts, movements, alerts } = data
  const displayName = user?.nom ?? user?.email ?? ''
  const firstName = displayName.split(' ')[0]

  const statCards = [
    {
      label: t('dashboard.stats.products'),
      value: formatNumber(stats.products, locale),
      icon: Package,
      color: 'green',
      sub: t('dashboard.stats.unitsSub', { count: formatNumber(stats.units, locale) }),
      tag: t('dashboard.stats.activeTag'),
    },
    {
      label: t('dashboard.stats.alerts'),
      value: formatNumber(stats.alerts, locale),
      icon: TriangleAlert,
      color: 'orange',
      sub:
        stats.alerts > 0
          ? t('dashboard.stats.alertsSub')
          : t('dashboard.stats.noAlertsSub'),
      tag:
        stats.alerts > 0
          ? t('dashboard.stats.actionRequired')
          : t('dashboard.stats.allGood'),
      warn: stats.alerts > 0,
    },
    {
      label: isOwner
        ? t('dashboard.stats.value')
        : isAdmin
          ? t('dashboard.stats.activeUsers')
          : t('dashboard.stats.categories'),
      value: isOwner
        ? formatNumber(stats.value, locale)
        : formatNumber(categories.length, locale),
      suffix: isOwner ? 'FCFA' : '',
      icon: isOwner ? Wallet : Package,
      color: 'blue',
      sub: isOwner
        ? t('dashboard.stats.valueSub')
        : t('dashboard.stats.categoriesSub'),
      tag: isOwner ? t('dashboard.stats.financial') : t('dashboard.stats.global'),
    },
    {
      label: t('dashboard.stats.today'),
      value: formatNumber(stats.today, locale),
      icon: ArrowLeftRight,
      color: 'purple',
      sub: t('dashboard.stats.todaySub', {
        entries: stats.entries,
        exits: stats.exits,
      }),
      tag: t('dashboard.stats.realtime'),
    },
  ]

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title={t('dashboard.greeting', { name: firstName })}
        description={t('dashboard.subtitle')}
      >
        {!isAdmin && (
          <Button asChild>
            <Link to="/mouvements">
              <Plus aria-hidden="true" />
              {t('dashboard.newMovement')}
            </Link>
          </Button>
        )}
      </PageHeader>

      <OverviewToolbar />

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      <div className="chart-grid">
        <MovementsAreaChart charts={charts} />
        <CategoriesDonut categories={categories} totalProducts={stats.products} />
      </div>

      {!isAdmin && (
        <div className="bottom-grid">
          <RecentMovementsTable movements={movements} />
          <AlertsPanel alerts={alerts} />
        </div>
      )}

      {!isAdmin && <TopProductsChart topProducts={topProducts} />}

      {isAdmin && (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>{t('dashboard.admin.title')}</h2>
              <p>{t('dashboard.admin.subtitle')}</p>
            </div>
            <Link to="/utilisateurs" className="text-link">
              {t('dashboard.admin.manageUsers')}
              <ArrowRight size={14} />
            </Link>
          </div>
          <EmptyState
            icon={Package}
            title={t('dashboard.admin.comingSoon')}
            description={t('dashboard.admin.comingSoonDescription')}
          />
        </section>
      )}
    </motion.div>
  )
}
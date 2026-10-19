import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ShieldCheck,
  UserCheck,
  UserX,
  Users as UsersIcon,
  Plus,
} from 'lucide-react'
import UserAvatar from '@/components/common/UserAvatar'
import RoleBadge from '@/components/users/RoleBadge'
import StatusBadge from '@/components/users/StatusBadge'
import StatCard from '@/components/dashboard/StatCard'
import AdminRoleChart from '@/components/dashboard/AdminRoleChart'
import OverviewToolbar from '@/components/dashboard/OverviewToolbar'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useUsers } from '@/hooks/useUsers'
import { formatNumber } from '@/lib/format'

export default function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const { user } = useAuth()
  const { data: users = [], isLoading, isError, refetch } = useUsers()

  // Calcul local (pas besoin d'appeler /users/stats : on a déjà la liste complète).
  const total = users.length
  const actifs = users.filter((u) => u.actif).length
  const inactifs = total - actifs
  const admins = users.filter((u) => u.role === 'ADMINISTRATEUR').length
  const parRole = {
    PROPRIETAIRE: users.filter((u) => u.role === 'PROPRIETAIRE').length,
    GERANT: users.filter((u) => u.role === 'GERANT').length,
    ADMINISTRATEUR: admins,
  }

  // 5 derniers utilisateurs créés (par date décroissante).
  const recents = [...users]
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
    .slice(0, 5)

  const displayName = user?.nom ?? user?.email ?? ''
  const firstName = displayName.split(' ')[0]

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
        icon={UsersIcon}
        title={t('errors.server')}
        description={t('errors.network')}
      >
        <Button variant="outline" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </EmptyState>
    )
  }

  const statCards = [
    {
      label: t('dashboard.admin.stats.total'),
      value: formatNumber(total, locale),
      icon: UsersIcon,
      color: 'blue',
      sub: t('dashboard.admin.stats.totalSub'),
      tag: t('dashboard.admin.stats.totalTag'),
    },
    {
      label: t('dashboard.admin.stats.active'),
      value: formatNumber(actifs, locale),
      icon: UserCheck,
      color: 'green',
      sub: t('dashboard.admin.stats.activeSub'),
      tag: t('dashboard.admin.stats.activeTag'),
    },
    {
      label: t('dashboard.admin.stats.inactive'),
      value: formatNumber(inactifs, locale),
      icon: UserX,
      color: 'orange',
      sub: t('dashboard.admin.stats.inactiveSub'),
      tag: t('dashboard.admin.stats.inactiveTag'),
      warn: inactifs > 0,
    },
    {
      label: t('dashboard.admin.stats.admins'),
      value: formatNumber(admins, locale),
      icon: ShieldCheck,
      color: 'purple',
      sub: t('dashboard.admin.stats.adminsSub'),
      tag: t('dashboard.admin.stats.adminsTag'),
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
        title={t('dashboard.admin.greeting', { name: firstName })}
        description={t('dashboard.admin.subtitle')}
      >
        <Button asChild>
          <Link to="/utilisateurs">
            <Plus aria-hidden="true" />
            {t('dashboard.admin.newUser')}
          </Link>
        </Button>
      </PageHeader>

      <OverviewToolbar />

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      <div className="chart-grid">
        {/* Colonne principale : liste des derniers utilisateurs */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>
                {t('dashboard.admin.recentTitle')}
                <span className="count-badge">{users.length}</span>
              </h2>
              <p>{t('dashboard.admin.recentSubtitle')}</p>
            </div>
            <Link to="/utilisateurs" className="text-link">
              {t('dashboard.admin.viewAll')}
              <ArrowRight size={14} />
            </Link>
          </div>

          {recents.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title={t('users.empty.title')}
              description={t('users.empty.description')}
            />
          ) : (
            <div className="admin-users">
              {recents.map((u) => (
                <div key={u.id}>
                  <UserAvatar name={u.nom} />
                  <span>
                    <b>{u.nom}</b>
                    <small>{u.email}</small>
                  </span>
                  <RoleBadge role={u.role} />
                  <StatusBadge active={u.actif} />
                </div>
              ))}
            </div>
          )}

          <Link to="/utilisateurs" className="alert-footer">
            {t('dashboard.admin.manageUsers')}
            <ArrowRight size={14} />
          </Link>
        </section>

        {/* Colonne secondaire : donut de répartition */}
        <AdminRoleChart parRole={parRole} total={total} />
      </div>
    </motion.div>
  )
}
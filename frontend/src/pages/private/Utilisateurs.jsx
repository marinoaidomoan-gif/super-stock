import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus, Search, Users as UsersIcon } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import PageHeader from '@/components/common/PageHeader'
import InfoBanner from '@/components/users/InfoBanner'
import ToggleActiveDialog from '@/components/users/ToggleActiveDialog'
import UserFormDialog from '@/components/users/UserFormDialog'
import UsersTable from '@/components/users/UsersTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useUsers } from '@/hooks/useUsers'
import { ROLES } from '@/lib/roles'

export default function Utilisateurs() {
  const { t } = useTranslation()
  const { data: users = [], isLoading, isError, refetch } = useUsers()
  const [recherche, setRecherche] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toggleState, setToggleState] = useState({ open: false, user: null })

  const filtered = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!q) return true
      return (
        u.nom?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      )
    })
  }, [users, recherche, roleFilter])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (user) => {
    setEditing(user)
    setFormOpen(true)
  }

  const openToggle = (user) => setToggleState({ open: true, user })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <PageHeader
        title={t('users.title')}
        description={t('users.subtitle')}
      >
        <Button onClick={openCreate}>
          <Plus aria-hidden="true" />
          {t('users.add')}
        </Button>
      </PageHeader>

      <InfoBanner />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t('users.search')}
            className="pl-8"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('users.filters.allRoles')}</SelectItem>
            <SelectItem value={ROLES.PROPRIETAIRE}>{t('roles.PROPRIETAIRE')}</SelectItem>
            <SelectItem value={ROLES.GERANT}>{t('roles.GERANT')}</SelectItem>
            <SelectItem value={ROLES.ADMINISTRATEUR}>{t('roles.ADMINISTRATEUR')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{t('users.errors.loadFailed')}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={t(users.length === 0 ? 'users.empty.title' : 'users.empty.noResultsTitle')}
          description={t(users.length === 0 ? 'users.empty.description' : 'users.empty.noResultsDescription')}
        >
          {users.length === 0 && (
            <Button onClick={openCreate}>
              <Plus aria-hidden="true" />
              {t('users.add')}
            </Button>
          )}
        </EmptyState>
      ) : (
        <UsersTable users={filtered} onEdit={openEdit} onToggle={openToggle} />
      )}

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} />

      <ToggleActiveDialog
        open={toggleState.open}
        onOpenChange={(open) => setToggleState((s) => ({ ...s, open }))}
        user={toggleState.user}
      />
    </motion.div>
  )
}
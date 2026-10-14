import { useTranslation } from 'react-i18next'
import { Loader2, MoreHorizontal, Pencil, UserCheck, UserX } from 'lucide-react'
import UserAvatar from '@/components/common/UserAvatar'
import RoleBadge from '@/components/users/RoleBadge'
import StatusBadge from '@/components/users/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function UsersTable({ users, onEdit, onToggle, pendingId }) {
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('users.columns.user')}</TableHead>
            <TableHead>{t('users.columns.email')}</TableHead>
            <TableHead>{t('users.columns.role')}</TableHead>
            <TableHead>{t('users.columns.status')}</TableHead>
            <TableHead className="text-right">{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.nom} />
                  <span className="font-medium">{user.nom}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <StatusBadge active={user.actif} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={pendingId === user.id}>
                      {pendingId === user.id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <MoreHorizontal />
                      )}
                      <span className="sr-only">{t('common.actions')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Pencil />
                      {t('users.actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggle(user)}>
                      {user.actif ? <UserX /> : <UserCheck />}
                      {t(user.actif ? 'users.actions.deactivate' : 'users.actions.reactivate')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
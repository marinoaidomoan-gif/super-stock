import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { ROLES } from '@/lib/roles'
import { cn } from '@/lib/utils'

const STYLES = {
  [ROLES.PROPRIETAIRE]:
    'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  [ROLES.GERANT]:
    'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  [ROLES.ADMINISTRATEUR]:
    'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
}

export default function RoleBadge({ role }) {
  const { t } = useTranslation()
  return (
    <Badge variant="secondary" className={cn('border-transparent', STYLES[role])}>
      {t(`roles.${role}`)}
    </Badge>
  )
}
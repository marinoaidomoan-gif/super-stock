import { LogOut, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom' // Ajout de useNavigate
import UserAvatar from '@/components/common/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'

export default function UserMenu() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate() // Initialisation
  const displayName = user.nom ?? user.email

  // Fonction pour déconnecter ET rediriger
  const handleLogout = () => {
    logout()
    navigate('/dashboard', { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t('layout.userMenu')}>
          <UserAvatar name={displayName} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-0.5 font-normal">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <p className="text-xs font-medium text-primary">{t(`roles.${user.role}`)}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/parametres">
            <Settings aria-hidden="true" />
            {t('nav.parametres')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}> {/* Utilisation de handleLogout */}
          <LogOut aria-hidden="true" />
          {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
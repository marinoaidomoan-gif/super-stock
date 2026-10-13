import { useState } from 'react'
import { PanelLeft, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import NotificationBell from '@/components/common/NotificationBell'
import ThemeToggle from '@/components/common/ThemeToggle'
import UserMenu from '@/components/common/UserMenu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSidebar } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/roles'

export default function Header() {
  const { t } = useTranslation()
  const { can } = useAuth()
  const { toggleSidebar } = useSidebar()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  // L'administrateur n'a pas accès aux produits ni aux alertes.
  const canUseStock = can([ROLES.GERANT])

  const handleSearch = (event) => {
    event.preventDefault()
    const term = query.trim()
    if (term) navigate(`/produits?search=${encodeURIComponent(term)}`)
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/70 px-4 backdrop-blur-md">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label={t('layout.toggleSidebar')}>
        <PanelLeft className="size-5" />
      </Button>

      {canUseStock && (
        <form role="search" onSubmit={handleSearch} className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('layout.search')}
              aria-label={t('layout.search')}
              className="pl-8"
            />
          </div>
        </form>
      )}

      <div className="ml-auto flex items-center gap-1">
        {canUseStock && <NotificationBell />}
        <LanguageSwitcher />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
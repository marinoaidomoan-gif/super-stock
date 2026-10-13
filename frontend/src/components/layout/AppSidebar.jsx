import { Boxes, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import UserAvatar from '@/components/common/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { NAV_ITEMS } from '@/config/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AppSidebar() {
  const { t } = useTranslation()
  const { user, can, logout } = useAuth()
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  // Seules les entrées autorisées pour le rôle sont affichées.
  const items = NAV_ITEMS.filter((item) => !item.roles || can(item.roles))
  const displayName = user.nom ?? user.email

  // Sur mobile, le menu est un tiroir : on le ferme après un clic.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={t('common.appName')}>
              <Link to="/dashboard" onClick={closeOnMobile}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Boxes className="size-4" aria-hidden="true" />
                </span>
                <span className="text-base font-semibold tracking-tight">{t('common.appName')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('layout.menu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`)
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={t(`nav.${item.key}`)}>
                      <Link to={item.to} onClick={closeOnMobile} aria-current={isActive ? 'page' : undefined}>
                        <item.icon aria-hidden="true" />
                        <span>{t(`nav.${item.key}`)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-1 py-1.5 group-data-[collapsible=icon]:justify-center">
          <UserAvatar name={displayName} />
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">{t(`roles.${user.role}`)}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 group-data-[collapsible=icon]:hidden"
            onClick={logout}
            aria-label={t('auth.logout')}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
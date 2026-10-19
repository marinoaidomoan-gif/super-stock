import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CircleHelp, LogOut, Settings, ShoppingCart } from 'lucide-react'
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { NAV_ITEMS } from '@/config/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLowStockAlerts } from '@/hooks/useLowStockAlerts'
import { cn } from '@/lib/utils'
import { ROLES } from '@/lib/roles'

// Classes appliquées à chaque bouton de navigation.
const NAV_BUTTON_CLASS = cn(
  'h-9 w-full justify-start gap-2.5 px-2.5 text-sm font-medium',
  'data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700',
  'dark:data-[active=true]:bg-emerald-500/10 dark:data-[active=true]:text-emerald-300',
  'hover:bg-sidebar-accent/60',
)

export default function AppSidebar() {
  const { t } = useTranslation()
  const { user, can, logout } = useAuth()
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const { count } = useLowStockAlerts()

  const isAdmin = user?.role === ROLES.ADMINISTRATEUR
  const items = NAV_ITEMS.filter((item) => !item.roles || can(item.roles))
  const displayName = user.nom ?? user.email

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon">
      {/* ---------- En-tête : logo uniquement ---------- */}
      <SidebarHeader className="px-2.5 pb-1.5 pt-2.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={t('common.appName')}>
              <Link to="/dashboard" onClick={closeOnMobile}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-500 text-white shadow-sm">
                  <ShoppingCart className="size-4" aria-hidden="true" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-base font-semibold tracking-tight">
                    {t('common.appName')}
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ---------- Corps : liens de navigation ---------- */}
      <SidebarContent className="px-2.5">
        <SidebarGroup className="gap-1">
          <SidebarGroupLabel className="mb-1 px-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('layout.stockManagement')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive =
                  pathname === item.to || pathname.startsWith(`${item.to}/`)
                const isAlerts = item.key === 'alertes'
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={t(`nav.${item.key}`)}
                      className={NAV_BUTTON_CLASS}
                    >
                      <Link
                        to={item.to}
                        onClick={closeOnMobile}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon className="size-[1.05rem]" aria-hidden="true" />
                        <span className="truncate">{t(`nav.${item.key}`)}</span>
                      </Link>
                    </SidebarMenuButton>
                    {isAlerts && count > 0 && !isAdmin && (
                      <SidebarMenuBadge className="bg-red-600 text-white">
                        {count > 9 ? '9+' : count}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ---------- Pied : carte santé + paramètres + utilisateur ---------- */}
      <SidebarFooter className="px-2.5 pb-2.5">
        {/* Carte "Votre stock, sous contrôle" — visible seulement si déplié ET pas admin */}
        {!isAdmin && (
          <div className="mb-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-2.5 text-xs group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2 font-medium text-sidebar-accent-foreground">
              <span className="size-2 rounded-full bg-emerald-500" />
              {t('layout.stockHealthTitle')}
            </div>
            <p className="mt-1 text-muted-foreground">
              {t('layout.stockHealthSubtitle')}
            </p>
            <Link
              to="/alertes"
              className="mt-2 inline-flex items-center gap-1 font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              onClick={closeOnMobile}
            >
              {t('layout.viewActivity')} →
            </Link>
          </div>
        )}

        <SidebarSeparator className="my-1.5" />

        {/* Liens du bas : Paramètres + À propos */}
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={t('nav.parametres')}
              className={NAV_BUTTON_CLASS}
            >
              <Link to="/parametres" onClick={closeOnMobile}>
                <Settings className="size-[1.05rem]" aria-hidden="true" />
                <span className="truncate">{t('nav.parametres')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={t('layout.about')}
              className={NAV_BUTTON_CLASS}
            >
              <Link to="/" onClick={closeOnMobile}>
                <CircleHelp className="size-[1.05rem]" aria-hidden="true" />
                <span className="truncate">{t('layout.about')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-1.5" />

        {/* Bloc utilisateur : on utilise un <div> pour éviter <button> dans <button> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-11 items-center gap-2 rounded-md px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <UserAvatar name={displayName} />
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {t(`roles.${user.role}`)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 group-data-[collapsible=icon]:hidden"
                onClick={logout}
                aria-label={t('auth.logout')}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLowStockAlerts } from '@/hooks/useLowStockAlerts'
import { formatNumber } from '@/lib/format'

export default function NotificationBell() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const { items, count } = useLowStockAlerts()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`${t('layout.notifications')} : ${t('layout.alertsCount', { count })}`}
        >
          <Bell className="size-5" />
          {count > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white"
            >
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t('layout.alertsCount', { count })}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t('layout.noAlerts')}</p>
        ) : (
          // Les alertes arrivent triées du plus critique au moins critique.
          items.slice(0, 5).map((item) => (
            <DropdownMenuItem key={item.id} asChild>
              <Link
                to={`/produits?search=${encodeURIComponent(item.reference)}`}
                className="flex items-center justify-between gap-3"
              >
                <span className="min-w-0">
                  <span className="block truncate">{item.nom}</span>
                  <span className="block font-mono text-xs text-muted-foreground">{item.reference}</span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatNumber(item.quantiteStock, locale)} / {formatNumber(item.seuilAlerte, locale)}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/alertes" className="justify-center font-medium text-primary">
            {t('layout.viewAllAlerts')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
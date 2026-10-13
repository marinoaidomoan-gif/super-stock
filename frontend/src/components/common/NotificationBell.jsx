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

export default function NotificationBell() {
  const { t } = useTranslation()
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
          items.slice(0, 5).map((item) => (
            <DropdownMenuItem key={item.id} asChild>
              {/* Les noms de champs (nom, quantiteStock) et la route du détail seront confirmés à l'étape Produits. */}
              <Link to={`/produits/${item.id}`} className="flex justify-between gap-2">
                <span className="truncate">{item.nom}</span>
                <span className="text-xs text-muted-foreground">{item.quantiteStock}</span>
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
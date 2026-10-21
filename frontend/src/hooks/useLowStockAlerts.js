import { useAlerts } from '@/hooks/useAlerts'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/roles'

// Alimente la cloche du header. Rafraîchie chaque minute et au retour sur l'onglet,
// car un autre utilisateur peut faire baisser un stock à tout moment.
// ⚠️ Pour l'administrateur, les alertes de stock n'ont pas de sens
// (il n'a pas accès aux produits) et l'API renvoie 403.
export function useLowStockAlerts() {
  const { can } = useAuth()
  const { data = [] } = useAlerts(
    {},
    { enabled: can([ROLES.GERANT]), refetchInterval: 60_000, refetchOnWindowFocus: true },
  )
  return { items: data, count: data.length }
}
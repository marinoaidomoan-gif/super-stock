import { useAlerts } from '@/hooks/useAlerts'

// Alimente la cloche du header. Rafraîchie chaque minute et au retour sur l'onglet,
// car un autre utilisateur peut faire baisser un stock à tout moment.
export function useLowStockAlerts() {
  const { data = [] } = useAlerts({}, { refetchInterval: 60_000, refetchOnWindowFocus: true })
  return { items: data, count: data.length }
}
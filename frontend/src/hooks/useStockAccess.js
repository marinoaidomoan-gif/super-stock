import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/roles'

// Vrai pour le gérant et le propriétaire ; faux pour l'administrateur (aucun accès aux données de stock).
export function useStockAccess() {
  const { can } = useAuth()
  return can([ROLES.GERANT])
}
// Fil d'activité : le serveur fournit les mouvements, les produits et (pour l'admin) les comptes,
// selon le rôle. Les inventaires validés viennent de leur route habituelle (propriétaire).
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useHistoriqueInventaires } from '@/hooks/useInventories'
import { ROLES } from '@/lib/roles'
import { historyService } from '@/services/historyService'

function toEvent(e) {
  const base = { id: e.id, type: e.type, date: new Date(e.date), author: e.auteur ?? '—' }

  switch (e.type) {
    case 'movement-in':
    case 'movement-out':
      return {
        ...base,
        title: `${e.type === 'movement-in' ? 'Entrée' : 'Sortie'} de ${e.quantite} ${e.unite ?? ''}`.trim(),
        subtitle: e.nom,
        meta: e.detail,
      }
    case 'product':
      return { ...base, title: `Produit créé : ${e.nom}`, subtitle: e.detail, meta: e.extra ?? '' }
    default:
      return { ...base, title: `Nouveau compte : ${e.nom}`, subtitle: e.detail, meta: e.extra ?? '' }
  }
}

export function useHistory() {
  const { can } = useAuth()
  // L'inventaire est réservé au propriétaire : les autres rôles ne l'appellent pas (sinon 403).
  const canSeeInventories = can([ROLES.PROPRIETAIRE])

  const feedQuery = useQuery({
    queryKey: ['history'],
    queryFn: () => historyService.list({ limit: 100 }),
    refetchOnMount: 'always', // toujours à jour quand on ouvre la page
  })
  const inventoriesQuery = useHistoriqueInventaires(1, { enabled: canSeeInventories })

  const events = useMemo(() => {
    const all = (feedQuery.data ?? []).map(toEvent)

    if (canSeeInventories) {
      for (const inv of inventoriesQuery.data?.data ?? []) {
        all.push({
          id: `inv-${inv.id}`,
          type: 'inventory',
          date: new Date(inv.dateValidation ?? inv.dateFin ?? inv.dateDebut),
          title: `Inventaire n°${inv.id} validé`,
          subtitle: `${inv.nombreProduits ?? '—'} produits · ${inv.nombreEcarts ?? 0} écart(s)`,
          meta: inv.commentaire ?? '',
          author: inv.lancePar?.nom ?? '—',
        })
      }
    }

    return all.sort((a, b) => b.date - a.date)
  }, [feedQuery.data, inventoriesQuery.data, canSeeInventories])

  return {
    events,
    isLoading: feedQuery.isLoading || (canSeeInventories && inventoriesQuery.isLoading),
    isError: feedQuery.isError || (canSeeInventories && inventoriesQuery.isError),
    refetch: () => {
      feedQuery.refetch()
      if (canSeeInventories) inventoriesQuery.refetch()
    },
  }
}
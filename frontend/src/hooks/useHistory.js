// src/hooks/useHistory.js
//
// Agrège les événements de l'application en une seule timeline.
// Sources : mouvements de stock, inventaires validés, produits créés, utilisateurs créés.
// Aucun endpoint dédié : on reconstruit l'historique à partir de l'existant.
import { useMemo } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useMovements } from '@/hooks/useMovements'
import { useUsers } from '@/hooks/useUsers'
import { useHistoriqueInventaires } from '@/hooks/useInventories'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/roles'

export function useHistory() {
  const { user } = useAuth()
  const isAdmin = user?.role === ROLES.ADMINISTRATEUR

  // On charge tout ce qui peut générer des événements.
  // Les données sont déjà cachées par React Query (pas de double appel).
  const movementsQuery = useMovements({ page: 1, limit: 100 })
  const productsQuery = useProducts({ page: 1, limit: 100 })
  const inventoriesQuery = useHistoriqueInventaires(1)
  const usersQuery = useUsers({ enabled: isAdmin })  // admin uniquement

  const movements = movementsQuery.data?.data ?? []
  const products = productsQuery.data?.data ?? []
  const inventories = inventoriesQuery.data?.data ?? []
  const users = isAdmin ? usersQuery.data ?? [] : []

  const events = useMemo(() => {
    const all = []

    // --- Mouvements de stock ---
    for (const m of movements) {
      all.push({
        id: `mv-${m.id}`,
        type: m.type === 'ENTREE' ? 'movement-in' : 'movement-out',
        date: new Date(m.dateMouvement),
        title:
          m.type === 'ENTREE'
            ? `Entrée de ${m.quantite} ${m.product?.unite ?? ''}`
            : `Sortie de ${m.quantite} ${m.product?.unite ?? ''}`,
        subtitle: m.product?.nom ?? 'Produit inconnu',
        meta: m.product?.reference,
        author: m.user?.nom ?? '—',
      })
    }

    // --- Inventaires validés ---
    for (const inv of inventories) {
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

    // --- Produits créés ---
    for (const p of products) {
      all.push({
        id: `prod-${p.id}`,
        type: 'product',
        date: new Date(p.createdAt),
        title: `Produit créé : ${p.nom}`,
        subtitle: p.reference,
        meta: p.category?.nom ?? '',
        author: '—',
      })
    }

    // --- Utilisateurs créés (admin) ---
    for (const u of users) {
      all.push({
        id: `user-${u.id}`,
        type: 'user',
        date: new Date(u.createdAt ?? Date.now()),
        title: `Nouveau compte : ${u.nom}`,
        subtitle: u.email,
        meta: u.role,
        author: '—',
      })
    }

    // Tri décroissant (le plus récent en premier)
    return all.sort((a, b) => b.date - a.date)
  }, [movements, products, inventories, users])

  return {
    events,
    isLoading:
      movementsQuery.isLoading ||
      productsQuery.isLoading ||
      inventoriesQuery.isLoading ||
      (isAdmin && usersQuery.isLoading),
    isError:
      movementsQuery.isError ||
      productsQuery.isError ||
      inventoriesQuery.isError ||
      (isAdmin && usersQuery.isError),
    refetch: () => {
      movementsQuery.refetch()
      productsQuery.refetch()
      inventoriesQuery.refetch()
      if (isAdmin) usersQuery.refetch()
    },
  }
}
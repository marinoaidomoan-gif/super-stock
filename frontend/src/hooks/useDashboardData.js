// src/hooks/useDashboardData.js
//
// Agrège les données du tableau de bord à partir des hooks React Query
// existants (produits, mouvements, catégories, alertes).
// Aucun appel API supplémentaire : on réutilise le cache.
import { useMemo } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useMovements } from '@/hooks/useMovements'
import { useCategories } from '@/hooks/useCategories'
import { useAlerts } from '@/hooks/useAlerts'

// Palette de secours si la catégorie n'a pas de couleur en base
const FALLBACK_COLORS = [
  '#10b981', // émeraude
  '#3b82f6', // bleu
  '#f59e0b', // ambre
  '#8b5cf6', // violet
  '#ef4444', // rouge
  '#14b8a6', // teal
  '#f97316', // orange
  '#ec4899', // rose
  '#06b6d4', // cyan
  '#84cc16', // lime
]

// Récupère l'identifiant de catégorie d'un produit.
// ⚠️ Ton backend NestJS expose "categoryId" (anglais) et "category" (objet eager).
const getCategoryId = (product) =>
  product?.categoryId ?? product?.category?.id ?? null

// Récupère le prix d'achat s'il existe. Ton entité Product n'en a pas
// encore : la fonction renvoie 0 sans planter (la carte "Valeur totale"
// affichera 0 FCFA tant que le champ n'existe pas côté backend).
const getPrixAchat = (product) =>
  Number(product?.prixAchat ?? product?.prix_achat ?? product?.prixUnitaire ?? 0) || 0

// Récupère l'id du produit depuis un mouvement. Ton backend expose
// "productId" (colonne) et "product" (relation eager).
const getMovementProductId = (movement) =>
  movement?.productId ?? movement?.product?.id ?? null

export function useDashboardData() {
  // 100 produits / 100 mouvements : suffisant pour le dashboard.
  // (Ton backend refuse 1000, d'où la limite à 100.)
  const productsQuery = useProducts({ page: 1, limit: 100, actif: true })
  const movementsQuery = useMovements({ page: 1, limit: 100 })
  const categoriesQuery = useCategories()
  const alertsQuery = useAlerts()

  const products = productsQuery.data?.data ?? []
  const movements = movementsQuery.data?.data ?? []
  const categories = categoriesQuery.data ?? []
  const alerts = alertsQuery.data ?? []

  const data = useMemo(() => {
    // ---------- Stats globales ----------
    const totalProducts = products.length
    const totalUnits = products.reduce((sum, p) => sum + (p.quantiteStock ?? 0), 0)
    const totalValue = products.reduce(
      (sum, p) => sum + (p.quantiteStock ?? 0) * getPrixAchat(p),
      0,
    )

    // ---------- Mouvements du jour ----------
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMovements = movements.filter(
      (m) => new Date(m.dateMouvement) >= today,
    )
    const todayEntries = todayMovements.filter((m) => m.type === 'ENTREE').length
    const todayExits = todayMovements.filter((m) => m.type === 'SORTIE').length

    // ---------- Graphique : 7 derniers jours ----------
    const charts = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      day.setHours(0, 0, 0, 0)
      const next = new Date(day)
      next.setDate(next.getDate() + 1)

      const dayMovements = movements.filter((m) => {
        const d = new Date(m.dateMouvement)
        return d >= day && d < next
      })

      charts.push({
        date: day.toISOString().slice(0, 10),
        entree: dayMovements
          .filter((m) => m.type === 'ENTREE')
          .reduce((s, m) => s + m.quantite, 0),
        sortie: dayMovements
          .filter((m) => m.type === 'SORTIE')
          .reduce((s, m) => s + m.quantite, 0),
      })
    }

    // ---------- Répartition par catégorie ----------
    // On garde uniquement les catégories ayant au moins 1 produit.
    const categoryData = categories
      .map((c, i) => ({
        id: c.id,
        name: c.nom,
        color: c.couleur || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
        value: products.filter((p) => getCategoryId(p) === c.id).length,
      }))
      .filter((c) => c.value > 0)

    // ---------- Top 5 produits les plus mouvementés ----------
    const top = products
      .map((p) => ({
        ...p,
        moves: movements
          .filter((m) => getMovementProductId(m) === p.id)
          .reduce((sum, m) => sum + m.quantite, 0),
      }))
      .filter((p) => p.moves > 0)
      .sort((a, b) => b.moves - a.moves)
      .slice(0, 5)

    return {
      stats: {
        products: totalProducts,
        units: totalUnits,
        value: totalValue,
        alerts: alerts.length,
        today: todayMovements.length,
        entries: todayEntries,
        exits: todayExits,
      },
      charts,
      categories: categoryData,
      topProducts: top,
      products,
      movements,
      alerts,
    }
  }, [products, movements, categories, alerts])

  return {
    data,
    isLoading:
      productsQuery.isLoading ||
      movementsQuery.isLoading ||
      categoriesQuery.isLoading ||
      alertsQuery.isLoading,
    isError:
      productsQuery.isError ||
      movementsQuery.isError ||
      categoriesQuery.isError ||
      alertsQuery.isError,
  }
}
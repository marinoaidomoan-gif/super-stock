// src/hooks/useInventories.js
//
// Hooks React Query pour les inventaires. React Query garde les données en
// cache, gère les états de chargement et d'erreur, et recharge ce qu'il faut
// après chaque modification (c'est le rôle d'invalidateQueries).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventoryService.js'

// "Clés de requête" : l'identité de chaque donnée dans le cache.
// Invalider ['inventories'] recharge TOUT ce qui commence par cette clé.
export const inventoryKeys = {
  all: ['inventories'],
  active: ['inventories', 'active'],
  history: (page) => ['inventories', 'history', page],
  detail: (id) => ['inventories', 'detail', id],
}

// L'inventaire EN COURS (il y en a au plus un), ou null s'il n'y en a pas.
export function useInventaireEnCours() {
  return useQuery({
    queryKey: inventoryKeys.active,
    queryFn: async () => {
      const reponse = await inventoryService.lister({ statut: 'EN_COURS', limit: 1 })
      return reponse.data[0] ?? null
    },
  })
}

// L'historique : les inventaires VALIDÉS, 5 par page.
export function useHistoriqueInventaires(page) {
  return useQuery({
    queryKey: inventoryKeys.history(page),
    queryFn: () => inventoryService.lister({ statut: 'VALIDE', page, limit: 5 }),
  })
}

// Un inventaire avec toutes ses lignes. "enabled" : ne lance pas la requête
// tant qu'on n'a pas d'identifiant valide.
export function useInventaire(id) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryService.detail(id),
    enabled: Number.isInteger(id),
  })
}

// ----- Modifications (mutations) -----

export function useLancerInventaire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentaire) => inventoryService.lancer(commentaire),
    onSuccess: (inventaire) => {
      // On place tout de suite le nouvel inventaire dans le cache : la page
      // affiche le comptage sans attendre un rechargement.
      queryClient.setQueryData(inventoryKeys.detail(inventaire.id), inventaire)
      queryClient.setQueryData(inventoryKeys.active, inventaire)
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}

export function useEnregistrerQuantites(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lignes) => inventoryService.enregistrerQuantites(id, lignes),
    // Le backend renvoie l'inventaire à jour : on remplace le cache directement.
    onSuccess: (inventaire) => {
      queryClient.setQueryData(inventoryKeys.detail(id), inventaire)
    },
  })
}

export function useValiderInventaire(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => inventoryService.valider(id),
    // La validation change le stock des produits et ajoute des mouvements :
    // on invalide TOUT le cache pour que chaque page se recharge à jour
    // (produits, mouvements, alertes, tableau de bord...).
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}

export function useAnnulerInventaire(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => inventoryService.annuler(id),
    onSuccess: () => {
      // L'inventaire n'existe plus : on le retire du cache.
      queryClient.setQueryData(inventoryKeys.active, null)
      queryClient.removeQueries({ queryKey: inventoryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}
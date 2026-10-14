import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PRODUCTS_KEY } from '@/hooks/useProducts'
import { movementService } from '@/services/movementService'

export const MOVEMENTS_KEY = ['movements']

export function useMovements(params) {
  return useQuery({
    queryKey: [...MOVEMENTS_KEY, params],
    queryFn: () => movementService.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useMovementAuthors() {
  return useQuery({
    queryKey: [...MOVEMENTS_KEY, 'authors'],
    queryFn: movementService.authors,
    staleTime: 5 * 60_000,
  })
}

function useMovementMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    // Un mouvement change le stock : on recharge aussi les produits et les alertes.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: MOVEMENTS_KEY }),
        queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
        queryClient.invalidateQueries({ queryKey: ['alerts'] }),
      ]),
  })
}

export const useCreateMovement = () => useMovementMutation(movementService.create)
export const useCorrectMovement = () =>
  useMovementMutation(({ id, ...data }) => movementService.correct(id, data))
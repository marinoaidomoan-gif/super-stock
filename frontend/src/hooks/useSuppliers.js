import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MOVEMENTS_KEY } from '@/hooks/useMovements'
import { supplierService } from '@/services/supplierService'

export const SUPPLIERS_KEY = ['suppliers']

// params : { recherche } (facultatif). Sans paramètre, la page et le formulaire de mouvement
// partagent le même cache.
export function useSuppliers(params = {}, options = {}) {
  return useQuery({
    queryKey: [...SUPPLIERS_KEY, params],
    queryFn: () => supplierService.list(params),
    placeholderData: keepPreviousData,
    ...options,
  })
}

function useSupplierMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY }),
        // Les mouvements affichent le nom du fournisseur : on les recharge aussi.
        queryClient.invalidateQueries({ queryKey: MOVEMENTS_KEY }),
      ]),
  })
}

export const useCreateSupplier = () => useSupplierMutation(supplierService.create)
export const useUpdateSupplier = () =>
  useSupplierMutation(({ id, ...data }) => supplierService.update(id, data))
export const useDeleteSupplier = () => useSupplierMutation(supplierService.remove)
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CATEGORIES_KEY } from '@/hooks/useCategories'
import { productService } from '@/services/productService'

export const PRODUCTS_KEY = ['products']

export function useProducts(params, options = {}) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, params],
    queryFn: () => productService.list(params),
    placeholderData: keepPreviousData,
    ...options,
  })
}

function useProductMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
        // Le nombre de produits par catégorie change aussi.
        queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
      ]),
  })
}

export const useCreateProduct = () => useProductMutation(productService.create)
export const useUpdateProduct = () =>
  useProductMutation(({ id, ...data }) => productService.update(id, data))
export const useDeactivateProduct = () => useProductMutation(productService.remove)
export const useReactivateProduct = () =>
  useProductMutation((id) => productService.update(id, { actif: true }))
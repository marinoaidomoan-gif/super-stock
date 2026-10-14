import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { productService } from '@/services/productService'

export const ALERTS_KEY = ['alerts']

// params : { categoryId } (facultatif). Sans paramètre, la cloche et la page partagent le même cache.
export function useAlerts(params = {}, options = {}) {
  return useQuery({
    queryKey: [...ALERTS_KEY, params],
    queryFn: () => productService.alerts(params),
    placeholderData: keepPreviousData,
    ...options,
  })
}
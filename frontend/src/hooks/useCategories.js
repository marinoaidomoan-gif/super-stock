import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/categoryService'

export const CATEGORIES_KEY = ['categories']

export function useCategories(options = {}) {
  return useQuery({ queryKey: CATEGORIES_KEY, queryFn: categoryService.list, ...options })
}

// Après chaque modification, on recharge la liste pour qu'elle reste à jour.
function useCategoryMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  })
}

export const useCreateCategory = () => useCategoryMutation(categoryService.create)
export const useUpdateCategory = () =>
  useCategoryMutation(({ id, ...data }) => categoryService.update(id, data))
export const useDeleteCategory = () => useCategoryMutation(categoryService.remove)
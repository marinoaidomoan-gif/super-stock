import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/userService'

export const USERS_KEY = ['users']

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: userService.list,
  })
}

function useUserMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}

export const useCreateUser = () => useUserMutation(userService.create)
export const useUpdateUser = () =>
  useUserMutation(({ id, ...data }) => userService.update(id, data))
export const useToggleUserActive = () =>
  useUserMutation((id) => userService.toggleActive(id))
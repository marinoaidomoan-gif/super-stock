// src/hooks/useUpdateProfile.js
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '@/i18n'
import { useAuth } from '@/hooks/useAuth'
import { authStorage } from '@/lib/auth-storage'
import { userService } from '@/services/userService'

// Met à jour le profil ET synchronise l'utilisateur dans localStorage.
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload) => userService.updateMe(payload),
    onSuccess: (updated) => {
      // On fusionne l'utilisateur actuel avec les champs modifiés.
      const next = { ...user, ...updated }
      authStorage.save(authStorage.getToken(), next)
      queryClient.invalidateQueries()
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (payload) => userService.updatePassword(payload),
    onSuccess: () => {
      toast.success(i18n.t('settings.security.success'))
    },
  })
}
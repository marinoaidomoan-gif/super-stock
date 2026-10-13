import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '@/i18n'
import { AuthContext } from '@/contexts/auth-context'
import { authStorage } from '@/lib/auth-storage'
import { hasRole } from '@/lib/roles'
import { setUnauthorizedHandler } from '@/services/api'
import { authService } from '@/services/authService'

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState(() => authStorage.getUser())
  // Tant qu'un jeton existe, on attend la confirmation du serveur avant d'afficher l'app.
  const [isLoading, setIsLoading] = useState(() => Boolean(authStorage.getToken()))

  // Session expirée (401 sur une route protégée) : on déconnecte.
  // ProtectedRoute redirige alors vers /login automatiquement.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      queryClient.clear()
      toast.error(i18n.t('errors.unauthorized'), { id: 'session-expired' })
    })
  }, [queryClient])

  // Au chargement : vérifie le jeton et rafraîchit le profil (rôle, statut...).
  useEffect(() => {
    if (!authStorage.getToken()) return

    let cancelled = false
    authService
      .me()
      .then((freshUser) => {
        if (cancelled) return
        authStorage.save(authStorage.getToken(), freshUser)
        setUser(freshUser)
      })
      .catch(() => {
        // 401 : déjà géré par l'intercepteur. Autre erreur (réseau) : on garde la session.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    authStorage.save(data.access_token, data.user)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    authStorage.clear()
    setUser(null)
    queryClient.clear() // vide le cache : le prochain utilisateur ne voit pas les données du précédent
  }, [queryClient])

  const can = useCallback((roles) => (user ? hasRole(user.role, roles) : false), [user])

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: Boolean(user), login, logout, can }),
    [user, isLoading, login, logout, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
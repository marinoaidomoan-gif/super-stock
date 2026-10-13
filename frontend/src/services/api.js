import axios from 'axios'
import { authStorage } from '@/lib/auth-storage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Ajoute le jeton JWT à chaque requête.
api.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// L'AuthContext (étape 3) enregistrera ici ce qu'il faut faire quand la session expire.
let onUnauthorized = () => {}
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

// Un 401 sur n'importe quelle route (sauf le login lui-même) = session expirée ou compte désactivé.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      authStorage.clear()
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

export default api
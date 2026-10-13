import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PageLoader from '@/components/common/PageLoader'
import { useAuth } from '@/hooks/useAuth'

// Usage : <Route element={<ProtectedRoute roles={[ROLES.GERANT]} />}> ... </Route>
// Sans la prop roles : il suffit d'être connecté.
export default function ProtectedRoute({ roles }) {
  const { user, isLoading, can } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !can(roles)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
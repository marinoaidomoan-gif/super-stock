import { lazy, Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PageLoader from '@/components/common/PageLoader'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/contexts/AuthProvider'
import { ROLES } from '@/lib/roles'

import Landing from '@/pages/public/Landing.jsx'

const Login = lazy(() => import('@/pages/public/Login'))
const ForgotPassword = lazy(() => import('@/pages/public/ForgotPassword'))
const Dashboard = lazy(() => import('@/pages/private/Dashboard'))
const Placeholder = lazy(() => import('@/pages/private/Placeholder'))
const Categories = lazy(() => import('@/pages/private/Categories'))
const Products = lazy(() => import('@/pages/private/Products'))
const Movements = lazy(() => import('@/pages/private/Movements'))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Connecté : tous les rôles */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/historique" element={<Placeholder titleKey="nav.historique" />} />
                  <Route path="/parametres" element={<Placeholder titleKey="nav.parametres" />} />

                  {/* Gérant (et propriétaire, qui hérite) */}
                  <Route element={<ProtectedRoute roles={[ROLES.GERANT]} />}>
                    <Route path="/produits" element={<Products />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/mouvements" element={<Movements />} />
                    <Route path="/alertes" element={<Placeholder titleKey="nav.alertes" />} />
                  </Route>

                  {/* Propriétaire uniquement */}
                  <Route element={<ProtectedRoute roles={[ROLES.PROPRIETAIRE]} />}>
                    <Route path="/fournisseurs" element={<Placeholder titleKey="nav.fournisseurs" />} />
                    <Route path="/inventaire" element={<Placeholder titleKey="nav.inventaire" />} />
                  </Route>

                  {/* Administrateur système uniquement */}
                  <Route element={<ProtectedRoute roles={[ROLES.ADMINISTRATEUR]} />}>
                    <Route path="/utilisateurs" element={<Placeholder titleKey="nav.utilisateurs" />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  )
}
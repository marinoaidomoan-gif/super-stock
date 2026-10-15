import { lazy, Suspense, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PageLoader from '@/components/common/PageLoader'
import SplashScreen from '@/components/common/SplashScreen'
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
const Alerts = lazy(() => import('@/pages/private/Alerts'))
const Suppliers = lazy(() => import('@/pages/private/Suppliers'))
import Inventory from '@/pages/private/Inventory.jsx'
import InventoryDetail from '@/pages/private/InventoryDetail.jsx'
const Parametres = lazy(() => import('@/pages/private/Parametres'))
const Utilisateurs = lazy(() => import('@/pages/private/Utilisateurs'))



export default function App() {
  const [booted, setBooted] = useState(false)
  return (
    <MotionConfig reducedMotion="user">
      {/* Splash affiché tant que booted n'est pas passé à true */}
      {!booted && <SplashScreen onDone={() => setBooted(true)} />}
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
                  <Route path="/parametres" element={<Parametres />} />

                  {/* Gérant (et propriétaire, qui hérite) */}
                  <Route element={<ProtectedRoute roles={[ROLES.GERANT]} />}>
                    <Route path="/produits" element={<Products />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/mouvements" element={<Movements />} />
                    <Route path="/alertes" element={<Alerts />} />
                  </Route>

                  {/* Propriétaire uniquement */}
                  <Route element={<ProtectedRoute roles={[ROLES.PROPRIETAIRE]} />}>
                    <Route path="/fournisseurs" element={<Suppliers />} />
                    <Route path="/inventaire" element={<Inventory />} />
                    <Route path="/inventaire/:id" element={<InventoryDetail />} />
                  </Route>

                  {/* Administrateur système uniquement */}
                  <Route element={<ProtectedRoute roles={[ROLES.ADMINISTRATEUR]} />}>
                    <Route path="/utilisateurs" element={<Utilisateurs />} />
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
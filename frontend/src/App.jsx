import { lazy, Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PageLoader from '@/components/common/PageLoader'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthProvider'

// Chargement différé : chaque page est téléchargée seulement quand on la visite.
const Login = lazy(() => import('@/pages/public/Login'))
const ForgotPassword = lazy(() => import('@/pages/public/ForgotPassword'))
const Dashboard = lazy(() => import('@/pages/private/Dashboard'))

export default function App() {
  return (
    // reducedMotion="user" : respecte le réglage « réduire les animations » du système.
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  )
}
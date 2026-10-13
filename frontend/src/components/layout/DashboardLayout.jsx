import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation } from 'react-router-dom'
import AppSidebar from '@/components/layout/AppSidebar'
import Header from '@/components/layout/Header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function DashboardLayout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <SidebarProvider>
      {/* Lien d'évitement : visible uniquement au clavier (Tab), pour sauter le menu. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t('layout.skipToContent')}
      </a>

      <AppSidebar />

      <SidebarInset>
        <Header />
        <div id="main-content" tabIndex={-1} className="flex-1 p-4 outline-none md:p-6">
          {/* key = chemin : l'animation (fondu + glissement) rejoue à chaque changement de page. */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto w-full max-w-7xl"
          >
            <Outlet />
          </motion.div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
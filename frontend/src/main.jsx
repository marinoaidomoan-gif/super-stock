import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import '@fontsource-variable/inter'
import './index.css'
import './i18n'
import App from './App.jsx'
import { Toaster } from '@/components/ui/sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="superstock-theme">
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
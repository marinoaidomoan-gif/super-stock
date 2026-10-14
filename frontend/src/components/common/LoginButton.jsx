// src/components/common/LoginButton.jsx
//
// Bouton émeraude "Se connecter". Si l'utilisateur est DÉJÀ connecté, il
// devient "Accéder à l'application" et mène au tableau de bord.
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth.js'
import { cn } from '@/lib/utils'

export default function LoginButton({ size = 'default', variant = 'default', className }) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  return (
    // asChild : le Button prend l'apparence, mais c'est le <Link> qui est
    // rendu (un vrai lien, accessible au clavier).
    <Button
      asChild
      size={size}
      variant={variant}
      // cn() fusionne les classes : celles passées en "className" l'emportent
      // sur les classes émeraude par défaut.
      className={cn(
        'group bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-500/40 active:translate-y-0 active:scale-95',
        className,
      )}
    >
      <Link to={isAuthenticated ? '/dashboard' : '/login'}>
        {isAuthenticated ? t('landing.openApp') : t('common.login')}
        <ArrowRight
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-1"
        />
      </Link>
    </Button>
  )
}
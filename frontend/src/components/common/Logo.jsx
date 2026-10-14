// src/components/common/Logo.jsx
//
// Logo SuperStock : une icône dans un carré émeraude + le nom.
// Réutilisé dans la landing page, la page de connexion et la sidebar.
// src/components/common/Logo.jsx
//
// Logo SuperStock : une icône panier dans un carré émeraude + le nom.
// Réutilisé dans la landing page, la page de connexion et la sidebar.
import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Logo({ className }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid size-9 place-items-center rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
        <ShoppingCart className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-tight">SuperStock</span>
    </span>
  )
}
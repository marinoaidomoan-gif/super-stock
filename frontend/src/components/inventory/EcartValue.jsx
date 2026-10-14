// src/components/inventory/EcartValue.jsx
//
// Affiche un écart avec sa couleur :
//   - vert  (+) : on a TROUVÉ plus de stock que prévu
//   - rouge (-) : il MANQUE du stock
//   - gris  (0) : aucun écart ; "—" : pas encore compté
import { cn } from '@/lib/utils'
import { formatEcart } from '@/lib/format.js'

export default function EcartValue({ ecart, langue }) {
  if (ecart === null || ecart === undefined) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    // tabular-nums : tous les chiffres ont la même largeur, donc les nombres
    // s'alignent bien dans la colonne.
    <span
      className={cn(
        'font-medium tabular-nums',
        ecart > 0 && 'text-emerald-600 dark:text-emerald-400',
        ecart < 0 && 'text-red-600 dark:text-red-400',
        ecart === 0 && 'text-muted-foreground',
      )}
    >
      {ecart === 0 ? '0' : formatEcart(ecart, langue)}
    </span>
  )
}
// src/components/inventory/InventoryStatusBadge.jsx
//
// Pastille de statut d'un inventaire : orange "En cours", verte "Validé".
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

const STYLES = {
  EN_COURS: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  VALIDE: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
}

export default function InventoryStatusBadge({ statut }) {
  const { t } = useTranslation()
  return (
    <Badge variant="outline" className={STYLES[statut]}>
      {t(`inventory.status.${statut}`)}
    </Badge>
  )
}
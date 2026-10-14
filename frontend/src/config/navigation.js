import {
  ArrowLeftRight,
  BellRing,
  ClipboardCheck,
  History,
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Users,
} from 'lucide-react'
import { ROLES } from '@/lib/roles'

// roles : rôles autorisés (le propriétaire hérite du gérant). Absent = tous les rôles connectés.
export const NAV_ITEMS = [
  { key: 'dashboard', to: '/dashboard', icon: LayoutDashboard },
  { key: 'produits', to: '/produits', icon: Package, roles: [ROLES.GERANT] },
  { key: 'categories', to: '/categories', icon: Tags, roles: [ROLES.GERANT] },
  { key: 'fournisseurs', to: '/fournisseurs', icon: Truck, roles: [ROLES.PROPRIETAIRE] },
  { key: 'mouvements', to: '/mouvements', icon: ArrowLeftRight, roles: [ROLES.GERANT] },
  { key: 'inventaire', to: '/inventaire', icon: ClipboardCheck, roles: [ROLES.PROPRIETAIRE] },
  { key: 'alertes', to: '/alertes', icon: BellRing, roles: [ROLES.GERANT] },
  { key: 'utilisateurs', to: '/utilisateurs', icon: Users, roles: [ROLES.ADMINISTRATEUR] },
  { key: 'historique', to: '/historique', icon: History, roles: [ROLES.ADMINISTRATEUR]},
]
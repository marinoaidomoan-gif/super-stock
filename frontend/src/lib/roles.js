export const ROLES = {
  PROPRIETAIRE: 'PROPRIETAIRE',
  GERANT: 'GERANT',
  ADMINISTRATEUR: 'ADMINISTRATEUR',
}

// Même hiérarchie que le backend : le propriétaire hérite des droits du gérant.
const EFFECTIVE_ROLES = {
  PROPRIETAIRE: ['PROPRIETAIRE', 'GERANT'],
  GERANT: ['GERANT'],
  ADMINISTRATEUR: ['ADMINISTRATEUR'],
}

// allowedRoles : tableau de rôles autorisés, ex. [ROLES.GERANT]
export function hasRole(userRole, allowedRoles) {
  const effective = EFFECTIVE_ROLES[userRole] ?? []
  return allowedRoles.some((role) => effective.includes(role))
}
// src/services/inventoryService.js
//
// Appels HTTP vers les routes /api/inventories du backend. Un "service" ne
// fait QUE parler à l'API : pas d'affichage, pas d'état. Les composants
// l'utilisent à travers les hooks de useInventories.js.
// Chaque fonction renvoie directement les données (response.data).
import { api } from '@/services/api.js'

export const inventoryService = {
  // GET /inventories?page=1&limit=5&statut=VALIDE : liste avec un résumé.
  lister: (params) => api.get('/inventories', { params }).then((r) => r.data),

  // GET /inventories/3 : en-tête + toutes les lignes.
  detail: (id) => api.get(`/inventories/${id}`).then((r) => r.data),

  // POST /inventories : lance un inventaire (le commentaire est facultatif).
  lancer: (commentaire) =>
    api.post('/inventories', commentaire ? { commentaire } : {}).then((r) => r.data),

  // PATCH /inventories/3/quantites : enregistre des quantités comptées.
  // "lignes" = [{ productId, quantiteReelle }, ...]
  enregistrerQuantites: (id, lignes) =>
    api.patch(`/inventories/${id}/quantites`, { lignes }).then((r) => r.data),

  // POST /inventories/3/valider : crée les mouvements de correction.
  valider: (id) => api.post(`/inventories/${id}/valider`).then((r) => r.data),

  // DELETE /inventories/3 : annule un inventaire non validé.
  annuler: (id) => api.delete(`/inventories/${id}`),
}
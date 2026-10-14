import api from './api'

export const movementService = {
  async list(params) {
    const { data } = await api.get('/stock-movements', { params })
    return data // { data, total, page, limit, totalPages }
  },

  async create(payload) {
    const { data } = await api.post('/stock-movements', payload)
    return data
  },

  // Crée le mouvement inverse. Un mouvement n'est jamais modifié ni supprimé.
  async correct(id, payload) {
    const { data } = await api.post(`/stock-movements/${id}/correction`, payload)
    return data
  },

  async authors() {
    const { data } = await api.get('/stock-movements/auteurs')
    return data // [{ id, nom }]
  },
}
import api from './api'

export const productService = {
  async list(params) {
    const { data } = await api.get('/products', { params })
    return data // { data, total, page, limit, totalPages }
  },

  async create(payload) {
    const { data } = await api.post('/products', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.patch(`/products/${id}`, payload)
    return data
  },

  // Côté serveur, DELETE désactive le produit (il n'est jamais supprimé).
  async remove(id) {
    await api.delete(`/products/${id}`)
  },
}
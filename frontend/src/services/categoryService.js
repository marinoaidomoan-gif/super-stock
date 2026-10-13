import api from './api'

export const categoryService = {
  async list() {
    const { data } = await api.get('/categories')
    return data
  },

  async create(payload) {
    const { data } = await api.post('/categories', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.patch(`/categories/${id}`, payload)
    return data
  },

  async remove(id) {
    await api.delete(`/categories/${id}`) // 204 : pas de contenu à lire
  },
}
import api from './api'

export const supplierService = {
  async list(params) {
    const { data } = await api.get('/suppliers', { params })
    return data // tableau, avec nombreApprovisionnements
  },

  async create(payload) {
    const { data } = await api.post('/suppliers', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.patch(`/suppliers/${id}`, payload)
    return data
  },

  async remove(id) {
    await api.delete(`/suppliers/${id}`)
  },
}
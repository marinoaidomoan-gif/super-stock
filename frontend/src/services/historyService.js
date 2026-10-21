import api from './api'

export const historyService = {
  async list(params) {
    const { data } = await api.get('/historique', { params })
    return data // tableau d'événements
  },
}
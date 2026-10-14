// src/services/userService.js
//
// Appels HTTP vers /api/users. Le profil (me) est réservé à l'utilisateur
// connecté ; le reste (CRUD) est réservé à l'administrateur.
import api from './api'

export const userService = {
  // --- Profil de l'utilisateur connecté ---
  async updateMe(payload) {
    const { data } = await api.patch('/users/me', payload)
    return data
  },

  async updatePassword({ motDePasseActuel, nouveauMotDePasse }) {
    const { data } = await api.patch('/users/me/password', {
      motDePasseActuel,
      nouveauMotDePasse,
    })
    return data
  },

  // --- Administration (ADMINISTRATEUR uniquement) ---
  async list() {
    const { data } = await api.get('/users')
    return data // tableau d'utilisateurs
  },

  async create(payload) {
    const { data } = await api.post('/users', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.patch(`/users/${id}`, payload)
    return data
  },

  // Bascule actif/inactif — correspond au PATCH /users/:id/activer de ton backend.
  async toggleActive(id) {
    const { data } = await api.patch(`/users/${id}/activer`)
    return data
  },

  async stats() {
    const { data } = await api.get('/users/stats')
    return data
  },
}
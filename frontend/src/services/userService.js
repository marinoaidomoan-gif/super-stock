// src/services/userService.js
//
// Appels HTTP vers les routes /api/users/me. Utilisé par la page Paramètres
// pour modifier le nom et le mot de passe de l'utilisateur connecté.
import api from './api'

export const userService = {
  // PATCH /users/me — modification partielle du profil.
  async updateMe(payload) {
    const { data } = await api.patch('/users/me', payload)
    return data
  },

  // PATCH /users/me/password — changement de mot de passe.
  async updatePassword({ motDePasseActuel, nouveauMotDePasse }) {
    const { data } = await api.patch('/users/me/password', {
      motDePasseActuel,
      nouveauMotDePasse,
    })
    return data
  },
}
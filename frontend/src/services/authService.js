import api from './api'

export const authService = {
  async login({ email, motDePasse }) {
    const { data } = await api.post('/auth/login', { email, motDePasse })
    return data // { access_token, user }
  },

  async me() {
    const { data } = await api.get('/auth/me')
    return data
  },
}
import api from './api'

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (fullName, email, password, desiredRole) => {
    const response = await api.post('/auth/register', { fullName, email, password, desiredRole })
    return response.data
  },

  refreshToken: async (token) => {
    const response = await api.post(`/auth/refresh-token?token=${token}`)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me')
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
  }
}

export default authService

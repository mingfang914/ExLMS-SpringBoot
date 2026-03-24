import api from './api'

const adminService = {
  getUsers: async (page = 0, size = 10, keyword = '') => {
    const response = await api.get('/admin/users', { params: { page, size, keyword } })
    return response.data
  },

  changeUserStatus: async (id, status) => {
    const response = await api.put(`/admin/users/${id}/status`, null, { params: { status } })
    return response.data
  },

  changeUserRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, null, { params: { role } })
    return response.data
  },

  exportUsersCsvUrl: () => {
    return '/api/admin/users/export'
  }
}

export default adminService

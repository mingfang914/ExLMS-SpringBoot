import axios from 'axios'
import store from '../store'
import { logout } from '../store/authSlice'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiration or unauthorized access
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Check if error is 401/403 and we haven't retried yet
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          // Using axios directly to avoid interceptor loop
          const res = await axios.post(`/api/auth/refresh-token?token=${refreshToken}`)
          
          if (res.data && res.data.token) {
            localStorage.setItem('token', res.data.token)
            if (res.data.refreshToken) {
              localStorage.setItem('refreshToken', res.data.refreshToken)
            }
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`
            return api(originalRequest)
          }
        } catch (refreshErr) {
          // Refresh failed
        }
      }
      
      // Clear token and redirect to login if unauthorized and refresh failed
      store.dispatch(logout())
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

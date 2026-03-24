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
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('API Request: Added token to', config.url)
    } else if (config.headers.Authorization) {
      console.log('API Request: Token already present for', config.url)
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
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          console.log('Refreshing token...');
          // Using axios instance directly to respect baseURL and proxy
          const res = await axios({
            method: 'post',
            url: '/api/auth/refresh-token',
            params: { token: refreshToken }
          })
          
          if (res.data && res.data.token) {
            console.log('Token refreshed successfully');
            localStorage.setItem('token', res.data.token)
            if (res.data.refreshToken) {
              localStorage.setItem('refreshToken', res.data.refreshToken)
            }
            // Clear Authorization header to let the Request Interceptor add the new one
            if (originalRequest.headers.delete) {
              originalRequest.headers.delete('Authorization')
            } else {
              delete originalRequest.headers['Authorization']
            }
            
            // Retry the original request using the api instance after a short delay
            console.log('Retrying original request with new token:', originalRequest.url);
            await new Promise(resolve => setTimeout(resolve, 100));
            return api(originalRequest)
          }
        } catch (refreshErr) {
          console.error('Refresh token failed:', refreshErr);
          store.dispatch(logout())
          window.location.href = '/login'
          return Promise.reject(refreshErr)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

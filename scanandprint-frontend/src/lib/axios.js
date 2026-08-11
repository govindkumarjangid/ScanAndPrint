import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken')
    const shopToken = localStorage.getItem('shopToken')
    if (adminToken && config.url?.startsWith('/admin')) {
      config.headers.Authorization = `Bearer ${adminToken}`
    } else if (shopToken) {
      config.headers.Authorization = `Bearer ${shopToken}`
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor for Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        )

        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api

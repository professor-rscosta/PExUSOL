// src/api/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Interceptor — injeta token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('usina_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor — trata erros globais
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado
      localStorage.removeItem('usina_token')
      localStorage.removeItem('usina_usuario')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

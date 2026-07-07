import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Attach bearer token from env (set VITE_API_TOKEN in .env)
const TOKEN = import.meta.env.VITE_API_TOKEN
if (TOKEN) {
  api.defaults.headers.common['Authorization'] = `Bearer ${TOKEN}`
}

// Global error interceptor
api.interceptors.response.use(
  res => res,
  err => {
    // Don't expose details to console in production
    if (import.meta.env.DEV) {
      console.error('[API]', err.response?.status, err.config?.url)
    }
    return Promise.reject(err)
  }
)

export default api

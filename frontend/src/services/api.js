import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const deviceId = localStorage.getItem('device_id')
  
  // Try to get token from sessionStorage first (current session), then localStorage (persisted)
  const token = deviceId 
    ? (sessionStorage.getItem(`token_${deviceId}`) || localStorage.getItem(`token_${deviceId}`))
    : null
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    // Only add device ID header for authenticated requests
    if (deviceId) {
      config.headers['X-Device-Id'] = deviceId
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout on 401 for auth endpoints to avoid losing session on other failed requests
    const url = error.config?.url || ''
    if (error.response?.status === 401 && (url.includes('/auth/') || url.includes('/verify'))) {
      const deviceId = localStorage.getItem('device_id')
      if (deviceId) {
        // Clear from both storages
        sessionStorage.removeItem(`token_${deviceId}`)
        sessionStorage.removeItem(`admin_${deviceId}`)
        localStorage.removeItem(`token_${deviceId}`)
        localStorage.removeItem(`admin_${deviceId}`)
        console.log('🚪 Auth failed (401) - token cleared from all storage')
      }
    }
    return Promise.reject(error)
  }
)

export default api

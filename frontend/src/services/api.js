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
  const token = deviceId ? sessionStorage.getItem(`token_${deviceId}`) : null
  
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
    if (error.response?.status === 401) {
      const deviceId = localStorage.getItem('device_id')
      if (deviceId) {
        sessionStorage.removeItem(`token_${deviceId}`)
        sessionStorage.removeItem(`admin_${deviceId}`)
      }
    }
    return Promise.reject(error)
  }
)

export default api

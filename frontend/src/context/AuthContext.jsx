import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

// Generate or get unique device ID - stored in localStorage to persist across sessions
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    // Use crypto.randomUUID() for modern browsers, fallback to manual generation
    if (crypto.randomUUID) {
      deviceId = crypto.randomUUID()
    } else {
      // Fallback for older browsers
      deviceId = 'device-' + Math.random().toString(36).substr(2, 9)
    }
    localStorage.setItem('device_id', deviceId)
  }
  return deviceId
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const deviceId = getDeviceId()

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      // Try both sessionStorage (current session) and localStorage (persistent)
      const storedToken = sessionStorage.getItem(`token_${deviceId}`) || localStorage.getItem(`token_${deviceId}`)
      const storedAdmin = sessionStorage.getItem(`admin_${deviceId}`) || localStorage.getItem(`admin_${deviceId}`)
      
      if (storedToken && storedAdmin) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || '/api'}/auth/verify`,
            {
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'X-Device-Id': deviceId,
                'Content-Type': 'application/json'
              }
            }
          )
          if (response.ok) {
            setToken(storedToken)
            setAdmin(JSON.parse(storedAdmin))
            console.log('✅ Token validated and restored from storage')
          } else {
            // Clear invalid token from both storages
            sessionStorage.removeItem(`token_${deviceId}`)
            sessionStorage.removeItem(`admin_${deviceId}`)
            localStorage.removeItem(`token_${deviceId}`)
            localStorage.removeItem(`admin_${deviceId}`)
            console.log('❌ Token invalid, cleared from storage')
          }
        } catch (error) {
          console.error('Token validation failed:', error)
        }
      }
      setLoading(false)
    }
    validateToken()
  }, [deviceId])

  const login = async (email, password) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || '/api'}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceId })
      }
    )
    const data = await response.json()
    if (!data.success) throw new Error(data.message)
    
    // Store in BOTH sessionStorage (for current session) and localStorage (for persistence)
    sessionStorage.setItem(`token_${deviceId}`, data.token)
    sessionStorage.setItem(`admin_${deviceId}`, JSON.stringify(data.admin))
    localStorage.setItem(`token_${deviceId}`, data.token)
    localStorage.setItem(`admin_${deviceId}`, JSON.stringify(data.admin))
    
    setToken(data.token)
    setAdmin(data.admin)
    return data
  }

  const logout = () => {
    // Remove from both storages
    sessionStorage.removeItem(`token_${deviceId}`)
    sessionStorage.removeItem(`admin_${deviceId}`)
    localStorage.removeItem(`token_${deviceId}`)
    localStorage.removeItem(`admin_${deviceId}`)
    setToken(null)
    setAdmin(null)
    console.log('✅ Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ token, admin, loading, login, logout, deviceId }}>
      {children}
    </AuthContext.Provider>
  )
}

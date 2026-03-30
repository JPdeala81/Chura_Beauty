import { createContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const AuthContext = createContext()

// Generate or get unique device ID
const getDeviceId = () => {
  let deviceId = sessionStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = uuidv4()
    sessionStorage.setItem('device_id', deviceId)
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
      const storedToken = sessionStorage.getItem(`token_${deviceId}`)
      const storedAdmin = sessionStorage.getItem(`admin_${deviceId}`)
      
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
          } else {
            sessionStorage.removeItem(`token_${deviceId}`)
            sessionStorage.removeItem(`admin_${deviceId}`)
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
    sessionStorage.setItem(`token_${deviceId}`, data.token)
    sessionStorage.setItem(`admin_${deviceId}`, JSON.stringify(data.admin))
    setToken(data.token)
    setAdmin(data.admin)
    return data
  }

  const logout = () => {
    sessionStorage.removeItem(`token_${deviceId}`)
    sessionStorage.removeItem(`admin_${deviceId}`)
    setToken(null)
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ token, admin, loading, login, logout, deviceId }}>
      {children}
    </AuthContext.Provider>
  )
}

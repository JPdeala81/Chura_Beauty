import { createContext, useState } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || '/api'}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }
    )
    const data = await response.json()
    if (!data.success) throw new Error(data.message)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setAdmin(data.admin)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ token, admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

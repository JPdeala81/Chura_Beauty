import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function ProtectedLoginRoute({ children }) {
  const { token, loading } = useContext(AuthContext)

  if (loading) {
    return <div>Chargement...</div>
  }

  // Si déjà connecté, redirection vers le dashboard approprié
  if (token) {
    return <Navigate to="/admin/dashboard" replace />
  }

  // Si pas connecté, affiche la page de login
  return children
}

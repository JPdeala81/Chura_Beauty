import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * RoleRoute - Protège une route en vérifiant le rôle de l'utilisateur
 * @param {string} allowedRole - Le rôle autorisé à accéder à cette route
 * @param {*} fallbackRoute - Route de redirection si rôle ne correspond pas
 * @param {*} children - Contenu à rendre si accès autorisé
 */
const RoleRoute = ({ allowedRole, fallbackRoute = '/admin/login', children }) => {
  const { token, admin, loading } = useContext(AuthContext)
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--gradient-primary)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '3px solid rgba(255,255,255,0.2)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    )
  }
  
  if (!token || !admin) {
    return <Navigate to="/admin/login" replace />
  }
  
  // Check if user's role matches the allowed role
  if (allowedRole && admin.role !== allowedRole) {
    console.warn(`✗ Access denied: User role '${admin.role}' does not match required role '${allowedRole}'. Redirecting to ${fallbackRoute}`)
    return <Navigate to={fallbackRoute} replace />
  }
  
  console.log(`✓ Access granted: User role '${admin.role}' matches requirement '${allowedRole}'`)
  return children
}

export default RoleRoute

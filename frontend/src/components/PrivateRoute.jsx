import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const PrivateRoute = () => {
  const { token } = useContext(AuthContext)
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }
  return <Outlet />
}

export default PrivateRoute

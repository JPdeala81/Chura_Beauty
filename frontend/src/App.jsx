import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ThemeSwitcher from './components/ThemeSwitcher'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageServices from './pages/admin/ManageServices'
import ManageAppointments from './pages/admin/ManageAppointments'
import Revenue from './pages/admin/Revenue'
import Settings from './pages/admin/Settings'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* ✅ ROUTES PUBLIQUES - jamais de redirection */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/admin/login" element={<Login />} />

            {/* ✅ ROUTES ADMIN PROTÉGÉES - redirige vers login si pas connecté */}
            <Route path="/admin" element={<PrivateRoute />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="services" element={<ManageServices />} />
              <Route path="appointments" element={<ManageAppointments />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* ✅ TOUTE AUTRE URL - retourne à l'accueil */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ThemeSwitcher />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

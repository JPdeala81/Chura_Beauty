import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useContext, useEffect } from 'react'
import { AuthContext } from './context/AuthContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider } from './context/ThemeContext'
import { QRCodeProvider } from './context/QRCodeContext'
import { SiteSettingsProvider, useSiteSettings } from './contexts/SiteSettingsContext'
import ThemeSwitcherFloating from './components/ThemeSwitcherFloating'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import HelpPage from './pages/HelpPage'
import Login from './pages/Login'
import ResetPassword from './pages/admin/ResetPassword'
import DebugLogin from './pages/admin/DebugLogin'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import AboutUs from './pages/AboutUs'
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard'
import ManageServices from './pages/admin/ManageServices'
import ManageAppointments from './pages/admin/ManageAppointments'
import Revenue from './pages/admin/Revenue'
import Settings from './pages/admin/Settings'
import PrivateRoute from './components/PrivateRoute'
import RoleRoute from './components/RoleRoute'
import ProtectedLoginRoute from './components/ProtectedLoginRoute'
import MaintenancePage from './pages/MaintenancePage'
import OwnerProfile from './pages/OwnerProfile'
import DeveloperDashboard from './pages/admin/DeveloperDashboard'
import { useMaintenanceCheck } from './hooks/useMaintenanceCheck'

// Component to redirect /admin to the correct dashboard based on role
function AdminRedirect() {
  const { admin, deviceId } = useContext(AuthContext)
  
  console.log('🔍 AdminRedirect Debug:', {
    admin,
    role: admin?.role,
    deviceId,
    storageData: {
      sessionAdmin: sessionStorage.getItem(`admin_${deviceId}`),
      localAdmin: localStorage.getItem(`admin_${deviceId}`)
    }
  })
  
  if (!admin) {
    console.log('⚠️ AdminRedirect: No admin found, redirecting to login')
    return <Navigate to="/admin/login" replace />
  }
  
  // Redirect to appropriate dashboard based on role
  const role = admin.role || 'admin'
  console.log(`✅ AdminRedirect: Redirecting ${admin.email} to dashboard for role: ${role}`)
  
  if (role === 'developer') {
    console.log('→ Redirecting to /admin/developer')
    return <Navigate to="/admin/developer" replace />
  }
  console.log('→ Redirecting to /admin/dashboard')
  return <Navigate to="/admin/dashboard" replace />
}

function AppRoutes() {
  const { isMaintenance, maintenanceData } = useMaintenanceCheck()
  const { admin } = useContext(AuthContext)
  const siteSettings = useSiteSettings()

  // If under maintenance and user is not admin, show maintenance page
  if (isMaintenance && (!admin || (admin.role !== 'admin' && admin.role !== 'developer'))) {
    return (
      <>
        <MaintenancePage 
          maintenanceInfo={maintenanceData || {}}
          siteSettings={siteSettings}
          onAdminLogin={() => window.location.href = '/admin/login'}
        />
      </>
    )
  }

  return (
    <>
      <Routes>
        {/* ✅ ROUTES PUBLIQUES */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/admin/login" element={<ProtectedLoginRoute><Login /></ProtectedLoginRoute>} />
        <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
        <Route path="/debug/login" element={<DebugLogin />} />
        <Route path="/owner-profile/:slug" element={<OwnerProfile />} />

        {/* ✅ AUTO-REDIRECT /admin vers le bon dashboard basé sur rôle */}
        <Route path="/admin" element={<PrivateRoute />}>
          <Route index element={<AdminRedirect />} />
        </Route>

        {/* ✅ SUPER ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={<RoleRoute allowedRole="admin"><SuperAdminDashboard /></RoleRoute>} />
        <Route path="/admin/services" element={<RoleRoute allowedRole="admin"><ManageServices /></RoleRoute>} />
        <Route path="/admin/appointments" element={<RoleRoute allowedRole="admin"><ManageAppointments /></RoleRoute>} />
        <Route path="/admin/revenue" element={<RoleRoute allowedRole="admin"><Revenue /></RoleRoute>} />
        <Route path="/admin/settings" element={<RoleRoute allowedRole="admin"><Settings /></RoleRoute>} />

        {/* ✅ DEVELOPER ROUTES */}
        <Route path="/admin/developer" element={<RoleRoute allowedRole="developer"><DeveloperDashboard /></RoleRoute>} />

        {/* ✅ ROUTE PAR DÉFAUT */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ThemeSwitcherFloating />
    </>
  )
}

function App() {
  // Charger le thème au démarrage de l'app
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'gold'
    document.documentElement.setAttribute('data-theme', savedTheme)
    console.log('🎨 App.jsx - Thème chargé au démarrage:', savedTheme)
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider>
            <QRCodeProvider>
              <SiteSettingsProvider>
                <AppRoutes />
              </SiteSettingsProvider>
            </QRCodeProvider>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

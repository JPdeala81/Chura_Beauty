import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const tabs = [
  { id: 'home', label: 'Accueil', icon: '🏠' },
  { id: 'services', label: 'Services', icon: '💅' },
  { id: 'appointments', label: 'RDV', icon: '📅' },
  { id: 'revenue', label: 'Revenus', icon: '📊' },
  { id: 'settings', label: 'Paramètres', icon: '⚙️' },
  { id: 'profile', label: 'Profil', icon: '👤' },
]

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home')
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [stats, setStats] = useState({ services: 0, appointments: 0, revenue: 0, pending: 0 })
  const [services, setServices] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, servicesRes, appointmentsRes] = await Promise.allSettled([
        api.get('/revenue/stats'),
        api.get('/services'),
        api.get('/appointments'),
      ])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || {})
      if (servicesRes.status === 'fulfilled') setServices(servicesRes.value.data.services || [])
      if (appointmentsRes.status === 'fulfilled') setAppointments(appointmentsRes.value.data.appointments || [])
    } catch (e) {
      console.error('Dashboard fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isMobile = screenWidth < 768

  const superKpis = [
    { label: 'Services', value: stats.services || 0, icon: '💅', color: '#ffd700' },
    { label: 'RDV ce mois', value: stats.appointments || 0, icon: '📅', color: '#20c997' },
    { label: 'CA (FCFA)', value: (stats.revenue || 0).toLocaleString(), icon: '💰', color: '#667eea' },
    { label: 'En attente', value: stats.pending || 0, icon: '⏳', color: '#ff6b6b' },
  ]

  const chartData = [
    { month: 'Jan', value: 2400 },
    { month: 'Fév', value: 2210 },
    { month: 'Mar', value: 2290 },
    { month: 'Avr', value: 2000 },
    { month: 'Mai', value: 2181 },
    { month: 'Juin', value: 2500 },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'services': return renderServices()
      case 'appointments': return renderAppointments()
      case 'revenue': return renderRevenue()
      case 'settings': return renderSettings()
      case 'profile': return renderProfile()
      default: return renderHome()
    }
  }

  const renderHome = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: 'clamp(20px, 5vw, 40px)' }}
    >
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
          borderRadius: '16px',
          padding: 'clamp(20px, 4vw, 40px)',
          color: '#333',
          marginBottom: 'clamp(30px, 5vw, 50px)',
          boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
        }}
      >
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', margin: '0 0 8px 0', fontWeight: '800' }}>
          Super Admin Dashboard 👑
        </h1>
        <p style={{ margin: 0, fontSize: 'clamp(14px, 2vw, 16px)', opacity: 0.9 }}>
          Supervision complète du système, services et revenus
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 20vw, 260px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
        marginBottom: 'clamp(30px, 5vw, 50px)',
      }}>
        {superKpis.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)' }}
            style={{
              background: 'white',
              borderRadius: '14px',
              padding: 'clamp(16px, 3vw, 24px)',
              border: '2px solid #f0f0f0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <span style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)' }}>{card.icon}</span>
            </div>
            <h3 style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              {card.label}
            </h3>
            <p style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)', fontWeight: '700', color: '#333', margin: 0 }}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '16px', fontWeight: '700' }}>
          📈 Tendance des Revenus
        </h2>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: 'clamp(16px, 3vw, 24px)',
          border: '2px solid #f0f0f0',
          minHeight: '300px',
        }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#999" style={{ fontSize: 'clamp(11px, 1.5vw, 13px)' }} />
              <YAxis stroke="#999" style={{ fontSize: 'clamp(11px, 1.5vw, 13px)' }} />
              <Tooltip contentStyle={{ background: '#f9f9f9', border: '1px solid #e0e0e0' }} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#667eea" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ marginTop: 'clamp(30px, 5vw, 50px)' }}
      >
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '16px', fontWeight: '700' }}>
          📊 Derniers RDV
        </h2>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '2px solid #f0f0f0',
          overflow: 'hidden',
        }}>
          {appointments.slice(0, 5).map((apt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px)',
                borderBottom: i < 4 ? '1px solid #f0f0f0' : 'none',
              }}
            >
              <div>
                <div style={{ fontWeight: '700', color: '#333', fontSize: 'clamp(13px, 1.8vw, 15px)' }}>
                  {apt.service_name || 'Service'}
                </div>
                <div style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', color: '#999', marginTop: '4px' }}>
                  {apt.client_name || 'Client'}
                </div>
              </div>
              <span style={{
                background: apt.status === 'confirmed' ? '#d4edda' : '#f8d7da',
                color: apt.status === 'confirmed' ? '#155724' : '#721c24',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: 'clamp(11px, 1.5vw, 12px)',
                fontWeight: '600',
              }}>
                {apt.status === 'confirmed' ? '✅ Confirmé' : '⏳ Attente'}
              </span>
            </motion.div>
          ))}
          {appointments.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
              Aucun rendez-vous
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )

  const renderServices = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '20px', fontWeight: '700' }}>
        💅 Gestion des Services
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 45vw, 300px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
      }}>
        {services.slice(0, 6).map((service, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: 'clamp(16px, 3vw, 24px)',
              border: '2px solid #f0f0f0',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💅</div>
            <h3 style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#333', fontSize: 'clamp(14px, 2vw, 16px)' }}>
              {service.title || 'Service'}
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#999' }}>
              {service.description?.substring(0, 50)}...
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: '#667eea', fontSize: 'clamp(13px, 1.8vw, 15px)' }}>
                {service.price} FCFA
              </span>
              <span style={{ fontSize: '12px', color: '#999' }}>
                {service.duration_minutes || 30}min
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderAppointments = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '20px', fontWeight: '700' }}>
        📅 Tous les Rendez-vous
      </h2>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '2px solid #f0f0f0',
        overflow: 'hidden',
      }}>
        {appointments.map((apt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: '16px',
              padding: 'clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px)',
              borderBottom: i < appointments.length - 1 ? '1px solid #f0f0f0' : 'none',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '24px' }}>📅</div>
            <div>
              <div style={{ fontWeight: '700', color: '#333', fontSize: 'clamp(13px, 1.8vw, 15px)', marginBottom: '4px' }}>
                {apt.service_name || 'Service'} - {apt.client_name || 'Client'}
              </div>
              <div style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', color: '#999' }}>
                {apt.appointment_date || 'Date TBD'} • {apt.appointment_time || 'Heure TBD'}
              </div>
            </div>
            <span style={{
              background: apt.status === 'confirmed' ? '#d4edda' : '#f8d7da',
              color: apt.status === 'confirmed' ? '#155724' : '#721c24',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: 'clamp(11px, 1.5vw, 12px)',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}>
              {apt.status === 'confirmed' ? '✅ Confirmé' : '⏳ Attente'}
            </span>
          </motion.div>
        ))}
        {appointments.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
            Aucun rendez-vous
          </div>
        )}
      </div>
    </motion.div>
  )

  const renderRevenue = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '20px', fontWeight: '700' }}>
        📊 Revenus & Statistiques
      </h2>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: 'clamp(16px, 3vw, 24px)',
        border: '2px solid #f0f0f0',
        minHeight: '300px',
      }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#999" style={{ fontSize: 'clamp(11px, 1.5vw, 13px)' }} />
            <YAxis stroke="#999" style={{ fontSize: 'clamp(11px, 1.5vw, 13px)' }} />
            <Tooltip contentStyle={{ background: '#f9f9f9', border: '1px solid #e0e0e0' }} />
            <Legend />
            <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )

  const renderSettings = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '20px', fontWeight: '700' }}>
        ⚙️ Paramètres Système
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 45vw, 300px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
      }}>
        {[
          { name: 'Paramètres Généraux', icon: '⚙️', color: '#667eea' },
          { name: 'Configuration Email', icon: '📧', color: '#20c997' },
          { name: 'Intégration WhatsApp', icon: '💬', color: '#25d366' },
          { name: 'Sécurité', icon: '🔒', color: '#ff6b6b' },
        ].map((setting, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: 'clamp(20px, 3vw, 24px)',
              border: '2px solid #f0f0f0',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{setting.icon}</div>
            <h3 style={{ margin: 0, fontWeight: '700', color: '#333', fontSize: 'clamp(14px, 2vw, 16px)' }}>
              {setting.name}
            </h3>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderProfile = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '20px', fontWeight: '700' }}>
        👤 Mon Profil
      </h2>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: 'clamp(20px, 4vw, 40px)',
        border: '2px solid #f0f0f0',
        maxWidth: '600px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>👑</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 'clamp(16px, 2.5vw, 18px)', fontWeight: '700', color: '#333' }}>
            Super Administrator
          </h3>
          <p style={{ margin: 0, color: '#999', fontSize: 'clamp(13px, 1.8vw, 14px)' }}>
            Accès complet au système
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: 'clamp(12px, 2vw, 16px)',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: 'clamp(14px, 2vw, 16px)',
            marginBottom: '12px',
          }}
        >
          Modifier le Profil
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: 'clamp(12px, 2vw, 16px)',
            background: 'rgba(255, 107, 107, 0.1)',
            color: '#ff6b6b',
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: 'clamp(14px, 2vw, 16px)',
          }}
        >
          🚪 Déconnexion
        </motion.button>
      </div>
    </motion.div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
          borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
          padding: 'clamp(12px, 2vw, 20px) clamp(16px, 4vw, 32px)',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <span style={{ fontSize: '28px' }}>👑</span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                fontWeight: '700',
                color: '#333',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                Super Admin
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(0, 0, 0, 0.6)' }}>
                Full Access
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            style={{
              background: 'rgba(255, 107, 107, 0.1)',
              border: '2px solid rgba(255, 107, 107, 0.3)',
              color: '#ff6b6b',
              borderRadius: '8px',
              padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)',
              cursor: 'pointer',
              fontSize: 'clamp(12px, 1.8vw, 14px)',
              fontWeight: '600',
            }}
          >
            {isMobile ? '🚪' : '🚪 Déconnexion'}
          </motion.button>
        </div>
      </motion.nav>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'white',
          borderBottom: '2px solid #f0f0f0',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '0 clamp(12px, 3vw, 24px)',
          minHeight: 'clamp(48px, 8vw, 64px)',
          alignItems: 'center',
        }}>
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : 'transparent',
                color: activeTab === tab.id ? '#333' : '#666',
                border: 'none',
                padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: 'clamp(12px, 1.8vw, 14px)',
                fontWeight: activeTab === tab.id ? '700' : '600',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
              }}
            >
              <span>{tab.icon}</span>
              {!isMobile && <span style={{ marginLeft: '6px' }}>{tab.label}</span>}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <div style={{ padding: 'clamp(20px, 4vw, 40px)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SuperAdminDashboard

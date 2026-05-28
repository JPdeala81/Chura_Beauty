import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import ManageServices from './ManageServices'
import ManageAppointments from './ManageAppointments'
import Revenue from './Revenue'
import Settings from './Settings'
import ProfileSettings from '../../components/admin/ProfileSettings'
import SecuritySettings from '../../components/admin/SecuritySettings'
import SiteSettings from '../../components/admin/SiteSettings'
import NotificationPanel from '../../components/admin/NotificationPanel'

const tabs = [
  { id: 'home', label: 'Accueil', icon: '🏠' },
  { id: 'services', label: 'Services', icon: '💅' },
  { id: 'appointments', label: 'RDV', icon: '📅' },
  { id: 'revenue', label: 'Revenus', icon: '📊' },
  { id: 'notifications', label: 'Notifs', icon: '🔔' },
  { id: 'site', label: 'Site', icon: '🌐' },
  { id: 'profile', label: 'Profil', icon: '👤' },
  { id: 'security', label: 'Sécurité', icon: '🔒' },
]

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home')
  const [stats, setStats] = useState({ services: 0, appointments: 0, pending: 0, revenue: 0 })
  const [adminInfo, setAdminInfo] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      const [statsRes, adminRes, notifRes] = await Promise.allSettled([
        api.get('/revenue/stats'),
        api.get('/auth/profile'),
        api.get('/notifications/unread-count')
      ])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || {})
      if (adminRes.status === 'fulfilled') setAdminInfo(adminRes.value.data?.admin || adminRes.value.data)
      if (notifRes.status === 'fulfilled') setUnreadCount(notifRes.value.data?.count || 0)
    } catch (e) {
      console.error('Dashboard fetch error:', e)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isMobile = screenWidth < 768
  const isTablet = screenWidth < 1024

  const kpiCards = [
    { label: 'Services actifs', value: stats.services || 0, icon: '💅', color: '#ffd700', trend: '+12%' },
    { label: 'RDV ce mois', value: stats.appointments || 0, icon: '📅', color: '#20c997', trend: '+8%' },
    { label: 'En attente', value: stats.pending || 0, icon: '⏳', color: '#ff6b6b', trend: '-2%' },
    { label: 'CA (FCFA)', value: (stats.revenue || 0).toLocaleString(), icon: '💰', color: '#667eea', trend: '+24%' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'services': return <ManageServices />
      case 'appointments': return <ManageAppointments />
      case 'revenue': return <Revenue />
      case 'notifications': return <NotificationPanel />
      case 'site': return <SiteSettings onUpdate={fetchDashboardData} />
      case 'profile': return <ProfileSettings admin={adminInfo} onUpdate={fetchDashboardData} />
      case 'security': return <SecuritySettings />
      default: return renderHomeContent()
    }
  }

  const renderHomeContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: 'clamp(20px, 5vw, 40px)' }}
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: 'clamp(20px, 4vw, 40px)',
          color: 'white',
          marginBottom: 'clamp(30px, 5vw, 50px)',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}
      >
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', margin: '0 0 8px 0', fontWeight: '800' }}>
          Bienvenue, {adminInfo?.salon_name || 'Admin'} 👑
        </h1>
        <p style={{ margin: 0, fontSize: 'clamp(14px, 2vw, 16px)', opacity: 0.9 }}>
          Gérez votre salon avec élégance. Tous les outils à votre portée.
        </p>
      </motion.div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(240px, 22vw, 280px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
        marginBottom: 'clamp(30px, 5vw, 50px)'
      }}>
        {kpiCards.map((card, idx) => (
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
              border: `2px solid rgba(${card.color === '#ffd700' ? '255, 215, 0' : '0, 0, 0'}, 0.1)`,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <span style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)' }}>{card.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#20c997' }}>{card.trend}</span>
            </div>
            <h3 style={{ fontSize: 'clamp(12px, 1.8vw, 13px)', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {card.label}
            </h3>
            <p style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)', fontWeight: '700', color: '#333', margin: 0 }}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '16px', fontWeight: '700' }}>
          Actions rapides
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(180px, 20vw, 240px), 1fr))',
          gap: 'clamp(12px, 2vw, 16px)'
        }}>
          {[
            { id: 'services', label: '💅 Services', desc: 'Gérer vos prestations' },
            { id: 'appointments', label: '📅 Rendez-vous', desc: 'Voir les demandes' },
            { id: 'revenue', label: '📊 Revenus', desc: 'Statistiques' },
            { id: 'notifications', label: '🔔 Notifs', desc: `${unreadCount} non lues` },
            { id: 'site', label: '🌐 Mon site', desc: 'Personnaliser' },
            { id: 'profile', label: '👤 Profil', desc: 'Mes infos' },
          ].map((action) => (
            <motion.button
              key={action.id}
              onClick={() => setActiveTab(action.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'white',
                border: '2px solid #f0f0f0',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {action.label.split(' ')[0]}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                {action.label.split(' ')[1]}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {action.desc}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '2px solid rgba(255, 215, 0, 0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
          padding: 'clamp(12px, 2vw, 20px) clamp(16px, 4vw, 32px)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <span style={{ fontSize: '28px' }}>💆‍♀️</span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                fontWeight: '700',
                color: 'white',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {adminInfo?.salon_name || 'Chura Beauty'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Dashboard
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveTab('notifications')}
                style={{
                  background: 'rgba(255, 215, 0, 0.2)',
                  border: '2px solid #ffd700',
                  color: '#ffd700',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                🔔 {unreadCount}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                borderRadius: '8px',
                padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)',
                cursor: 'pointer',
                fontSize: 'clamp(12px, 1.8vw, 14px)',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              {isMobile ? '🚪' : '🚪 Déconnexion'}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'white',
          borderBottom: '2px solid #f0f0f0',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth'
        }}
      >
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '0 clamp(12px, 3vw, 24px)',
          minHeight: 'clamp(48px, 8vw, 64px)',
          alignItems: 'center',
          flexShrink: 0
        }}>
          {tabs.map((tab, idx) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                border: 'none',
                padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: 'clamp(12px, 1.8vw, 14px)',
                fontWeight: activeTab === tab.id ? '700' : '600',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease'
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

export default AdminDashboard

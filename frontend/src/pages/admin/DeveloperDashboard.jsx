import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'

const tabs = [
  { id: 'home', label: 'Accueil', icon: '🏠' },
  { id: 'logs', label: 'Logs', icon: '📋' },
  { id: 'security', label: 'Sécurité', icon: '🔒' },
  { id: 'admins', label: 'Admins', icon: '👥' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'payments', label: 'Paiements', icon: '💳' },
]

const DeveloperDashboard = () => {
  const [activeTab, setActiveTab] = useState('home')
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [stats, setStats] = useState({ services: 0, appointments: 0, admins: 0, logs: 0 })
  const [logs, setLogs] = useState([])
  const [admins, setAdmins] = useState([])
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceReason, setMaintenanceReason] = useState('Maintenance système')
  const [securityConfig, setSecurityConfig] = useState({
    https: true,
    jwt: true,
    rls: true,
    rateLimit: true,
  })
  const [paymentConfig, setPaymentConfig] = useState({
    airtel_code: '',
    moov_code: '',
    is_payment_enabled: false,
  })
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
      const [statsRes, logsRes, adminsRes] = await Promise.allSettled([
        api.get('/revenue/stats'),
        api.get('/site-settings/developer/recent-logs'),
        api.get('/site-settings/developer/all-admins'),
      ])
      if (statsRes.status === 'fulfilled') {
        const data = statsRes.value.data
        setStats({ services: data.services || 0, appointments: data.appointments || 0, admins: admins.length, logs: logs.length })
      }
      if (logsRes.status === 'fulfilled') setLogs(Array.isArray(logsRes.value.data) ? logsRes.value.data : [])
      if (adminsRes.status === 'fulfilled') setAdmins(Array.isArray(adminsRes.value.data) ? adminsRes.value.data : [])
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
  const isTablet = screenWidth < 1024

  const devKpis = [
    { label: 'Services Actifs', value: stats.services, icon: '💅', color: '#ffd700', stat: 'Services' },
    { label: 'RDV ce mois', value: stats.appointments, icon: '📅', color: '#20c997', stat: 'Appointments' },
    { label: 'Administrateurs', value: admins.length, icon: '👥', color: '#667eea', stat: 'Admins' },
    { label: 'Logs Système', value: logs.length, icon: '📊', color: '#ff6b6b', stat: 'Logs' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'logs': return renderLogs()
      case 'security': return renderSecurity()
      case 'admins': return renderAdmins()
      case 'maintenance': return renderMaintenance()
      case 'payments': return renderPayments()
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: 'clamp(20px, 4vw, 40px)',
          color: 'white',
          marginBottom: 'clamp(30px, 5vw, 50px)',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        }}
      >
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', margin: '0 0 8px 0', fontWeight: '800' }}>
          Dashboard Développeur 💻
        </h1>
        <p style={{ margin: 0, fontSize: 'clamp(14px, 2vw, 16px)', opacity: 0.9 }}>
          Surveillance système, logs, sécurité et configuration avancée
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 20vw, 260px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
        marginBottom: 'clamp(30px, 5vw, 50px)',
      }}>
        {devKpis.map((card, idx) => (
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
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#999' }}>Dev</span>
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

      {/* System Status */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '16px', fontWeight: '700' }}>
          État du Système
        </h2>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 30px)',
          border: '2px solid #f0f0f0',
        }}>
          {[
            { name: 'API Server', status: 'online', icon: '✅' },
            { name: 'Base de Données', status: 'online', icon: '✅' },
            { name: 'Cache Redis', status: 'online', icon: '✅' },
            { name: 'Mail Service', status: 'online', icon: '✅' },
            { name: 'WhatsApp Integration', status: 'online', icon: '✅' },
          ].map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < 4 ? '1px solid #f0f0f0' : 'none',
              }}
            >
              <span style={{ fontWeight: '600', color: '#333' }}>{service.name}</span>
              <span style={{ fontSize: '14px', fontWeight: '700' }}>{service.icon} {service.status}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  const renderLogs = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '20px', fontWeight: '700' }}>
        📋 Logs Système
      </h2>
      <div style={{
        background: '#1e1e1e',
        borderRadius: '12px',
        padding: 'clamp(16px, 3vw, 24px)',
        fontFamily: 'monospace',
        color: '#00ff00',
        fontSize: 'clamp(11px, 1.5vw, 13px)',
        maxHeight: '400px',
        overflowY: 'auto',
        border: '2px solid #333',
      }}>
        {logs.slice(0, 20).map((log, i) => (
          <div key={i} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
            <span style={{ color: '#888' }}>$ </span>
            <span>{typeof log === 'string' ? log : log.message || JSON.stringify(log)}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div style={{ color: '#666' }}>Aucun log disponible</div>
        )}
      </div>
    </motion.div>
  )

  const renderSecurity = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '20px', fontWeight: '700' }}>
        🔒 Configuration de Sécurité
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 45vw, 280px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
      }}>
        {[
          { name: 'HTTPS/TLS 1.3', enabled: securityConfig.https },
          { name: 'JWT Authentication', enabled: securityConfig.jwt },
          { name: 'Row Level Security', enabled: securityConfig.rls },
          { name: 'Rate Limiting', enabled: securityConfig.rateLimit },
        ].map((sec, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: 'clamp(16px, 3vw, 24px)',
              border: `2px solid ${sec.enabled ? '#20c997' : '#ff6b6b'}`,
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: '#333' }}>{sec.name}</span>
              <span style={{ fontSize: '18px' }}>{sec.enabled ? '✅' : '❌'}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderAdmins = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '20px', fontWeight: '700' }}>
        👥 Gestion des Administrateurs
      </h2>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '2px solid #f0f0f0',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 45vw, 280px), 1fr))',
          gap: '1px',
          backgroundColor: '#e0e0e0',
          padding: '1px',
        }}>
          {admins.slice(0, 6).map((admin, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              style={{
                background: 'white',
                padding: 'clamp(12px, 2vw, 16px)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
              <div style={{ fontWeight: '600', color: '#333', fontSize: 'clamp(12px, 1.8vw, 14px)', marginBottom: '4px' }}>
                {admin.email?.split('@')[0] || 'Admin'}
              </div>
              <div style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', color: '#999' }}>
                {admin.role || 'Administrator'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {admins.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          Aucun administrateur
        </div>
      )}
    </motion.div>
  )

  const renderMaintenance = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '20px', fontWeight: '700' }}>
        🔧 Mode Maintenance
      </h2>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: 'clamp(20px, 4vw, 30px)',
        border: '2px solid #f0f0f0',
      }}>
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: '700' }}>
              Activer le mode maintenance
            </h3>
            <p style={{ margin: 0, color: '#999', fontSize: 'clamp(12px, 1.8vw, 14px)' }}>
              Restreindre l'accès pour les utilisateurs normaux
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            style={{
              background: maintenanceMode ? 'linear-gradient(135deg, #ff6b6b, #ff8787)' : 'linear-gradient(135deg, #20c997, #37b24d)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: 'clamp(12px, 1.8vw, 14px)',
            }}
          >
            {maintenanceMode ? '🔴 Arrêter' : '🟢 Activer'}
          </motion.button>
        </motion.div>
        {maintenanceMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: '#fff3cd',
              border: '2px solid #ffc107',
              borderRadius: '8px',
              padding: '16px',
              color: '#856404',
            }}
          >
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>⚠️ Mode Maintenance Actif</div>
            <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 14px)' }}>
              Le site est actuellement en maintenance. Les utilisateurs verront une page d'indisponibilité.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )

  const renderPayments = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '20px', fontWeight: '700' }}>
        💳 Configuration des Paiements
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 45vw, 320px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
      }}>
        {[
          { name: 'Airtel Money', key: 'airtel_code', icon: '📱' },
          { name: 'Moov Money', key: 'moov_code', icon: '📱' },
        ].map((payment, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: 'clamp(16px, 3vw, 24px)',
              border: '2px solid #f0f0f0',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>{payment.icon}</div>
            <h3 style={{ margin: '0 0 12px 0', fontWeight: '700', fontSize: 'clamp(14px, 2vw, 16px)' }}>
              {payment.name}
            </h3>
            <input
              type="text"
              placeholder="Code API"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: 'clamp(12px, 1.8vw, 14px)',
                marginBottom: '12px',
                boxSizing: 'border-box',
              }}
              value={paymentConfig[payment.key] || ''}
              onChange={(e) => setPaymentConfig({ ...paymentConfig, [payment.key]: e.target.value })}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: 'clamp(12px, 1.8vw, 14px)',
              }}
            >
              Enregistrer
            </motion.button>
          </motion.div>
        ))}
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: '2px solid rgba(255, 215, 0, 0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
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
            <span style={{ fontSize: '28px' }}>💻</span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                fontWeight: '700',
                color: 'white',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                Developer Dashboard
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>
                System Monitor
              </div>
            </div>
          </div>
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
                background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
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

export default DeveloperDashboard

import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'

// Import de tous les composants admin
import ManageServices from './ManageServices'
import ManageAppointments from './ManageAppointments'
import Revenue from './Revenue'
import Settings from './Settings'
import ProfileSettings from '../../components/admin/ProfileSettings'
import SecuritySettings from '../../components/admin/SecuritySettings'
import SiteSettings from '../../components/admin/SiteSettings'
import NotificationPanel from '../../components/admin/NotificationPanel'

const primaryTabs = [
  { id: 'home', label: 'Accueil', icon: '🏠' },
  { id: 'services', label: 'Services', icon: '💅' },
  { id: 'appointments', label: 'Rendez-vous', icon: '📅' },
  { id: 'revenue', label: 'Revenus', icon: '📊' },
]

const secondaryTabs = [
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'site', label: 'Mon Site', icon: '🌐' },
  { id: 'profile', label: 'Profil', icon: '👤' },
  { id: 'security', label: 'Sécurité', icon: '🔒' },
]

const tabs = [...primaryTabs, ...secondaryTabs]

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home')
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [stats, setStats] = useState({ services: 0, appointments: 0, pending: 0, revenue: 0 })
  const [adminInfo, setAdminInfo] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const { logout, token } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
    checkFirstLogin()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, adminRes, notifRes] = await Promise.allSettled([
        api.get('/revenue/stats'),
        api.get('/auth/profile'),
        api.get('/notifications/unread-count')
      ])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data)
      if (adminRes.status === 'fulfilled') setAdminInfo(adminRes.value.data)
      if (notifRes.status === 'fulfilled') setUnreadCount(notifRes.value.data.count || 0)
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    }
  }

  const checkFirstLogin = async () => {
    try {
      const res = await api.get('/auth/profile')
      const admin = res.data
      // Si pas de question secrète définie → premier login
      if (!admin.secret_question || !admin.recovery_email) {
        setIsFirstLogin(true)
        setActiveTab('security')
      }
    } catch (e) {}
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const kpiCards = [
    { label: 'Services actifs', value: stats.services || 0, icon: '💅', color: '#b8860b', bg: 'rgba(184,134,11,0.1)' },
    { label: 'RDV ce mois', value: stats.appointments || 0, icon: '📅', color: '#20c997', bg: 'rgba(32,201,151,0.1)' },
    { label: 'En attente', value: stats.pending || 0, icon: '⏳', color: '#fd7e14', bg: 'rgba(253,126,20,0.1)', urgent: true },
    { label: 'CA total (FCFA)', value: (stats.revenue || 0).toLocaleString(), icon: '💰', color: '#6f42c1', bg: 'rgba(111,66,193,0.1)' }
  ]

  const quickActions = [
    { id: 'services', label: 'Gérer mes services', icon: '💅', desc: 'Ajouter, modifier, supprimer vos prestations', color: '#b8860b' },
    { id: 'appointments', label: 'Rendez-vous', icon: '📅', desc: 'Accepter ou refuser les demandes clients', color: '#20c997', badge: stats.pending },
    { id: 'revenue', label: 'Chiffre d\'affaires', icon: '📊', desc: 'Voir vos revenus par semaine, mois, année', color: '#6f42c1' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', desc: 'Voir toutes vos notifications', color: '#fd7e14', badge: unreadCount },
    { id: 'site', label: 'Personnaliser le site', icon: '🌐', desc: 'Modifier slogans, couleurs, coordonnées', color: '#e83e8c' },
    { id: 'profile', label: 'Mon profil', icon: '👤', desc: 'Modifier vos informations personnelles', color: '#17a2b8' },
    { id: 'security', label: 'Sécurité', icon: '🔒', desc: 'Mot de passe, récupération, questions secrètes', color: '#28a745' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'services': return <ManageServices />
      case 'appointments': return <ManageAppointments />
      case 'revenue': return <Revenue />
      case 'notifications': return <NotificationPanel />
      case 'site': return <SiteSettings onUpdate={fetchDashboardData} />
      case 'profile': return <ProfileSettings onUpdate={fetchDashboardData} />
      case 'security': return <SecuritySettings isFirstLogin={isFirstLogin} onComplete={() => setIsFirstLogin(false)} />
      default: return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f0' }}>

      {/* NAVBAR ADMIN */}
      <nav style={{
        background: 'linear-gradient(135deg, #1a0f08 0%, #2c1810 100%)',
        borderBottom: '1px solid rgba(212,165,116,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
      }}>
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center justify-content-between" style={{ height: '65px' }}>

            {/* Logo */}
            <div className="d-flex align-items-center gap-3">
              <span style={{ fontSize: '28px' }}>💆‍♀️</span>
              <div>
                <div style={{
                  fontFamily: 'Playfair Display, serif',
                  background: 'linear-gradient(135deg, #b8860b, #d4a574)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '18px',
                  fontWeight: '700',
                  lineHeight: 1
                }}>
                  {adminInfo?.salon_name || 'Chura Beauty'}
                </div>
                <div style={{ color: 'rgba(248,200,212,0.5)', fontSize: '11px', marginTop: '2px' }}>
                  Dashboard Administrateur
                </div>
              </div>
            </div>

            {/* Tabs navbar - desktop */}
            <div className="d-none d-lg-flex align-items-center gap-1">
              {primaryTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? 'rgba(184,134,11,0.2)' : 'transparent',
                    border: activeTab === tab.id ? '1px solid rgba(184,134,11,0.4)' : '1px solid transparent',
                    color: activeTab === tab.id ? '#d4a574' : 'rgba(248,200,212,0.6)',
                    borderRadius: '10px',
                    padding: '7px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                    fontFamily: 'Nunito, sans-serif'
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.id === 'appointments' && stats.pending > 0 && (
                    <span style={{
                      background: '#fd7e14',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700'
                    }}>{stats.pending}</span>
                  )}
                </button>
              ))}
              
              {/* More menu dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  style={{
                    background: showMoreMenu ? 'rgba(184,134,11,0.2)' : 'transparent',
                    border: showMoreMenu ? '1px solid rgba(184,134,11,0.4)' : '1px solid transparent',
                    color: 'rgba(248,200,212,0.6)',
                    borderRadius: '10px',
                    padding: '7px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'Nunito, sans-serif'
                  }}
                >
                  <span>⋯ Plus</span>
                </button>
                
                {showMoreMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '6px',
                    background: 'linear-gradient(135deg, #1a0f08 0%, #2c1810 100%)',
                    border: '1px solid rgba(212,165,116,0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    minWidth: '180px',
                    zIndex: 1001,
                    overflow: 'hidden'
                  }}>
                    {secondaryTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id)
                          setShowMoreMenu(false)
                        }}
                        style={{
                          width: '100%',
                          background: activeTab === tab.id ? 'rgba(184,134,11,0.2)' : 'transparent',
                          border: 'none',
                          color: activeTab === tab.id ? '#d4a574' : 'rgba(248,200,212,0.7)',
                          padding: '10px 16px',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontFamily: 'Nunito, sans-serif',
                          borderBottom: tab !== secondaryTabs[secondaryTabs.length - 1] ? '1px solid rgba(212,165,116,0.1)' : 'none'
                        }}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                        {tab.id === 'notifications' && unreadCount > 0 && (
                          <span style={{
                            marginLeft: 'auto',
                            background: '#dc3545',
                            color: 'white',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700'
                          }}>{unreadCount}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions droite */}
            <div className="d-flex align-items-center gap-2">
              <Link to="/" style={{
                color: 'rgba(248,200,212,0.7)',
                textDecoration: 'none',
                fontSize: '13px',
                padding: '7px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(248,200,212,0.2)',
                transition: 'all 0.3s',
                fontFamily: 'Nunito, sans-serif'
              }}>
                🌐 Voir le site
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(220,53,69,0.15)',
                  border: '1px solid rgba(220,53,69,0.3)',
                  color: '#ff6b6b',
                  borderRadius: '10px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Nunito, sans-serif'
                }}
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Tabs mobile */}
        <div className="d-lg-none" style={{ overflowX: 'auto', borderTop: '1px solid rgba(212,165,116,0.1)' }}>
          <div className="d-flex" style={{ padding: '8px 16px', gap: '8px', minWidth: 'max-content' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'rgba(184,134,11,0.2)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid rgba(184,134,11,0.4)' : '1px solid transparent',
                  color: activeTab === tab.id ? '#d4a574' : 'rgba(248,200,212,0.6)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Nunito, sans-serif'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* CONTENU */}
      <div className="container-fluid px-4 py-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Alerte premier login */}
        <AnimatePresence>
          {isFirstLogin && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,193,7,0.15), rgba(253,126,20,0.1))',
                border: '1px solid rgba(255,193,7,0.4)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: '700', color: '#fd7e14', fontFamily: 'Playfair Display, serif' }}>
                  Bienvenue ! Configuration requise
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '2px' }}>
                  Veuillez configurer vos méthodes de récupération de mot de passe et mettre à jour vos coordonnées.
                </div>
              </div>
              <button
                onClick={() => setActiveTab('security')}
                style={{
                  marginLeft: 'auto',
                  background: 'linear-gradient(135deg, #fd7e14, #ffc107)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  padding: '8px 16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '13px',
                  whiteSpace: 'nowrap'
                }}
              >
                Configurer →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'home' ? (
          <>
            {/* Salutation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
                Bonjour, {adminInfo?.owner_name || 'Administratrice'} 👋
              </h2>
              <p style={{ color: '#6c757d', marginTop: '4px' }}>
                Bienvenue dans votre espace de gestion — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </motion.div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
              {kpiCards.map((kpi, i) => (
                <div key={i} className="col-6 col-lg-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                    style={{
                      background: 'white',
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      border: `1px solid ${kpi.bg}`,
                      cursor: 'default',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: kpi.bg
                    }} />
                    <div style={{ fontSize: '2rem', marginBottom: '12px', position: 'relative' }}>{kpi.icon}</div>
                    <div style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                      fontWeight: '700',
                      color: kpi.color,
                      lineHeight: 1,
                      position: 'relative'
                    }}>
                      {kpi.value}
                      {kpi.urgent && kpi.value > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '12px',
                          height: '12px',
                          background: '#dc3545',
                          borderRadius: '50%',
                          animation: 'pulse 1s infinite'
                        }} />
                      )}
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '13px', marginTop: '6px', fontWeight: '500' }}>
                      {kpi.label}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Quick Actions Cards */}
            <motion.h5
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '16px' }}
            >
              ✨ Actions rapides
            </motion.h5>

            <div className="row g-3">
              {quickActions.map((action, i) => (
                <div key={action.id} className="col-6 col-md-4 col-lg-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * i + 0.4 }}
                    whileHover={{ y: -8, boxShadow: `0 20px 40px ${action.color}22` }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(action.id)}
                    style={{
                      background: 'white',
                      borderRadius: '20px',
                      padding: '24px 20px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      border: `1px solid ${action.color}22`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      textAlign: 'center'
                    }}
                  >
                    {action.badge > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#dc3545',
                        color: 'white',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700'
                      }}>{action.badge}</span>
                    )}
                    <div style={{
                      fontSize: '2.5rem',
                      marginBottom: '12px',
                      display: 'block'
                    }}>{action.icon}</div>
                    <div style={{
                      fontFamily: 'Playfair Display, serif',
                      color: '#2c1810',
                      fontSize: '14px',
                      fontWeight: '700',
                      marginBottom: '6px'
                    }}>
                      {action.label}
                    </div>
                    <div style={{
                      color: '#6c757d',
                      fontSize: '12px',
                      lineHeight: '1.4'
                    }}>
                      {action.desc}
                    </div>
                    <div style={{
                      marginTop: '14px',
                      background: `${action.color}15`,
                      color: action.color,
                      borderRadius: '8px',
                      padding: '6px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      Ouvrir →
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Bouton retour */}
              <button
                onClick={() => setActiveTab('home')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(184,134,11,0.3)',
                  color: '#b8860b',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'Nunito, sans-serif'
                }}
              >
                ← Retour au tableau de bord
              </button>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard

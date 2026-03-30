import { useState, useEffect, useContext, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
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
import RevenueChart from '../../components/admin/RevenueChart'

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
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
    checkFirstLogin()
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isXS = screenWidth < 480
  const isSM = screenWidth < 768
  const isMD = screenWidth < 992
  const showTextInTab = screenWidth >= 640

  const fetchDashboardData = async () => {
    try {
      const [statsRes, adminRes, notifRes] = await Promise.allSettled([
        api.get('/revenue/stats'),
        api.get('/auth/profile'),
        api.get('/notifications/unread-count')
      ])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || {})
      if (adminRes.status === 'fulfilled') setAdminInfo(adminRes.value.data)
      if (notifRes.status === 'fulfilled') setUnreadCount(notifRes.value.data?.count || 0)
    } catch (e) {}
  }

  const checkFirstLogin = async () => {
    try {
      const res = await api.get('/auth/profile')
      if (!res.data?.secret_question || !res.data?.recovery_email) {
        setIsFirstLogin(true)
      }
    } catch (e) {}
  }

  const handleLogout = () => { logout(); navigate('/') }

  const kpiCards = [
    { label: 'Services actifs', value: stats.services || 0, icon: '💅', color: '#b8860b', bg: 'rgba(184,134,11,0.1)' },
    { label: 'RDV ce mois', value: stats.appointments || 0, icon: '📅', color: '#20c997', bg: 'rgba(32,201,151,0.1)' },
    { label: 'En attente', value: stats.pending || 0, icon: '⏳', color: '#fd7e14', bg: 'rgba(253,126,20,0.1)', urgent: true },
    { label: 'CA (FCFA)', value: (stats.revenue || 0).toLocaleString(), icon: '💰', color: '#6f42c1', bg: 'rgba(111,66,193,0.1)' }
  ]

  const quickActions = [
    { id: 'services', label: 'Mes services', icon: '💅', desc: 'Gérer vos prestations', color: '#b8860b' },
    { id: 'appointments', label: 'Rendez-vous', icon: '📅', desc: 'Accepter ou refuser', color: '#20c997', badge: stats.pending },
    { id: 'revenue', label: 'Revenus', icon: '📊', desc: 'Statistiques CA', color: '#6f42c1' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', desc: 'Vos alertes', color: '#fd7e14', badge: unreadCount },
    { id: 'site', label: 'Mon site', icon: '🌐', desc: 'Personnaliser', color: '#e83e8c' },
    { id: 'profile', label: 'Profil', icon: '👤', desc: 'Mes infos', color: '#17a2b8' },
    { id: 'security', label: 'Sécurité', icon: '🔒', desc: 'Mot de passe', color: '#28a745' },
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
      <nav style={{
        background: 'linear-gradient(135deg, #1a0f08 0%, #2c1810 100%)',
        borderBottom: '1px solid rgba(212,165,116,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: isXS ? '52px' : '60px',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isXS ? '6px' : '10px', flexShrink: 0 }}>
              <span style={{ fontSize: isXS ? '20px' : '24px' }}>💆‍♀️</span>
              {!isXS && (
                <div>
                  <div style={{
                    fontFamily: 'Playfair Display, serif',
                    background: 'linear-gradient(135deg, #b8860b, #d4a574)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: isSM ? '14px' : '17px',
                    fontWeight: '700',
                    lineHeight: 1,
                    whiteSpace: 'nowrap'
                  }}>
                    {adminInfo?.salon_name || 'Chura Beauty'}
                  </div>
                  {!isSM && (
                    <div style={{ color: 'rgba(248,200,212,0.4)', fontSize: '10px', marginTop: '2px' }}>
                      Dashboard Admin
                    </div>
                  )}
                </div>
              )}
            </div>
            {!isMD && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: activeTab === tab.id ? 'rgba(184,134,11,0.2)' : 'transparent',
                      border: activeTab === tab.id ? '1px solid rgba(184,134,11,0.4)' : '1px solid transparent',
                      color: activeTab === tab.id ? '#d4a574' : 'rgba(248,200,212,0.6)',
                      borderRadius: '10px',
                      padding: '7px 12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                      fontFamily: 'Nunito, sans-serif',
                      flexShrink: 0,
                      position: 'relative'
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.id === 'notifications' && unreadCount > 0 && (
                      <span style={{ background: '#dc3545', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {isMD && !isSM && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    title={tab.label}
                    style={{
                      background: activeTab === tab.id ? 'rgba(184,134,11,0.25)' : 'transparent',
                      border: activeTab === tab.id ? '1px solid rgba(184,134,11,0.5)' : '1px solid transparent',
                      color: activeTab === tab.id ? '#d4a574' : 'rgba(248,200,212,0.6)',
                      borderRadius: '10px',
                      width: '38px',
                      height: '38px',
                      fontSize: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    {tab.icon}
                    {tab.id === 'notifications' && unreadCount > 0 && (
                      <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#dc3545', color: 'white', borderRadius: '50%', width: '14px', height: '14px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                        {unreadCount > 9 ? '+' : unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: isXS ? '4px' : '8px', flexShrink: 0 }}>
              {isSM && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{
                    background: 'rgba(212,165,116,0.1)',
                    border: '1px solid rgba(212,165,116,0.2)',
                    color: '#d4a574',
                    borderRadius: '8px',
                    width: '36px',
                    height: '36px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {mobileMenuOpen ? '✕' : '☰'}
                </button>
              )}
              <Link to="/"
                title="Voir le site"
                style={{
                  color: 'rgba(248,200,212,0.7)',
                  textDecoration: 'none',
                  fontSize: isXS ? '16px' : '13px',
                  padding: isXS ? '8px' : '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(248,200,212,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'Nunito, sans-serif'
                }}
              >
                🌐 {!isXS && !isSM && <span>Voir le site</span>}
              </Link>
              <button
                onClick={handleLogout}
                title="Déconnexion"
                style={{
                  background: 'rgba(220,53,69,0.15)',
                  border: '1px solid rgba(220,53,69,0.3)',
                  color: '#ff6b6b',
                  borderRadius: '8px',
                  padding: isXS ? '8px' : '7px 12px',
                  fontSize: isXS ? '16px' : '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'Nunito, sans-serif'
                }}
              >
                🚪 {!isXS && !isSM && <span>Déco</span>}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {isSM && mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden', borderTop: '1px solid rgba(212,165,116,0.1)', paddingBottom: '8px' }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '6px',
                  padding: '12px 0'
                }}>
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false) }}
                      style={{
                        background: activeTab === tab.id ? 'rgba(184,134,11,0.2)' : 'rgba(255,255,255,0.03)',
                        border: activeTab === tab.id ? '1px solid rgba(184,134,11,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        color: activeTab === tab.id ? '#d4a574' : 'rgba(248,200,212,0.65)',
                        borderRadius: '10px',
                        padding: '10px 6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: 'Nunito, sans-serif',
                        position: 'relative'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                      <span style={{ fontSize: '10px', lineHeight: 1 }}>{tab.label}</span>
                      {tab.id === 'notifications' && unreadCount > 0 && (
                        <span style={{ position: 'absolute', top: '6px', right: '8px', background: '#dc3545', color: 'white', borderRadius: '50%', width: '14px', height: '14px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {unreadCount > 9 ? '+' : unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(212,165,116,0.08)' }}>
                  <Link to="/" style={{ flex: 1, background: 'rgba(248,200,212,0.06)', border: '1px solid rgba(248,200,212,0.1)', color: 'rgba(248,200,212,0.7)', borderRadius: '10px', padding: '10px', textAlign: 'center', fontSize: '13px', textDecoration: 'none', fontFamily: 'Nunito, sans-serif' }}>
                    🌐 Voir le site
                  </Link>
                  <button onClick={handleLogout} style={{ flex: 1, background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.2)', color: '#ff6b6b', borderRadius: '10px', padding: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', fontFamily: 'Nunito, sans-serif' }}>
                    🚪 Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      <div style={{ padding: isXS ? '12px' : isSM ? '16px' : '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <AnimatePresence>
          {isFirstLogin && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,193,7,0.12), rgba(253,126,20,0.08))',
                border: '1px solid rgba(255,193,7,0.35)',
                borderRadius: '14px',
                padding: isXS ? '12px' : '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: isSM ? 'flex-start' : 'center',
                gap: '12px',
                flexDirection: isSM ? 'column' : 'row'
              }}
            >
              <span style={{ fontSize: '22px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', color: '#fd7e14', fontFamily: 'Playfair Display, serif', fontSize: isXS ? '14px' : '16px' }}>
                  Configuration requise
                </div>
                <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '2px' }}>
                  Définissez vos méthodes de récupération de mot de passe.
                </div>
              </div>
              <button
                onClick={() => setActiveTab('security')}
                style={{ background: 'linear-gradient(135deg, #fd7e14, #ffc107)', border: 'none', borderRadius: '10px', color: 'white', padding: '8px 16px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', alignSelf: isSM ? 'stretch' : 'auto', fontFamily: 'Nunito, sans-serif' }}
              >
                Configurer →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {activeTab === 'home' ? (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', fontSize: isXS ? '1.4rem' : isSM ? '1.6rem' : '2rem', marginBottom: '4px' }}>
                Bonjour {adminInfo?.owner_name?.split(' ')[0] || 'Admin'} 👋
              </h2>
              <p style={{ color: '#6c757d', fontSize: isXS ? '12px' : '14px' }}>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </motion.div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isXS ? 'repeat(2, 1fr)' : isSM ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: isXS ? '10px' : '16px',
              marginBottom: '28px'
            }}>
              {kpiCards.map((kpi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  style={{
                    background: 'white',
                    borderRadius: isXS ? '14px' : '18px',
                    padding: isXS ? '14px' : isSM ? '16px' : '22px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    border: \1px solid \\,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: kpi.bg }} />
                  <div style={{ fontSize: isXS ? '1.4rem' : '1.8rem', marginBottom: '8px' }}>{kpi.icon}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: isXS ? '1.3rem' : '1.8rem', fontWeight: '700', color: kpi.color, lineHeight: 1 }}>
                    {kpi.value}
                  </div>
                  <div style={{ color: '#6c757d', fontSize: isXS ? '10px' : '12px', marginTop: '4px', fontWeight: '500' }}>
                    {kpi.label}
                  </div>
                </motion.div>
              ))}
            </div>
            <h5 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '14px', fontSize: isXS ? '1rem' : '1.2rem' }}>
              ✨ Actions rapides
            </h5>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isXS ? 'repeat(2, 1fr)' : isSM ? 'repeat(3, 1fr)' : isMD ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)',
              gap: isXS ? '10px' : '14px',
              marginBottom: '28px'
            }}>
              {quickActions.map((action, i) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(action.id)}
                  style={{
                    background: 'white',
                    borderRadius: isXS ? '14px' : '18px',
                    padding: isXS ? '14px 10px' : isSM ? '16px 12px' : '22px 16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: \1px solid \18\,
                    cursor: 'pointer',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  {action.badge > 0 && (
                    <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#dc3545', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                      {action.badge > 9 ? '9+' : action.badge}
                    </span>
                  )}
                  <div style={{ fontSize: isXS ? '1.8rem' : '2.2rem', marginBottom: '8px' }}>{action.icon}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', fontSize: isXS ? '11px' : '13px', fontWeight: '700', marginBottom: isXS ? '0' : '4px' }}>
                    {action.label}
                  </div>
                  {!isXS && (
                    <div style={{ color: '#6c757d', fontSize: '11px', lineHeight: '1.3' }}>
                      {action.desc}
                    </div>
                  )}
                  <div style={{ marginTop: isXS ? '6px' : '10px', background: \\12\, color: action.color, borderRadius: '6px', padding: '4px', fontSize: '11px', fontWeight: '700' }}>
                    Ouvrir →
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ background: 'white', borderRadius: '20px', padding: isXS ? '16px' : '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
            >
              <RevenueChart compact={isSM} />
            </motion.div>
          </>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setActiveTab('home')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(184,134,11,0.25)',
                  color: '#b8860b',
                  borderRadius: '10px',
                  padding: isXS ? '6px 12px' : '8px 16px',
                  fontSize: isXS ? '12px' : '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'Nunito, sans-serif'
                }}
              >
                ← Tableau de bord
              </button>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <style>{\
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }
        * { -webkit-tap-highlight-color: transparent; }
        button { touch-action: manipulation; }
      \}</style>
    </div>
  )
}

export default AdminDashboard

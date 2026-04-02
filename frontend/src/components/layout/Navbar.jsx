import { useState, useEffect, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [salonName, setSalonName] = useState('Chura Beauty Salon')
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const location = useLocation()
  const { token, logout, admin } = useContext(AuthContext)
  
  // Check if user is admin or developer (restrict booking)
  const isAdminOrDeveloper = token && admin && (admin.role === 'admin' || admin.role === 'developer')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchSalonName = async () => {
      try {
        const res = await api.get('/auth/profile')
        if (res.data?.salon_name) setSalonName(res.data.salon_name)
      } catch (e) {
        // Silently fail - don't log out, just use default name
        console.warn('Could not fetch salon name:', e.message)
      }
    }
    // Only fetch if we have a token
    if (token) {
      fetchSalonName()
    }
  }, [token])

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
  }

  return (
    <nav className={`navbar navbar-expand-lg fixed-top navbar-luxury ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link className="navbar-brand-luxury" to="/">
          💆‍♀️ {salonName}
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: 'var(--primary-color)' }}
        >
          <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: '24px' }}></i>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav mx-auto gap-1">
            {[
              { path: '/', label: 'Accueil' },
              { path: '/services', label: 'Services' },
              { path: '/help', label: 'Aide' }
            ].map(({ path, label }) => (
              <li key={path} className="nav-item">
                <Link
                  className={`nav-link nav-link-luxury ${location.pathname === path ? 'active' : ''}`}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Time Badge - Animated */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="navbar-time-badge"
              style={{ fontSize: 'clamp(11px, 2vw, 16px)' }}
            >
              <span style={{ fontSize: '1em' }}>🕐</span>
              <span>{currentTime.toLocaleTimeString('fr-FR')}</span>
            </motion.div>

            {/* Book Appointment Button - DISABLED FOR ADMIN/DEVELOPER */}
            {isAdminOrDeveloper ? (
              <motion.div
                title="Vous êtes administrateur - action non autorisée"
                className="btn-luxury-appointment"
                style={{
                  opacity: 0.5,
                  cursor: 'not-allowed',
                  pointerEvents: 'none',
                  padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px)',
                  fontSize: 'clamp(12px, 1.8vw, 16px)'
                }}
              >
                <span>🚫</span>
                <span className="d-none d-sm-inline" style={{ textDecoration: 'line-through' }}>Prendre RDV</span>
              </motion.div>
            ) : (
              <Link 
                to="/services" 
                className="btn-luxury-appointment"
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px)',
                  fontSize: 'clamp(12px, 1.8vw, 16px)'
                }}
              >
                <span>📅</span>
                <span className="d-none d-sm-inline">Prendre RDV</span>
              </Link>
            )}
            {token ? (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className="btn-luxury-gradient"
                  onClick={() => setMenuOpen(false)}
                  style={{ 
                    padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 24px)',
                    fontSize: 'clamp(11px, 1.8vw, 14px)',
                    fontWeight: '600',
                    borderRadius: '8px',
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>👑</span>
                  <span className="d-none d-sm-inline">Dashboard</span>
                </Link>
                <button
                  className="btn-admin-logout"
                  onClick={handleLogout}
                  style={{
                    padding: 'clamp(8px, 2vw, 9px) clamp(12px, 3vw, 18px)',
                    fontSize: 'clamp(11px, 1.8vw, 13px)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🚪 <span className="d-none d-sm-inline">Déconnexion</span>
                </button>
              </>
            ) : (
              <Link 
                to="/admin/login" 
                className="btn-admin-login"
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: 'clamp(8px, 2vw, 9px) clamp(12px, 3vw, 22px)',
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  whiteSpace: 'nowrap'
                }}
              >
                🔐 <span className="d-none d-sm-inline">Connexion</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

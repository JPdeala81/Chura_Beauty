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
  const { token, logout } = useContext(AuthContext)

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
              { path: '/services', label: 'Services' }
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
            >
              <span style={{ fontSize: '16px' }}>🕐</span>
              <span>{currentTime.toLocaleTimeString('fr-FR')}</span>
            </motion.div>

            {/* Book Appointment Button */}
            <Link 
              to="/services" 
              className="btn-luxury-appointment" 
              onClick={() => setMenuOpen(false)}
            >
              <span style={{ fontSize: '18px' }}>📅</span>
              <span>Prendre RDV</span>
            </Link>
            {token ? (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className="btn-luxury-gradient d-none d-lg-inline-block"
                  onClick={() => setMenuOpen(false)}
                  style={{ 
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  👑 Dashboard
                </Link>
                <button
                  className="btn-admin-logout d-none d-lg-inline-block"
                  onClick={handleLogout}
                >
                  🚪 Déconnexion
                </button>
              </>
            ) : (
              <Link 
                to="/admin/login" 
                className="btn-admin-login d-none d-lg-inline-block"
                onClick={() => setMenuOpen(false)}
              >
                🔐 Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

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
              style={{
                padding: '8px 16px',
                backgroundColor: '#b8860b',
                color: 'white',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center',
                minWidth: '100px',
                boxShadow: '0 4px 15px rgba(184, 134, 11, 0.4)',
                letterSpacing: '0.5px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>🕐</span>
                <span>{currentTime.toLocaleTimeString('fr-FR')}</span>
              </div>
            </motion.div>

            {/* Book Appointment Button - More Visible */}
            <Link 
              to="/services" 
              className="btn-luxury-appointment d-none d-lg-inline-block" 
              style={{ 
                padding: '12px 28px', 
                fontSize: '15px',
                fontWeight: '700',
                borderRadius: '10px',
                backgroundColor: '#b8860b',
                color: 'white',
                border: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(184, 134, 11, 0.4)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#d4a574'
                e.target.style.boxShadow = '0 6px 25px rgba(184, 134, 11, 0.6)'
                e.target.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#b8860b'
                e.target.style.boxShadow = '0 4px 15px rgba(184, 134, 11, 0.4)'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              <span style={{ fontSize: '18px' }}>📅</span>
              <span>Prendre RDV</span>
            </Link>
            {token ? (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className="btn-luxury-gradient d-none d-lg-inline-block"
                  style={{ 
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #b8860b, #d4a574)',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(184, 134, 11, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 6px 20px rgba(184, 134, 11, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = '0 4px 15px rgba(184, 134, 11, 0.3)'
                  }}
                >
                  👑 Dashboard
                </Link>
                <button
                  className="btn-logout d-none d-lg-inline-block"
                  onClick={handleLogout}
                  style={{ 
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    backgroundColor: '#f8f4f0',
                    border: '2px solid #e0d0c0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f5e6d3'
                    e.target.style.borderColor = '#b8860b'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f8f4f0'
                    e.target.style.borderColor = '#e0d0c0'
                  }}
                >
                  🚪 Déconnexion
                </button>
              </>
            ) : (
              <Link 
                to="/admin/login" 
                className="btn-admin-login d-none d-lg-inline-block"
                style={{ 
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #28a745, #20c997)',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.5)'
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)'
                  e.target.style.transform = 'translateY(0)'
                }}
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

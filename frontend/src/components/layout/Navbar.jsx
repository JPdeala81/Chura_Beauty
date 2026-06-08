import { useState, useEffect, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import './navbar.css'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [salonName, setSalonName] = useState('Chura Beauty Salon')
  const location = useLocation()
  const { token, logout } = useContext(AuthContext)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchSalonName = async () => {
      try {
        const res = await api.get('/auth/profile')
        if (res.data?.salon_name) setSalonName(res.data.salon_name)
      } catch (e) {
        console.warn('Could not fetch salon name:', e.message)
      }
    }
    if (token) fetchSalonName()
  }, [token])

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { path: '/', label: 'Accueil', icon: 'bi-house' },
    { path: '/services', label: 'Services', icon: 'bi-scissors' },
    { path: '/help', label: 'Aide', icon: 'bi-question-circle' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`navbar-modern ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo & Brand */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">✨</div>
          <div className="brand-text">
            <span className="brand-name">{salonName}</span>
            <span className="brand-tagline">Beauty & Wellness</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                <i className={`bi ${link.icon}`}></i>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="navbar-actions">
            <Link to="/services" className="btn-book-appointment">
              <i className="bi bi-calendar-check"></i>
              <span>Prendre RDV</span>
            </Link>
            {token ? (
              <button onClick={handleLogout} className="btn-logout">
                <i className="bi bi-box-arrow-right"></i>
                <span>Déconnexion</span>
              </button>
            ) : (
              <Link to="/admin/login" className="btn-login">
                <i className="bi bi-shield-lock"></i>
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`navbar-toggler ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="navbar-mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mobile-links">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`mobile-link ${isActive(link.path) ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className={`bi ${link.icon}`}></i>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="mobile-actions">
                <Link
                  to="/services"
                  className="mobile-btn-book"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="bi bi-calendar-check"></i>
                  <span>Prendre RDV</span>
                </Link>
                {token ? (
                  <button onClick={handleLogout} className="mobile-btn-logout">
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Déconnexion</span>
                  </button>
                ) : (
                  <Link
                    to="/admin/login"
                    className="mobile-btn-login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="bi bi-shield-lock"></i>
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar

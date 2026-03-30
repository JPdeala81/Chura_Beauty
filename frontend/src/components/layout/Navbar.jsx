import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [salonName, setSalonName] = useState('Chura Beauty Salon')
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchSalonName = async () => {
      try {
        const res = await api.get('/auth/profile')
        if (res.data?.salonName) setSalonName(res.data.salonName)
      } catch (e) {}
    }
    fetchSalonName()
  }, [])

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
          style={{ color: '#d4a574' }}
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

          <div className="d-flex align-items-center gap-2">
            <Link to="/services" className="btn-luxury-outline d-none d-lg-inline-block" style={{ padding: '8px 20px', fontSize: '13px' }}>
              Prendre RDV
            </Link>
            {typeof window !== 'undefined' && localStorage.getItem('token') ? (
              <>
                <Link to="/admin/dashboard" className="btn-admin-login nav-link-luxury">
                  📊 Dashboard
                </Link>
                <button
                  className="btn-admin-login nav-link-luxury"
                  style={{ background: 'none', border: 'none', color: '#ff6b6b', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                  }}
                >
                  🚪 Déconnexion
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="btn-admin-login nav-link-luxury">
                Connexion Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

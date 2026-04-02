import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'

const floatingEmojis = ['💆‍♀️', '✨', '💅', '🌸', '💄', '👑', '🌺', '💎', '🪷', '🌟']

const HeroSection = ({ onScrollToServices }) => {
  const { token, admin } = useContext(AuthContext)
  const [adminInfo, setAdminInfo] = useState({
    salonName: 'Chura Beauty Salon',
    bio: 'Votre destination beauté à Libreville',
    coverPicture: null,
    heroTitle: 'Révélez Votre Beauté Naturelle',
    heroSubtitle: 'Des soins d\'exception pour sublimer votre beauté'
  })
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  
  // Check if user is admin or developer
  const isAdminOrDeveloper = token && admin && (admin.role === 'admin' || admin.role === 'developer')

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await api.get('/auth/profile')
        if (response.data) setAdminInfo(prev => ({ ...prev, ...response.data }))
      } catch (error) {
        console.log('Profil par défaut utilisé')
      }
    }
    fetchAdmin()
  }, [])

  // Handle window resize for responsive padding
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Responsive padding based on screen size
  const getResponsivePadding = () => {
    if (windowWidth < 576) return '20px'      // Mobile - navbar accounts for most spacing
    if (windowWidth < 768) return '30px'      // Tablet
    return '40px'                             // Desktop
  }

  return (
    <section
      className="hero-section"
      style={{
        background: adminInfo.coverPicture
          ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${adminInfo.coverPicture}) center/cover no-repeat`
          : 'var(--gradient-primary)',
        minHeight: '100vh',
        paddingTop: getResponsivePadding()
      }}
    >
      {/* Particules flottantes */}
      <div className="hero-particles">
        {floatingEmojis.map((emoji, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 15}px`,
              opacity: 0.6,
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut'
            }}
            initial={{ top: `${Math.random() * 80 + 10}%` }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div className="row align-items-center min-vh-100 py-5">
          <div className="col-lg-7">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                className="d-inline-block mb-3 px-4 py-2 rounded-pill"
                style={{ background: 'rgba(var(--primary-color), 0.1)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', fontSize: '14px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                ✨ {adminInfo.salonName}
              </motion.span>

              <motion.h1
                className="hero-title mb-4"
                style={{ color: 'var(--text-color)', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                {adminInfo.heroTitle || 'Révélez Votre'}{' '}
                <span style={{
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Beauté Naturelle
                </span>
              </motion.h1>

              <motion.p
                className="hero-subtitle mb-5"
                style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.8', maxWidth: '500px' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {adminInfo.bio || adminInfo.heroSubtitle}
              </motion.p>

              <motion.div
                className="d-flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button className="btn-luxury-primary" onClick={onScrollToServices}>
                  Découvrir nos services
                </button>
                {isAdminOrDeveloper ? (
                  <motion.button 
                    className="btn-luxury-outline"
                    disabled
                    style={{
                      opacity: 0.5,
                      cursor: 'not-allowed'
                    }}
                    title="Vous êtes administrateur - action non autorisée"
                  >
                    🚫 Prendre rendez-vous
                  </motion.button>
                ) : (
                  <Link to="/services" className="btn-luxury-outline">
                    Prendre rendez-vous
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </div>

          <div className="col-lg-5 d-none d-lg-block">
            <motion.div
              className="position-relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.div
                className="floating-element hero-glass-card"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-gold-light)',
                  borderRadius: '30px',
                  padding: '40px',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '80px', lineHeight: 1 }}>💆‍♀️</div>
                <h4 className="hero-salon-name" style={{ marginTop: '20px' }}>
                  {adminInfo.salonName}
                </h4>
                <p className="hero-subtitle" style={{ fontSize: '14px', marginTop: '10px' }}>
                  Libreville, Gabon
                </p>
                <div className="d-flex justify-content-center gap-3 mt-3">
                  {['💅', '🌸', '✨'].map((e, i) => (
                    <motion.span
                      key={i}
                      style={{ fontSize: '24px' }}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute',
          bottom: 'max(20px, 4vh)',
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          zIndex: 2,
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onScrollToServices}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      >
        <i className="bi bi-chevron-double-down scroll-indicator-icon" style={{ fontSize: 'clamp(20px, 5vw, 28px)' }}></i>
      </motion.div>
    </section>
  )
}

export default HeroSection

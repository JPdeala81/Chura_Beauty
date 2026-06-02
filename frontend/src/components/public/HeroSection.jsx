import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { useSiteSettings } from '../../contexts/SiteSettingsContext'
import api from '../../services/api'

const floatingEmojis = ['💆‍♀️', '✨', '💅', '🌸', '💄', '👑', '🌺', '💎', '🪷', '🌟']

const HeroSection = ({ onScrollToServices }) => {
  const { token, admin } = useContext(AuthContext)
  const siteSettings = useSiteSettings()

  const adminInfo = {
    salonName: siteSettings.companyName || siteSettings.appName || 'Chura Beauty Salon',
    bio: siteSettings.heroSubtitle || 'Votre destination beauté à Libreville',
    coverPicture: siteSettings.heroBackground || null,
    heroTitle: siteSettings.heroTitle || 'Révélez Votre Beauté Naturelle',
    heroSubtitle: siteSettings.heroSubtitle || 'Des soins d\'exception pour sublimer votre beauté'
  }
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  const isAdminOrDeveloper = token && admin && (admin.role === 'admin' || admin.role === 'developer')

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getResponsivePadding = () => {
    if (windowWidth < 576) return '20px'
    if (windowWidth < 768) return '30px'
    return '40px'
  }

  // Counter component
  const AnimatedCounter = ({ value, label, emoji }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: 'center',
          padding: '20px'
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          style={{
            fontSize: '40px',
            marginBottom: '8px'
          }}
        >
          {emoji}
        </motion.div>
        <motion.div
          style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px'
          }}
        >
          {value}+
        </motion.div>
        <div style={{
          fontSize: '12px',
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: '600'
        }}>
          {label}
        </div>
      </motion.div>
    )
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
                style={{
                  background: 'rgba(255, 215, 0, 0.15)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  color: '#ffd700',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                ✨ {adminInfo.salonName}
              </motion.span>

              <motion.h1
                className="hero-title mb-4"
                style={{
                  color: '#fff',
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  fontSize: 'clamp(32px, 8vw, 64px)',
                  fontWeight: '800',
                  lineHeight: '1.2'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                {adminInfo.heroTitle || 'Révélez Votre'}{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Beauté Naturelle
                </span>
              </motion.h1>

              <motion.p
                className="hero-subtitle mb-5"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: 'clamp(16px, 3vw, 20px)',
                  lineHeight: '1.8',
                  maxWidth: '500px'
                }}
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
                <button
                  className="btn-luxury-primary"
                  onClick={onScrollToServices}
                  style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Découvrir nos services ✨
                </button>
                {isAdminOrDeveloper ? (
                  <motion.button
                    className="btn-luxury-outline"
                    disabled
                    style={{
                      opacity: 0.5,
                      cursor: 'not-allowed',
                      padding: '14px 32px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      background: 'transparent',
                      borderRadius: '12px'
                    }}
                    title="Vous êtes administrateur - action non autorisée"
                  >
                    🚫 Prendre rendez-vous
                  </motion.button>
                ) : (
                  <Link
                    to="/services"
                    className="btn-luxury-outline"
                    style={{
                      display: 'inline-block',
                      padding: '14px 32px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      background: 'transparent',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Prendre rendez-vous 📅
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
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '30px',
                  padding: siteSettings.heroCardMedia ? '0' : '40px',
                  backdropFilter: 'blur(20px)',
                  textAlign: 'center',
                  overflow: 'hidden'
                }}
              >
                {siteSettings.heroCardMedia ? (
                  /* ── MEDIA PERSONNALISÉ ── */
                  siteSettings.heroCardMediaType === 'video' ? (
                    <video
                      src={siteSettings.heroCardMedia}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{ width: '100%', borderRadius: '30px', display: 'block', maxHeight: '380px', objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src={siteSettings.heroCardMedia}
                      alt={adminInfo.salonName}
                      style={{ width: '100%', borderRadius: '30px', display: 'block', maxHeight: '380px', objectFit: 'cover' }}
                    />
                  )
                ) : (
                  /* ── ANIMATION PAR DÉFAUT ── */
                  <>
                    <div style={{ fontSize: '80px', lineHeight: 1 }}>💆‍♀️</div>
                    <h4 style={{
                      marginTop: '20px',
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#fff'
                    }}>
                      {adminInfo.salonName}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      marginTop: '10px',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      {siteSettings.address || 'Libreville, Gabon'}
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
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 215, 0, 0.1)',
            padding: '40px',
            marginTop: '60px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
            marginBottom: '60px'
          }}
        >
          <AnimatedCounter value="500" label="Clients satisfaits" emoji="😊" />
          <AnimatedCounter value="50" label="Services" emoji="💅" />
          <AnimatedCounter value="100" label="Avis positifs" emoji="⭐" />
          <AnimatedCounter value="10" label="Années d'expérience" emoji="👑" />
        </motion.div>
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
        <i className="bi bi-chevron-double-down scroll-indicator-icon" style={{
          fontSize: 'clamp(20px, 5vw, 28px)',
          color: '#ffd700'
        }}></i>
      </motion.div>
    </section>
  )
}

export default HeroSection

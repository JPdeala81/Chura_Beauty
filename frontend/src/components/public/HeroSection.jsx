import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const floatingEmojis = ['💆‍♀️', '✨', '💅', '🌸', '💄', '👑', '🌺', '💎', '🪷', '🌟']

const HeroSection = ({ onScrollToServices }) => {
  const [adminInfo, setAdminInfo] = useState({
    salonName: 'Chura Beauty Salon',
    bio: 'Votre destination beauté à Libreville',
    coverPicture: null,
    heroTitle: 'Révélez Votre Beauté Naturelle',
    heroSubtitle: 'Des soins d\'exception pour sublimer votre beauté',
    heroBgColor: '#2c1810',
    heroTextColor: '#f8c8d4'
  })

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

  return (
    <section
      className="hero-section"
      style={{
        background: adminInfo.coverPicture
          ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${adminInfo.coverPicture}) center/cover no-repeat`
          : `linear-gradient(135deg, ${adminInfo.heroBgColor || '#2c1810'} 0%, #4a2c1a 40%, #b8860b 100%)`,
        minHeight: '100vh',
        paddingTop: '80px'
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
                style={{ background: 'rgba(212,165,116,0.2)', border: '1px solid rgba(212,165,116,0.4)', color: '#d4a574', fontSize: '14px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                ✨ {adminInfo.salonName}
              </motion.span>

              <motion.h1
                className="hero-title mb-4"
                style={{ color: adminInfo.heroTextColor || '#f8c8d4', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                {adminInfo.heroTitle || 'Révélez Votre'}{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #b8860b, #d4a574, #f8c8d4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Beauté Naturelle
                </span>
              </motion.h1>

              <motion.p
                className="hero-subtitle mb-5"
                style={{ color: 'rgba(248,200,212,0.85)', fontSize: '1.2rem', lineHeight: '1.8', maxWidth: '500px' }}
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
                <Link to="/services" className="btn-luxury-outline">
                  Prendre rendez-vous
                </Link>
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
                className="floating-element"
                style={{
                  background: 'rgba(212,165,116,0.1)',
                  border: '1px solid rgba(212,165,116,0.3)',
                  borderRadius: '30px',
                  padding: '40px',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '80px', lineHeight: 1 }}>💆‍♀️</div>
                <h4 style={{ color: '#d4a574', fontFamily: 'Playfair Display, serif', marginTop: '20px' }}>
                  {adminInfo.salonName}
                </h4>
                <p style={{ color: 'rgba(248,200,212,0.7)', fontSize: '14px', marginTop: '10px' }}>
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
        className="position-absolute bottom-0 start-50 translate-middle-x mb-4"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ cursor: 'pointer', zIndex: 2 }}
        onClick={onScrollToServices}
      >
        <i className="bi bi-chevron-double-down" style={{ color: '#d4a574', fontSize: '24px' }}></i>
      </motion.div>
    </section>
  )
}

export default HeroSection

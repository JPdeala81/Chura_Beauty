import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const NotFound = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <Navbar />
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 40%, #b8860b 100%)',
          paddingTop: '80px'
        }}
      >
        {/* Animated Background Elements */}
        <div className="position-absolute w-100 h-100" style={{ top: 0, left: 0, zIndex: 0, overflow: 'hidden' }}>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="position-absolute rounded-circle"
              style={{
                width: `${200 + i * 50}px`,
                height: `${200 + i * 50}px`,
                background: `rgba(212, 165, 116, ${0.1 - i * 0.02})`,
                filter: 'blur(40px)',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                zIndex: 0
              }}
              animate={{
                x: [0, 50, -50, 0],
                y: [0, -50, 50, 0]
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Glow Effect Following Mouse */}
        <motion.div
          className="position-absolute rounded-circle"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(212, 165, 116, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
          animate={{
            x: mousePosition.x - 150,
            y: mousePosition.y - 150
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />

        {/* Content */}
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* 404 Number with Animation */}
            <motion.div
              style={{
                fontSize: '120px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #d4a574 0%, #f8c8d4 50%, #b8860b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '20px',
                fontFamily: 'Playfair Display, serif',
                letterSpacing: '10px'
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              404
            </motion.div>

            {/* Emoji Animation */}
            <motion.div
              style={{ fontSize: '80px', marginBottom: '30px' }}
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              🔍
            </motion.div>

            {/* Title */}
            <motion.h1
              className="mb-3"
              style={{
                color: '#f8c8d4',
                fontSize: '48px',
                fontFamily: 'Playfair Display, serif',
                fontWeight: '700'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Page Non Trouvée
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mb-5"
              style={{
                color: 'rgba(248, 200, 212, 0.75)',
                fontSize: '18px',
                maxWidth: '500px',
                margin: '0 auto 40px',
                lineHeight: '1.8'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
              Retournons à nos services de beauté !
            </motion.p>

            {/* Buttons */}
            <motion.div
              className="d-flex flex-wrap justify-content-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link
                to="/"
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #b8860b, #d4a574)',
                  color: 'white',
                  padding: '14px 40px',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: 'none',
                  boxShadow: '0 8px 20px rgba(184, 134, 11, 0.3)',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  display: 'inline-block'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 30px rgba(184, 134, 11, 0.5)'
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 20px rgba(184, 134, 11, 0.3)'
                }}
              >
                🏠 Retour à l'accueil
              </Link>

              <Link
                to="/services"
                className="btn"
                style={{
                  background: 'rgba(212, 165, 116, 0.2)',
                  color: '#d4a574',
                  padding: '14px 40px',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid #d4a574',
                  boxShadow: '0 8px 20px rgba(212, 165, 116, 0.2)',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  display: 'inline-block'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.background = 'rgba(212, 165, 116, 0.3)'
                  e.target.style.boxShadow = '0 12px 30px rgba(212, 165, 116, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.background = 'rgba(212, 165, 116, 0.2)'
                  e.target.style.boxShadow = '0 8px 20px rgba(212, 165, 116, 0.2)'
                }}
              >
                💆‍♀️ Nos Services
              </Link>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              className="mt-5"
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                fontSize: '40px'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {['✨', '💅', '🌸', '💄', '👑'].map((emoji, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut'
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default NotFound

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMaintenanceCheck } from '../hooks/useMaintenanceCheck'

const Maintenance = () => {
  const { maintenanceData } = useMaintenanceCheck()
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (maintenanceData?.maintenance_end) {
      const updateTimer = () => {
        const end = new Date(maintenanceData.maintenance_end).getTime()
        const now = new Date().getTime()
        const diff = Math.max(0, end - now)

        if (diff === 0) {
          setTimeLeft(null)
        } else {
          const hours = Math.floor(diff / 3600000)
          const minutes = Math.floor((diff % 3600000) / 60000)
          const seconds = Math.floor((diff % 60000) / 1000)
          setTimeLeft({ hours, minutes, seconds })
        }
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [maintenanceData])

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0f08 0%, #2c1810 50%, #3d2414 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: Math.random() * 8 + 4,
              repeat: Infinity,
              repeatType: 'loop'
            }}
            style={{
              position: 'absolute',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(212,165,116,0.3) 0%, rgba(212,165,116,0) 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        style={{
          textAlign: 'center',
          background: 'rgba(20, 12, 8, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          padding: '60px 40px',
          maxWidth: '700px',
          width: '100%',
          border: '2px solid rgba(212, 165, 116, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Title */}
        <motion.div variants={itemVariants}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            background: 'linear-gradient(135deg, #d4a574, #b8860b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '12px',
            fontWeight: '700'
          }}>
            ⚙️ Maintenance en cours
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: '1.1rem',
            color: 'rgba(248, 200, 212, 0.8)',
            marginBottom: '32px'
          }}
        >
          {maintenanceData?.maintenance_reason || 'Notre site est actuellement en maintenance pour vous offrir une meilleure expérience.'}
        </motion.p>

        {/* Timer */}
        {timeLeft && (
          <motion.div
            variants={itemVariants}
            style={{
              background: 'rgba(212, 165, 116, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              border: '1px solid rgba(212, 165, 116, 0.3)'
            }}
          >
            <p style={{ color: 'rgba(248, 200, 212, 0.6)', fontSize: '0.9rem', marginBottom: '12px' }}>
              Nous serons de retour dans
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {[
                { label: 'Heures', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Secondes', value: timeLeft.seconds }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.2), rgba(212, 165, 116, 0.1))',
                    borderRadius: '12px',
                    padding: '16px 12px',
                    border: '1px solid rgba(212, 165, 116, 0.4)'
                  }}
                >
                  <div style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    fontWeight: '700',
                    color: '#d4a574',
                    fontFamily: 'monospace'
                  }}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(248, 200, 212, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginTop: '4px'
                  }}>
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message */}
        <motion.div
          variants={itemVariants}
          style={{
            background: 'rgba(248, 200, 212, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(248, 200, 212, 0.1)',
            marginBottom: '32px'
          }}
        >
          <p style={{
            color: 'rgba(248, 200, 212, 0.7)',
            fontSize: '0.95rem',
            lineHeight: '1.6'
          }}>
            Nos équipes travaillent dur pour améliorer votre expérience. Nous vous remercions de votre patience et votre fidélité.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px'
          }}
        >
          <a
            href="mailto:contact@example.com"
            style={{
              background: 'linear-gradient(135deg, #b8860b, #d4a574)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              fontFamily: 'Nunito, sans-serif',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            📧 Nous contacter
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'rgba(212, 165, 116, 0.15)',
              color: '#d4a574',
              border: '2px solid rgba(212, 165, 116, 0.3)',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              fontFamily: 'Nunito, sans-serif',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(212, 165, 116, 0.25)'}
            onMouseLeave={e => e.target.style.background = 'rgba(212, 165, 116, 0.15)'}
          >
            📱 Suivez-nous
          </a>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={itemVariants}
          style={{
            marginTop: '32px',
            fontSize: '0.85rem',
            color: 'rgba(248, 200, 212, 0.5)',
            borderTop: '1px solid rgba(212, 165, 116, 0.2)',
            paddingTop: '24px'
          }}
        >
          © 2024 {maintenanceData?.salon_name || 'Chura Beauty'}. Tous les droits réservés.
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Maintenance

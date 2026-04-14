import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import '../styles/maintenance.css'

const MaintenancePage = ({ maintenanceInfo = {}, onAdminLogin = null, siteSettings = {} }) => {
  const [countdownTime, setCountdownTime] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    if (!maintenanceInfo.endTime) return

    const interval = setInterval(() => {
      const end = new Date(maintenanceInfo.endTime)
      const now = new Date()
      const diff = end - now

      if (diff <= 0) {
        setCountdownTime(null)
        clearInterval(interval)
      } else {
        const hours = Math.floor(diff / 3600000)
        const minutes = Math.floor((diff % 3600000) / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setCountdownTime({ hours, minutes, seconds })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [maintenanceInfo.endTime])

  return (
    <div className="maintenance-page">
      {/* Animated Background */}
      <div className="maintenance-bg">
        <motion.div
          className="bg-shape bg-shape-1"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="bg-shape bg-shape-2"
          animate={{
            y: [0, 20, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        className="maintenance-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo/Title */}
        <motion.div
          className="maintenance-header"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="maintenance-title">🔧 Maintenance en Cours</h1>
          <p className="maintenance-subtitle">
            {siteSettings?.app_name || 'Chura Beauty Salon'}
          </p>
        </motion.div>

        {/* Message */}
        <motion.div
          className="maintenance-message"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p>
            Notre site est actuellement en maintenance pour améliorer votre expérience.
          </p>
          {maintenanceInfo.reason && (
            <p style={{ fontSize: '0.95rem', marginTop: '0.5rem', opacity: 0.9 }}>
              <strong>Raison:</strong> {maintenanceInfo.reason}
            </p>
          )}
        </motion.div>

        {/* Countdown Timer */}
        {countdownTime && (
          <motion.div
            className="maintenance-countdown"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3>Retour Prévu Dans:</h3>
            <div className="countdown-boxes">
              <motion.div
                className="countdown-box"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="countdown-value">{String(countdownTime.hours).padStart(2, '0')}</span>
                <span className="countdown-label">heures</span>
              </motion.div>
              <span className="countdown-separator">:</span>
              <motion.div
                className="countdown-box"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
              >
                <span className="countdown-value">{String(countdownTime.minutes).padStart(2, '0')}</span>
                <span className="countdown-label">minutes</span>
              </motion.div>
              <span className="countdown-separator">:</span>
              <motion.div
                className="countdown-box"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              >
                <span className="countdown-value">{String(countdownTime.seconds).padStart(2, '0')}</span>
                <span className="countdown-label">secondes</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Contact Info */}
        <motion.div
          className="maintenance-contact"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h4>📞 Besoin d'Aide?</h4>
          <div className="contact-items">
            {siteSettings?.footer_phone && (
              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <a href={`tel:${siteSettings.footer_phone}`}>
                  {siteSettings.footer_phone}
                </a>
              </div>
            )}
            {siteSettings?.footer_whatsapp && (
              <div className="contact-item">
                <span className="contact-icon">💬</span>
                <a href={`https://wa.me/${siteSettings.footer_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </div>
            )}
            {siteSettings?.footer_email && (
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <a href={`mailto:${siteSettings.footer_email}`}>
                  {siteSettings.footer_email}
                </a>
              </div>
            )}
          </div>
        </motion.div>

        {/* Admin Login Button */}
        {onAdminLogin && (
          <motion.div
            className="maintenance-admin-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <button
              className="btn-admin-access"
              onClick={() => setShowLoginModal(true)}
            >
              🔐 Accès Administrateur
            </button>
          </motion.div>
        )}

        {/* Admin Login Modal */}
        {showLoginModal && (
          <motion.div
            className="admin-login-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              className="admin-login-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>🔐 Accès Administrateur</h3>
              <p>Vous êtes actuellement connecté en tant qu'administrateur.</p>
              <button
                className="btn-close-modal"
                onClick={() => {
                  setShowLoginModal(false)
                  if (onAdminLogin) onAdminLogin()
                }}
              >
                ✓ Continuer vers le Dashboard
              </button>
              <button
                className="btn-cancel-modal"
                onClick={() => setShowLoginModal(false)}
              >
                ✕ Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="maintenance-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p>© {new Date().getFullYear()} {siteSettings?.app_name || 'Chura Beauty Salon'}. Tous droits réservés.</p>
      </motion.footer>
    </div>
  )
}

export default MaintenancePage

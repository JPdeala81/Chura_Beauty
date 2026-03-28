import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ErrorToast = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [message, onClose])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: '300px',
            maxWidth: '500px'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: '20px', flexShrink: 0 }}
            >
              ⚠️
            </motion.div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                Erreur de connexion
              </strong>
              <p style={{ fontSize: '13px', margin: 0, opacity: 0.95 }}>
                {message}
              </p>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                fontSize: '16px'
              }}
            >
              ✕
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ErrorToast

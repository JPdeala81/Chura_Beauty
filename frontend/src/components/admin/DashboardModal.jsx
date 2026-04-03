import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DashboardModal = ({ 
  show = false, 
  type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
  title = '',
  message = '',
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isDangerous = false // for delete/reset confirmations
}) => {
  if (!show) return null

  const bgColors = {
    success: 'rgba(0, 255, 150, 0.1)',
    error: 'rgba(255, 107, 107, 0.1)',
    warning: 'rgba(255, 193, 7, 0.1)',
    info: 'rgba(0, 217, 255, 0.1)',
    confirm: 'rgba(101, 84, 192, 0.1)'
  }

  const borderColors = {
    success: '#00ff96',
    error: '#ff6b6b',
    warning: '#ffc107',
    info: '#00d9ff',
    confirm: '#6554c0'
  }

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    confirm: '❓'
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(4px)'
          }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: `2px solid ${borderColors[type]}`,
              borderRadius: 'var(--border-radius-lg)',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: `0 0 30px ${borderColors[type]}40`,
              color: 'var(--text-color)'
            }}
          >
            {/* Icon & Title */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {iconMap[type]}
              </div>
              <h4 style={{ 
                color: borderColors[type], 
                margin: 0, 
                marginBottom: '0.5rem',
                fontWeight: 'bold'
              }}>
                {title}
              </h4>
            </div>

            {/* Message */}
            <div style={{
              background: bgColors[type],
              border: `1px solid ${borderColors[type]}`,
              borderRadius: 'var(--border-radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }}>
              {message}
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {type === 'confirm' ? (
                <>
                  <button
                    onClick={() => {
                      if (onConfirm) onConfirm()
                    }}
                    style={{
                      background: isDangerous ? '#ff6b6b' : borderColors[type],
                      color: isDangerous ? '#fff' : '#000',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: 'var(--border-radius-md)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      flex: '1',
                      minWidth: '120px'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    {confirmText}
                  </button>
                  <button
                    onClick={onCancel}
                    style={{
                      background: 'var(--bg-color)',
                      color: 'var(--text-color)',
                      border: `2px solid ${borderColors[type]}`,
                      padding: '0.75rem 1.5rem',
                      borderRadius: 'var(--border-radius-md)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      flex: '1',
                      minWidth: '120px'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    {cancelText}
                  </button>
                </>
              ) : (
                <button
                  onClick={onConfirm || onCancel}
                  style={{
                    background: borderColors[type],
                    color: '#000',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: 'var(--border-radius-md)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    minWidth: '150px'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  D'accord
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DashboardModal

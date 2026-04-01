import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQRCodeContext } from '../../context/QRCodeContext'

const QRCodeConfig = ({ showTitle = true, compact = false }) => {
  const { qrConfig, updateQRConfig, toggleQRCode, setQRMode, setUSSDCode, setPhoneNumber } = useQRCodeContext()
  const [localConfig, setLocalConfig] = useState(qrConfig)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleToggle = async (enabled) => {
    try {
      setSaving(true)
      await toggleQRCode(enabled)
      setLocalConfig({ ...localConfig, enabled })
      setMessage('✅ Configuration mise à jour')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleModeChange = async (mode) => {
    try {
      setSaving(true)
      await setQRMode(mode)
      setLocalConfig({ ...localConfig, mode })
      setMessage('✅ Mode QR Code changé')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Erreur lors du changement de mode')
    } finally {
      setSaving(false)
    }
  }

  const handleUSSDChange = async (e) => {
    const ussdCode = e.target.value
    setLocalConfig({ ...localConfig, ussdCode })
    try {
      setSaving(true)
      await setUSSDCode(ussdCode)
      setMessage('✅ Code USSD mis à jour')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handlePhoneChange = async (e) => {
    const phoneNumber = e.target.value
    setLocalConfig({ ...localConfig, phoneNumber })
    try {
      setSaving(true)
      await setPhoneNumber(phoneNumber)
      setMessage('✅ Numéro de téléphone mis à jour')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const containerClass = compact ? 'p-3' : 'p-4'
  const titleSize = compact ? 'h6' : 'h5'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${containerClass}`}
      style={{
        background: 'linear-gradient(135deg, rgba(184,134,11,0.05), rgba(212,168,67,0.05))',
        border: '1px solid rgba(184,134,11,0.2)',
        borderRadius: '12px'
      }}
    >
      {showTitle && (
        <div className={`${titleSize} mb-4`} style={{ fontFamily: 'Playfair Display, serif', fontWeight: '700', color: 'var(--primary-color)' }}>
          🔐 Configuration Module QR Code
        </div>
      )}

      {/* Status Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-3 p-2"
          style={{
            background: message.includes('✅') ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)',
            color: message.includes('✅') ? '#28a745' : '#dc3545',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          {message}
        </motion.div>
      )}

      {/* Toggle Enable/Disable */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label style={{ fontWeight: '600', marginBottom: 0, color: 'var(--primary-color)' }}>
            📱 Activer le Module QR Code
          </label>
          <motion.button
            onClick={() => handleToggle(!localConfig.enabled)}
            disabled={saving}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: 'none',
              background: localConfig.enabled ? '#28a745' : '#6c757d',
              color: 'white',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            {localConfig.enabled ? '✅ Activé' : '❌ Désactivé'}
          </motion.button>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          {localConfig.enabled
            ? 'Le QR Code est activé et apparaîtra sur les services'
            : 'Activez pour ajouter les QR Codes aux services'}
        </p>
      </div>

      {/* Configuration Options - only show if enabled */}
      {localConfig.enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ borderTop: '1px solid rgba(184,134,11,0.2)', paddingTop: '20px' }}
        >
          {/* Mode Selection */}
          <div className="mb-4">
            <label style={{ fontWeight: '600', color: 'var(--primary-color)', marginBottom: '10px', display: 'block' }}>
              ⚙️ Mode QR Code
            </label>
            <div className="d-flex gap-2" style={{ flexWrap: 'wrap' }}>
              <motion.button
                onClick={() => handleModeChange('service_info')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: localConfig.mode === 'service_info' ? 'none' : '1px solid var(--primary-color)',
                  background: localConfig.mode === 'service_info' ? 'var(--primary-color)' : 'transparent',
                  color: localConfig.mode === 'service_info' ? 'white' : 'var(--primary-color)',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '13px'
                }}
                disabled={saving}
              >
                📄 Infos Service
              </motion.button>

              <motion.button
                onClick={() => handleModeChange('ussd_call')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: localConfig.mode === 'ussd_call' ? 'none' : '1px solid var(--primary-color)',
                  background: localConfig.mode === 'ussd_call' ? 'var(--primary-color)' : 'transparent',
                  color: localConfig.mode === 'ussd_call' ? 'white' : 'var(--primary-color)',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '13px'
                }}
                disabled={saving}
              >
                📞 Appel Téléphonique
              </motion.button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', margin: 0 }}>
              {localConfig.mode === 'service_info'
                ? '✓ Le QR Code redirige vers les infos du service'
                : '✓ Le QR Code déclenche un appel téléphonique'}
            </p>
          </div>

          {/* USSD Code Input (for call mode) */}
          {localConfig.mode === 'ussd_call' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <label style={{ fontWeight: '600', color: 'var(--primary-color)', marginBottom: '8px', display: 'block' }}>
                📱 Code USSD ou Numéro
              </label>
              <input
                type="text"
                value={localConfig.ussdCode}
                onChange={handleUSSDChange}
                placeholder="ex: *241# ou +242123456789"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(184,134,11,0.3)',
                  background: 'rgba(255,255,255,0.5)',
                  color: 'var(--primary-color)',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', margin: 0 }}>
                Code USSD pour activation de service mobile ou numéro à appeler
              </p>
            </motion.div>
          )}

          {/* Phone Number Input (optional) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label style={{ fontWeight: '600', color: 'var(--primary-color)', marginBottom: '8px', display: 'block' }}>
              ☎️ Numéro de Contact (Optionnel)
            </label>
            <input
              type="text"
              value={localConfig.phoneNumber}
              onChange={handlePhoneChange}
              placeholder="ex: +242123456789"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(184,134,11,0.3)',
                background: 'rgba(255,255,255,0.5)',
                color: 'var(--primary-color)',
                fontWeight: '600',
                fontSize: '14px'
              }}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', margin: 0 }}>
              Numéro de secours ou support utilisateur
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Information Box */}
      <motion.div
        className="mt-4 p-3"
        style={{
          background: 'rgba(0,0,0,0.02)',
          borderLeft: '3px solid var(--primary-color)',
          borderRadius: '6px'
        }}
      >
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          <strong>ℹ️ Info:</strong> Une fois activé, les QR codes apparaîtront automatiquement sur chaque service. Les clients peuvent scanner pour accéder aux infos ou déclencher un appel.
        </p>
      </motion.div>
    </motion.div>
  )
}

export default QRCodeConfig

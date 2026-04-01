import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as qrCodeService from '../../services/qrCodeService'
import './QRCodeDisplay.css'

const QRCodeDisplay = ({ serviceId, serviceName }) => {
  const [config, setConfig] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadQRCodeConfig()
  }, [serviceId])

  const loadQRCodeConfig = async () => {
    try {
      setLoading(true)
      const qrConfig = await qrCodeService.getQRCodeConfig()
      setConfig(qrConfig)

      if (qrConfig.enabled) {
        const content = qrCodeService.generateQRCodeContent(qrConfig, serviceId)
        const url = qrCodeService.generateQRCodeUrl(content, 300)
        setQrCodeUrl(url)
        console.log('✅ QR Code généré pour:', serviceName)
      }
    } catch (error) {
      console.error('Erreur chargement QR Code:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !config || !config.enabled || !qrCodeUrl) {
    return null
  }

  const getBehaviorText = () => {
    if (config.type === 'info') {
      return 'Scanner pour afficher les détails du service'
    } else if (config.type === 'call') {
      if (config.ussdCode) {
        return `Scanner pour appeler ${config.ussdCode}`
      } else if (config.phoneNumber) {
        return `Scanner pour appeler ${config.phoneNumber}`
      }
    }
    return 'Scanner le QR Code'
  }

  return (
    <>
      <motion.button
        className="qr-code-badge"
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={getBehaviorText()}
      >
        <span className="qr-icon">₿</span>
        <span className="qr-text">QR Code</span>
      </motion.button>

      {/* Modal QR Code */}
      {showModal && (
        <motion.div
          className="qr-modal-overlay"
          onClick={() => setShowModal(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="qr-modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <button
              className="qr-modal-close"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h3 className="qr-modal-title">{serviceName}</h3>

            <div className="qr-code-container">
              <motion.img
                src={qrCodeUrl}
                alt="QR Code"
                className="qr-code-image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
            </div>

            <p className="qr-modal-description">
              {getBehaviorText()}
            </p>

            <div className="qr-modal-actions">
              <motion.a
                href={qrCodeUrl}
                download={`qr-${serviceId}.png`}
                className="btn-qr-download"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📥 Télécharger QR Code
              </motion.a>

              <motion.button
                className="btn-qr-close"
                onClick={() => setShowModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Fermer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default QRCodeDisplay

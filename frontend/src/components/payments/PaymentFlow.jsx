import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode.react'
import api from '../../services/api'

const PaymentFlow = ({ service, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1) // 1: customer info, 2: payment method, 3: network, 4: payment, 5: confirmation
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'qr_scan' // or 'manual' or 'phone_call'
  })

  const [paymentNetwork, setPaymentNetwork] = useState('moov') // 'moov' or 'airtel'

  // Generate USSD code based on network and amount
  const generateUSSDCode = () => {
    const network = paymentNetwork
    const amount = service.price || 0
    const adminNumber = formData.adminNumber || '24277123456' // Default admin number

    if (network === 'moov') {
      return `*555*2*${adminNumber}*${amount}#`
    } else if (network === 'airtel') {
      return `*150*2*1*${adminNumber}*${amount}#`
    }
    return ''
  }

  const handleCreateSession = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.post('/payments/sessions', {
        serviceId: service.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        serviceAmount: service.price,
        paymentNetwork: paymentNetwork,
        paymentMethod: formData.paymentMethod
      })

      setSession(response.data.session)
      setStep(4)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création de la session')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copié dans le presse-papiers!')
  }

  const handlePhone = (code) => {
    window.location.href = `tel:${code}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="payment-flow"
      style={{
        background: 'linear-gradient(135deg, rgba(184,134,11,0.05), rgba(212,168,67,0.05))',
        border: '1px solid rgba(184,134,11,0.2)',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      {/* Step Indicator */}
      <div className="mb-4">
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: step >= s ? 'var(--primary-color)' : '#e0e0e0',
                color: step >= s ? 'white' : '#999',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Customer Information */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h5 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
              👤 Vos Informations
            </h5>

            <div className="form-group mb-3">
              <label className="form-label">Nom complet</label>
              <input
                type="text"
                className="form-control"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Ex: Jean Dupont"
                style={{ borderColor: 'var(--primary-color)' }}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Numéro de téléphone (+241)</label>
              <input
                type="tel"
                className="form-control"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="Ex: +241 06 XX XX XX"
                style={{ borderColor: 'var(--primary-color)' }}
              />
            </div>

            <button
              className="btn"
              style={{
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                width: '100%',
                marginTop: '1rem'
              }}
              onClick={() => {
                if (formData.customerName && formData.customerPhone) {
                  setStep(2)
                } else {
                  setError('Veuillez remplir tous les champs')
                }
              }}
            >
              Continuer →
            </button>
          </motion.div>
        )}

        {/* Step 2: Payment Method Selection */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h5 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
              💳 Méthode de Paiement
            </h5>

            <div className="mb-3">
              <label className="form-check mb-3">
                <input
                  type="radio"
                  className="form-check-input"
                  checked={formData.paymentMethod === 'qr_scan'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'qr_scan' })}
                />
                <span className="form-check-label ms-2">📱 Scanner le QR Code</span>
              </label>

              <label className="form-check mb-3">
                <input
                  type="radio"
                  className="form-check-input"
                  checked={formData.paymentMethod === 'manual'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'manual' })}
                />
                <span className="form-check-label ms-2">📝 Paiement Manuel USSD</span>
              </label>

              <label className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  checked={formData.paymentMethod === 'phone_call'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'phone_call' })}
                />
                <span className="form-check-label ms-2">☎️ Appel USSD (Auto-dial)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="btn btn-outline-secondary"
                style={{ flex: 1 }}
                onClick={() => setStep(1)}
              >
                ← Retour
              </button>
              <button
                className="btn"
                style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                  flex: 1,
                  border: 'none'
                }}
                onClick={() => setStep(3)}
              >
                Continuer →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Network Selection */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h5 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
              📡 Sélectionner Votre Réseau
            </h5>

            <div className="mb-3">
              <label className="form-check mb-3">
                <input
                  type="radio"
                  className="form-check-input"
                  checked={paymentNetwork === 'moov'}
                  onChange={() => setPaymentNetwork('moov')}
                />
                <span className="form-check-label ms-2">
                  🟠 Moov Money (+241 65/66/76)
                </span>
              </label>

              <label className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  checked={paymentNetwork === 'airtel'}
                  onChange={() => setPaymentNetwork('airtel')}
                />
                <span className="form-check-label ms-2">
                  🔴 Airtel Money (+241 74/77)
                </span>
              </label>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Votre numéro actuel: <strong>{formData.customerPhone}</strong>
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="btn btn-outline-secondary"
                style={{ flex: 1 }}
                onClick={() => setStep(2)}
              >
                ← Retour
              </button>
              <button
                className="btn"
                style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                  flex: 1,
                  border: 'none'
                }}
                onClick={handleCreateSession}
                disabled={loading}
              >
                {loading ? '⏳ Création...' : 'Créer Session →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Payment Instructions */}
        {step === 4 && session && (
          <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h5 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
              💰 Instructions de Paiement
            </h5>

            {/* Session Code */}
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '12px', color: '#856404', margin: 0 }}>Code de Session</p>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#856404',
                margin: '0.5rem 0 0.5rem 0',
                fontFamily: 'monospace',
                letterSpacing: '2px'
              }}>
                {session.session_code}
              </p>
              <small style={{ color: '#856404' }}>
                Conservez ce code pour retrouver votre session
              </small>
            </div>

            {/* Amount */}
            <div style={{
              background: 'rgba(184,134,11,0.1)',
              border: '1px solid rgba(184,134,11,0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Montant à payer</p>
              <p style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'var(--primary-color)',
                margin: '0.5rem 0'
              }}>
                {service.price.toLocaleString('fr-FR')} XAF
              </p>
            </div>

            {/* QR Code Display for QR Scan Method */}
            {formData.paymentMethod === 'qr_scan' && (
              <div style={{
                background: 'white',
                border: '2px solid var(--primary-color)',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--primary-color)',
                  marginBottom: '1rem'
                }}>
                  📱 Scannez ce code QR
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <QRCode
                    value={`SESSION:${session.session_code}|AMOUNT:${service.price}|NETWORK:${paymentNetwork}`}
                    size={256}
                    level="H"
                    includeMargin
                    style={{
                      border: '8px solid white',
                      borderRadius: '8px',
                      padding: '8px',
                      background: 'white'
                    }}
                  />
                </div>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  margin: '1rem 0 0 0'
                }}>
                  Utilisez l'application de paiement de {paymentNetwork === 'moov' ? 'Moov Money' : 'Airtel Money'} pour scanner
                </p>
              </div>
            )}

            {/* USSD Code for Manual/Phone Methods */}
            {formData.paymentMethod !== 'qr_scan' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-color)' }}>
                  Code USSD {paymentNetwork === 'moov' ? '(Moov Money)' : '(Airtel Money)'}
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '8px'
                }}>
                  <input
                    type="text"
                    className="form-control"
                    value={generateUSSDCode()}
                    readOnly
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      background: '#f5f5f5',
                      borderColor: 'var(--primary-color)'
                    }}
                  />
                  <button
                    className="btn"
                    style={{
                      background: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => copyToClipboard(generateUSSDCode())}
                  >
                    📋 Copier
                  </button>
                </div>
              </div>
            )}

            {/* Instructions based on payment method */}
            {formData.paymentMethod === 'qr_scan' && (
              <div style={{
                background: '#e8f5e9',
                border: '1px solid #4caf50',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: '#2e7d32', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                  📱 Paiement par QR Code
                </p>
                <ol style={{ color: '#2e7d32', fontSize: '13px', margin: '0.5rem 0', paddingLeft: '20px' }}>
                  <li>Ouvrez l'application {paymentNetwork === 'moov' ? 'Moov Money' : 'Airtel Money'}</li>
                  <li>Utilisez la fonction de paiement par QR Code</li>
                  <li>Scannez le code QR ci-dessus</li>
                  <li>Confirmez le paiement sur votre téléphone</li>
                </ol>
              </div>
            )}

            {formData.paymentMethod === 'phone_call' && (
              <div style={{
                background: '#e8f5e9',
                border: '1px solid #4caf50',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: '#2e7d32', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                  ☎️ Appel USSD Auto
                </p>
                <p style={{ color: '#2e7d32', fontSize: '14px', margin: 0 }}>
                  Cliquez sur "Appeler" pour composer automatiquement le code USSD
                </p>
              </div>
            )}

            {formData.paymentMethod === 'manual' && (
              <div style={{
                background: '#e3f2fd',
                border: '1px solid #2196f3',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: '#1565c0', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                  📝 Paiement Manuel
                </p>
                <ol style={{ color: '#1565c0', fontSize: '14px', margin: 0, paddingLeft: '20px' }}>
                  <li>Composez le code USSD ci-dessus sur votre téléphone</li>
                  <li>Suivez les instructions de votre opérateur</li>
                  <li>Envoyez une capture d'écran pour confirmation</li>
                </ol>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="btn btn-outline-secondary"
                style={{ flex: 1 }}
                onClick={() => setStep(3)}
              >
                ← Retour
              </button>
              {formData.paymentMethod === 'phone_call' && (
                <button
                  className="btn"
                  style={{
                    background: 'var(--primary-color)',
                    color: 'white',
                    flex: 1,
                    border: 'none'
                  }}
                  onClick={() => handlePhone(generateUSSDCode())}
                >
                  ☎️ Appeler
                </button>
              )}
              {formData.paymentMethod !== 'phone_call' && (
                <button
                  className="btn"
                  style={{
                    background: 'var(--primary-color)',
                    color: 'white',
                    flex: 1,
                    border: 'none'
                  }}
                  onClick={() => setStep(5)}
                >
                  {formData.paymentMethod === 'qr_scan' ? '✅ Paiement Effectué →' : '✅ Paiement Effectué →'}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 5: Confirmation/Screenshot Upload */}
        {step === 5 && session && (
          <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h5 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
              ✅ Confirmation Paiement
            </h5>

            <p style={{ marginBottom: '1.5rem' }}>
              Merci pour votre paiement! Pour confirmer votre paiement plus rapidement, vous pouvez envoyer une capture d'écran de la transaction.
            </p>

            <div style={{
              border: '2px dashed rgba(184,134,11,0.3)',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '1rem',
              cursor: 'pointer'
            }}>
              <p style={{ fontSize: '32px', margin: 0 }}>📸</p>
              <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '0.5rem' }}>
                Cliquez pour uploader la capture d'écran
              </p>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="screenshot-upload"
              />
            </div>

            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <p style={{ fontSize: '12px', color: '#856404', margin: 0 }}>
                <strong>Code de session:</strong> {session.session_code}
              </p>
            </div>

            <button
              className="btn"
              style={{
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                width: '100%'
              }}
              onClick={onSuccess}
            >
              ✅ Paiement Complété
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-danger mt-3"
          role="alert"
        >
          {error}
        </motion.div>
      )}

      {/* Cancel Button */}
      <button
        className="btn btn-link"
        style={{
          width: '100%',
          marginTop: '1rem',
          color: 'var(--text-muted)'
        }}
        onClick={onCancel}
      >
        ✕ Annuler
      </button>
    </motion.div>
  )
}

export default PaymentFlow

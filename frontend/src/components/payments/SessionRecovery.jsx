import React, { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api'

const SessionRecovery = ({ onSessionFound, onClose }) => {
  const [sessionCode, setSessionCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)

  const handleSearch = async () => {
    try {
      setLoading(true)
      setError('')

      if (!sessionCode.trim()) {
        setError('Veuillez entrer un code de session')
        setLoading(false)
        return
      }

      const response = await api.get(`/payments/sessions/${sessionCode}`)
      setSession(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Session non trouvée')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { color: '#ffc107', label: '⏳ En attente', bg: '#fff3cd' },
      'waiting_confirmation': { color: '#17a2b8', label: '👀 Attente de confirmation', bg: '#d1ecf1' },
      'verified': { color: '#28a745', label: '✅ Vérifiée', bg: '#d4edda' },
      'completed': { color: '#28a745', label: '✅ Complétée', bg: '#d4edda' },
      'expired': { color: '#dc3545', label: '❌ Expirée', bg: '#f8d7da' },
      'cancelled': { color: '#dc3545', label: '❌ Annulée', bg: '#f8d7da' }
    }
    return statusMap[status] || { color: '#999', label: '?', bg: '#f5f5f5' }
  }

  if (session) {
    const status = getStatusBadge(session.payment_status)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(184,134,11,0.2)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px'
        }}
      >
        <h5 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
          📋 Détails de la Session
        </h5>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Code de Session</label>
          <div style={{
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: 'var(--primary-color)'
          }}>
            {session.session_code}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Statut</label>
          <div style={{
            background: status.bg,
            color: status.color,
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontWeight: '600'
          }}>
            {status.label}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Montant</label>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', color: 'var(--primary-color)' }}>
              {session.service_amount.toLocaleString('fr-FR')} XAF
            </p>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Réseau</label>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase' }}>
              {session.payment_network === 'moov' ? '🟠 Moov' : '🔴 Airtel'}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Client</label>
          <p style={{ margin: 0, fontSize: '14px' }}>{session.customer_name}</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
            {session.customer_phone}
          </p>
        </div>

        {session.admin_notes && (
          <div style={{
            marginBottom: '1rem',
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Notes de l'Admin</label>
            <p style={{ margin: 0, fontSize: '14px', marginTop: '0.5rem' }}>
              {session.admin_notes}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            className="btn btn-outline-secondary"
            style={{ flex: 1 }}
            onClick={() => {
              setSession(null)
              setSessionCode('')
            }}
          >
            Nouvelle Recherche
          </button>
          <button
            className="btn"
            style={{
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              flex: 1
            }}
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: 'var(--surface)',
        border: '1px solid rgba(184,134,11,0.2)',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px'
      }}
    >
      <h5 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
        🔍 Retrouver Ma Session
      </h5>

      <p style={{ fontSize: '14px', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        Entrez votre code de session à 8 chiffres pour vérifier le statut de votre paiement.
      </p>

      <div className="form-group mb-3">
        <label className="form-label">Code de Session</label>
        <input
          type="text"
          className="form-control"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
          placeholder="Ex: 12345678"
          maxLength="8"
          style={{
            borderColor: 'var(--primary-color)',
            fontSize: '18px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textAlign: 'center',
            fontFamily: 'monospace'
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-danger"
          role="alert"
          style={{ marginBottom: '1rem' }}
        >
          {error}
        </motion.div>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          className="btn btn-outline-secondary"
          style={{ flex: 1 }}
          onClick={onClose}
        >
          Fermer
        </button>
        <button
          className="btn"
          style={{
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            flex: 1
          }}
          onClick={handleSearch}
          disabled={loading || sessionCode.length !== 8}
        >
          {loading ? '⏳ Recherche...' : '🔎 Rechercher'}
        </button>
      </div>
    </motion.div>
  )
}

export default SessionRecovery

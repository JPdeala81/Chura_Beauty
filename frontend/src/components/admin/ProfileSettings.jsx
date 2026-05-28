import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api'

const ProfileSettings = ({ admin, onUpdate }) => {
  const [formData, setFormData] = useState({
    email: admin?.email || '',
    salon_name: admin?.salon_name || '',
    owner_name: admin?.owner_name || '',
    phone: admin?.phone || '',
    whatsapp: admin?.whatsapp || '',
    address: admin?.address || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (admin) {
      setFormData({
        email: admin.email || '',
        salon_name: admin.salon_name || '',
        owner_name: admin.owner_name || '',
        phone: admin.phone || '',
        whatsapp: admin.whatsapp || '',
        address: admin.address || '',
      })
    }
  }, [admin])

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      await api.put('/auth/profile', formData)
      setMessage({ type: 'success', text: 'Profil mis à jour!' })
      onUpdate?.()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }
    try {
      setLoading(true)
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setMessage({ type: 'success', text: 'Mot de passe changé!' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: 'clamp(12px, 1.8vw, 14px)',
    width: '100%',
  }

  const sectionStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: 'clamp(20px, 4vw, 30px)',
    border: '2px solid #f0f0f0',
    marginBottom: 'clamp(20px, 3vw, 30px)',
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: '600',
          }}
        >
          {message.text}
        </motion.div>
      )}

      {/* Profile Section */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)', fontWeight: '700', color: '#333' }}>
          👤 Informations Personnelles
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'clamp(12px, 2vw, 16px)', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Email
            </label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Nom du Salon
            </label>
            <input type="text" value={formData.salon_name} onChange={(e) => setFormData({ ...formData, salon_name: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Votre Nom
            </label>
            <input type="text" value={formData.owner_name} onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Téléphone
            </label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              WhatsApp
            </label>
            <input type="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Adresse
            </label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={inputStyle} />
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveProfile}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: 'clamp(10px, 1.5vw, 12px) clamp(20px, 4vw, 30px)',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: 'clamp(12px, 1.8vw, 14px)',
            opacity: loading ? 0.7 : 1,
          }}
        >
          💾 Enregistrer Profil
        </motion.button>
      </div>

      {/* Password Section */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)', fontWeight: '700', color: '#333' }}>
          🔐 Changer le Mot de Passe
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'clamp(12px, 2vw, 16px)', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Mot de passe actuel
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Nouveau mot de passe
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Confirmer le mot de passe
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '20px', fontWeight: '600', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          Afficher les mots de passe
        </label>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleChangePassword}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: 'clamp(10px, 1.5vw, 12px) clamp(20px, 4vw, 30px)',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: 'clamp(12px, 1.8vw, 14px)',
            opacity: loading ? 0.7 : 1,
          }}
        >
          🔐 Changer le Mot de Passe
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ProfileSettings

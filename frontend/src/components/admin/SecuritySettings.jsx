import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api'

const secretQuestions = [
  'Quel est le nom de votre premier animal de compagnie ?',
  'Quelle est la ville où vous êtes né(e) ?',
  'Quel est le prénom de votre mère ?',
  'Quelle était votre école primaire ?',
  'Quel est votre plat préféré ?',
  'Quel est le nom de votre meilleure amie d\'enfance ?',
  'Quelle est votre couleur préférée ?',
  'Quel est le prénom de votre père ?'
]

const SecuritySettings = ({ isFirstLogin, onComplete }) => {
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [securityForm, setSecurityForm] = useState({ secretQuestion: '', secretAnswer: '', recoveryEmail: '' })
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingSecurity, setLoadingSecurity] = useState(false)
  const [messagePassword, setMessagePassword] = useState(null)
  const [messageSecurity, setMessageSecurity] = useState(null)
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    fetchSecurityInfo()
  }, [])

  const fetchSecurityInfo = async () => {
    try {
      const res = await api.get('/auth/profile')
      if (res.data) {
        setSecurityForm(prev => ({
          ...prev,
          secretQuestion: res.data.secret_question || '',
          recoveryEmail: res.data.recovery_email || ''
        }))
      }
    } catch (e) {}
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setMessagePassword({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
    }
    if (passwordForm.newPassword.length < 8) {
      return setMessagePassword({ type: 'error', text: 'Le mot de passe doit avoir au moins 8 caractères' })
    }
    setLoadingPassword(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setMessagePassword({ type: 'success', text: '✅ Mot de passe modifié avec succès !' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setMessagePassword({ type: 'error', text: err.response?.data?.message || 'Erreur lors du changement' })
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleSecuritySave = async (e) => {
    e.preventDefault()
    if (!securityForm.secretQuestion || !securityForm.secretAnswer || !securityForm.recoveryEmail) {
      return setMessageSecurity({ type: 'error', text: 'Tous les champs sont obligatoires' })
    }
    setLoadingSecurity(true)
    try {
      await api.put('/auth/security', {
        secretQuestion: securityForm.secretQuestion,
        secretAnswer: securityForm.secretAnswer,
        recoveryEmail: securityForm.recoveryEmail
      })
      setMessageSecurity({ type: 'success', text: '✅ Paramètres de sécurité sauvegardés !' })
      if (onComplete) onComplete()
    } catch (err) {
      setMessageSecurity({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la sauvegarde' })
    } finally {
      setLoadingSecurity(false)
    }
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    marginBottom: '24px',
    border: '1px solid rgba(184,134,11,0.08)'
  }

  const inputStyle = {
    border: '2px solid rgba(184,134,11,0.15)',
    borderRadius: '12px',
    padding: '12px 16px',
    width: '100%',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s'
  }

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    display: 'block'
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      {isFirstLogin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(255,193,7,0.1), rgba(253,126,20,0.08))',
            border: '1px solid rgba(255,193,7,0.4)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '24px'
          }}
        >
          <h5 style={{ fontFamily: 'Playfair Display, serif', color: '#fd7e14', marginBottom: '8px' }}>
            🔐 Configuration initiale requise
          </h5>
          <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>
            Pour sécuriser votre compte, veuillez définir vos méthodes de récupération de mot de passe
            et mettre à jour vos coordonnées personnelles.
          </p>
        </motion.div>
      )}

      {/* Changer mot de passe */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
        <h5 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🔑 Changer le mot de passe
        </h5>
        {messagePassword && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            background: messagePassword.type === 'success' ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)',
            color: messagePassword.type === 'success' ? '#28a745' : '#dc3545',
            border: `1px solid ${messagePassword.type === 'success' ? 'rgba(40,167,69,0.3)' : 'rgba(220,53,69,0.3)'}`
          }}>
            {messagePassword.text}
          </div>
        )}
        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Mot de passe actuel</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                style={inputStyle}
                placeholder="Votre mot de passe actuel"
                required
              />
              <button type="button" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                {showPasswords.current ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <label style={labelStyle}>Nouveau mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  style={inputStyle}
                  placeholder="Min. 8 caractères"
                  required
                />
                <button type="button" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                  {showPasswords.new ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Confirmer</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  style={inputStyle}
                  placeholder="Répétez le mot de passe"
                  required
                />
                <button type="button" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                  {showPasswords.confirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loadingPassword}
            style={{
              marginTop: '20px',
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '12px 28px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif'
            }}>
            {loadingPassword ? '⏳ Modification...' : '🔐 Modifier le mot de passe'}
          </button>
        </form>
      </motion.div>

      {/* Récupération mot de passe */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle}>
        <h5 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🛡️ Récupération du mot de passe
        </h5>
        <p style={{ color: '#6c757d', fontSize: '13px', marginBottom: '24px' }}>
          Ces informations vous permettront de récupérer votre compte si vous oubliez votre mot de passe.
        </p>
        {messageSecurity && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            background: messageSecurity.type === 'success' ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)',
            color: messageSecurity.type === 'success' ? '#28a745' : '#dc3545',
            border: `1px solid ${messageSecurity.type === 'success' ? 'rgba(40,167,69,0.3)' : 'rgba(220,53,69,0.3)'}`
          }}>
            {messageSecurity.text}
          </div>
        )}
        <form onSubmit={handleSecuritySave}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email de récupération</label>
            <input
              type="email"
              value={securityForm.recoveryEmail}
              onChange={e => setSecurityForm(p => ({ ...p, recoveryEmail: e.target.value }))}
              style={inputStyle}
              placeholder="email@exemple.com"
              required
            />
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '6px' }}>
              📧 Un lien de réinitialisation sera envoyé à cet email
            </p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Question secrète</label>
            <select
              value={securityForm.secretQuestion}
              onChange={e => setSecurityForm(p => ({ ...p, secretQuestion: e.target.value }))}
              style={{ ...inputStyle, background: 'white' }}
              required
            >
              <option value="">Choisissez une question...</option>
              {secretQuestions.map((q, i) => (
                <option key={i} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Réponse secrète</label>
            <input
              type="text"
              value={securityForm.secretAnswer}
              onChange={e => setSecurityForm(p => ({ ...p, secretAnswer: e.target.value }))}
              style={inputStyle}
              placeholder="Votre réponse (sensible à la casse)"
              required
            />
          </div>
          <button type="submit" disabled={loadingSecurity}
            style={{
              background: 'linear-gradient(135deg, #b8860b, #d4a574)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '12px 28px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif'
            }}>
            {loadingSecurity ? '⏳ Sauvegarde...' : '🛡️ Sauvegarder la sécurité'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default SecuritySettings

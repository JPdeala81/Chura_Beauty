import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { motion } from 'framer-motion'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token manquant. Utilisez le lien reçu par email.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Les deux champs sont requis.')
      return
    }

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    // Vérifier la force du mot de passe
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)
    const hasSpecialChar = /[!@#$%^&*]/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Le mot de passe doit contenir des majuscules, minuscules et chiffres.')
      return
    }

    setLoading(true)
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { newPassword })
      setSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      
      // Rediriger vers le login après 2 secondes
      setTimeout(() => {
        navigate('/admin/login', { 
          state: { message: 'Mot de passe réinitialisé avec succès. Connectez-vous.' } 
        })
      }, 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la réinitialisation.'
      setError(errorMsg)
      console.error('Reset password error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'var(--gradient-primary)' }}
    >
      <motion.div
        className="card shadow-lg border-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '450px', borderRadius: '20px' }}
      >
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="mb-3" style={{ fontSize: '48px' }}>🔐</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--primary-color)' }}>
              Réinitialiser le Mot de Passe
            </h3>
            <p className="text-muted mt-2">Entrez votre nouveau mot de passe</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="alert alert-danger mb-4"
              role="alert"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="alert alert-success mb-4"
              role="alert"
            >
              ✅ Mot de passe réinitialisé! Redirection vers la connexion...
            </motion.div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              {/* Nouveau mot de passe */}
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label" style={{ fontWeight: '600' }}>
                  Nouveau Mot de Passe
                </label>
                <div className="input-group">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    disabled={loading}
                    style={{
                      borderColor: newPassword && newPassword.length >= 8 ? '#28a745' : 'var(--primary-color)',
                      background: 'var(--light-color)'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <small className="text-muted d-block mt-2">
                  Doit contenir: majuscules, minuscules, chiffres et 8+ caractères
                </small>
              </div>

              {/* Confirmer mot de passe */}
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label" style={{ fontWeight: '600' }}>
                  Confirmer le Mot de Passe
                </label>
                <div className="input-group">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez le mot de passe"
                    disabled={loading}
                    style={{
                      borderColor:
                        confirmPassword && newPassword === confirmPassword ? '#28a745' : 'var(--primary-color)',
                      background: 'var(--light-color)'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirm(!showConfirm)}
                    disabled={loading}
                  >
                    {showConfirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Bouton soumettre */}
              <motion.button
                type="submit"
                className="btn btn-lg w-100"
                disabled={loading || !token}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                  fontWeight: '600',
                  border: 'none'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Traitement...
                  </>
                ) : (
                  'Réinitialiser le Mot de Passe'
                )}
              </motion.button>
            </form>
          )}

          {/* Lien retour */}
          {success && (
            <div className="text-center mt-4">
              <p className="text-muted mb-0">
                Vous serez redirigé vers la  <a href="/admin/login" style={{ color: 'var(--primary-color)' }}>connexion</a>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPassword

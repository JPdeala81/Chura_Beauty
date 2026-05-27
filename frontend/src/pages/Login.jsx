import { useState, useContext } from 'react'
import { Modal } from 'react-bootstrap'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { motion } from 'framer-motion'

const Login = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  // Password recovery modal state
  const [showModal, setShowModal] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoveryMsg, setRecoveryMsg] = useState(null)
  const [showQuestion, setShowQuestion] = useState(false)
  const [questionEmail, setQuestionEmail] = useState('')
  const [secretQuestion, setSecretQuestion] = useState('')
  const [secretAnswer, setSecretAnswer] = useState('')
  const [questionStep, setQuestionStep] = useState(1)
  const [questionMsg, setQuestionMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError('Email ou mot de passe incorrect. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // Password recovery handlers
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryMsg(null);
    try {
      await api.post('/auth/forgot-password', { email: recoveryEmail });
      setRecoveryMsg({ type: 'success', text: 'Un email de réinitialisation a été envoyé.' });
    } catch (err) {
      setRecoveryMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'envoi.' });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleGetQuestion = async (e) => {
    e.preventDefault();
    setQuestionMsg(null);
    setQuestionStep(1);
    try {
      const res = await api.get(`/auth/profile?email=${encodeURIComponent(questionEmail)}`);
      if (res.data && res.data.secret_question) {
        setSecretQuestion(res.data.secret_question);
        setQuestionStep(2);
      } else {
        setQuestionMsg({ type: 'error', text: 'Aucune question secrète trouvée pour cet email.' });
      }
    } catch (err) {
      setQuestionMsg({ type: 'error', text: err.response?.data?.message || 'Erreur.' });
    }
  };

  const handleRecoverWithQuestion = async (e) => {
    e.preventDefault();
    setQuestionMsg(null);
    setRecoveryLoading(true);
    try {
      const res = await api.post('/auth/recover-with-question', {
        email: questionEmail,
        secretAnswer
      });
      setQuestionMsg({ type: 'success', text: res.data.message || 'Réponse correcte. Vérifiez votre email.' });
    } catch (err) {
      setQuestionMsg({ type: 'error', text: err.response?.data?.message || 'Réponse incorrecte.' });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      {/* Animated Background Elements */}
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'rgba(255, 215, 0, 0.05)',
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="position-relative"
        style={{ zIndex: 10, width: '100%', maxWidth: '420px', padding: '20px' }}
      >
        {/* Main Card */}
        <motion.div
          variants={itemVariants}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
            padding: '48px 32px'
          }}
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-5"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: '56px', marginBottom: '16px' }}
            >
              👑
            </motion.div>
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              color: '#667eea',
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              Espace Admin
            </h3>
            <p style={{ color: '#999', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Chura Beauty Salon
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
                color: '#fff',
                padding: '14px 16px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <motion.div
              variants={itemVariants}
              className="mb-4"
            >
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                fontSize: '13px',
                color: '#333',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Email
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                className="form-control"
                placeholder="Rentrer votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '14px 16px',
                  background: 'rgba(102, 126, 234, 0.05)',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#333',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              variants={itemVariants}
              className="mb-4"
            >
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                fontSize: '13px',
                color: '#333',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Mot de passe
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: '14px 16px',
                  background: 'rgba(102, 126, 234, 0.05)',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#333',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div
              variants={itemVariants}
              className="mb-4"
              style={{ textAlign: 'left' }}
            >
              <button
                type="button"
                onClick={() => setShowModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0',
                  textDecoration: 'underline'
                }}
              >
                Mot de passe oublié ?
              </button>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Connexion...
                </>
              ) : (
                'Se connecter ✨'
              )}
            </motion.button>
          </form>

          {/* Back to Site */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-5"
          >
            <a href="/" style={{
              color: '#999',
              fontSize: '13px',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#667eea'}
            onMouseLeave={(e) => e.target.style.color = '#999'}
            >
              ← Retour au site
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Modal mot de passe oublié */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setShowQuestion(false); setRecoveryMsg(null); setQuestionMsg(null); setQuestionStep(1); }} centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #e0e0e0' }}>
          <Modal.Title style={{ fontWeight: '700', color: '#333' }}>Récupération du mot de passe</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          {!showQuestion ? (
            <>
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: '#333', marginBottom: '8px' }}>Recevoir un email de réinitialisation</label>
                <form onSubmit={handleForgotPassword}>
                  <input type="email" className="form-control mb-3" placeholder="Votre email" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} required style={{ borderRadius: '8px', padding: '10px 12px' }} />
                  <button type="submit" className="btn w-100" disabled={recoveryLoading} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', fontWeight: '600', padding: '10px', borderRadius: '8px' }}>
                    {recoveryLoading ? 'Envoi...' : 'Envoyer le lien'}
                  </button>
                </form>
                {recoveryMsg && <div className={`alert mt-3 alert-${recoveryMsg.type === 'success' ? 'success' : 'danger'} small`} style={{ borderRadius: '8px' }}>{recoveryMsg.text}</div>}
              </div>
              <div className="text-center my-3">
                <span className="small text-muted">ou</span>
              </div>
              <div className="mb-2">
                <button className="btn btn-link w-100" style={{ color: '#667eea', textDecoration: 'underline', fontWeight: '600' }} onClick={() => setShowQuestion(true)}>
                  Répondre à la question secrète
                </button>
              </div>
            </>
          ) : (
            <>
              {questionStep === 1 && (
                <form onSubmit={handleGetQuestion}>
                  <label className="form-label fw-semibold" style={{ color: '#333', marginBottom: '8px' }}>Votre email</label>
                  <input type="email" className="form-control mb-3" value={questionEmail} onChange={e => setQuestionEmail(e.target.value)} required style={{ borderRadius: '8px', padding: '10px 12px' }} />
                  <button type="submit" className="btn btn-primary w-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', fontWeight: '600', padding: '10px', borderRadius: '8px' }}>Afficher la question</button>
                  {questionMsg && <div className={`alert mt-3 alert-${questionMsg.type === 'success' ? 'success' : 'danger'} small`} style={{ borderRadius: '8px' }}>{questionMsg.text}</div>}
                </form>
              )}
              {questionStep === 2 && (
                <form onSubmit={handleRecoverWithQuestion}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: '#333', marginBottom: '8px' }}>Question secrète</label>
                    <input type="text" className="form-control mb-3" value={secretQuestion} disabled style={{ borderRadius: '8px', padding: '10px 12px', background: '#f5f5f5' }} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: '#333', marginBottom: '8px' }}>Votre réponse</label>
                    <input type="text" className="form-control mb-3" value={secretAnswer} onChange={e => setSecretAnswer(e.target.value)} required style={{ borderRadius: '8px', padding: '10px 12px' }} />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={recoveryLoading} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', fontWeight: '600', padding: '10px', borderRadius: '8px' }}>
                    {recoveryLoading ? 'Vérification...' : 'Valider'}
                  </button>
                  {questionMsg && <div className={`alert mt-3 alert-${questionMsg.type === 'success' ? 'success' : 'danger'} small`} style={{ borderRadius: '8px' }}>{questionMsg.text}</div>}
                </form>
              )}
              <div className="text-center mt-4">
                <button className="btn btn-link small" style={{ color: '#667eea' }} onClick={() => { setShowQuestion(false); setQuestionStep(1); setQuestionMsg(null); }}>
                  ← Retour
                </button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </motion.div>
  )
}

export default Login

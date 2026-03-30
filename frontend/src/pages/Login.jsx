import { useState, useContext } from 'react'
import { Modal } from 'react-bootstrap'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

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
      navigate('/admin/dashboard')
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

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #f8c8d4 0%, #fff9f0 50%, #d4a574 100%)' }}>
      <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '420px', borderRadius: '20px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="mb-3" style={{ fontSize: '48px' }}>💆‍♀️</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#b8860b' }}>
              Espace Admin
            </h3>
            <p className="text-muted small">Chura Beauty Salon</p>
          </div>

          {error && (
            <div className="alert alert-danger rounded-3 small">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted">Email</label>
              <input
                type="email"
                className="form-control rounded-3"
                placeholder="Rentrer votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: '12px 16px' }}
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold small text-muted">Mot de passe</label>
              <input
                type="password"
                className="form-control rounded-3"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: '12px 16px' }}
              />
            </div>
            <div className="mb-2 text-end">
              <button type="button" className="btn btn-link p-0 small" style={{ color: '#b8860b', textDecoration: 'underline' }} onClick={() => setShowModal(true)}>
                Mot de passe oublié ?
              </button>
            </div>
            <button
              type="submit"
              className="btn w-100 fw-bold py-3 rounded-3"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                fontSize: '16px',
                border: 'none',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Connexion...
                </>
              ) : (
                '🔐 Se connecter'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/" className="text-muted small text-decoration-none">
              ← Retour au site
            </a>
          </div>
        </div>
      </div>

      {/* Modal mot de passe oublié */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setShowQuestion(false); setRecoveryMsg(null); setQuestionMsg(null); setQuestionStep(1); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Récupération du mot de passe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!showQuestion ? (
            <>
              <div className="mb-3">
                <label className="form-label">Recevoir un email de réinitialisation</label>
                <form onSubmit={handleForgotPassword}>
                  <input type="email" className="form-control mb-2" placeholder="Votre email" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} required />
                  <button type="submit" className="btn btn-primary w-100" disabled={recoveryLoading} style={{ background: '#b8860b', border: 'none' }}>
                    {recoveryLoading ? 'Envoi...' : 'Envoyer le lien'}
                  </button>
                </form>
                {recoveryMsg && <div className={`alert mt-2 alert-${recoveryMsg.type === 'success' ? 'success' : 'danger'} small`}>{recoveryMsg.text}</div>}
              </div>
              <div className="text-center my-2">
                <span className="small text-muted">ou</span>
              </div>
              <div className="mb-2">
                <button className="btn btn-link w-100" style={{ color: '#b8860b', textDecoration: 'underline' }} onClick={() => setShowQuestion(true)}>
                  Répondre à la question secrète
                </button>
              </div>
            </>
          ) : (
            <>
              {questionStep === 1 && (
                <form onSubmit={handleGetQuestion}>
                  <label className="form-label">Votre email</label>
                  <input type="email" className="form-control mb-2" value={questionEmail} onChange={e => setQuestionEmail(e.target.value)} required />
                  <button type="submit" className="btn btn-primary w-100" style={{ background: '#b8860b', border: 'none' }}>Afficher la question</button>
                  {questionMsg && <div className={`alert mt-2 alert-${questionMsg.type === 'success' ? 'success' : 'danger'} small`}>{questionMsg.text}</div>}
                </form>
              )}
              {questionStep === 2 && (
                <form onSubmit={handleRecoverWithQuestion}>
                  <div className="mb-2">
                    <label className="form-label">Question secrète</label>
                    <input type="text" className="form-control mb-2" value={secretQuestion} disabled />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Votre réponse</label>
                    <input type="text" className="form-control mb-2" value={secretAnswer} onChange={e => setSecretAnswer(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={recoveryLoading} style={{ background: '#b8860b', border: 'none' }}>
                    {recoveryLoading ? 'Vérification...' : 'Valider'}
                  </button>
                  {questionMsg && <div className={`alert mt-2 alert-${questionMsg.type === 'success' ? 'success' : 'danger'} small`}>{questionMsg.text}</div>}
                </form>
              )}
              <div className="text-center mt-3">
                <button className="btn btn-link small" onClick={() => { setShowQuestion(false); setQuestionStep(1); setQuestionMsg(null); }}>
                  ← Retour
                </button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default Login

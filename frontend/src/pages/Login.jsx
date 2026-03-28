import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      // Redirect to home with error message
      navigate('/', { 
        state: { 
          errorMessage: 'Vous ne pouvez pas vous reconnecter, cet espace ne vous est pas réservé' 
        } 
      })
    } finally {
      setLoading(false)
    }
  }

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
    </div>
  )
}

export default Login

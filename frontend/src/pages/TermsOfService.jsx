import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const TermsOfService = () => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTermsOfService()
  }, [])

  const fetchTermsOfService = async () => {
    try {
      const response = await api.get('/site-settings')
      if (response.data?.terms_of_service) {
        setContent(response.data.terms_of_service)
      } else {
        setContent('Conditions d\'utilisation non configurées. Contactez l\'administrateur.')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setContent('Erreur lors du chargement.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'var(--bg-color)',
      color: 'var(--text-color)',
      minHeight: '100vh',
      paddingTop: '80px',
      paddingBottom: '60px'
    }}>
      <div className="container py-5">
        <button
          onClick={() => navigate('/')}
          className="btn btn-outline-primary mb-4"
          style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
        >
          ← Retour à l'accueil
        </button>

        <div className="card" style={{
          background: 'var(--surface)',
          border: '1px solid var(--primary-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '2rem'
        }}>
          <h1 style={{ color: 'var(--primary-color)', marginBottom: '2rem' }}>
            ⚖️ Conditions d'Utilisation
          </h1>

          <div style={{
            lineHeight: '1.8',
            fontSize: '1rem'
          }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                Chargement...
              </p>
            ) : content ? (
              <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {content}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                Conditions d'utilisation non disponibles
              </p>
            )}
          </div>

          <div style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--surface-2)',
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            <p>
              Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
            </p>
            <p>
              En utilisant nos services, vous acceptez ces conditions. Pour toute question, contactez l'administrateur.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService

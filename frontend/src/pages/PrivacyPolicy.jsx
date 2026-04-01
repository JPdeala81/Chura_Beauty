import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const PrivacyPolicy = () => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPrivacyPolicy()
  }, [])

  const fetchPrivacyPolicy = async () => {
    try {
      const response = await api.get('/site-settings')
      if (response.data?.privacy_policy) {
        setContent(response.data.privacy_policy)
      } else {
        setContent('Politique de confidentialité non configurée. Contactez l\'administrateur.')
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
            🔒 Politique de Confidentialité
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
                Politique de confidentialité non disponible
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
              Pour toute question concernant cette politique, contactez-nous via le formulaire de contact ou l'email en footer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy

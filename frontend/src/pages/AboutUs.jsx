import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AboutUs = () => {
  const [content, setContent] = useState('')
  const [salonInfo, setSalonInfo] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [settingsRes, profileRes] = await Promise.allSettled([
        api.get('/site-settings'),
        api.get('/auth/profile')
      ])

      if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.about_content) {
        setContent(settingsRes.value.data.about_content)
      }

      if (profileRes.status === 'fulfilled') {
        setSalonInfo(profileRes.value.data || {})
      }
    } catch (error) {
      console.error('Erreur:', error)
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
            ℹ️ À propos de nous
          </h1>

          <div className="row g-4 mb-4">
            <div className="col-12 col-md-6">
              <div style={{
                background: 'var(--bg-color)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '1.5rem'
              }}>
                <h5 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                  💆‍♀️ {salonInfo.salon_name || 'Chura Beauty Salon'}
                </h5>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.95rem'
                }}>
                  {salonInfo.address && (
                    <p>
                      <strong>📍 Adresse:</strong> {salonInfo.address}
                    </p>
                  )}
                  {salonInfo.phone && (
                    <p>
                      <strong>📞 Téléphone:</strong>{' '}
                      <a href={`tel:${salonInfo.phone}`} style={{ color: 'var(--primary-color)' }}>
                        {salonInfo.phone}
                      </a>
                    </p>
                  )}
                  {salonInfo.whatsapp && (
                    <p>
                      <strong>💬 WhatsApp:</strong>{' '}
                      <a href={`https://wa.me/${salonInfo.whatsapp?.replace(/\s/g, '').replace('+', '')}`}
                        target="_blank" rel="noreferrer"
                        style={{ color: 'var(--primary-color)' }}>
                        {salonInfo.whatsapp}
                      </a>
                    </p>
                  )}
                  {salonInfo.email && (
                    <p>
                      <strong>📧 Email:</strong>{' '}
                      <a href={`mailto:${salonInfo.email}`} style={{ color: 'var(--primary-color)' }}>
                        {salonInfo.email}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div style={{
                background: '(--bg-color)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '1.5rem'
              }}>
                <h5 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                  ✨ Nos Valeurs
                </h5>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  <li>Excellence et professionnalisme dans chaque service</li>
                  <li>Respect et bienveillance envers nos clients</li>
                  <li>Produits de qualité et hygiène irréprochable</li>
                  <li>Innovation et adaptation aux tendances</li>
                  <li>Engagement pour votre satisfaction</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-color)',
            border: '1px solid var(--primary-color)',
            borderRadius: 'var(--border-radius-md)',
            padding: '1.5rem',
            marginTop: '2rem'
          }}>
            <h5 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
              📝 Notre Histoire
            </h5>
            <div style={{
              lineHeight: '1.8',
              fontSize: '0.95rem',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Chargement...</p>
              ) : content ? (
                content
              ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Contenu non configuré. Les administrateurs peuvent ajouter le contenu via le tableau de bord.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs

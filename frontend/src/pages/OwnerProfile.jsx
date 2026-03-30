import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode.react'
import api from '../services/api'

const OwnerProfile = () => {
  const { slug = 'default' } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(\/owner-profile/\\)
        setProfile(res.data)
      } catch (e) {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [slug])

  if (loading) return <div style={{ minHeight: '100vh', background: '#f8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>

  if (!profile) return null

  const particleVariants = {
    animate: {
      y: [0, -20, 0],
      opacity: [0.3, 0.8, 0.3],
      transition: { duration: Math.random() * 3 + 3, repeat: Infinity }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a0f08 0%, #3d2414 50%, #1a0f08 100%)', zIndex: 0 }}>
        {[...Array(15)].map((_, i) => (
          <motion.div key={i}
            variants={particleVariants}
            animate="animate"
            style={{
              position: 'absolute',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: i % 2 === 0 ? 'radial-gradient(circle, rgba(184,134,11,0.1))' : 'radial-gradient(circle, rgba(248,200,212,0.05))',
              left: \\%\,
              top: \\%\
            }}
          />
        ))}
      </div>
      <div style={{ position: 'relative', zIndex: 1, padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '50%', background: 'white', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', marginBottom: '24px' }}>
            <div style={{ fontSize: '80px' }}>{profile.favicon_emoji || '💆‍♀️'}</div>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: '#d4a574', marginBottom: '8px' }}>
            {profile.salon_name}
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#f8c8d4', fontWeight: '500' }}>{profile.owner_name}</p>
          {profile.site_created_at && (
            <p style={{ color: 'rgba(248,200,212,0.6)', fontSize: '13px', marginTop: '8px' }}>
              Plateforme depuis {new Date(profile.site_created_at).toLocaleDateString('fr-FR')}
            </p>
          )}
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{ background: 'white', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#b8860b', marginBottom: '16px' }}>Mon QR Code</h3>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <QRCode value={window.location.origin} size={200} level="H" />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <button style={{ background: '#b8860b', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontWeight: '600' }} onClick={() => alert('Téléchargement du QR Code')}>
                📥 Télécharger
              </button>
              <button style={{ background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigator.clipboard.writeText(window.location.origin)}>
                📋 Copier le lien
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#b8860b', marginBottom: '16px' }}>📞 Nous contacter</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.phone && (
                <a href={\	el:\\} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#2c1810', textDecoration: 'none', padding: '10px', background: 'rgba(184,134,11,0.1)', borderRadius: '8px' }}>
                  <span>📱</span> {profile.phone}
                </a>
              )}
              {profile.whatsapp && (
                <a href={\https://wa.me/\\} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#2c1810', textDecoration: 'none', padding: '10px', background: 'rgba(32,201,151,0.1)', borderRadius: '8px' }}>
                  <span>💬</span> WhatsApp
                </a>
              )}
              {profile.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#2c1810', padding: '10px', background: 'rgba(111,66,193,0.1)', borderRadius: '8px' }}>
                  <span>📍</span> <span>{profile.address}</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#b8860b', marginBottom: '16px' }}>🔗 Réseaux sociaux</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {profile.instagram && (
                <a href={\https://instagram.com/\\} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#e1306c', padding: '8px 12px', background: '#f0f0f0', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                  📸 Instagram
                </a>
              )}
              {profile.facebook && (
                <a href={\https://facebook.com/\\} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1877f2', padding: '8px 12px', background: '#f0f0f0', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                  👍 Facebook
                </a>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', borderTop: '1px solid rgba(248,200,212,0.2)', paddingTop: '24px' }}
        >
          <p style={{ color: 'rgba(248,200,212,0.7)', fontSize: '13px', marginBottom: '8px' }}>
            Plateforme créée par <strong>JP Deal Company</strong>
          </p>
          <p style={{ color: 'rgba(248,200,212,0.5)', fontSize: '12px' }}>
            © {new Date().getFullYear()} - Tous droits réservés
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default OwnerProfile

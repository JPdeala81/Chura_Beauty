import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode.react'
import api from '../../services/api'

const OwnerProfile = () => {
  const { ownerSlug } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOwnerProfile()
  }, [ownerSlug])

  const fetchOwnerProfile = async () => {
    try {
      const res = await api.get(`/owner-profile${ownerSlug ? `/${ownerSlug}` : ''}`)
      setProfile(res.data)
      setError(null)
    } catch (e) {
      setError('Profil non trouvé')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f5f0' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '3rem' }}>
          💆‍♀️
        </motion.div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f5f0' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>😕</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '12px' }}>Profil non trouvé</h2>
          <p style={{ color: '#6c757d' }}>Le salon que vous recherchez n'existe pas ou n'est plus disponible.</p>
        </motion.div>
      </div>
    )
  }

  const siteUrl = window.location.origin
  const profileBgColor = profile.hero_bg_color || '#2c1810'
  const profileTextColor = profile.hero_text_color || '#f8c8d4'

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f0' }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: `linear-gradient(135deg, ${profileBgColor} 0%, ${profileBgColor}dd 100%)`,
          color: profileTextColor,
          padding: '60px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05 }}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0.5, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#fff',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>{profile.favicon_emoji || '💆‍♀️'}</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '12px', fontWeight: '700' }}>
            {profile.salon_name}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', opacity: 0.9, marginBottom: '8px' }}>
            Par {profile.owner_name}
          </p>
          <p style={{ fontSize: '0.95rem', opacity: 0.8 }}>
            ✨ Excellence en beauté depuis {profile.site_created_at ? new Date(profile.site_created_at).getFullYear() : 'toujours'}
          </p>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'start' }}>

          {/* Profil Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: '1px solid rgba(184,134,11,0.1)'
            }}
          >
            {profile.profile_photo ? (
              <img src={profile.profile_photo} alt={profile.owner_name} style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '20px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }} />
            ) : (
              <div style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #b8860b, #d4a574)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }}>
                {profile.favicon_emoji || '👤'}
              </div>
            )}
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', fontSize: '1.6rem', marginBottom: '8px' }}>
              {profile.owner_name}
            </h2>
            <p style={{ color: '#b8860b', fontWeight: '700', marginBottom: '16px', fontSize: '0.95rem' }}>
              Propriétaire - {profile.salon_name}
            </p>
            <p style={{ color: '#6c757d', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
              {profile.bio || 'Passionnée par l\'art de la beauté et du bien-être.'}
            </p>
            {profile.address && (
              <div style={{ background: 'rgba(184,134,11,0.08)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', color: '#6c757d', marginBottom: '16px', lineHeight: '1.6' }}>
                📍 {profile.address}
              </div>
            )}
          </motion.div>

          {/* QR Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: '1px solid rgba(90,204,230,0.2)'
            }}
          >
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '20px', fontSize: '1.2rem' }}>
              📱 Accès Rapide
            </h3>
            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <QRCode value={siteUrl} size={160} level="H" includeMargin={true} />
            </div>
            <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#6c757d' }}>
              Scannez pour accéder au site
            </p>
            <div style={{ marginTop: '20px', display: 'grid', gap: '8px' }}>
              {profile.phone && (
                <a href={`tel:${profile.phone}`} style={{
                  background: 'linear-gradient(135deg, #20c997, #17a2b8)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  display: 'block',
                  transition: 'all 0.3s'
                }}>
                  📞 Appeler: {profile.phone}
                </a>
              )}
              {profile.whatsapp && (
                <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{
                  background: 'linear-gradient(135deg, #25d366, #128c7e)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  display: 'block',
                  transition: 'all 0.3s'
                }}>
                  💬 WhatsApp: {profile.whatsapp}
                </a>
              )}
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: '1px solid rgba(111,66,193,0.1)'
            }}
          >
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '20px', fontSize: '1.2rem' }}>
              📲 Coordonnées
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {profile.phone && (
                <div style={{ padding: '12px', background: 'rgba(111,66,193,0.05)', borderRadius: '10px', fontSize: '0.9rem', color: '#6c757d' }}>
                  <span style={{ fontWeight: '700', color: '#2c1810' }}>Téléphone:</span> {profile.phone}
                </div>
              )}
              {profile.whatsapp && (
                <div style={{ padding: '12px', background: 'rgba(37,211,102,0.05)', borderRadius: '10px', fontSize: '0.9rem', color: '#6c757d' }}>
                  <span style={{ fontWeight: '700', color: '#2c1810' }}>WhatsApp:</span> {profile.whatsapp}
                </div>
              )}
              {profile.address && (
                <div style={{ padding: '12px', background: 'rgba(184,134,11,0.05)', borderRadius: '10px', fontSize: '0.9rem', color: '#6c757d' }}>
                  <span style={{ fontWeight: '700', color: '#2c1810' }}>Adresse:</span> {profile.address}
                </div>
              )}
              <div style={{ padding: '12px', background: 'rgba(90,204,230,0.05)', borderRadius: '10px', fontSize: '0.9rem', color: '#6c757d' }}>
                <span style={{ fontWeight: '700', color: '#2c1810' }}>Site:</span> {siteUrl}
              </div>
            </div>

            {/* Réseaux Sociaux */}
            {(profile.instagram || profile.facebook) && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(184,134,11,0.1)' }}>
                <h6 style={{ color: '#2c1810', marginBottom: '12px', fontWeight: '700' }}>Suivez-nous</h6>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {profile.instagram && (
                    <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{
                      background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      fontSize: '1.1rem',
                      transition: 'transform 0.3s'
                    }}>
                      📷
                    </a>
                  )}
                  {profile.facebook && (
                    <a href={`https://facebook.com/${profile.facebook.replace('@', '')}`} target="_blank" rel="noreferrer" style={{
                      background: '#1877f2',
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      fontSize: '1.1rem',
                      transition: 'transform 0.3s'
                    }}>
                      👍
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Depuis Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            background: 'linear-gradient(135deg, rgba(184,134,11,0.08), rgba(212,165,116,0.04))',
            borderRadius: '20px',
            padding: '32px',
            textAlign: 'center',
            marginTop: '40px',
            border: '1px solid rgba(184,134,11,0.15)'
          }}
        >
          <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '12px', fontSize: '1.3rem' }}>
            💎 Par JP Deal Company
          </h3>
          <p style={{ color: '#6c757d', fontSize: '0.95rem', marginBottom: '16px' }}>
            Plateforme de gestion pour salons de beauté et services d'esthétique
          </p>
          {profile.site_created_at && (
            <p style={{ color: '#b8860b', fontWeight: '600', fontSize: '0.9rem' }}>
              ✨ Site créé le {new Date(profile.site_created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default OwnerProfile

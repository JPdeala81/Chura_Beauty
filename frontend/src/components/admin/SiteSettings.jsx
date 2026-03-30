import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api'

const initialState = {
  salonName: '',
  heroTitle: '',
  heroSubtitle: '',
  bio: '',
  phone: '',
  whatsapp: '',
  address: '',
  instagram: '',
  facebook: '',
  heroBgColor: '#2c1810',
  heroTextColor: '#f8c8d4',
  coverPhoto: '',
  profilePhoto: '',
  favicon_emoji: '💆‍♀️',
  favicon_image: '',
  hero_animation: 'particles',
  hero_cta_text: 'Découvrir maintenant',
  hero_cta2_text: 'Consulter',
  navbar_cta_text: 'Réserver',
  admin_btn_text: 'Bon marché'
}

const animationPresets = [
  { id: 'particles', label: 'Particules', icon: '✨' },
  { id: 'gradient', label: 'Gradient animé', icon: '🌈' },
  { id: 'waves', label: 'Vagues', icon: '~' },
  { id: 'stars', label: 'Étoiles', icon: '⭐' },
  { id: 'bubbles', label: 'Bulles', icon: '🫧' },
  { id: 'geometric', label: 'Géométrique', icon: '🔷' }
]

const emojiPresets = ['💆‍♀️', '💅', '✨', '💄', '👑', '🌸', '💎', '🌺']

const SiteSettings = ({ onUpdate }) => {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [expandSections, setExpandSections] = useState({ animations: true, favicon: false, cta: false })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile')
      if (res.data) {
        setForm(prev => ({
          ...prev,
          salonName: res.data.salon_name || '',
          heroTitle: res.data.hero_title || '',
          heroSubtitle: res.data.hero_subtitle || '',
          bio: res.data.bio || '',
          phone: res.data.phone || '',
          whatsapp: res.data.whatsapp || '',
          address: res.data.address || '',
          instagram: res.data.instagram || '',
          facebook: res.data.facebook || '',
          favicon_emoji: res.data.favicon_emoji || '💆‍♀️',
          favicon_image: res.data.favicon_image || '',
          hero_animation: res.data.hero_animation || 'particles',
          hero_cta_text: res.data.hero_cta_text || 'Découvrir maintenant',
          hero_cta2_text: res.data.hero_cta2_text || 'Consulter',
          navbar_cta_text: res.data.navbar_cta_text || 'Réserver',
          admin_btn_text: res.data.admin_btn_text || 'Bon marché',
          profilePhoto: res.data.profile_photo || ''
        }))
      }
    } catch (e) {}
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      await api.put('/auth/profile', {
        salon_name: form.salonName,
        hero_title: form.heroTitle,
        hero_subtitle: form.heroSubtitle,
        bio: form.bio,
        phone: form.phone,
        whatsapp: form.whatsapp,
        address: form.address,
        instagram: form.instagram,
        facebook: form.facebook,
        favicon_emoji: form.favicon_emoji,
        favicon_image: form.favicon_image,
        hero_animation: form.hero_animation,
        hero_cta_text: form.hero_cta_text,
        hero_cta2_text: form.hero_cta2_text,
        navbar_cta_text: form.navbar_cta_text,
        admin_btn_text: form.admin_btn_text,
        profile_photo: form.profilePhoto
      })
      setMessage({ type: 'success', text: 'Paramètres sauvegardés ✅' })
      if (onUpdate) onUpdate()
      setTimeout(() => setMessage(null), 3000)
    } catch (e) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section) => {
    setExpandSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
      >
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '24px' }}>
          ⚙️ Paramètres du site
        </h2>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}
          >
            {message.text}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Informations de base */}
          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e9ecef' }}>
            <h5 style={{ color: '#b8860b', marginBottom: '16px', fontWeight: '700' }}>📝 Informations de base</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <input type="text" name="salonName" placeholder="Nom du salon" value={form.salonName} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="text" name="heroTitle" placeholder="Titre hero" value={form.heroTitle} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="text" name="heroSubtitle" placeholder="Sous-titre hero" value={form.heroSubtitle} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
            </div>
          </div>

          {/* Animations Hero */}
          <motion.div
            initial={false}
            animate={{ height: expandSections.animations ? 'auto' : 0, opacity: expandSections.animations ? 1 : 0 }}
            style={{ overflow: 'hidden', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e9ecef' }}
          >
            <button
              type="button"
              onClick={() => toggleSection('animations')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                color: '#b8860b',
                fontSize: '16px',
                fontWeight: '700',
                padding: '12px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {expandSections.animations ? '▼' : '▶'} ✨ Animations du hero
            </button>
            <div style={{ paddingTop: '16px' }}>
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>Choisissez l'animation de fond pour votre page d'accueil</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                {animationPresets.map(preset => (
                  <motion.label key={preset.id}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '16px',
                      border: form.hero_animation === preset.id ? '2px solid #b8860b' : '1px solid #ddd',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: form.hero_animation === preset.id ? 'rgba(184, 134, 11, 0.1)' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="hero_animation"
                      value={preset.id}
                      checked={form.hero_animation === preset.id}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: '24px' }}>{preset.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>{preset.label}</span>
                  </motion.label>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Favicon & Icon */}
          <motion.div
            initial={false}
            animate={{ height: expandSections.favicon ? 'auto' : 0, opacity: expandSections.favicon ? 1 : 0 }}
            style={{ overflow: 'hidden', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e9ecef' }}
          >
            <button
              type="button"
              onClick={() => toggleSection('favicon')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                color: '#b8860b',
                fontSize: '16px',
                fontWeight: '700',
                padding: '12px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {expandSections.favicon ? '▼' : '▶'} 🎨 Icône & Favicon
            </button>
            <div style={{ paddingTop: '16px' }}>
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>Sélectionnez l'emoji favicon de votre salon</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {emojiPresets.map(emoji => (
                  <motion.label key={emoji}
                    whileHover={{ scale: 1.1 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      border: form.favicon_emoji === emoji ? '2px solid #b8860b' : '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: form.favicon_emoji === emoji ? 'rgba(184, 134, 11, 0.1)' : 'white',
                      fontSize: '28px'
                    }}
                  >
                    <input
                      type="radio"
                      name="favicon_emoji"
                      value={emoji}
                      checked={form.favicon_emoji === emoji}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                    {emoji}
                  </motion.label>
                ))}
              </div>
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>Ou upload une image favicon (optionnel)</p>
              <input type="file" accept="image/*" onChange={(e) => setForm(prev => ({ ...prev, favicon_image: e.target.files?.[0] || '' }))} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
            </div>
          </motion.div>

          {/* Boutons CTA */}
          <motion.div
            initial={false}
            animate={{ height: expandSections.cta ? 'auto' : 0, opacity: expandSections.cta ? 1 : 0 }}
            style={{ overflow: 'hidden', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e9ecef' }}
          >
            <button
              type="button"
              onClick={() => toggleSection('cta')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                color: '#b8860b',
                fontSize: '16px',
                fontWeight: '700',
                padding: '12px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {expandSections.cta ? '▼' : '▶'} 📢 Textes des boutons CTA
            </button>
            <div style={{ paddingTop: '16px', display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>Bouton principal hero</label>
                <input type="text" name="hero_cta_text" value={form.hero_cta_text} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>Bouton secondaire hero</label>
                <input type="text" name="hero_cta2_text" value={form.hero_cta2_text} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>Bouton navbar RDV</label>
                <input type="text" name="navbar_cta_text" value={form.navbar_cta_text} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>Bouton connexion admin</label>
                <input type="text" name="admin_btn_text" value={form.admin_btn_text} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              </div>
            </div>
          </motion.div>

          {/* Contact & Réseaux */}
          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e9ecef' }}>
            <h5 style={{ color: '#b8860b', marginBottom: '16px', fontWeight: '700' }}>📞 Contact & Réseaux</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <input type="tel" name="phone" placeholder="Téléphone" value={form.phone} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="tel" name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="text" name="address" placeholder="Adresse" value={form.address} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="text" name="instagram" placeholder="Instagram" value={form.instagram} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="text" name="facebook" placeholder="Facebook" value={form.facebook} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setForm(initialState)} style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600' }}>
              Réinitialiser
            </button>
            <button type="submit" disabled={loading} style={{ background: '#b8860b', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: loading ? 0.6 : 1 }}>
              {loading ? '⏳ Sauvegarde...' : '✅ Sauvegarder'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default SiteSettings

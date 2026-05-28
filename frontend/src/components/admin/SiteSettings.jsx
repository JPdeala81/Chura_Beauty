import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api'

const SiteSettings = ({ onUpdate }) => {
  const [form, setForm] = useState({
    app_name: 'Chura Beauty',
    footer_company_name: 'Chura Beauty Salon',
    footer_phone: '+241 00 00 00 00',
    footer_whatsapp: '+241 00 00 00 00',
    footer_address: 'Libreville, Gabon',
    footer_email: 'contact@churabeauty.ga',
    footer_instagram: 'https://instagram.com/churabeauty',
    footer_facebook: 'https://facebook.com/churabeauty',
    homepage_hero_title: 'Bienvenue',
    homepage_hero_subtitle: 'Services de beauté premium',
    tagline: 'Excellence et élégance',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    try {
      setLoading(true)
      await api.put('/site-settings', form)
      setMessage({ type: 'success', text: '✅ Paramètres sauvegardés!' })
      onUpdate?.()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: 'clamp(12px, 1.8vw, 14px)',
    width: '100%',
  }

  const sectionStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: 'clamp(20px, 4vw, 30px)',
    border: '2px solid #f0f0f0',
    marginBottom: 'clamp(20px, 3vw, 30px)',
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: '600',
          }}
        >
          {message.text}
        </motion.div>
      )}

      {/* Branding */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)', fontWeight: '700', color: '#333' }}>
          🎨 Branding
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'clamp(12px, 2vw, 16px)' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Nom de l'application
            </label>
            <input type="text" value={form.app_name} onChange={(e) => setForm({ ...form, app_name: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Slogan
            </label>
            <input type="text" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)', fontWeight: '700', color: '#333' }}>
          🎯 Section Hero
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'clamp(12px, 2vw, 16px)' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Titre Principal
            </label>
            <input type="text" value={form.homepage_hero_title} onChange={(e) => setForm({ ...form, homepage_hero_title: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Sous-titre
            </label>
            <input type="text" value={form.homepage_hero_subtitle} onChange={(e) => setForm({ ...form, homepage_hero_subtitle: e.target.value })} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)', fontWeight: '700', color: '#333' }}>
          🏢 Informations de l'Entreprise
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'clamp(12px, 2vw, 16px)' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Nom de l'Entreprise
            </label>
            <input type="text" value={form.footer_company_name} onChange={(e) => setForm({ ...form, footer_company_name: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Téléphone
            </label>
            <input type="tel" value={form.footer_phone} onChange={(e) => setForm({ ...form, footer_phone: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              WhatsApp
            </label>
            <input type="tel" value={form.footer_whatsapp} onChange={(e) => setForm({ ...form, footer_whatsapp: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Email
            </label>
            <input type="email" value={form.footer_email} onChange={(e) => setForm({ ...form, footer_email: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Adresse
            </label>
            <input type="text" value={form.footer_address} onChange={(e) => setForm({ ...form, footer_address: e.target.value })} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)', fontWeight: '700', color: '#333' }}>
          📱 Réseaux Sociaux
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'clamp(12px, 2vw, 16px)' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Instagram
            </label>
            <input type="url" value={form.footer_instagram} onChange={(e) => setForm({ ...form, footer_instagram: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              Facebook
            </label>
            <input type="url" value={form.footer_facebook} onChange={(e) => setForm({ ...form, footer_facebook: e.target.value })} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={loading}
        style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px)',
          fontWeight: '700',
          cursor: 'pointer',
          fontSize: 'clamp(12px, 1.8vw, 14px)',
          opacity: loading ? 0.7 : 1,
        }}
      >
        💾 Enregistrer Paramètres
      </motion.button>
    </motion.div>
  )
}

export default SiteSettings

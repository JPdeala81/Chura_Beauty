import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import QRCode from 'qrcode.react'
import JsBarcode from 'jsbarcode'
import api from '../../services/api'

const initialState = {
  email: '',
  salonName: '',
  ownerName: '',
  phone: '',
  whatsapp: '',
  address: '',
  bio: '',
  instagram: '',
  facebook: '',
  profilePhoto: ''
}

const ProfileSettings = ({ onUpdate }) => {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const qrRef = useRef()
  const barcodeRef = useRef()

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (barcodeRef.current && form.salonName) {
      try {
        JsBarcode(barcodeRef.current, window.location.origin, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: false
        })
      } catch (e) {}
    }
  }, [form.salonName])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile')
      if (res.data) {
        setForm({
          email: res.data.email || '',
          salonName: res.data.salon_name || '',
          ownerName: res.data.owner_name || '',
          phone: res.data.phone || '',
          whatsapp: res.data.whatsapp || '',
          address: res.data.address || '',
          bio: res.data.bio || '',
          instagram: res.data.instagram || '',
          facebook: res.data.facebook || '',
          profilePhoto: res.data.profile_photo || ''
        })
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
    try {
      await api.put('/auth/profile', form)
      setMessage({ type: 'success', text: 'Profil mis à jour ✅' })
      if (onUpdate) onUpdate()
      setTimeout(() => setMessage(null), 3000)
    } catch (e) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas')
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = \qr-code-\.png\
    link.click()
  }

  const downloadBarcode = () => {
    const svg = barcodeRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svg))
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = url
      link.download = \arcode-\.png\
      link.click()
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
      >
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '24px' }}>
          👤 Mon Profil
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

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '28px' }}>
          {/* Left column - Form */}
          <div>
            <h5 style={{ color: '#b8860b', marginBottom: '18px', fontWeight: '700' }}>Informations personnelles</h5>
            <div style={{ display: 'grid', gap: '16px' }}>
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} disabled style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', background: '#f9f9f9' }} />
              <input type="text" name="salonName" placeholder="Nom du salon" value={form.salonName} onChange={handleChange} required style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="text" name="ownerName" placeholder="Nom du propriétaire" value={form.ownerName} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="tel" name="phone" placeholder="Téléphone" value={form.phone} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="tel" name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="text" name="address" placeholder="Adresse" value={form.address} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <textarea name="bio" placeholder="Biographie" value={form.bio} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', minHeight: '100px', fontFamily: 'Nunito, sans-serif' }} />
              <input type="text" name="instagram" placeholder="Instagram" value={form.instagram} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <input type="text" name="facebook" placeholder="Facebook" value={form.facebook} onChange={handleChange} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
              <button type="submit" disabled={loading} style={{ background: '#b8860b', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳ Sauvegarde...' : '✅ Sauvegarder'}
              </button>
            </div>
          </div>

          {/* Right column - QR & Barcode */}
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* QR Code */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.1) 0%, rgba(212,165,116,0.05) 100%)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(184,134,11,0.2)', textAlign: 'center' }}
            >
              <h6 style={{ color: '#b8860b', marginBottom: '16px', fontWeight: '700' }}>📲 QR Code du salon</h6>
              <div ref={qrRef} style={{ display: 'inline-block', background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <QRCode value={window.location.origin} size={180} level="H" />
              </div>
              <p style={{ color: '#999', fontSize: '12px', marginBottom: '12px', lineHeight: '1.5' }}>
                À imprimer sur vos cartes de visite, réseaux sociaux ou point de vente
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={downloadQR}
                  style={{ flex: 1, background: '#b8860b', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  📥 Télécharger PNG
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(window.location.origin)}
                  style={{ flex: 1, background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  📋 Copier lien
                </button>
              </div>
            </motion.div>

            {/* Barcode */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              style={{ background: 'linear-gradient(135deg, rgba(32,201,151,0.1) 0%, rgba(32,201,151,0.05) 100%)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(32,201,151,0.2)', textAlign: 'center' }}
            >
              <h6 style={{ color: '#20c997', marginBottom: '16px', fontWeight: '700' }}>🏷️ Code-barres</h6>
              <div style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <svg ref={barcodeRef} />
              </div>
              <p style={{ color: '#999', fontSize: '12px', marginBottom: '12px', lineHeight: '1.5' }}>
                Pour vos tickets de caisse et point de vente
              </p>
              <button
                type="button"
                onClick={downloadBarcode}
                style={{ width: '100%', background: '#20c997', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
              >
                📥 Télécharger
              </button>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ProfileSettings

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../services/api'

const Maintenance = () => {
  const [settings, setSettings] = useState({ maintenance_reason: 'Maintenance en cours', maintenance_end: null, salon_name: 'Chura Beauty Salon', site_created_at: new Date() })
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [siteRes, profileRes] = await Promise.allSettled([
          api.get('/site-settings'),
          api.get('/auth/profile')
        ])
        if (siteRes.status === 'fulfilled') setSettings(prev => ({ ...prev, maintenance_reason: siteRes.value.data?.maintenance_reason || prev.maintenance_reason, maintenance_end: siteRes.value.data?.maintenance_end }))
        if (profileRes.status === 'fulfilled') setSettings(prev => ({ ...prev, salon_name: profileRes.value.data?.salon_name || prev.salon_name, site_created_at: profileRes.value.data?.created_at }))
      } catch (e) {}
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (!settings.maintenance_end) return
    const timer = setInterval(() => {
      const end = new Date(settings.maintenance_end)
      const now = new Date()
      const diff = end - now
      if (diff <= 0) { clearInterval(timer); setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); return }
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ hours, minutes, seconds })
    }, 1000)
    return () => clearInterval(timer)
  }, [settings.maintenance_end])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0f08 50%, #0a0a0f 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {[...Array(12)].map((_, i) => (
        <motion.div key={i}
          style={{ position: 'absolute', width: '4px', height: '4px', borderRadius: '50%', background: i % 2 === 0 ? '#b8860b' : '#f8c8d4', left: \\%\, top: \\%\ }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: Math.random() * 3 + 3, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(248,200,212,0.05) 0%, transparent 70%)' }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '600px', width: '100%' }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ fontSize: '5rem', marginBottom: '24px' }}
        >
          🔧
        </motion.div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', background: 'linear-gradient(135deg, #b8860b, #d4a574, #f8c8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>
          {settings.salon_name}
        </h1>
        <div style={{ display: 'inline-block', background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.3)', borderRadius: '50px', padding: '8px 24px', marginBottom: '24px' }}>
          <span style={{ color: '#d4a574', fontWeight: '700', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            🔄 Maintenance en cours
          </span>
        </div>
        <p style={{ color: 'rgba(248,200,212,0.65)', fontSize: 'clamp(14px, 2vw, 17px)', marginBottom: '40px', lineHeight: '1.7', padding: '0 20px' }}>
          {settings.maintenance_reason}
        </p>
        {settings.maintenance_end && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {[
              { value: timeLeft.hours, label: 'Heures' },
              { value: timeLeft.minutes, label: 'Minutes' },
              { value: timeLeft.seconds, label: 'Secondes' }
            ].map(({ value, label }) => (
              <motion.div key={label}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.25)', borderRadius: '16px', padding: '20px 24px', minWidth: '90px', textAlign: 'center' }}
              >
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: '900', background: 'linear-gradient(135deg, #b8860b, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>
                  {String(value).padStart(2, '0')}
                </div>
                <div style={{ color: 'rgba(248,200,212,0.5)', fontSize: '11px', marginTop: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {label}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50px', height: '4px', marginBottom: '32px', overflow: 'hidden' }}>
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg, transparent, #b8860b, #ffd700, transparent)', borderRadius: '50px' }}
          />
        </div>
        <p style={{ color: 'rgba(248,200,212,0.3)', fontSize: '13px', marginBottom: '20px' }}>
          Nous revenons bientôt avec de nouvelles fonctionnalités ✨
        </p>
        <Link to="/admin/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.3)', color: '#d4a574', borderRadius: '50px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.3s', fontFamily: 'Nunito, sans-serif' }}
        >
          🔐 Espace administrateur
        </Link>
      </motion.div>
    </div>
  )
}

export default Maintenance

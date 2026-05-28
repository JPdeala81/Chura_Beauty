import { motion } from 'framer-motion'

const SecuritySettings = () => {
  const securityFeatures = [
    { name: 'HTTPS/TLS 1.3', status: true, icon: '🔒', desc: 'Chiffrement SSL avancé' },
    { name: 'JWT Tokens', status: true, icon: '🔑', desc: 'Authentification sécurisée' },
    { name: 'Row Level Security', status: true, icon: '🛡️', desc: 'Sécurité au niveau des données' },
    { name: 'Rate Limiting', status: true, icon: '⚡', desc: 'Protection contre les attaques' },
    { name: 'Audit Logs', status: true, icon: '📋', desc: 'Suivi des activités' },
    { name: 'Password Encryption', status: true, icon: '🔐', desc: 'Hachage bcrypt' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '24px', fontWeight: '700' }}>
        🔒 Paramètres de Sécurité
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 45vw, 350px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
      }}>
        {securityFeatures.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)' }}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: 'clamp(20px, 3vw, 24px)',
              border: '2px solid #f0f0f0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>{feature.icon}</span>
              <span style={{
                display: 'inline-block',
                background: '#d4edda',
                color: '#155724',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: 'clamp(11px, 1.5vw, 12px)',
                fontWeight: '700',
              }}>
                ✅ Actif
              </span>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#333', fontSize: 'clamp(14px, 2vw, 16px)' }}>
              {feature.name}
            </h3>
            <p style={{ margin: 0, color: '#999', fontSize: 'clamp(12px, 1.8vw, 13px)' }}>
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Security Checklist */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: 'clamp(30px, 5vw, 50px)',
          background: 'white',
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 30px)',
          border: '2px solid #f0f0f0',
        }}
      >
        <h3 style={{ margin: '0 0 20px 0', fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)', fontWeight: '700', color: '#333' }}>
          ✅ Checklist de Sécurité
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            '✅ Connexions HTTPS obligatoires',
            '✅ Sessions avec token JWT',
            '✅ Données chiffrées en transit',
            '✅ Mots de passe hachés (bcrypt)',
            '✅ Authentification à deux facteurs disponible',
            '✅ Logs d\'audit complets',
            '✅ Protection contre les injections SQL',
            '✅ Validation des entrées côté serveur',
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#f9f9f9',
                borderRadius: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: 'clamp(12px, 1.8vw, 14px)',
              }}
            >
              {item}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SecuritySettings

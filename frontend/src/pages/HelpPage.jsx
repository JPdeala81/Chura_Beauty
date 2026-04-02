import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HelpCenter from '../components/payments/HelpCenter'
import SessionRecovery from '../components/payments/SessionRecovery'

export default function HelpPage() {
  const [showSessionRecovery, setShowSessionRecovery] = useState(false)

  return (
    <>
      <Navbar />
      
      <section style={{
        background: 'linear-gradient(135deg, rgba(184,134,11,0.05), rgba(212,168,67,0.05))',
        paddingTop: 'clamp(60px, 10vw, 100px)',
        paddingBottom: 'clamp(40px, 8vw, 80px)'
      }}>
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-5"
          >
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontFamily: 'Playfair Display, serif',
              fontWeight: '700',
              color: 'var(--primary-color)',
              marginBottom: '1rem'
            }}>
              ❓ Centre d'Aide
            </h1>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 18px)',
              color: 'var(--text-muted)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Trouvez les réponses à vos questions sur nos services et nos paiements
            </p>
          </motion.div>

          {/* Quick Access Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '3rem'
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSessionRecovery(false)}
              style={{
                padding: '1rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
            >
              📚 Questions Fréquentes
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSessionRecovery(true)}
              style={{
                padding: '1rem',
                background: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
            >
              🔍 Retrouver Ma Session
            </motion.button>
          </motion.div>

          {/* Main Content */}
          {!showSessionRecovery ? (
            <motion.div
              key="help-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HelpCenter />
            </motion.div>
          ) : (
            <motion.div
              key="session-recovery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <SessionRecovery
                onSessionFound={() => console.log('Session found')}
                onClose={() => setShowSessionRecovery(false)}
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* Additional Info Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'var(--surface)',
          paddingTop: 'clamp(40px, 8vw, 80px)',
          paddingBottom: 'clamp(40px, 8vw, 80px)',
          marginTop: 'clamp(20px, 5vw, 40px)'
        }}
      >
        <div className="container">
          <h3 style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontFamily: 'Playfair Display, serif',
            fontWeight: '700',
            color: 'var(--primary-color)',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            💡 Comment ça marche?
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '📱',
                title: 'Paiement Simple',
                description: 'Scannez un QR Code ou composez un code USSD avec votre téléphone pour payer en quelques secondes.'
              },
              {
                icon: '✅',
                title: 'Vérification Rapide',
                description: 'Envoyez une capture d\'écran de votre paiement pour une vérification instantanée par notre équipe.'
              },
              {
                icon: '🔍',
                title: 'Suivi Transparent',
                description: 'Utilisez votre code de session pour suivre votre paiement à tout moment.'
              },
              {
                icon: '📞',
                title: 'Support Client',
                description: 'Notre équipe est disponible pour répondre à toutes vos questions sur le paiement.'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(184,134,11,0.05), rgba(212,168,67,0.05))',
                  border: '1px solid rgba(184,134,11,0.2)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  fontSize: '40px',
                  marginBottom: '1rem'
                }}>
                  {item.icon}
                </div>
                <h5 style={{
                  color: 'var(--primary-color)',
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>
                  {item.title}
                </h5>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Info Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
          paddingTop: 'clamp(40px, 8vw, 80px)',
          paddingBottom: 'clamp(40px, 8vw, 80px)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <div className="container">
          <h3 style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontFamily: 'Playfair Display, serif',
            fontWeight: '700',
            marginBottom: '2rem'
          }}>
            📞 Besoin d'Aide Directe?
          </h3>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Notre équipe de support est disponible pour vous aider avec vos questions ou préoccupations.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <motion.a
              href="https://wa.me/+241606062200"
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid white',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              💬 WhatsApp
            </motion.a>

            <motion.a
              href="mailto:support@churasalon.com"
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid white',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              📧 Email
            </motion.a>
          </div>
        </div>
      </motion.section>

      <Footer />
    </>
  )
}

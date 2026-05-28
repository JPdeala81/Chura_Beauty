import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useSiteSettings } from '../../contexts/SiteSettingsContext'
import { motion } from 'framer-motion'

const Footer = () => {
  const [isHidden, setIsHidden] = useState(false)
  const siteSettings = useSiteSettings()

  useEffect(() => {
    const hidden = localStorage.getItem('footerHidden') === 'true'
    setIsHidden(hidden)
  }, [])

  const toggleFooter = () => {
    const newState = !isHidden
    setIsHidden(newState)
    localStorage.setItem('footerHidden', newState)
  }

  const adminInfo = {
    salonName: siteSettings.companyName || siteSettings.appName || 'Chura Beauty Salon',
    phone: siteSettings.footerPhone || '+241 00 00 00 00',
    whatsapp: siteSettings.footerWhatsapp || '+241 00 00 00 00',
    address: siteSettings.address || 'Libreville, Gabon',
    instagram: siteSettings.footerInstagram || '',
    facebook: siteSettings.footerFacebook || ''
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.1, rotate: 5 }
  };

  return (
    <>
      {isHidden && (
        <motion.button
          onClick={toggleFooter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 1000,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
            border: 'none',
            color: '#000',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700'
          }}
          title="Afficher le pied de page"
        >
          ↑
        </motion.button>
      )}

      {!isHidden && (
        <footer style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(40, 30, 50, 0.95) 100%)',
          borderTop: '1px solid rgba(255, 215, 0, 0.1)',
          color: '#e0e0e0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Toggle Button */}
          <motion.button
            onClick={toggleFooter}
            whileHover={{ scale: 1.1 }}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 100,
              background: 'rgba(255, 215, 0, 0.2)',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              color: '#ffd700',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700'
            }}
            title="Masquer le pied de page"
          >
            ↓
          </motion.button>
      {/* Animated Background Elements */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />

      <div className="container py-5 position-relative" style={{ zIndex: 1 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="row g-5"
        >
          {/* Brand Section */}
          <motion.div
            variants={itemVariants}
            className="col-lg-4 col-md-6"
          >
            <motion.h5
              style={{
                fontSize: '20px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px'
              }}
            >
              💆‍♀️ {adminInfo.salonName}
            </motion.h5>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.8',
              color: '#b0b0b0',
              marginTop: '16px',
              marginBottom: '20px'
            }}>
              Votre salon de beauté de confiance à Libreville. Nous prenons soin de vous avec passion et professionnalisme.
            </p>

            {/* Social Icons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {adminInfo.instagram && (
                <motion.a
                  href={adminInfo.instagram}
                  target="_blank"
                  rel="noreferrer"
                  variants={iconVariants}
                  whileHover="hover"
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                    borderRadius: '50%',
                    color: '#000',
                    fontSize: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="bi bi-instagram"></i>
                </motion.a>
              )}
              {adminInfo.facebook && (
                <motion.a
                  href={adminInfo.facebook}
                  target="_blank"
                  rel="noreferrer"
                  variants={iconVariants}
                  whileHover="hover"
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    color: '#fff',
                    fontSize: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="bi bi-facebook"></i>
                </motion.a>
              )}
              <motion.a
                href={`https://wa.me/${adminInfo.whatsapp?.replace(/\s/g, '').replace('+', '')}`}
                target="_blank"
                rel="noreferrer"
                variants={iconVariants}
                whileHover="hover"
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #25d366, #34a96b)',
                  borderRadius: '50%',
                  color: '#fff',
                  fontSize: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="bi bi-whatsapp"></i>
              </motion.a>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            variants={itemVariants}
            className="col-lg-3 col-md-6"
          >
            <h6 style={{
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#ffd700',
              marginBottom: '16px'
            }}>
              Nos Services
            </h6>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Coiffure & Tresses', 'Soins du visage', 'Ongles mains & pieds', 'Soins des sourcils', 'Maquillage'].map((service, i) => (
                <motion.li
                  key={i}
                  variants={itemVariants}
                  style={{ marginBottom: '12px' }}
                >
                  <Link
                    to="/services"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#b0b0b0',
                      textDecoration: 'none',
                      fontSize: '13px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffd700';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#b0b0b0';
                    }}
                  >
                    {service}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Information */}
          <motion.div
            variants={itemVariants}
            className="col-lg-2 col-md-6"
          >
            <h6 style={{
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#ffd700',
              marginBottom: '16px'
            }}>
              Informations
            </h6>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { to: '/about-us', label: 'À propos de nous' },
                { to: '/privacy-policy', label: 'Politique de confidentialité' },
                { to: '/terms-of-service', label: 'Conditions d\'utilisation' }
              ].map((item, i) => (
                <motion.li
                  key={i}
                  variants={itemVariants}
                  style={{ marginBottom: '12px' }}
                >
                  <Link
                    to={item.to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#b0b0b0',
                      textDecoration: 'none',
                      fontSize: '13px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffd700';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#b0b0b0';
                    }}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            variants={itemVariants}
            className="col-lg-3 col-md-6"
          >
            <h6 style={{
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#ffd700',
              marginBottom: '16px'
            }}>
              Contact
            </h6>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { icon: 'bi-geo-alt-fill', text: adminInfo.address, href: null },
                { icon: 'bi-telephone-fill', text: adminInfo.phone, href: `tel:${adminInfo.phone}` },
                { icon: 'bi-whatsapp', text: adminInfo.whatsapp, href: `https://wa.me/${adminInfo.whatsapp?.replace(/\s/g, '').replace('+', '')}` }
              ].map((contact, i) => (
                <motion.li
                  key={i}
                  variants={itemVariants}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    fontSize: '13px'
                  }}
                >
                  <i className={`bi ${contact.icon}`} style={{ color: '#ffd700', minWidth: '16px' }}></i>
                  {contact.href ? (
                    <a
                      href={contact.href}
                      target={contact.href.startsWith('http') ? '_blank' : undefined}
                      rel={contact.href.startsWith('http') ? 'noreferrer' : undefined}
                      style={{
                        color: '#b0b0b0',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ffd700'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#b0b0b0'}
                    >
                      {contact.text}
                    </a>
                  ) : (
                    <span style={{ color: '#b0b0b0' }}>{contact.text}</span>
                  )}
                </motion.li>
              ))}
            </ul>
            <motion.div
              whileHover={{ scale: 1.02, x: 4 }}
              style={{ marginTop: '20px' }}
            >
              <Link
                to="/admin/login"
                style={{
                  display: 'inline-block',
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease'
                }}
              >
                👑 Admin
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.hr
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          style={{
            borderColor: 'rgba(255, 215, 0, 0.1)',
            marginTop: '40px',
            marginBottom: '24px'
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="row align-items-center"
        >
          <motion.div
            variants={itemVariants}
            className="col-md-6"
          >
            <p style={{
              marginBottom: '0',
              fontSize: '12px',
              color: '#888',
              letterSpacing: '0.5px'
            }}>
              © {new Date().getFullYear()} {adminInfo.salonName}. Tous droits réservés.
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="col-md-6 text-md-end"
          >
            <p style={{
              marginBottom: '0',
              fontSize: '12px',
              color: '#888',
              letterSpacing: '0.5px'
            }}>
              Fait avec ❤️ à Libreville, Gabon
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
      )}
    </>
  )
}

export default Footer

import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import QRCodeBlock from './QRCodeBlock';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';

export default function ServiceCard({ service, index = 0 }) {
  const { primaryColor = '#ffd700' } = useSiteSettings();
  const mainImage = service.images?.[service.main_image_index] || service.images?.[0] || '/placeholder.jpg';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.1, duration: 0.5, ease: 'easeOut' }
    },
    hover: { y: -8, transition: { duration: 0.3 } }
  };

  const imageOverlayVariants = {
    initial: { opacity: 0 },
    hover: { opacity: 1, transition: { duration: 0.3 } }
  };

  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { delay: index * 0.1 + 0.2, duration: 0.4 }
    },
    hover: { scale: 1.05 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="h-100"
    >
      <Card className="service-card h-100 shadow-lg border-0 overflow-hidden" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Image Container */}
        <div style={{ position: 'relative', height: '280px', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
          <motion.img
            src={mainImage}
            alt={service.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              padding: '0'
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />

          {/* Price Badge Overlay */}
          <motion.div
            variants={imageOverlayVariants}
            initial="initial"
            whileHover="hover"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, rgba(${primaryColor === '#ffd700' ? '255, 215, 0' : '0, 0, 0'}, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{
                background: primaryColor,
                color: primaryColor === '#ffd700' ? '#000' : '#fff',
                padding: '12px 24px',
                borderRadius: '50px',
                fontSize: '20px',
                fontWeight: '700',
                boxShadow: `0 8px 16px rgba(${primaryColor === '#ffd700' ? '255, 215, 0' : '0, 0, 0'}, 0.4)`
              }}
            >
              💰 {service.price} FCFA
            </motion.div>
          </motion.div>
        </div>

        {/* Content */}
        <Card.Body className="d-flex flex-column" style={{ padding: '24px' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.1, duration: 0.4 }}
          >
            <Card.Title style={{
              fontSize: '18px',
              fontWeight: '700',
              background: `linear-gradient(135deg, ${primaryColor}, #ff69b4)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              {service.title}
            </Card.Title>

            <Card.Subtitle style={{
              fontSize: '13px',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '16px',
              fontWeight: '600'
            }}>
              {service.category}
            </Card.Subtitle>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.15, duration: 0.4 }}
            style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.6',
              marginBottom: '16px',
              flex: 1
            }}
          >
            {service.description.substring(0, 100)}...
          </motion.p>

          {/* Duration Badge */}
          <motion.div
            variants={badgeVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.1), rgba(150, 100, 255, 0.1))',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#555',
              width: 'fit-content',
              marginBottom: '16px',
              border: '1px solid rgba(150, 100, 255, 0.2)'
            }}
          >
            <span>⏱️</span>
            <span>{service.duration_minutes || service.duration} min</span>
          </motion.div>

          {/* QR Code Section */}
          <div style={{ marginBottom: '16px' }}>
            <QRCodeBlock service={service} isEnabled={false} />
          </div>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={`/service/${service.id}`}
              style={{ textDecoration: 'none' }}
            >
              <Button
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: `linear-gradient(135deg, ${primaryColor}, #ff69b4)`,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: primaryColor === '#ffd700' ? '#000' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 12px rgba(${primaryColor === '#ffd700' ? '255, 215, 0' : '255, 105, 180'}, 0.3)`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Voir détails & Réserver ✨
              </Button>
            </Link>
          </motion.div>
        </Card.Body>
      </Card>
    </motion.div>
  );
}

import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BookingModal from '../components/public/BookingModal';
import PaymentFlow from '../components/payments/PaymentFlow';
import * as serviceService from '../services/serviceService';
import * as appointmentService from '../services/appointmentService';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, admin } = useContext(AuthContext);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const isAdminOrDev = token && admin && (admin.role === 'admin' || admin.role === 'developer');

  const downloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${service.title}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await serviceService.getServiceById(id);
        setService(response.data.service);
      } catch (error) {
        console.error('Error fetching service:', error);
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '50px',
              height: '50px',
              border: '3px solid rgba(255, 215, 0, 0.2)',
              borderTop: '3px solid #ffd700',
              borderRadius: '50%'
            }}
          />
        </div>
        <Footer />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <h2 style={{ color: '#ffd700', fontFamily: 'Playfair Display, serif', marginBottom: '16px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
              Service non trouvé
            </h2>
            <p style={{ color: '#999', marginBottom: '20px', fontSize: 'clamp(14px, 2vw, 16px)' }}>Désolé, le service n'existe pas.</p>
            <motion.button
              onClick={() => navigate('/services')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ← Retour aux services
            </motion.button>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
        padding: 'clamp(20px, 6vw, 40px) 20px',
        textAlign: 'center'
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
              fontWeight: '700',
              color: '#000',
              margin: '0 0 8px 0'
            }}>
              {service.title}
            </h1>
            <p style={{
              fontSize: 'clamp(12px, 2vw, 14px)',
              color: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              margin: 0
            }}>
              <span style={{ background: 'rgba(0, 0, 0, 0.1)', padding: '6px 12px', borderRadius: '20px' }}>
                {service.category}
              </span>
              <span style={{ background: 'rgba(0, 0, 0, 0.1)', padding: '6px 12px', borderRadius: '20px' }}>
                {service.duration_minutes || service.duration || '-'} min
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Detail Section */}
      <section style={{
        background: '#fafafa',
        padding: 'clamp(20px, 6vw, 40px) 20px'
      }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(16px, 4vw, 32px)',
            alignItems: 'start'
          }}>
            {/* Images Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {service.images && service.images.length > 0 ? (
                <div>
                  <motion.img
                    key={selectedImage}
                    src={service.images[selectedImage]}
                    alt={service.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowImageModal(true)}
                    style={{
                      width: '100%',
                      maxHeight: 'clamp(200px, 50vw, 400px)',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      marginBottom: '12px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      display: 'block'
                    }}
                    whileHover={{ scale: 1.02 }}
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => downloadImage(service.images[selectedImage])}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#ffd700',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: 'clamp(12px, 2vw, 13px)',
                      marginBottom: '12px'
                    }}
                  >
                    ⬇️ Télécharger
                  </motion.button>

                  {service.images.length > 1 && (
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      overflowX: 'auto',
                      paddingBottom: '8px'
                    }}>
                      {service.images.map((img, idx) => (
                        <motion.img
                          key={idx}
                          src={img}
                          alt={`Preview ${idx}`}
                          onClick={() => setSelectedImage(idx)}
                          whileHover={{ scale: 1.1 }}
                          style={{
                            width: 'clamp(60px, 12vw, 80px)',
                            height: 'clamp(60px, 12vw, 80px)',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: selectedImage === idx ? '3px solid #ffd700' : '2px solid #ddd',
                            opacity: selectedImage === idx ? 1 : 0.6,
                            flexShrink: 0
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: 'clamp(200px, 50vw, 400px)',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 237, 74, 0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(2rem, 8vw, 4rem)'
                }}>
                  💅
                </div>
              )}
            </motion.div>

            {/* Details Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Price & Duration Card */}
              <motion.div
                whileHover={{ y: -4 }}
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  padding: 'clamp(16px, 3vw, 20px)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  color: '#000',
                  boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)'
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <div>
                    <p style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', opacity: 0.8, margin: '0 0 4px 0', fontWeight: '600' }}>💰 TARIF</p>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', margin: 0, fontWeight: '700' }}>
                      {service.price?.toLocaleString('fr-FR')} FCFA
                    </h3>
                  </div>
                  <div>
                    <p style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', opacity: 0.8, margin: '0 0 4px 0', fontWeight: '600' }}>⏱️ DURÉE</p>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', margin: 0, fontWeight: '700' }}>
                      {service.duration_minutes || service.duration || '-'} min
                    </h3>
                  </div>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ marginBottom: '20px' }}
              >
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: '#333', marginBottom: '10px' }}>
                  📝 Détails
                </h3>
                <p style={{
                  color: '#666',
                  lineHeight: '1.7',
                  fontSize: 'clamp(13px, 2vw, 15px)',
                  margin: 0
                }}>
                  {service.description}
                </p>
              </motion.div>

              {/* Availability */}
              {service.availability && service.availability.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    borderLeft: '4px solid #ffd700'
                  }}
                >
                  <h4 style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: '#b8860b', fontWeight: '700', marginBottom: '8px', margin: 0 }}>
                    📅 Disponibilités
                  </h4>
                  {service.availability.map((av, idx) => (
                    <p key={idx} style={{ fontSize: 'clamp(12px, 1.8vw, 13px)', color: '#666', margin: '6px 0' }}>
                      <strong>{av.dayOfWeek}:</strong> {av.startTime} - {av.endTime}
                    </p>
                  ))}
                </motion.div>
              )}

              {/* Options */}
              {service.checkboxOptions && service.checkboxOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    background: 'rgba(200, 150, 255, 0.05)',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    borderLeft: '4px solid #9966ff'
                  }}
                >
                  <h4 style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: '#7744cc', fontWeight: '700', margin: '0 0 8px 0' }}>
                    ✨ Options
                  </h4>
                  {service.checkboxOptions.map((option, idx) => (
                    <p key={idx} style={{ fontSize: 'clamp(12px, 1.8vw, 13px)', color: '#666', margin: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ffd700', fontWeight: 'bold' }}>✓</span> {option}
                    </p>
                  ))}
                </motion.div>
              )}

              {/* Admin/Dev Warning */}
              {isAdminOrDev && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 150, 150, 0.1))',
                    border: '2px solid rgba(255, 107, 107, 0.3)',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    marginBottom: '16px'
                  }}
                >
                  <p style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: '#dc3545', fontWeight: '600', margin: 0 }}>
                    👑 Vous êtes administrateur/développeur. Vous devez vous déconnecter pour réserver.
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '10px'
              }}>
                <motion.button
                  whileHover={!isAdminOrDev ? { scale: 1.03 } : {}}
                  whileTap={!isAdminOrDev ? { scale: 0.97 } : {}}
                  onClick={() => !isAdminOrDev && setShowBookingModal(true)}
                  disabled={isAdminOrDev}
                  style={{
                    padding: 'clamp(10px, 2.5vw, 12px)',
                    fontSize: 'clamp(12px, 1.8vw, 14px)',
                    fontWeight: '700',
                    background: isAdminOrDev ? '#ccc' : '#ffd700',
                    color: isAdminOrDev ? '#999' : '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isAdminOrDev ? 'not-allowed' : 'pointer',
                    opacity: isAdminOrDev ? 0.5 : 1
                  }}
                >
                  📅 Réserver
                </motion.button>

                <motion.button
                  whileHover={!isAdminOrDev ? { scale: 1.03 } : {}}
                  whileTap={!isAdminOrDev ? { scale: 0.97 } : {}}
                  onClick={() => !isAdminOrDev && setShowPaymentFlow(true)}
                  disabled={isAdminOrDev}
                  style={{
                    padding: 'clamp(10px, 2.5vw, 12px)',
                    fontSize: 'clamp(12px, 1.8vw, 14px)',
                    fontWeight: '700',
                    background: isAdminOrDev ? '#ccc' : '#667eea',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isAdminOrDev ? 'not-allowed' : 'pointer',
                    opacity: isAdminOrDev ? 0.5 : 1
                  }}
                >
                  💳 Payer
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/services')}
                style={{
                  width: '100%',
                  padding: 'clamp(10px, 2.5vw, 12px)',
                  border: '2px solid #ffd700',
                  background: 'transparent',
                  color: '#ffd700',
                  borderRadius: '8px',
                  fontSize: 'clamp(12px, 1.8vw, 14px)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ← Retour
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {showBookingModal && (
          <BookingModal
            show={showBookingModal}
            onHide={() => setShowBookingModal(false)}
            service={service}
            availableSlots={availableSlots}
          />
        )}
      </AnimatePresence>

      {/* Payment Flow Modal */}
      <AnimatePresence>
        {showPaymentFlow && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                background: '#fff',
                borderRadius: '12px',
                maxHeight: '90vh',
                overflowY: 'auto',
                maxWidth: '550px',
                width: '100%',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
              }}
            >
              <PaymentFlow
                service={service}
                onSuccess={() => {
                  setShowPaymentFlow(false)
                  alert('✅ Paiement réussi!')
                }}
                onCancel={() => setShowPaymentFlow(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: 'none', background: '#f9f9f9' }}>
          <Modal.Title style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>{service?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px' }}>
          {service?.images && service.images[selectedImage] && (
            <img
              src={service.images[selectedImage]}
              alt={service.title}
              style={{
                width: '100%',
                borderRadius: '8px',
                objectFit: 'contain',
                maxHeight: '70vh'
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  );
}

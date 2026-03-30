import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BookingModal from '../components/public/BookingModal';
import * as serviceService from '../services/serviceService';
import * as appointmentService from '../services/appointmentService';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await serviceService.getServiceById(id);
        console.log('📸 Service fetched:', {
          title: response.data.service?.title,
          imagesCount: response.data.service?.images?.length,
          images: response.data.service?.images,
          main_image_index: response.data.service?.main_image_index
        });
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

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    try {
      const response = await appointmentService.getAvailableSlots(id, date);
      setAvailableSlots(response.data.slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-5" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '3px solid rgba(184,134,11,0.2)',
            borderTop: '3px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Navbar />
        <div className="container py-5" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 style={{ color: 'var(--primary-color)', fontFamily: 'Playfair Display, serif', marginBottom: '20px' }}>
              Service non trouvé
            </h2>
            <p className="text-muted mb-4">Désolé, le service que vous recherchez n'existe pas.</p>
            <motion.button
              className="btn-luxury-primary"
              onClick={() => navigate('/services')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retour aux services
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
      <section style={{ background: 'var(--gradient-primary)', padding: '60px 0', minHeight: '40vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '3rem',
              fontWeight: '700',
              color: 'white',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              marginBottom: '10px'
            }}>
              {service.title}
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.9)',
              display: 'flex',
              gap: '15px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px' }}>
                {service.category}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px' }}>
                ({service.duration || '-'} min)
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Detail Section */}
      <section style={{ background: 'white', padding: '60px 0', minHeight: '80vh' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start', marginTop: '30px' }}>
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {service.images && service.images.length > 0 ? (
                <div>
                  <motion.img
                    key={selectedImage}
                    src={service.images[selectedImage]}
                    alt={service.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      height: '400px',
                      marginBottom: '20px',
                      boxShadow: 'var(--shadow-luxury)'
                    }}
                  />
                  {service.images.length > 1 && (
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginTop: '15px' }}>
                      {service.images.map((img, idx) => (
                        <motion.img
                          key={idx}
                          src={img}
                          alt={`Preview ${idx}`}
                          onClick={() => setSelectedImage(idx)}
                          whileHover={{ scale: 1.05 }}
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: selectedImage === idx ? '3px solid var(--primary-color)' : '2px solid transparent',
                            opacity: selectedImage === idx ? 1 : 0.6,
                            transition: 'all 0.3s'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '400px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(184,134,11,0.1), rgba(248,200,212,0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem'
                }}>
                  💅
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div style={{ marginBottom: '30px' }}>
                <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                  Service Premium
                </p>
                <h2 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '2.2rem',
                  fontWeight: '700',
                  color: '#1a0f08',
                  margin: '10px 0'
                }}>
                  {service.title}
                </h2>
              </div>

              {/* Price & Duration */}
              <div style={{
                background: 'var(--gradient-primary)',
                padding: '20px',
                borderRadius: '12px',
                color: 'white',
                marginBottom: '30px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '5px' }}>TARIF</p>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', margin: 0 }}>
                    {service.price?.toLocaleString('fr-FR')} FCFA
                  </h3>
                </div>
                <div>
                  <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '5px' }}>DURÉE</p>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', margin: 0 }}>
                    {service.duration || '-'} min
                  </h3>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#1a0f08', marginBottom: '15px' }}>
                  À propos de ce service
                </h3>
                <p style={{ color: 'rgba(0,0,0,0.7)', lineHeight: '1.8', fontSize: '15px' }}>
                  {service.description}
                </p>
              </div>

              {/* Availability */}
              {service.availability && service.availability.length > 0 && (
                <div style={{ marginBottom: '30px', background: 'rgba(184,134,11,0.1)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--primary-color)', fontFamily: 'Playfair Display, serif', marginBottom: '15px', fontSize: '1.1rem' }}>
                    📅 Disponibilités
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {service.availability.map((av, idx) => (
                      <li key={idx} style={{ paddingBottom: '8px', color: 'rgba(0,0,0,0.7)', fontSize: '14px' }}>
                        <strong>{av.dayOfWeek}:</strong> {av.startTime} - {av.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Options */}
              {service.checkboxOptions && service.checkboxOptions.length > 0 && (
                <div style={{ marginBottom: '30px', background: 'rgba(248,200,212,0.1)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--accent-color)', fontFamily: 'Playfair Display, serif', marginBottom: '15px', fontSize: '1.1rem' }}>
                    ✨ Options disponibles
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {service.checkboxOptions.map((option, idx) => (
                      <li key={idx} style={{ paddingBottom: '8px', color: 'rgba(0,0,0,0.7)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>✓</span> {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Booking Button */}
              <motion.button
                className="btn-luxury-primary"
                onClick={() => setShowBookingModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Réserver ce service 📅
              </motion.button>

              <motion.button
                onClick={() => navigate('/services')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '14px',
                  marginTop: '12px',
                  border: '2px solid var(--primary-color)',
                  background: 'transparent',
                  color: 'var(--primary-color)',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                ← Retour aux services
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Responsive styling */}
        <style>{`
          @media (max-width: 768px) {
            [style*="display: grid, gridTemplateColumns"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {showBookingModal && (
        <BookingModal
          show={showBookingModal}
          onHide={() => setShowBookingModal(false)}
          service={service}
          availableSlots={availableSlots}
        />
      )}

      <Footer />
    </>
  );
}

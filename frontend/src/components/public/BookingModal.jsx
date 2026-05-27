import { useState } from 'react';
import { Modal, Button, Form, Card, Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as appointmentService from '../../services/appointmentService';

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const startHour = String(hour).padStart(2, '0');
      const startMin = String(min).padStart(2, '0');
      const endHour = String(min === 30 ? hour + 1 : hour).padStart(2, '0');
      const endMin = String(min === 30 ? 0 : 30).padStart(2, '0');

      slots.push({
        start: `${startHour}:${startMin}`,
        end: `${endHour}:${endMin}`
      });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function BookingModal({ show, onHide, service, availableSlots = [] }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientWhatsapp: '',
    desiredDate: null,
    desiredTimeSlot: null,
    selectedOptions: [],
    customDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => {
        const options = [...prev.selectedOptions];
        if (checked) {
          options.push(value);
        } else {
          const index = options.indexOf(value);
          if (index > -1) {
            options.splice(index, 1);
          }
        }
        return { ...prev, selectedOptions: options };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      desiredDate: date,
      desiredTimeSlot: null,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const formatDateToLocalString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const appointmentData = {
        service_id: service.id || service._id,
        client_name: formData.clientName,
        client_phone: formData.clientPhone,
        client_email: formData.clientEmail,
        client_whatsapp: formData.clientWhatsapp,
        desired_date: formatDateToLocalString(formData.desiredDate),
        slot_start: formData.desiredTimeSlot?.start,
        slot_end: formData.desiredTimeSlot?.end,
        selected_options: formData.selectedOptions,
        custom_description: formData.customDescription,
      };

      await appointmentService.createAppointment(appointmentData);
      setSuccess('Rendez-vous demandé avec succès !');

      setTimeout(() => {
        resetForm();
        onHide();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientWhatsapp: '',
      desiredDate: null,
      desiredTimeSlot: null,
      selectedOptions: [],
      customDescription: '',
    });
    setError('');
    setSuccess('');
  };

  const canProceedToStep2 = formData.desiredDate && formData.desiredTimeSlot;
  const canProceedToStep3 = true;
  const canProceedToStep4 = formData.clientName && formData.clientPhone && formData.clientEmail && formData.clientWhatsapp;

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  const inputStyle = {
    border: '2px solid rgba(255, 215, 0, 0.15)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static" keyboard={false}>
      <Modal.Header style={{
        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
        border: 'none',
        color: '#000'
      }} closeButton>
        <Modal.Title style={{ fontWeight: '700', fontSize: '18px' }}>
          📅 Réserver: {service?.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '32px', background: '#fafafa' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[1, 2, 3, 4].map((s) => (
              <motion.div
                key={s}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: step >= s ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : '#e0e0e0'
                }}
                animate={{ scaleX: step >= s ? 1 : 0.8 }}
              />
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
            Étape {step} sur 4
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="danger" dismissible onClose={() => setError('')} style={{
              background: 'rgba(220, 53, 69, 0.1)',
              border: '1px solid rgba(220, 53, 69, 0.3)',
              color: '#dc3545',
              marginBottom: '16px'
            }}>
              {error}
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Alert variant="success" dismissible onClose={() => setSuccess('')} style={{
              background: 'rgba(40, 167, 69, 0.1)',
              border: '1px solid rgba(40, 167, 69, 0.3)',
              color: '#28a745',
              marginBottom: '16px'
            }}>
              ✅ {success}
            </Alert>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <h6 style={{ fontWeight: '700', marginBottom: '16px', color: '#333' }}>📅 Choisir date et créneau</h6>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '600', marginBottom: '12px', display: 'block' }}>Date souhaitée</Form.Label>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '2px solid rgba(255, 215, 0, 0.15)'
                }}>
                  <DatePicker
                    selected={formData.desiredDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    inline
                    calendarClassName="custom-calendar"
                  />
                </div>
              </Form.Group>

              {formData.desiredDate && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Form.Group>
                    <Form.Label style={{ fontWeight: '600', marginBottom: '12px', display: 'block' }}>Créneau horaire</Form.Label>
                    <p style={{ fontSize: '13px', color: '#999', marginBottom: '12px' }}>
                      Sélectionnez votre créneau préféré
                    </p>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: '8px',
                      maxHeight: '280px',
                      overflowY: 'auto',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 215, 0, 0.15)'
                    }}>
                      {TIME_SLOTS.map((slot, idx) => (
                        <motion.label
                          key={slot.start}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px',
                            border: formData.desiredTimeSlot?.start === slot.start
                              ? '2px solid #ffd700'
                              : '2px solid rgba(255, 215, 0, 0.1)',
                            borderRadius: '8px',
                            background: formData.desiredTimeSlot?.start === slot.start
                              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 237, 74, 0.1))'
                              : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: formData.desiredTimeSlot?.start === slot.start ? '#b8860b' : '#666'
                          }}
                        >
                          <input
                            type="radio"
                            style={{ display: 'none' }}
                            checked={formData.desiredTimeSlot?.start === slot.start}
                            onChange={() => setFormData((prev) => ({
                              ...prev,
                              desiredTimeSlot: slot,
                            }))}
                          />
                          {slot.start}
                        </motion.label>
                      ))}
                    </div>
                  </Form.Group>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <h6 style={{ fontWeight: '700', marginBottom: '16px', color: '#333' }}>⭐ Options et description</h6>

              {service?.checkboxOptions && service.checkboxOptions.length > 0 && (
                <Form.Group className="mb-4" style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
                  <Form.Label style={{ fontWeight: '600', marginBottom: '12px' }}>Options disponibles</Form.Label>
                  {service.checkboxOptions.map((option) => (
                    <Form.Check
                      key={option}
                      type="checkbox"
                      id={`option-${option}`}
                      label={option}
                      value={option}
                      onChange={handleInputChange}
                      style={{ marginBottom: '8px' }}
                    />
                  ))}
                </Form.Group>
              )}

              <Form.Group style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
                <Form.Label style={{ fontWeight: '600', marginBottom: '12px', display: 'block' }}>Description personnalisée</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="customDescription"
                  value={formData.customDescription}
                  onChange={handleInputChange}
                  placeholder="Informations supplémentaires..."
                  style={inputStyle}
                />
              </Form.Group>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <h6 style={{ fontWeight: '700', marginBottom: '16px', color: '#333' }}>👤 Vos coordonnées</h6>

              <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', fontSize: '13px' }}>Prénom Nom *</Form.Label>
                  <Form.Control
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="Jean Dupont"
                    style={inputStyle}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', fontSize: '13px' }}>Téléphone *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    placeholder="+241 06 XX XX XX"
                    style={inputStyle}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', fontSize: '13px' }}>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    placeholder="jean@exemple.com"
                    style={inputStyle}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', fontSize: '13px' }}>WhatsApp *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="clientWhatsapp"
                    value={formData.clientWhatsapp}
                    onChange={handleInputChange}
                    placeholder="+241 06 XX XX XX"
                    style={inputStyle}
                    required
                  />
                </Form.Group>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <h6 style={{ fontWeight: '700', marginBottom: '16px', color: '#333' }}>✅ Récapitulatif</h6>

              <Card style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 237, 74, 0.05))',
                border: '2px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '12px'
              }}>
                <Card.Body>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.05 }}>
                    <h6 style={{ color: '#b8860b', marginBottom: '16px', fontWeight: '700' }}>📌 {service?.title}</h6>

                    <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#333' }}>
                      <p><strong>📅 Date :</strong> {formData.desiredDate?.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p><strong>🕐 Créneau :</strong> {formData.desiredTimeSlot?.start} - {formData.desiredTimeSlot?.end}</p>
                      <p><strong>👤 Nom :</strong> {formData.clientName}</p>
                      <p><strong>📞 Téléphone :</strong> {formData.clientPhone}</p>
                      <p><strong>📧 Email :</strong> {formData.clientEmail}</p>
                      <p><strong>💬 WhatsApp :</strong> {formData.clientWhatsapp}</p>
                      {formData.customDescription && <p><strong>📝 Description :</strong> {formData.customDescription}</p>}
                    </div>
                  </motion.div>
                </Card.Body>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal.Body>

      <Modal.Footer style={{ background: '#f5f5f5', border: 'none', padding: '16px 32px' }}>
        {step > 1 && (
          <Button
            variant="outline-secondary"
            onClick={() => setStep(step - 1)}
            disabled={loading}
            style={{ borderRadius: '8px' }}
          >
            ← Précédent
          </Button>
        )}

        {step < 4 && (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={
              loading ||
              (step === 1 && !canProceedToStep2) ||
              (step === 2 && !canProceedToStep3) ||
              (step === 3 && !canProceedToStep4)
            }
            style={{
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              border: 'none',
              color: '#000',
              fontWeight: '600',
              borderRadius: '8px'
            }}
          >
            Suivant →
          </Button>
        )}

        {step === 4 && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                border: 'none',
                color: 'white',
                fontWeight: '600',
                borderRadius: '8px',
                padding: '10px 24px'
              }}
            >
              {loading ? '⏳ En cours...' : '✅ Envoyer ma demande'}
            </Button>
          </motion.div>
        )}

        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={loading}
          style={{ borderRadius: '8px' }}
        >
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

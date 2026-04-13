import { useState } from 'react';
import { Modal, Button, Form, Card, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as appointmentService from '../../services/appointmentService';

// Generate time slots (every 30 minutes from 8h to 18h)
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
      desiredTimeSlot: null, // Reset time slot when date changes
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Format date as YYYY-MM-DD (local date, not UTC)
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

      console.log('📝 Submitting appointment:', appointmentData);
      console.log('🔍 Checking submitted data:', {
        has_client_name: appointmentData.client_name ? '✓ YES' : '❌ NO',
        has_client_phone: appointmentData.client_phone ? '✓ YES' : '❌ NO', 
        has_client_email: appointmentData.client_email ? '✓ YES' : '❌ NO',
        has_client_whatsapp: appointmentData.client_whatsapp ? '✓ YES' : '❌ NO',
        actual_values: {
          client_name: appointmentData.client_name,
          client_phone: appointmentData.client_phone,
          client_email: appointmentData.client_email,
          client_whatsapp: appointmentData.client_whatsapp
        }
      });
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

  const canProceedToStep2 =
    formData.desiredDate && formData.desiredTimeSlot;
  const canProceedToStep3 = true;
  const canProceedToStep4 =
    formData.clientName &&
    formData.clientPhone &&
    formData.clientEmail &&
    formData.clientWhatsapp;

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Réserver {service?.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {step === 1 && (
          <div>
            <h6>Étape 1 : Choisir date et créneau</h6>
            <Form.Group className="mb-3">
              <Form.Label>Date souhaitée</Form.Label>
              <DatePicker
                selected={formData.desiredDate}
                onChange={handleDateChange}
                minDate={new Date()}
                inline
              />
            </Form.Group>

            {formData.desiredDate && (
              <Form.Group className="mb-3">
                <Form.Label>Créneau horaire souhaité</Form.Label>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  Sélectionnez votre créneau préféré. L'administrateur confirmera la disponibilité.
                </p>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '10px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: '#f9f9f9'
                }}>
                  {TIME_SLOTS.map((slot) => (
                    <label key={slot.start} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      border: formData.desiredTimeSlot?.start === slot.start 
                        ? '2px solid var(--primary-color)' 
                        : '1px solid #ddd',
                      borderRadius: '6px',
                      background: formData.desiredTimeSlot?.start === slot.start 
                        ? 'rgba(184,134,11,0.1)' 
                        : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '13px',
                      fontWeight: formData.desiredTimeSlot?.start === slot.start ? '600' : '400'
                    }}>
                      <input
                        type="radio"
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                        checked={formData.desiredTimeSlot?.start === slot.start}
                        onChange={() => setFormData((prev) => ({
                          ...prev,
                          desiredTimeSlot: slot,
                        }))}
                      />
                      <span>{slot.start} - {slot.end}</span>
                    </label>
                  ))}
                </div>
              </Form.Group>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h6>Étape 2 : Options et description</h6>

            {service?.checkboxOptions && service.checkboxOptions.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Options</Form.Label>
                {service.checkboxOptions.map((option) => (
                  <Form.Check
                    key={option}
                    type="checkbox"
                    id={`option-${option}`}
                    label={option}
                    value={option}
                    onChange={handleInputChange}
                  />
                ))}
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Description personnalisée</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="customDescription"
                value={formData.customDescription}
                onChange={handleInputChange}
                placeholder="Informations supplémentaires..."
              />
            </Form.Group>
          </div>
        )}

        {step === 3 && (
          <div>
            <h6>Étape 3 : Coordonnées</h6>

            <Form.Group className="mb-3">
              <Form.Label>Prénom Nom</Form.Label>
              <Form.Control
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>WhatsApp</Form.Label>
              <Form.Control
                type="tel"
                name="clientWhatsapp"
                value={formData.clientWhatsapp}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </div>
        )}

        {step === 4 && (
          <div>
            <h6>Étape 4 : Récapitulatif</h6>

            <Card className="mb-3">
              <Card.Body>
                <h6>{service?.title}</h6>
                <p>
                  <strong>Date :</strong>{' '}
                  {formData.desiredDate?.toLocaleDateString('fr-FR')}
                </p>
                <p>
                  <strong>Heure :</strong> {formData.desiredTimeSlot?.start} -{' '}
                  {formData.desiredTimeSlot?.end}
                </p>
                <p>
                  <strong>Nom :</strong> {formData.clientName}
                </p>
                <p>
                  <strong>Téléphone :</strong> {formData.clientPhone}
                </p>
                <p>
                  <strong>Email :</strong> {formData.clientEmail}
                </p>
                <p>
                  <strong>WhatsApp :</strong> {formData.clientWhatsapp}
                </p>
                {formData.customDescription && (
                  <p>
                    <strong>Description :</strong> {formData.customDescription}
                  </p>
                )}
              </Card.Body>
            </Card>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        {step > 1 && (
          <Button
            variant="secondary"
            onClick={() => setStep(step - 1)}
            disabled={loading}
          >
            Précédent
          </Button>
        )}

        {step < 4 && (
          <Button
            variant="primary"
            onClick={() => setStep(step + 1)}
            disabled={
              loading ||
              (step === 1 && !canProceedToStep2) ||
              (step === 2 && !canProceedToStep3) ||
              (step === 3 && !canProceedToStep4)
            }
          >
            Suivant
          </Button>
        )}

        {step === 4 && (
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'En cours...' : '✅ Envoyer ma demande'}
          </Button>
        )}

        <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

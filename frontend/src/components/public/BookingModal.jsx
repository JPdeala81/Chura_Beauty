import { useState } from 'react';
import { Modal, Button, Form, Card, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as appointmentService from '../../services/appointmentService';

export default function BookingModal({ show, onHide, service, availableSlots = [] }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
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
        const options = prev.selectedOptions;
        if (checked) {
          options.push(value);
        } else {
          options.splice(options.indexOf(value), 1);
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
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const appointmentData = {
        serviceId: service._id,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientWhatsapp: formData.clientWhatsapp,
        desiredDate: formData.desiredDate,
        desiredTimeSlot: formData.desiredTimeSlot,
        selectedOptions: formData.selectedOptions,
        customDescription: formData.customDescription,
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
                <Form.Label>Créneau horaire</Form.Label>
                {availableSlots.length > 0 ? (
                  <div>
                    {availableSlots.map((slot) => (
                      <Form.Check
                        key={slot.start}
                        type="radio"
                        id={`slot-${slot.start}`}
                        label={`${slot.start} - ${slot.end}`}
                        name="timeSlot"
                        value={JSON.stringify(slot)}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            desiredTimeSlot: JSON.parse(e.target.value),
                          }))
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <Alert variant="warning">
                    Aucun créneau disponible pour cette date
                  </Alert>
                )}
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

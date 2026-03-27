import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Button, Badge, Alert } from 'react-bootstrap';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import BookingModal from '../components/public/BookingModal';
import * as serviceService from '../services/serviceService';
import * as appointmentService from '../services/appointmentService';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await serviceService.getServiceById(id);
        setService(response.data.service);
      } catch (error) {
        console.error('Error fetching service:', error);
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
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!service) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Service non trouvé.</Alert>
      </Container>
    );
  }

  const galleryImages = service.images.map((image) => ({
    original: image,
    thumbnail: image,
  }));

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          {service.images.length > 0 ? (
            <ImageGallery items={galleryImages} />
          ) : (
            <img
              src="/placeholder.jpg"
              alt={service.title}
              className="img-fluid rounded"
            />
          )}
        </Col>

        <Col md={6}>
          <h1>{service.title}</h1>

          <p className="text-muted mb-3">{service.category}</p>

          <Badge bg="primary" className="me-2 p-2">
            💰 {service.price} FCFA
          </Badge>
          <Badge bg="secondary" className="p-2">
            ⏱️ {service.duration} minutes
          </Badge>

          <p className="mt-4">{service.description}</p>

          {service.availability.length > 0 && (
            <div className="mt-4">
              <h5>Disponibilités</h5>
              <ul>
                {service.availability.map((av, idx) => (
                  <li key={idx}>
                    {av.dayOfWeek} : {av.startTime} - {av.endTime}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {service.checkboxOptions.length > 0 && (
            <div className="mt-4">
              <h5>Options disponibles</h5>
              <ul>
                {service.checkboxOptions.map((option, idx) => (
                  <li key={idx}>{option}</li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="mt-4 w-100"
            onClick={() => setShowBookingModal(true)}
          >
            Réserver ce service
          </Button>
        </Col>
      </Row>

      {showBookingModal && (
        <BookingModal
          show={showBookingModal}
          onHide={() => setShowBookingModal(false)}
          service={service}
          availableSlots={availableSlots}
        />
      )}
    </Container>
  );
}

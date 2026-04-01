import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import QRCodeBlock from './QRCodeBlock';
import QRCodeDisplay from './QRCodeDisplay';

export default function ServiceCard({ service }) {
  const mainImage = service.images?.[service.main_image_index] || service.images?.[0] || '/placeholder.jpg';

  return (
    <Card className="service-card h-100 shadow-sm" style={{ position: 'relative' }}>
      <Card.Img
        variant="top"
        src={mainImage}
        alt={service.title}
        style={{ height: '250px', objectFit: 'contain', backgroundColor: '#f5f5f5', padding: '10px' }}
      />

      {/* QR Code Badge */}
      <QRCodeDisplay serviceId={service.id} serviceName={service.title} />

      <Card.Body className="d-flex flex-column">
        <Card.Title>{service.title}</Card.Title>
        <Card.Subtitle className="mb-3 text-muted">
          {service.category}
        </Card.Subtitle>

        <Card.Text className="flex-grow-1">
          {service.description.substring(0, 100)}...
        </Card.Text>

        <div className="mb-3">
          <span className="badge bg-primary me-2">
            💰 {service.price} FCFA
          </span>
          <span className="badge bg-secondary">
            ⏱️ {service.duration} min
          </span>
        </div>

        <Link
          to={`/service/${service.id}`}
          className="btn btn-custom btn-primary mt-auto"
        >
          Voir détails & Réserver
        </Link>
      </Card.Body>
    </Card>
  );
}

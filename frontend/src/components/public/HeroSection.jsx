import { Container, Row, Col } from 'react-bootstrap';

export default function HeroSection({ admin }) {
  return (
    <div className="hero-section position-relative overflow-hidden">
      {admin?.coverPicture && (
        <img
          src={admin.coverPicture}
          alt="Couverture"
          className="position-absolute w-100 h-100"
          style={{ objectFit: 'cover', zIndex: -1 }}
        />
      )}
      <div className="hero-overlay"></div>

      <Container className="py-5">
        <Row className="align-items-center">
          <Col md={8}>
            <h1 className="display-4 fw-bold text-white mb-3">
              {admin?.salonName || 'Salon de Beauté'}
            </h1>
            <p className="lead text-light mb-4">
              Votre destination beauté, bien-être et détente.
            </p>
          </Col>

          {admin?.profilePicture && (
            <Col md={4} className="text-center">
              <img
                src={admin.profilePicture}
                alt={admin.ownerName}
                className="rounded-circle"
                style={{ width: 150, height: 150, objectFit: 'cover' }}
              />
              <p className="mt-3 text-white">{admin.ownerName}</p>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
}

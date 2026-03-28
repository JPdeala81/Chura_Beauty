import { Container, Row, Col } from 'react-bootstrap';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light mt-5 py-4 footer-custom">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>💆‍♀️ Salon de Beauté</h5>
            <p>Votre destination beauté et relaxation.</p>
          </Col>

          <Col md={4} className="mb-4 mb-md-0">
            <h5>Contact</h5>
            <p>
              📞 +241 666 000 000<br />
              💬 WhatsApp<br />
              📧 contact@salon.com
            </p>
          </Col>

          <Col md={4}>
            <h5>Réseaux sociaux</h5>
            <p>
              <a href="#" className="text-light me-2">
                📘 Facebook
              </a>
              <a href="#" className="text-light">
                📷 Instagram
              </a>
            </p>
          </Col>
        </Row>

        <Row className="mt-3 border-top border-secondary pt-3">
          <Col className="text-center">
            <p>&copy; {year} Salon de Beauté. Tous droits réservés.</p>
            <div className="text-center mt-3">
              <a 
                href="/admin/login" 
                style={{ 
                  color: 'rgba(255,255,255,0.3)', 
                  fontSize: '11px', 
                  textDecoration: 'none' 
                }}
              >
                Espace administrateur
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

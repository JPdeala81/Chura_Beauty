import { Offcanvas, Nav, Nav as BootstrapNav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Sidebar({ show, onHide }) {
  return (
    <Offcanvas show={show} onHide={onHide} placement="start">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Menu Admin</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <Nav className="flex-column">
          <BootstrapNav.Link as={Link} to="/admin/dashboard" onClick={onHide}>
            🏠 Tableau de bord
          </BootstrapNav.Link>
          <BootstrapNav.Link as={Link} to="/admin/services" onClick={onHide}>
            💼 Mes services
          </BootstrapNav.Link>
          <BootstrapNav.Link as={Link} to="/admin/appointments" onClick={onHide}>
            📅 Rendez-vous
          </BootstrapNav.Link>
          <BootstrapNav.Link as={Link} to="/admin/dashboard" onClick={onHide}>
            🔔 Notifications
          </BootstrapNav.Link>
          <BootstrapNav.Link as={Link} to="/admin/revenue" onClick={onHide}>
            📊 Chiffre d'affaires
          </BootstrapNav.Link>
          <BootstrapNav.Link as={Link} to="/admin/settings" onClick={onHide}>
            ⚙️ Paramètres
          </BootstrapNav.Link>
          <BootstrapNav.Link disabled>
            💳 Paiement mobile (🔒 Bientôt)
          </BootstrapNav.Link>
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

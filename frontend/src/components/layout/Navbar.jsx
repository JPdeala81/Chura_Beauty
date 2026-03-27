import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

export default function Navbar() {
  const { isAuthenticated, admin, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar bg="dark" expand="lg" sticky="top" className="navbar-custom">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold">
          💆‍♀️ Salon de Beauté
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              Accueil
            </Nav.Link>
            <Nav.Link as={Link} to="/services">
              Services
            </Nav.Link>

            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/admin/dashboard">
                  Tableau de bord
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/dashboard" className="position-relative">
                  🔔 Notifications
                  {unreadCount > 0 && (
                    <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle">
                      {unreadCount}
                    </Badge>
                  )}
                </Nav.Link>
                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <Nav.Link as={Link} to="/admin/login">
                Connexion Admin
              </Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

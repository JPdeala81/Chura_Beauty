import { useState, useContext } from 'react';
import { Container, Button, Form, Card, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import ProfileSettings from '../../components/admin/ProfileSettings';
import * as authService from '../../services/authService';

export default function Settings() {
  const { admin, updateAdmin, token } = useContext(AuthContext);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleProfileUpdate = async (data) => {
    try {
      setLoading(true);
      await updateAdmin(data);
      setMessage('Profil mis à jour avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Sidebar show={showSidebar} onHide={() => setShowSidebar(false)} />

      <Container fluid className="py-5">
        <Button
          variant="outline-secondary"
          className="d-lg-none mb-3"
          onClick={() => setShowSidebar(true)}
        >
          ☰ Menu
        </Button>

        <h1 className="mb-4">⚙️ Paramètres</h1>

        {message && (
          <Alert
            variant={message.includes('succès') ? 'success' : 'danger'}
            onClose={() => setMessage('')}
            dismissible
          >
            {message}
          </Alert>
        )}

        <ProfileSettings admin={admin} onSave={handleProfileUpdate} />
      </Container>
    </div>
  );
}

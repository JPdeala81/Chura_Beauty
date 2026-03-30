import { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import * as authService from '../../services/authService';

export default function ProfileSettings({ admin, onUpdate }) {
  const [formData, setFormData] = useState({
    email: admin?.email || '',
    salonName: admin?.salon_name || '',
    ownerName: admin?.owner_name || '',
    phone: admin?.phone || '',
    whatsapp: admin?.whatsapp || '',
    address: admin?.address || '',
    bio: admin?.bio || '',
    instagram: admin?.social_links?.instagram || admin?.instagram || '',
    facebook: admin?.social_links?.facebook || admin?.facebook || '',
  });

  // Update form when admin data changes
  useEffect(() => {
    if (admin) {
      setFormData({
        email: admin.email || '',
        salonName: admin.salon_name || '',
        ownerName: admin.owner_name || '',
        phone: admin.phone || '',
        whatsapp: admin.whatsapp || '',
        address: admin.address || '',
        bio: admin.bio || '',
        instagram: admin.social_links?.instagram || admin.instagram || '',
        facebook: admin.social_links?.facebook || admin.facebook || '',
      });
    }
  }, [admin]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email) {
      setError('L\'adresse email est requise');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        email: formData.email,
        salon_name: formData.salonName,
        owner_name: formData.ownerName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        address: formData.address,
        bio: formData.bio,
        instagram: formData.instagram,
        facebook: formData.facebook,
      };
      
      await authService.updateAdmin(updateData);
      setSuccess('Profil mis à jour avec succès !');
      if (onUpdate) {
        setTimeout(() => onUpdate(), 500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await authService.updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        token
      );
      setSuccess('Mot de passe modifié avec succès !');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <Alert variant="danger" style={{ borderRadius: '12px' }}>{error}</Alert>}
      {success && <Alert variant="success" style={{ borderRadius: '12px' }}>{success}</Alert>}

      <Card className="admin-settings-card mb-4">
        <Card.Header>
          <div className="admin-settings-title">
            👤 Profil du salon
          </div>
        </Card.Header>
        <Card.Body>
          {!formData.whatsapp && (
            <Alert variant="warning" style={{ borderRadius: '10px', marginBottom: '20px' }}>
              <strong>⚠️ Important :</strong> Configurez votre numéro WhatsApp pour recevoir les demandes de réservation en temps réel !
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            {/* Email */}
            <Form.Group className="mb-4">
              <Form.Label className="form-label-luxury">
                📧 Email *
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-control-luxury"
                placeholder="admin@salon.com"
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
              <small style={{ color: '#6c757d', marginTop: '6px', display: 'block' }}>
                Utilisé pour les notifications et la récupération de compte
              </small>
            </Form.Group>

            {/* Nom du salon */}
            <Form.Group className="mb-4">
              <Form.Label className="form-label-luxury">
                💆‍♀️ Nom du salon
              </Form.Label>
              <Form.Control
                type="text"
                name="salonName"
                value={formData.salonName}
                onChange={handleChange}
                className="form-control-luxury"
                placeholder="Chura Beauty"
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
            </Form.Group>

            {/* Nom du propriétaire */}
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
                👤 Nom du propriétaire
              </Form.Label>
              <Form.Control
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className="form-control-luxury"
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
            </Form.Group>

            {/* Contact Information */}
            <div style={{ backgroundColor: 'rgba(184,134,11,0.03)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(184,134,11,0.1)' }}>
              <h5 style={{ marginBottom: '16px', fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
                📞 Coordonnées
              </h5>
              
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '13px' }}>
                  ☎️ Téléphone
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control-luxury"
                  placeholder="+226 XX XX XXXX"
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '13px' }}>
                  💬 WhatsApp
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="form-control-luxury"
                  placeholder="+226 XX XX XXXX"
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
              </Form.Group>

              <Form.Group className="mb-0">
                <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '13px' }}>
                  📍 Adresse
                </Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control-luxury"
                  placeholder="Votre adresse complète"
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
              </Form.Group>
            </div>

            {/* Biographie */}
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
                ✒️ Biographie
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-control-luxury"
                placeholder="Présentez votre salon et vos services..."
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
            </Form.Group>

            {/* Social Links */}
            <div style={{ backgroundColor: 'rgba(212,165,116,0.03)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(212,165,116,0.1)' }}>
              <h5 style={{ marginBottom: '16px', fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
                📱 Réseaux sociaux
              </h5>
              
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '13px' }}>
                  📸 Instagram
                </Form.Label>
                <Form.Control
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="form-control-luxury"
                  placeholder="@votre_compte"
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
              </Form.Group>

              <Form.Group className="mb-0">
                <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '13px' }}>
                  👍 Facebook
                </Form.Label>
                <Form.Control
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="form-control-luxury"
                  placeholder="Votre page Facebook"
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
              </Form.Group>
            </div>

            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
              style={{ 
                borderRadius: '10px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #b8860b, #d4a574)',
                border: 'none',
                padding: '11px 24px'
              }}
            >
              {loading ? '⏳ Enregistrement...' : '✓ Enregistrer les modifications'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card style={{ borderRadius: '16px', border: '1px solid rgba(184,134,11,0.1)' }}>
        <Card.Header style={{ 
          background: 'linear-gradient(135deg, rgba(220,53,69,0.08), rgba(255,107,107,0.08))',
          borderBottom: '1px solid rgba(220,53,69,0.1)',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#c82333', fontFamily: 'Playfair Display, serif' }}>
            🔐 Modifier le mot de passe
          </div>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
                🔑 Mot de passe actuel
              </Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="form-control-luxury"
                required
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
                ✨ Nouveau mot de passe
              </Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="form-control-luxury"
                required
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
              <small style={{ color: '#6c757d', marginTop: '6px', display: 'block' }}>
                💡 Minimum 8 caractères, avec majuscule et chiffre
              </small>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
                ✓ Confirmer le mot de passe
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="form-control-luxury"
                required
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
            </Form.Group>

            <Button 
              variant="danger" 
              type="submit" 
              disabled={loading}
              style={{ 
                borderRadius: '10px',
                fontWeight: '700',
                padding: '11px 24px'
              }}
            >
              {loading ? '⏳ Modification...' : '🔄 Modifier le mot de passe'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}


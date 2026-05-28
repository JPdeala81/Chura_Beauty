import { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useFormValidation } from '../../hooks/useFormValidation';
import { sanitizeObject } from '../../utils/dataSanitization';
import * as authService from '../../services/authService';

export default function ProfileSettings({ admin, onUpdate }) {
  const [success, setSuccess] = useState('');

  const form = useFormValidation(
    {
      email: admin?.email || '',
      salonName: admin?.salon_name || '',
      ownerName: admin?.owner_name || '',
      phone: admin?.phone || '',
      whatsapp: admin?.whatsapp || '',
      address: admin?.address || '',
      bio: admin?.bio || '',
      instagram: admin?.social_links?.instagram || admin?.instagram || '',
      facebook: admin?.social_links?.facebook || admin?.facebook || '',
    },
    {
      email: [
        (v) => v ? '' : 'Email requis',
        (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Email invalide',
      ],
      salonName: [
        (v) => v ? '' : 'Nom du salon requis',
        (v) => v?.length >= 2 ? '' : 'Minimum 2 caractères',
      ],
      ownerName: [
        (v) => v ? '' : 'Nom du propriétaire requis',
        (v) => v?.length >= 2 ? '' : 'Minimum 2 caractères',
      ],
      phone: [
        (v) => v ? '' : 'Téléphone requis',
        (v) => /^[+]?[\d\s\-()]{7,}$/.test(v?.replace(/\s/g, '')) ? '' : 'Format invalide',
      ],
      whatsapp: [
        (v) => v ? '' : 'WhatsApp requis',
        (v) => /^[+]?[\d\s\-()]{7,}$/.test(v?.replace(/\s/g, '')) ? '' : 'Format invalide',
      ],
      address: (v) => v ? '' : 'Adresse requise',
      instagram: (v) => v ? '' : 'Instagram requis',
      facebook: (v) => v ? '' : 'Facebook requis',
    }
  );

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  // Update form when admin data changes
  useEffect(() => {
    if (admin) {
      form.setFieldValue('email', admin.email || '');
      form.setFieldValue('salonName', admin.salon_name || '');
      form.setFieldValue('ownerName', admin.owner_name || '');
      form.setFieldValue('phone', admin.phone || '');
      form.setFieldValue('whatsapp', admin.whatsapp || '');
      form.setFieldValue('address', admin.address || '');
      form.setFieldValue('bio', admin.bio || '');
      form.setFieldValue('instagram', admin.social_links?.instagram || admin?.instagram || '');
      form.setFieldValue('facebook', admin.social_links?.facebook || admin?.facebook || '');
    }
  }, [admin]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordErrors({});
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setSuccess('');
    try {
      // Sanitize all user inputs
      const sanitizedValues = sanitizeObject({
        email: values.email,
        salonName: values.salonName,
        ownerName: values.ownerName,
        phone: values.phone,
        whatsapp: values.whatsapp,
        address: values.address,
        bio: values.bio,
        instagram: values.instagram,
        facebook: values.facebook,
      });

      const updateData = {
        email: sanitizedValues.email,
        salon_name: sanitizedValues.salonName,
        owner_name: sanitizedValues.ownerName,
        phone: sanitizedValues.phone,
        whatsapp: sanitizedValues.whatsapp,
        address: sanitizedValues.address,
        bio: sanitizedValues.bio,
        instagram: sanitizedValues.instagram,
        facebook: sanitizedValues.facebook,
      };

      await authService.updateAdmin(updateData);
      setSuccess('Profil mis à jour avec succès !');
      if (onUpdate) {
        setTimeout(() => onUpdate(), 500);
      }
    } catch (err) {
      form.setFieldError('_form', err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setPasswordErrors({});

    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Mot de passe actuel requis';
    if (!passwordForm.newPassword) errors.newPassword = 'Nouveau mot de passe requis';
    if (passwordForm.newPassword && passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Minimum 8 caractères';
    }
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      errors.newPassword = (errors.newPassword || '') + ' + majuscule requise';
    }
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      errors.newPassword = (errors.newPassword || '') + ' + chiffre requis';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
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
      setPasswordErrors({ _form: err.response?.data?.message || 'Erreur' });
    }
  };

  return (
    <div>
      {form.errors._form && <Alert variant="danger" style={{ borderRadius: '12px' }}>{form.errors._form}</Alert>}
      {success && <Alert variant="success" style={{ borderRadius: '12px' }}>{success}</Alert>}

      <Card className="admin-settings-card mb-4">
        <Card.Header>
          <div className="admin-settings-title">
            👤 Profil du salon
          </div>
        </Card.Header>
        <Card.Body>
          {!form.values.whatsapp && (
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
                value={form.values.email}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                isInvalid={form.touched.email && !!form.errors.email}
                className="form-control-luxury"
                placeholder="admin@salon.com"
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
              {form.touched.email && form.errors.email && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                  {form.errors.email}
                </Form.Control.Feedback>
              )}
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
                value={form.values.salonName}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                isInvalid={form.touched.salonName && !!form.errors.salonName}
                className="form-control-luxury"
                placeholder="Chura Beauty"
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
              {form.touched.salonName && form.errors.salonName && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                  {form.errors.salonName}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* Nom du propriétaire */}
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
                👤 Nom du propriétaire
              </Form.Label>
              <Form.Control
                type="text"
                name="ownerName"
                value={form.values.ownerName}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                isInvalid={form.touched.ownerName && !!form.errors.ownerName}
                className="form-control-luxury"
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
              {form.touched.ownerName && form.errors.ownerName && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                  {form.errors.ownerName}
                </Form.Control.Feedback>
              )}
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
                  value={form.values.phone}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  isInvalid={form.touched.phone && !!form.errors.phone}
                  className="form-control-luxury"
                  placeholder="+226 XX XX XXXX"
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
                {form.touched.phone && form.errors.phone && (
                  <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                    {form.errors.phone}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '13px' }}>
                  💬 WhatsApp
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="whatsapp"
                  value={form.values.whatsapp}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  isInvalid={form.touched.whatsapp && !!form.errors.whatsapp}
                  className="form-control-luxury"
                  placeholder="+226 XX XX XXXX"
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
                {form.touched.whatsapp && form.errors.whatsapp && (
                  <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                    {form.errors.whatsapp}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Form.Group className="mb-0">
                <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '13px' }}>
                  📍 Adresse
                </Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={form.values.address}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  isInvalid={form.touched.address && !!form.errors.address}
                  className="form-control-luxury"
                  placeholder="Votre adresse complète"
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
                {form.touched.address && form.errors.address && (
                  <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                    {form.errors.address}
                  </Form.Control.Feedback>
                )}
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
                value={form.values.bio}
                onChange={form.handleChange}
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
                  value={form.values.instagram}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  isInvalid={form.touched.instagram && !!form.errors.instagram}
                  className="form-control-luxury"
                  placeholder="@votre_compte"
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
                {form.touched.instagram && form.errors.instagram && (
                  <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                    {form.errors.instagram}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Form.Group className="mb-0">
                <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '13px' }}>
                  👍 Facebook
                </Form.Label>
                <Form.Control
                  type="text"
                  name="facebook"
                  value={form.values.facebook}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  isInvalid={form.touched.facebook && !!form.errors.facebook}
                  className="form-control-luxury"
                  placeholder="Votre page Facebook"
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
                {form.touched.facebook && form.errors.facebook && (
                  <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                    {form.errors.facebook}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </div>

            <Button
              variant="primary"
              type="submit"
              disabled={form.isSubmitting}
              style={{
                borderRadius: '10px',
                fontWeight: '700',
                background: 'var(--gradient-primary)',
                border: 'none',
                padding: '11px 24px'
              }}
            >
              {form.isSubmitting ? '⏳ Enregistrement...' : '✓ Enregistrer les modifications'}
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
          {passwordErrors._form && <Alert variant="danger" style={{ borderRadius: '12px' }}>{passwordErrors._form}</Alert>}
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
                isInvalid={!!passwordErrors.currentPassword}
                className="form-control-luxury"
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
              {passwordErrors.currentPassword && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                  {passwordErrors.currentPassword}
                </Form.Control.Feedback>
              )}
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
                isInvalid={!!passwordErrors.newPassword}
                className="form-control-luxury"
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
              {passwordErrors.newPassword && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                  {passwordErrors.newPassword}
                </Form.Control.Feedback>
              )}
              <small style={{ color: '#6c757d', marginTop: '6px', display: 'block' }}>
                💡 Minimum 8 caractères, majuscule, minuscule, chiffre
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
                isInvalid={!!passwordErrors.confirmPassword}
                className="form-control-luxury"
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              />
              {passwordErrors.confirmPassword && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                  {passwordErrors.confirmPassword}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Button
              variant="danger"
              type="submit"
              style={{
                borderRadius: '10px',
                fontWeight: '700',
                padding: '11px 24px'
              }}
            >
              🔄 Modifier le mot de passe
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}


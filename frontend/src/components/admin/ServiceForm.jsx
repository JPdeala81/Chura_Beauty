import { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import * as serviceService from '../../services/serviceService';
import { useFormValidation, validators } from '../../hooks/useFormValidation';

export default function ServiceForm({ service, onClose }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [durationMode, setDurationMode] = useState('minutes');
  const [images, setImages] = useState([]);
  const [success, setSuccess] = useState('');

  const form = useFormValidation(
    {
      title: service?.title || '',
      description: service?.description || '',
      category: service?.category || '',
      price: service?.price || '',
      duration: service?.duration || '',
      displayStyle: service?.displayStyle || 'card',
      checkboxOptions: service?.checkboxOptions?.join(',') || '',
    },
    {
      title: [
        (v) => validators.required(v, 'Titre requis'),
        (v) => validators.minLength(3)(v, 'Minimum 3 caractères'),
        (v) => validators.maxLength(100)(v, 'Maximum 100 caractères'),
      ],
      description: [
        (v) => validators.required(v, 'Description requise'),
        (v) => validators.minLength(10)(v, 'Minimum 10 caractères'),
        (v) => validators.maxLength(500)(v, 'Maximum 500 caractères'),
      ],
      category: (v) => validators.required(v, 'Catégorie requise'),
      price: [
        (v) => validators.required(v, 'Prix requis'),
        (v) => validators.positiveNumber(v, 'Le prix doit être positif'),
        (v) => validators.minNumber(100)(v, 'Minimum 100 FCFA'),
      ],
      duration: [
        (v) => validators.required(v, 'Durée requise'),
        (v) => validators.positiveNumber(v, 'La durée doit être positive'),
      ],
    }
  );

  useEffect(() => {
    // Fetch existing categories
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await serviceService.getAllServices();
      const cats = [...new Set(response.data.services?.map(s => s.category).filter(Boolean))];
      setCategories(cats.sort());
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    form.setFieldValue(name, value);
    if (form.touched[name]) {
      const error = form.validateField(name, value);
      form.setFieldError(name, error);
    }
  };

  const handleDurationChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    let minutes = value;

    if (durationMode === 'hours') {
      minutes = value * 60;
    } else if (durationMode === 'seconds') {
      minutes = Math.round(value / 60);
    }

    form.setFieldValue('duration', minutes || '');
    if (form.touched.duration) {
      const error = form.validateField('duration', minutes);
      form.setFieldError('duration', error);
    }
  };

  const convertDurationDisplay = () => {
    const dur = parseFloat(form.values.duration) || 0;
    if (durationMode === 'hours') {
      return (dur / 60).toFixed(1);
    } else if (durationMode === 'seconds') {
      return Math.round(dur * 60);
    }
    return dur;
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory].sort());
      form.setFieldValue('category', newCategory);
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setSuccess('');

    try {
      const data = new FormData();
      const fieldMap = {
        'title': 'title',
        'description': 'description',
        'category': 'category',
        'price': 'price',
        'duration': 'duration',
        'displayStyle': 'display_style',
        'checkboxOptions': 'checkbox_options'
      };

      Object.keys(values).forEach((key) => {
        const backendKey = fieldMap[key] || key;
        if (key === 'checkboxOptions') {
          const options = values[key].split(',').filter(Boolean).map(o => o.trim());
          data.append(backendKey, JSON.stringify(options));
        } else {
          data.append(backendKey, values[key]);
        }
      });

      images.forEach((image) => {
        data.append('images', image);
      });

      if (service) {
        await serviceService.updateService(service.id || service._id, data);
        setSuccess('Service mis à jour !');
      } else {
        await serviceService.createService(data);
        setSuccess('Service créé !');
      }

      form.resetForm();
      setImages([]);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de l\'enregistrement';
      form.setFieldError('_form', errorMsg);
    }
  });

  return (
    <Card className="mb-4" style={{ borderRadius: '16px', border: '1px solid rgba(184,134,11,0.1)' }}>
      <Card.Header style={{ 
        background: 'linear-gradient(135deg, rgba(184,134,11,0.08), rgba(212,165,116,0.08))',
        borderBottom: '1px solid rgba(184,134,11,0.1)',
        borderRadius: '16px 16px 0 0'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a0f08', fontFamily: 'Playfair Display, serif' }}>
          {service ? '✏️ Modifier le service' : '➕ Ajouter un service'}
        </div>
      </Card.Header>

      <Card.Body>
        {form.errors._form && <Alert variant="danger" style={{ borderRadius: '12px' }}>{form.errors._form}</Alert>}
        {success && <Alert variant="success" style={{ borderRadius: '12px' }}>{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Titre */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
              🎨 Titre du service *
            </Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={form.values.title}
              onChange={handleFieldChange}
              onBlur={form.handleBlur}
              isInvalid={form.touched.title && !!form.errors.title}
              placeholder="Ex: Coloration complète"
              style={{ borderRadius: '10px', padding: '12px 16px' }}
            />
            {form.touched.title && form.errors.title && (
              <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                {form.errors.title}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
              📝 Description *
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.values.description}
              onChange={handleFieldChange}
              onBlur={form.handleBlur}
              isInvalid={form.touched.description && !!form.errors.description}
              placeholder="Décrivez votre service..."
              style={{ borderRadius: '10px', padding: '12px 16px' }}
            />
            {form.touched.description && form.errors.description && (
              <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                {form.errors.description}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {/* Catégorie */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px', marginBottom: '10px' }}>
              🏷️ Catégorie *
            </Form.Label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <Form.Select
                name="category"
                value={form.values.category}
                onChange={handleFieldChange}
                onBlur={form.handleBlur}
                isInvalid={form.touched.category && !!form.errors.category}
                style={{ borderRadius: '10px', padding: '12px 16px' }}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
              <Button
                variant="outline-primary"
                onClick={() => setShowNewCategory(!showNewCategory)}
                style={{ borderRadius: '10px', fontWeight: '700', whiteSpace: 'nowrap' }}
              >
                + Nouvelle
              </Button>
            </div>
            {form.touched.category && form.errors.category && (
              <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                {form.errors.category}
              </Form.Control.Feedback>
            )}

            {showNewCategory && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <Form.Control
                  type="text"
                  placeholder="Nom de la catégorie"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
                <Button
                  variant="success"
                  onClick={handleAddCategory}
                  style={{ borderRadius: '10px', fontWeight: '700', whiteSpace: 'nowrap' }}
                >
                  ✓ Ajouter
                </Button>
              </div>
            )}
          </Form.Group>

          {/* Prix */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
              💰 Prix (FCFA) *
            </Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={form.values.price}
              onChange={handleFieldChange}
              onBlur={form.handleBlur}
              isInvalid={form.touched.price && !!form.errors.price}
              placeholder="0"
              min="0"
              step="100"
              style={{ borderRadius: '10px', padding: '12px 16px' }}
            />
            {form.touched.price && form.errors.price && (
              <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                {form.errors.price}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {/* Durée */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px', marginBottom: '10px' }}>
              ⏱️ Durée du service *
            </Form.Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <Form.Control
                  type="number"
                  value={convertDurationDisplay()}
                  onChange={handleDurationChange}
                  onBlur={form.handleBlur}
                  isInvalid={form.touched.duration && !!form.errors.duration}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  style={{ borderRadius: '10px', padding: '12px 16px' }}
                />
              </div>
              <Form.Select
                value={durationMode}
                onChange={(e) => setDurationMode(e.target.value)}
                style={{
                  borderRadius: '10px',
                  padding: '12px 16px',
                  border: '2px solid rgba(184,134,11,0.15)',
                  fontWeight: '600',
                  minWidth: '120px'
                }}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Heures</option>
                <option value="seconds">Secondes</option>
              </Form.Select>
            </div>
            {form.touched.duration && form.errors.duration && (
              <Form.Control.Feedback type="invalid" style={{ display: 'block', marginTop: '6px' }}>
                {form.errors.duration}
              </Form.Control.Feedback>
            )}
            <small style={{ color: '#6c757d', marginTop: '6px', display: 'block' }}>
              💡 Stocké en minutes ({Math.round(form.values.duration)} min)
            </small>
          </Form.Group>

          {/* Style affichage */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
              🎯 Style d'affichage
            </Form.Label>
            <Form.Select
              name="displayStyle"
              value={form.values.displayStyle}
              onChange={handleFieldChange}
              style={{ borderRadius: '10px', padding: '12px 16px', border: '2px solid rgba(184,134,11,0.15)' }}
            >
              <option value="card">Carte standard</option>
              <option value="full-width">Largeur complète</option>
              <option value="featured">En vedette</option>
            </Form.Select>
          </Form.Group>

          {/* Images */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
              🖼️ Images
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={handleImageChange}
              accept="image/*"
              style={{ borderRadius: '10px', padding: '12px 16px', border: '2px solid rgba(184,134,11,0.15)' }}
            />
            {images.length > 0 && (
              <small style={{ color: '#28a745', marginTop: '6px', display: 'block', fontWeight: '600' }}>
                ✓ {images.length} image(s) sélectionnée(s)
              </small>
            )}
          </Form.Group>

          {/* Options */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
              ✓ Options (séparées par des virgules)
            </Form.Label>
            <Form.Control
              type="text"
              name="checkboxOptions"
              value={form.values.checkboxOptions}
              onChange={handleFieldChange}
              placeholder="Ex: Sans shampoing, Premium, Avec massage"
              style={{ borderRadius: '10px', padding: '12px 16px' }}
            />
            <small style={{ color: '#6c757d', marginTop: '6px', display: 'block' }}>
              💡 Les clients pourront sélectionner ces options lors de la réservation
            </small>
          </Form.Group>

          {/* Boutons */}
          <div className="d-flex gap-2" style={{ paddingTop: '12px', borderTop: '1px solid rgba(184,134,11,0.1)' }}>
            <Button
              variant="primary"
              type="submit"
              disabled={form.isSubmitting}
              style={{
                borderRadius: '10px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #b8860b, #d4a574)',
                border: 'none',
                padding: '11px 24px'
              }}
            >
              {form.isSubmitting ? '⏳ Enregistrement...' : '✓ Enregistrer'}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={form.isSubmitting}
              style={{
                borderRadius: '10px',
                fontWeight: '700'
              }}
            >
              ✕ Annuler
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}


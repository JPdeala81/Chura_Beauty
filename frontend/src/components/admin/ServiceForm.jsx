import { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import * as serviceService from '../../services/serviceService';

export default function ServiceForm({ service, onClose }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [durationMode, setDurationMode] = useState('minutes'); // 'minutes', 'hours', 'seconds'
  
  const [formData, setFormData] = useState({
    title: service?.title || '',
    description: service?.description || '',
    category: service?.category || '',
    price: service?.price || '',
    duration: service?.duration || '',
    displayStyle: service?.displayStyle || 'card',
    checkboxOptions: service?.checkboxOptions?.join(',') || '',
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDurationChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    let minutes = value;

    if (durationMode === 'hours') {
      minutes = value * 60;
    } else if (durationMode === 'seconds') {
      minutes = Math.round(value / 60);
    }

    setFormData((prev) => ({
      ...prev,
      duration: minutes || '',
    }));
  };

  const convertDurationDisplay = () => {
    const dur = parseFloat(formData.duration) || 0;
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
      setFormData((prev) => ({
        ...prev,
        category: newCategory,
      }));
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.duration) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'checkboxOptions') {
          data.append(key, JSON.stringify(formData[key].split(',').filter(Boolean)));
        } else {
          data.append(key, formData[key]);
        }
      });

      images.forEach((image) => {
        data.append('images', image);
      });

      if (service) {
        await serviceService.updateService(service._id, data);
        setSuccess('Service mis à jour !');
      } else {
        await serviceService.createService(data);
        setSuccess('Service créé !');
      }

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

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
        {error && <Alert variant="danger" style={{ borderRadius: '12px' }}>{error}</Alert>}
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
              value={formData.title}
              onChange={handleChange}
              className="form-control-luxury"
              placeholder="Ex: Coloration complète"
              required
              style={{ borderRadius: '10px', padding: '12px 16px' }}
            />
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
              value={formData.description}
              onChange={handleChange}
              className="form-control-luxury"
              placeholder="Décrivez votre service..."
              required
              style={{ borderRadius: '10px', padding: '12px 16px' }}
            />
          </Form.Group>

          {/* Catégorie avec création */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px', marginBottom: '10px' }}>
              🏷️ Catégorie *
            </Form.Label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control-luxury"
                required
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
            
            {showNewCategory && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Form.Control
                  type="text"
                  placeholder="Nom de la catégorie"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="form-control-luxury"
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
              value={formData.price}
              onChange={handleChange}
              className="form-control-luxury"
              placeholder="0"
              required
              min="0"
              step="100"
              style={{ borderRadius: '10px', padding: '12px 16px' }}
            />
          </Form.Group>

          {/* Durée avec sélecteur d'unité */}
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
                  className="form-control-luxury"
                  placeholder="0"
                  required
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
            <small style={{ color: '#6c757d', marginTop: '6px', display: 'block' }}>
              💡 Stocké en minutes ({Math.round(formData.duration)} min)
            </small>
          </Form.Group>

          {/* Style affichage */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
              🎯 Style d'affichage
            </Form.Label>
            <Form.Select
              name="displayStyle"
              value={formData.displayStyle}
              onChange={handleChange}
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

          {/* Options personnalisées */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '700', color: '#1a0f08', fontSize: '14px' }}>
              ✓ Options (séparées par des virgules)
            </Form.Label>
            <Form.Control
              type="text"
              name="checkboxOptions"
              value={formData.checkboxOptions}
              onChange={handleChange}
              className="form-control-luxury"
              placeholder="Ex: Sans shampoing, Premium, Avec massage"
              style={{ borderRadius: '10px', padding: '12px 16px' }}
            />
            <small style={{ color: '#6c757d', marginTop: '6px', display: 'block' }}>
              💡 Les clients pourront sélectionner ces options lors de la réservation
            </small>
          </Form.Group>

          {/* Boutons d'action */}
          <div className="d-flex gap-2" style={{ paddingTop: '12px', borderTop: '1px solid rgba(184,134,11,0.1)' }}>
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
              {loading ? '⏳ Enregistrement...' : '✓ Enregistrer'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={onClose} 
              disabled={loading}
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


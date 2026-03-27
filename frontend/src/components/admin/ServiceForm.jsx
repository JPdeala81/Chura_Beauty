import { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import * as serviceService from '../../services/serviceService';

export default function ServiceForm({ service, onClose }) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        {service ? 'Modifier le service' : 'Ajouter un service'}
      </Card.Header>

      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Titre</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Catégorie</Form.Label>
            <Form.Control
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Prix (FCFA)</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Durée (minutes)</Form.Label>
            <Form.Control
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Style d'affichage</Form.Label>
            <Form.Select
              name="displayStyle"
              value={formData.displayStyle}
              onChange={handleChange}
            >
              <option value="card">Card</option>
              <option value="full-width">Full-width</option>
              <option value="featured">Featured</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Images</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={handleImageChange}
              accept="image/*"
            />
            {images.length > 0 && <p>Imagescho ({images.length})</p>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Options (séparées par des virgules)</Form.Label>
            <Form.Control
              type="text"
              name="checkboxOptions"
              value={formData.checkboxOptions}
              onChange={handleChange}
              placeholder="Option 1, Option 2"
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

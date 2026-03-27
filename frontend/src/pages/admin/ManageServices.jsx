import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import ServiceForm from '../../components/admin/ServiceForm';
import ServiceList from '../../components/admin/ServiceList';
import Sidebar from '../../components/layout/Sidebar';
import * as serviceService from '../../services/serviceService';

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getAllServices();
      setServices(response.data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        await serviceService.deleteService(id);
        setServices(services.filter((s) => s._id !== id));
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingService(null);
    fetchServices();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

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

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>💼 Mes services</h1>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            ➕ Ajouter un service
          </Button>
        </div>

        {showForm && (
          <ServiceForm
            service={editingService}
            onClose={handleFormClose}
          />
        )}

        {services.length === 0 ? (
          <Alert variant="info">Aucun service. Créez-en un !</Alert>
        ) : (
          <ServiceList
            services={services}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Container>
    </div>
  );
}

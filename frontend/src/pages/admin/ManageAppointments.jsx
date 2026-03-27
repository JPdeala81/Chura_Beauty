import { useState, useEffect } from 'react';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import AppointmentManager from '../../components/admin/AppointmentManager';
import Sidebar from '../../components/layout/Sidebar';
import * as appointmentService from '../../services/appointmentService';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointments();
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
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

        <h1 className="mb-4">📅 Rendez-vous</h1>

        {appointments.length === 0 ? (
          <Alert variant="info">Aucun rendez-vous.</Alert>
        ) : (
          <AppointmentManager
            appointments={appointments}
            onUpdate={fetchAppointments}
          />
        )}
      </Container>
    </div>
  );
}

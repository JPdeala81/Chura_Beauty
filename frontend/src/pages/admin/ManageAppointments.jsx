import { useState, useEffect } from 'react';
import { Container, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import AppointmentManager from '../../components/admin/AppointmentManager';
import Sidebar from '../../components/layout/Sidebar';
import * as appointmentService from '../../services/appointmentService';
import { subscribeToAppointments, unsubscribeFromAppointments } from '../../services/realtimeService';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [realtimeSubscription, setRealtimeSubscription] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    // Update pending count
    const pending = appointments.filter(a => a.status === 'pending').length;
    setPendingCount(pending);
  }, [appointments]);

  useEffect(() => {
    // Subscribe to real-time updates
    const subscription = subscribeToAppointments((payload) => {
      console.log('Appointment update:', payload);
      
      if (payload.eventType === 'INSERT') {
        // New appointment created
        setAppointments(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        // Appointment updated
        setAppointments(prev =>
          prev.map(appt => appt.id === payload.new.id ? payload.new : appt)
        );
      } else if (payload.eventType === 'DELETE') {
        // Appointment deleted
        setAppointments(prev =>
          prev.filter(appt => appt.id !== payload.old.id)
        );
      }
    });

    setRealtimeSubscription(subscription);

    // Cleanup on unmount
    return () => {
      unsubscribeFromAppointments(subscription);
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointments();
      console.log('📋 Appointments response:', response.data);
      
      // Handle different response formats
      const appointmentsList = response.data.appointments || response.data || [];
      console.log('📋 Parsed appointments:', appointmentsList);
      
      setAppointments(appointmentsList);
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>📅 Rendez-vous</h1>
          {pendingCount > 0 && (
            <Badge bg="danger" pill style={{ fontSize: '14px', padding: '8px 12px' }}>
              {pendingCount} {pendingCount === 1 ? 'demande' : 'demandes'} en attente
            </Badge>
          )}
        </div>

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

import { useState } from 'react';
import { Table, Button, Badge, Form, Alert } from 'react-bootstrap';
import * as appointmentService from '../../services/appointmentService';

export default function AppointmentManager({ appointments, onUpdate }) {
  const [adminNotes, setAdminNotes] = useState({});
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      const notes = adminNotes[appointmentId] || '';
      await appointmentService.updateAppointmentStatus(
        appointmentId,
        newStatus,
        notes
      );
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleNotesChange = (appointmentId, value) => {
    setAdminNotes((prev) => ({
      ...prev,
      [appointmentId]: value,
    }));
  };

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead className="table-dark">
          <tr>
            <th>Client</th>
            <th>Email</th>
            <th>Service</th>
            <th>Date</th>
            <th>Heure</th>
            <th>Statut</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((appt) => {
            // Handle both camelCase and snake_case from different sources
            const clientName = appt.client_name || appt.clientName || 'N/A';
            const clientEmail = appt.client_email || appt.clientEmail || 'N/A';
            const serviceName = appt.services?.title || appt.service?.title || appt.serviceTitle || 'N/A';
            const desiredDate = appt.desired_date || appt.desiredDate;
            const slotStart = appt.slot_start || appt.desiredTimeSlot?.start || 'N/A';
            const slotEnd = appt.slot_end || appt.desiredTimeSlot?.end || 'N/A';
            const appointmentId = appt.id || appt._id;
            const status = appt.status || 'pending';
            const adminNotes = appt.admin_notes || appt.adminNotes || '';

            let formattedDate = 'Invalid Date';
            try {
              if (desiredDate) {
                formattedDate = new Date(desiredDate).toLocaleDateString('fr-FR');
              }
            } catch (e) {
              console.error('Date parsing error:', e);
            }

            return (
            <tr key={appointmentId}>
              <td>{clientName}</td>
              <td>{clientEmail}</td>
              <td>{serviceName}</td>
              <td>{formattedDate}</td>
              <td>{slotStart} - {slotEnd}</td>
              <td>
                <Badge
                  bg={
                    status === 'accepted'
                      ? 'success'
                      : status === 'pending'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {status === 'pending' ? 'En attente' : status === 'accepted' ? 'Accepté' : 'Refusé'}
                </Badge>
              </td>
              <td>
                <Form.Control
                  as="textarea"
                  size="sm"
                  rows={2}
                  value={adminNotes[appointmentId] || adminNotes || ''}
                  onChange={(e) =>
                    handleNotesChange(appointmentId, e.target.value)
                  }
                  placeholder="Notes..."
                />
              </td>
              <td>
                <div className="d-flex gap-2">
                  {status === 'pending' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(appointmentId, 'accepted')
                        }
                        disabled={loading}
                      >
                        ✅ Accepter
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(appointmentId, 'refused')
                        }
                        disabled={loading}
                      >
                        ❌ Refuser
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
          })}
        </tbody>
      </Table>
    </div>
  );
}

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
            <th>Service</th>
            <th>Date</th>
            <th>Heure</th>
            <th>Statut</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((appt) => (
            <tr key={appt._id}>
              <td>{appt.clientName}</td>
              <td>{appt.serviceId?.title}</td>
              <td>
                {new Date(appt.desiredDate).toLocaleDateString('fr-FR')}
              </td>
              <td>
                {appt.desiredTimeSlot?.start} - {appt.desiredTimeSlot?.end}
              </td>
              <td>
                <Badge
                  bg={
                    appt.status === 'accepted'
                      ? 'success'
                      : appt.status === 'pending'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {appt.status}
                </Badge>
              </td>
              <td>
                <Form.Control
                  as="textarea"
                  size="sm"
                  rows={2}
                  value={adminNotes[appt._id] || appt.adminNotes || ''}
                  onChange={(e) =>
                    handleNotesChange(appt._id, e.target.value)
                  }
                  placeholder="Notes..."
                />
              </td>
              <td>
                <div className="d-flex gap-2">
                  {appt.status === 'pending' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(appt._id, 'accepted')
                        }
                        disabled={loading}
                      >
                        ✅ Accepter
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(appt._id, 'refused')
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
          ))}
        </tbody>
      </Table>
    </div>
  );
}

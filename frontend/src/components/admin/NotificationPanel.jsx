import { useState, useEffect } from 'react';
import { Card, ListGroup, Spinner, Button } from 'react-bootstrap';
import api from '../../services/api';

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      console.log('📬 Notifications fetched:', res.data);
      setNotifications(res.data.notifications || res.data || []);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>🔔 Notifications ({notifications.length})</span>
        <Button 
          variant="sm" 
          onClick={fetchNotifications}
          size="sm"
        >
          🔄 Actualiser
        </Button>
      </Card.Header>
      <ListGroup variant="flush">
        {notifications.length === 0 ? (
          <Card.Body>Aucune notification</Card.Body>
        ) : (
          notifications.map((notif) => (
            <ListGroup.Item
              key={notif.id || notif._id}
              className={notif.is_read ? 'text-muted' : 'fw-bold'}
              style={{ cursor: 'pointer', padding: '15px' }}
              onClick={() => !notif.is_read && markAsRead(notif.id || notif._id)}
            >
              <div>
                <p className="mb-2">{notif.message || 'Sans titre'}</p>
                <small className="text-muted">
                  {notif.created_at ? new Date(notif.created_at).toLocaleString('fr-FR') : 'Date inconnue'}
                </small>
                {!notif.is_read && (
                  <div className="mt-2">
                    <span className="badge bg-primary">Non lue</span>
                  </div>
                )}
              </div>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Card>
  );
}

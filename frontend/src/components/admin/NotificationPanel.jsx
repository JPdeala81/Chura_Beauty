import { Card, ListGroup } from 'react-bootstrap';

export default function NotificationPanel({ notifications }) {
  return (
    <Card>
      <Card.Header>🔔 Notifications</Card.Header>
      <ListGroup variant="flush">
        {notifications.length === 0 ? (
          <Card.Body>Aucune notification</Card.Body>
        ) : (
          notifications.map((notif) => (
            <ListGroup.Item
              key={notif._id}
              className={notif.isRead ? 'text-muted' : 'fw-bold'}
            >
              <div>
                <p className="mb-1">{notif.message}</p>
                <small className="text-muted">
                  {new Date(notif.createdAt).toLocaleString('fr-FR')}
                </small>
              </div>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Card>
  );
}

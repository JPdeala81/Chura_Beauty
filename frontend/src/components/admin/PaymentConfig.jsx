import { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';

export default function PaymentConfig({ admin }) {
  const [isEnabled] = useState(false);

  return (
    <Card className="border-warning">
      <Card.Header className="bg-warning text-dark">
        <h5 className="mb-0">💳 Configuration Paiement Mobile (🔒 Bientôt disponible)</h5>
      </Card.Header>

      <Card.Body>
        <Alert variant="warning">
          <strong>Cette fonctionnalité est en cours de développement.</strong> Les
          codes de paiement mobile seront bientôt disponibles.
        </Alert>

        {!isEnabled && (
          <div
            className="position-relative p-4 bg-secondary bg-opacity-25 rounded"
            style={{ opacity: 0.6 }}
          >
            <div className="position-absolute top-50 start-50 translate-middle">
              <span className="badge bg-warning text-dark fs-6">
                🔒 Verrouillé
              </span>
            </div>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Code Airtel Money</Form.Label>
                <Form.Control type="text" disabled placeholder="*555*1*NUMERO*MONTANT#" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Code Moov Money</Form.Label>
                <Form.Control type="text" disabled placeholder="*155*1*NUMERO*MONTANT#" />
              </Form.Group>

              <Button variant="primary" disabled>
                Tester le code
              </Button>
            </Form>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

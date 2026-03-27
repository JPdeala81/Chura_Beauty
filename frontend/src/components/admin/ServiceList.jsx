import { Table, Button, Badge } from 'react-bootstrap';

export default function ServiceList({ services, onEdit, onDelete }) {
  return (
    <Table striped bordered hover responsive>
      <thead className="table-dark">
        <tr>
          <th>Titre</th>
          <th>Catégorie</th>
          <th>Prix</th>
          <th>Durée</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {services.map((service) => (
          <tr key={service._id}>
            <td>{service.title}</td>
            <td>{service.category}</td>
            <td>{service.price} FCFA</td>
            <td>{service.duration} min</td>
            <td>
              <Badge bg={service.isActive ? 'success' : 'danger'}>
                {service.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </td>
            <td>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onEdit(service)}
                className="me-2"
              >
                Éditer
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(service._id)}
              >
                Supprimer
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

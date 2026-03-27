import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import RevenueChart from '../admin/RevenueChart';
import * as appointmentService from '../../services/appointmentService';
import * as revenueService from '../../services/revenueService';
import Sidebar from '../../components/layout/Sidebar';

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    refused: 0,
  });
  const [revenueStats, setRevenueStats] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const appRes = await appointmentService.getAppointments();
        const revRes = await revenueService.getRevenue('week');

        const apps = appRes.data.appointments;
        setAppointments(apps.slice(0, 5));

        setStats({
          pending: apps.filter((a) => a.status === 'pending').length,
          accepted: apps.filter((a) => a.status === 'accepted').length,
          refused: apps.filter((a) => a.status === 'refused').length,
        });

        setRevenueStats(revRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

        <h1 className="mb-4">📊 Tableau de bord</h1>

        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="text-center bg-warning text-dark">
              <Card.Body>
                <h4>En attente</h4>
                <h2>{stats.pending}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="text-center bg-success text-white">
              <Card.Body>
                <h4>Acceptés</h4>
                <h2>{stats.accepted}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="text-center bg-danger text-white">
              <Card.Body>
                <h4>Refusés</h4>
                <h2>{stats.refused}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="text-center bg-info text-white">
              <Card.Body>
                <h4>CA cette semaine</h4>
                <h2>{revenueStats.stats?.totalRevenue || 0} FCFA</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col lg={8}>
            <RevenueChart />
          </Col>

          <Col lg={4}>
            <Card>
              <Card.Header>Derniers rendez-vous</Card.Header>
              <Card.Body>
                {appointments.length > 0 ? (
                  <ul className="list-unstyled">
                    {appointments.map((appt) => (
                      <li key={appt._id} className="mb-2 pb-2 border-bottom">
                        <strong>{appt.clientName}</strong>
                        <br />
                        {appt.serviceId?.title}
                        <br />
                        <small className="text-muted">
                          Status:{' '}
                          <span
                            className={`badge ${
                              appt.status === 'accepted'
                                ? 'bg-success'
                                : appt.status === 'pending'
                                ? 'bg-warning'
                                : 'bg-danger'
                            }`}
                          >
                            {appt.status}
                          </span>
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun rendez-vous</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import RevenueChart from '../../components/admin/RevenueChart';
import Sidebar from '../../components/layout/Sidebar';
import * as revenueService from '../../services/revenueService';

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const response = await revenueService.getRevenue('week');
      setRevenueData(response.data);
    } catch (error) {
      console.error('Error fetching revenue:', error);
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

        <h1 className="mb-4">📊 Chiffre d'affaires</h1>

        <RevenueChart />
      </Container>
    </div>
  );
}

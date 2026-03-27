import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, Button, ButtonGroup } from 'react-bootstrap';
import * as revenueService from '../../services/revenueService';

export default function RevenueChart() {
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [stats, setStats] = useState({});
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const response = await revenueService.getRevenue(period);
        setRevenueData(response.data.revenueData);
        setCategoryData(response.data.categoryData);
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching revenue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [period]);

  return (
    <div>
      <div className="mb-4">
        <ButtonGroup>
          <Button
            variant={period === 'week' ? 'primary' : 'outline-primary'}
            onClick={() => setPeriod('week')}
          >
            Cette semaine
          </Button>
          <Button
            variant={period === 'month' ? 'primary' : 'outline-primary'}
            onClick={() => setPeriod('month')}
          >
            Ce mois
          </Button>
          <Button
            variant={period === 'year' ? 'primary' : 'outline-primary'}
            onClick={() => setPeriod('year')}
          >
            Cette année
          </Button>
        </ButtonGroup>
      </div>

      <Card className="mb-4">
        <Card.Header>Chiffre d'affaires</Card.Header>
        <Card.Body>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8884d8"
                  name="CA (FCFA)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>Aucune donnée de CA</p>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>CA par catégorie</Card.Header>
        <Card.Body>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, total }) => `${_id}: ${total} FCFA`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>Aucune donnée par catégorie</p>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Statistiques</Card.Header>
        <Card.Body>
          <p>
            <strong>CA total :</strong> {stats.totalRevenue || 0} FCFA
          </p>
          <p>
            <strong>Rendez-vous acceptés :</strong> {stats.totalAppointments || 0}
          </p>
          <p>
            <strong>CA moyen :</strong> {stats.averageRevenue || 0} FCFA
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

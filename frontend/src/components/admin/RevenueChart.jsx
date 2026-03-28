import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import api from '../../services/api'

const COLORS = ['#d4a574', '#f8c8d4', '#c9a96e', '#e8b4b8', '#b8860b']

const RevenueChart = () => {
  const [period, setPeriod] = useState('week')
  const [data, setData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    totalAppointments: 0,
    totalHours: 0
  })

  useEffect(() => {
    fetchRevenue()
  }, [period])

  const fetchRevenue = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/revenue?period=${period}`)
      setData(response.data.chartData || [])
      setCategoryData(response.data.categoryData || [])
      setStats(response.data.stats || { total: 0, totalAppointments: 0, totalHours: 0 })
    } catch (error) {
      console.error('Erreur chargement revenus:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="revenue-chart">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0" style={{ fontFamily: 'Playfair Display, serif', color: '#b8860b' }}>
          📊 Chiffre d'Affaires
        </h5>
        <div className="btn-group">
          <button className={`btn btn-sm ${period === 'week' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setPeriod('week')}>Semaine</button>
          <button className={`btn btn-sm ${period === 'month' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setPeriod('month')}>Mois</button>
          <button className={`btn btn-sm ${period === 'year' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setPeriod('year')}>Année</button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">CA Total</h6>
              <h4 style={{ color: '#b8860b' }}>{stats.total?.toLocaleString()} FCFA</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Rendez-vous</h6>
              <h4 style={{ color: '#b8860b' }}>{stats.totalAppointments}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Heures travaillées</h6>
              <h4 style={{ color: '#b8860b' }}>{stats.totalHours}h</h4>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#b8860b' }}></div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title text-muted mb-3">Évolution du CA</h6>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} FCFA`, 'CA']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#b8860b" strokeWidth={2} dot={{ fill: '#b8860b' }} name="CA (FCFA)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title text-muted mb-3">Par catégorie</h6>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} FCFA`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RevenueChart
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

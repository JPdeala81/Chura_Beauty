import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import './SuperAdminDashboard.css'

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home')
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [stats, setStats] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [appoRes, servRes, statsRes] = await Promise.allSettled([
        api.get('/appointments'),
        api.get('/services'),
        api.get('/revenue/stats')
      ])
      
      // Extract correct data from responses
      if (appoRes.status === 'fulfilled') {
        const apptData = appoRes.value.data
        setAppointments(apptData.appointments || [])
      }
      if (servRes.status === 'fulfilled') {
        const servData = servRes.value.data
        setServices(servData.services || [])
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data || {})
      }
      generateChartData()
    } catch (err) {
      console.error('Erreur fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = () => {
    const data = [
      { name: 'Acceptés', value: 45, fill: '#00d9ff' },
      { name: 'En attente', value: 12, fill: '#ffd700' },
      { name: 'Refusés', value: 8, fill: '#ff6b6b' }
    ]
    setChartData(data)
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.client_email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      await api.patch(`/appointments/${id}`, { status: newStatus })
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status: newStatus } : apt
      ))
    } catch (err) {
      console.error('Erreur update:', err)
    }
  }

  return (
    <div className="super-admin-dashboard">
      {/* Header */}
      <header className="super-admin-header">
        <div className="header-content">
          <h1>💎 Tableau de Bord Super Admin</h1>
          <div className="header-actions">
            <button className="btn-refresh" onClick={fetchAllData}>🔄 Actualiser</button>
            <button className="btn-logout" onClick={handleLogout}>🚪 Déconnexion</button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="super-admin-nav">
        {['home', 'appointments', 'statistics', 'services', 'settings'].map(tab => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'home' && '🏠 Accueil'}
            {tab === 'appointments' && '📅 Rendez-vous'}
            {tab === 'statistics' && '📊 Statistiques'}
            {tab === 'services' && '💅 Services'}
            {tab === 'settings' && '⚙️ Paramètres'}
          </button>
        ))}
      </nav>

      <main className="super-admin-main">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.section 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="admin-section"
            >
              {/* KPI Cards */}
              <div className="kpi-grid">
                <motion.div className="kpi-card" whileHover={{ scale: 1.05 }}>
                  <div className="kpi-header">
                    <span className="kpi-icon">📅</span>
                    <h3>RDV Total</h3>
                  </div>
                  <p className="kpi-value">{appointments.length}</p>
                  <p className="kpi-trend">Tous les rendez-vous</p>
                </motion.div>

                <motion.div className="kpi-card" whileHover={{ scale: 1.05 }}>
                  <div className="kpi-header">
                    <span className="kpi-icon">✅</span>
                    <h3>Acceptés</h3>
                  </div>
                  <p className="kpi-value" style={{color: '#00d9ff'}}>
                    {appointments.filter(a => a.status === 'accepted').length}
                  </p>
                  <p className="kpi-trend">Confirmés</p>
                </motion.div>

                <motion.div className="kpi-card" whileHover={{ scale: 1.05 }}>
                  <div className="kpi-header">
                    <span className="kpi-icon">⏳</span>
                    <h3>En Attente</h3>
                  </div>
                  <p className="kpi-value" style={{color: '#ffd700'}}>
                    {appointments.filter(a => a.status === 'pending').length}
                  </p>
                  <p className="kpi-trend">À traiter</p>
                </motion.div>

                <motion.div className="kpi-card" whileHover={{ scale: 1.05 }}>
                  <div className="kpi-header">
                    <span className="kpi-icon">❌</span>
                    <h3>Refusés</h3>
                  </div>
                  <p className="kpi-value" style={{color: '#ff6b6b'}}>
                    {appointments.filter(a => a.status === 'rejected').length}
                  </p>
                  <p className="kpi-trend">Déclinés</p>
                </motion.div>
              </div>

              {/* Charts Section */}
              <div className="charts-container">
                <motion.div className="chart-box">
                  <h3>📊 Distribution des RDV</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div className="chart-box">
                  <h3>📈 Tendance RDV</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { name: 'Lun', value: 24 },
                      { name: 'Mar', value: 32 },
                      { name: 'Mer', value: 28 },
                      { name: 'Jeu', value: 41 },
                      { name: 'Ven', value: 35 },
                      { name: 'Sam', value: 52 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#00d9ff" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Quick Stats */}
              <motion.div className="quick-actions">
                <h3>Actions Rapides</h3>
                <div className="actions-grid">
                  <button 
                    className="action-btn"
                    onClick={() => setActiveTab('appointments')}
                  >
                    <span className="action-icon">📅</span>
                    <span className="action-text">Gérer RDV</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setActiveTab('services')}
                  >
                    <span className="action-icon">💅</span>
                    <span className="action-text">Services</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setActiveTab('statistics')}
                  >
                    <span className="action-icon">📊</span>
                    <span className="action-text">Stats</span>
                  </button>
                </div>
              </motion.div>
            </motion.section>
          )}

          {activeTab === 'appointments' && (
            <motion.section 
              key="appointments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="admin-section"
            >
              <div className="appointments-header">
                <h2>📅 Gestion des Rendez-vous</h2>
                <div className="filter-search-box">
                  <input
                    type="text"
                    placeholder="🔍 Chercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="accepted">Acceptés</option>
                    <option value="rejected">Refusés</option>
                  </select>
                </div>
              </div>

              <div className="appointments-table-container">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map(apt => (
                      <motion.tr key={apt.id} className="appointment-row">
                        <td className="cell-name">{apt.client_name}</td>
                        <td className="cell-email">{apt.client_email}</td>
                        <td className="cell-phone">{apt.client_phone}</td>
                        <td className="cell-service">{apt.service_id}</td>
                        <td className="cell-date">{new Date(apt.appointment_date).toLocaleDateString()}</td>
                        <td className="cell-status">
                          <span className={`status-badge status-${apt.status}`}>
                            {apt.status === 'pending' && '⏳ En attente'}
                            {apt.status === 'accepted' && '✅ Accepté'}
                            {apt.status === 'rejected' && '❌ Refusé'}
                          </span>
                        </td>
                        <td className="cell-actions">
                          {apt.status === 'pending' && (
                            <>
                              <button 
                                className="btn-accept"
                                onClick={() => updateAppointmentStatus(apt.id, 'accepted')}
                              >
                                ✅
                              </button>
                              <button 
                                className="btn-reject"
                                onClick={() => updateAppointmentStatus(apt.id, 'rejected')}
                              >
                                ❌
                              </button>
                            </>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAppointments.length === 0 && (
                <div className="empty-state">
                  <p>Aucun rendez-vous trouvé</p>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'services' && (
            <motion.section 
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="admin-section"
            >
              <h2>💅 Services</h2>
              <div className="services-grid">
                {services.map(service => (
                  <motion.div 
                    key={service.id}
                    className="service-card"
                    whileHover={{ scale: 1.05 }}
                  >
                    <h3>{service.title}</h3>
                    <p className="price">{service.price?.toLocaleString()} FCFA</p>
                    <p className="category">{service.category}</p>
                    <p className="duration">{service.duration_minutes} min</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'statistics' && (
            <motion.section 
              key="statistics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="admin-section"
            >
              <h2>📊 Statistiques Détaillées</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={[
                  { name: 'Sem 1', accepted: 12, pending: 5, rejected: 2 },
                  { name: 'Sem 2', accepted: 15, pending: 4, rejected: 3 },
                  { name: 'Sem 3', accepted: 18, pending: 3, rejected: 1 },
                  { name: 'Sem 4', accepted: 22, pending: 2, rejected: 2 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accepted" fill="#00d9ff" />
                  <Bar dataKey="pending" fill="#ffd700" />
                  <Bar dataKey="rejected" fill="#ff6b6b" />
                </BarChart>
              </ResponsiveContainer>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default SuperAdminDashboard

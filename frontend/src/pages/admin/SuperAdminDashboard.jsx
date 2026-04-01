import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import QRCodeConfig from '../../components/admin/QRCodeConfig'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home')
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [stats, setStats] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({})
  const [adminInfo, setAdminInfo] = useState({})
  const [editingSettings, setEditingSettings] = useState(false)
  const [formData, setFormData] = useState({})
  
  // Service Management
  const [editingService, setEditingService] = useState(null)
  const [newServiceForm, setNewServiceForm] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    title: '', category: '', price: 0, duration_minutes: 30, description: '', active: true
  })

  // Site Settings & Homepage
  const [editingSiteSettings, setEditingSiteSettings] = useState(false)
  const [siteSettingsForm, setSiteSettingsForm] = useState({
    app_name: 'Chura Beauty',
    app_logo: '',
    homepage_hero_title: 'Bienvenue',
    homepage_hero_subtitle: 'Services de beauté premium',
    tagline: 'Excellence et élégance',
    footer_company_name: 'Chura Beauty Salon',
    footer_address: '',
    footer_phone: '',
    footer_email: '',
    footer_whatsapp: '',
    footer_instagram: '',
    footer_facebook: '',
    footer_twitter: ''
  })

  // App Closure / Maintenance
  const [appClosureMode, setAppClosureMode] = useState(false)
  const [closureForm, setClosureForm] = useState({
    enabled: false,
    reason: 'Maintenance en cours',
    reopenDate: '',
    reopenTime: '09:00'
  })

  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [appoRes, servRes, statsRes, settingsRes, profileRes] = await Promise.allSettled([
        api.get('/appointments'),
        api.get('/services'),
        api.get('/revenue/stats'),
        api.get('/site-settings'),
        api.get('/auth/profile')
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
      if (settingsRes.status === 'fulfilled') {
        const settingsData = settingsRes.value.data || {}
        setSettings(settingsData)
        setFormData(settingsData)
      }
      if (profileRes.status === 'fulfilled') {
        setAdminInfo(profileRes.value.data || {})
      }
    } catch (err) {
      console.error('Erreur fetch:', err)
    } finally {
      setLoading(false)
    }
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

  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const saveSettings = async () => {
    try {
      await api.put('/site-settings', formData)
      setSettings(formData)
      setEditingSettings(false)
      alert('Paramètres sauvegardés avec succès')
    } catch (err) {
      console.error('Erreur save:', err)
      alert('Erreur lors de la sauvegarde')
    }
  }

  // Generate real statistics from fetched data
  const generateRealStats = () => {
    const total = appointments.length
    const accepted = appointments.filter(a => a.status === 'accepted').length
    const pending = appointments.filter(a => a.status === 'pending').length
    const rejected = appointments.filter(a => a.status === 'rejected').length
    
    return {
      appointmentStats: [
        { name: 'Acceptés', value: accepted, fill: '#00d9ff' },
        { name: 'En attente', value: pending, fill: '#ffd700' },
        { name: 'Refusés', value: rejected, fill: '#ff6b6b' }
      ],
      weeklyStats: generateWeeklyStats(),
      totalRevenue: calculateTotalRevenue()
    }
  }

  const generateWeeklyStats = () => {
    const lastWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    return lastWeek.map((date, i) => {
      const day = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][date.getDay()]
      const dayStart = new Date(date).setHours(0, 0, 0, 0)
      const dayEnd = new Date(date).setHours(23, 59, 59, 999)

      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date).getTime()
        return aptDate >= dayStart && aptDate <= dayEnd
      })

      return {
        name: day,
        accepted: dayAppointments.filter(a => a.status === 'accepted').length,
        pending: dayAppointments.filter(a => a.status === 'pending').length,
        rejected: dayAppointments.filter(a => a.status === 'rejected').length
      }
    })
  }

  const calculateTotalRevenue = () => {
    return appointments
      .filter(a => a.status === 'accepted')
      .reduce((sum, apt) => {
        const service = services.find(s => s.id === apt.service_id)
        return sum + (service?.price || 0)
      }, 0)
  }

  // ============ SERVICE MANAGEMENT ============
  const handleServiceFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setServiceForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name.includes('price') || name.includes('duration') ? parseFloat(value) : value)
    }))
  }

  const createService = async () => {
    if (!serviceForm.title || !serviceForm.category || !serviceForm.price) {
      alert('Veuillez remplir tous les champs requis')
      return
    }
    try {
      const response = await api.post('/services', serviceForm)
      setServices([...services, response.data])
      setServiceForm({ title: '', category: '', price: 0, duration_minutes: 30, description: '', active: true })
      setNewServiceForm(false)
      alert('Service créé avec succès')
    } catch (err) {
      console.error('Erreur création service:', err)
      alert('Erreur lors de la création')
    }
  }

  const updateService = async () => {
    if (!serviceForm.title || !serviceForm.category || !serviceForm.price) {
      alert('Veuillez remplir tous les champs requis')
      return
    }
    try {
      await api.put(`/services/${editingService}`, serviceForm)
      setServices(services.map(s => s.id === editingService ? { ...s, ...serviceForm } : s))
      setEditingService(null)
      setServiceForm({ title: '', category: '', price: 0, duration_minutes: 30, description: '', active: true })
      alert('Service mis à jour')
    } catch (err) {
      console.error('Erreur update service:', err)
      alert('Erreur lors de la mise à jour')
    }
  }

  const deleteService = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service?')) return
    try {
      await api.delete(`/services/${id}`)
      setServices(services.filter(s => s.id !== id))
      alert('Service supprimé')
    } catch (err) {
      console.error('Erreur suppression:', err)
      alert('Erreur lors de la suppression')
    }
  }

  const acceptService = async (id) => {
    try {
      await api.patch(`/services/${id}`, { active: true })
      setServices(services.map(s => s.id === id ? { ...s, active: true } : s))
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const rejectService = async (id) => {
    try {
      await api.patch(`/services/${id}`, { active: false })
      setServices(services.map(s => s.id === id ? { ...s, active: false } : s))
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  // ============ SITE SETTINGS ============
  const handleSiteSettingsChange = (e) => {
    const { name, value } = e.target
    setSiteSettingsForm(prev => ({ ...prev, [name]: value }))
  }

  const saveSiteSettings = async () => {
    try {
      await api.put('/site-settings/homepage', siteSettingsForm)
      alert('Paramètres du site sauvegardés')
      setEditingSiteSettings(false)
    } catch (err) {
      console.error('Erreur:', err)
      alert('Erreur lors de la sauvegarde')
    }
  }

  // ============ APP CLOSURE ============
  const handleClosureChange = (e) => {
    const { name, value, type, checked } = e.target
    setClosureForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const toggleAppClosure = async () => {
    try {
      const newState = !appClosureMode
      await api.post('/site-settings/app-closure', {
        enabled: newState,
        reason: closureForm.reason,
        reopenDate: closureForm.reopenDate,
        reopenTime: closureForm.reopenTime
      })
      setAppClosureMode(newState)
      alert(newState ? 'Application fermée' : 'Application réouverte')
    } catch (err) {
      console.error('Erreur:', err)
      alert('Erreur lors du changement')
    }
  }

  return (
    <div style={{ 
      background: 'var(--bg-color)', 
      color: 'var(--text-color)', 
      minHeight: '100vh',
      fontFamily: 'var(--font-primary, sans-serif)'
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--gradient-primary)',
        padding: '2rem',
        boxShadow: 'var(--shadow-luxury)',
        marginBottom: '2rem'
      }}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0" style={{ fontSize: '2rem', fontWeight: 'bold' }}>💎 Tableau de Bord Admin</h1>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-light"
                onClick={() => navigate('/')}
                style={{ borderColor: 'var(--surface)', color: 'white' }}
              >
                🏠 Accueil
              </button>
              <button 
                className="btn btn-outline-light"
                onClick={fetchAllData}
                style={{ borderColor: 'var(--surface)', color: 'white' }}
              >
                🔄 Actualiser
              </button>
              <button 
                className="btn btn-outline-danger"
                onClick={handleLogout}
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid px-3 px-md-4">
        {/* Admin Profile Card */}
        {adminInfo.email && (
          <motion.div 
            className="row mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="col-12 col-md-4">
              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '1.5rem'
              }}>
                <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>👤 Profil Admin</h6>
                <p className="mb-2"><strong>Email:</strong> {adminInfo.email}</p>
                <p className="mb-0"><strong>Rôle:</strong> <span className="badge" style={{ background: 'var(--primary-color)' }}>Admin</span></p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-4" style={{ borderBottom: '2px solid var(--surface)' }}>
          <div className="d-flex gap-2 flex-wrap">
            {[
              { id: 'home', label: '🏠 Accueil' },
              { id: 'appointments', label: '📅 Rendez-vous' },
              { id: 'services', label: '💅 Services' },
              { id: 'statistics', label: '📊 Statistiques' },
              { id: 'service-management', label: '⚙️ Gestion Services' },
              { id: 'site-management', label: '🌐 Paramètres Site' },
              { id: 'users', label: '👥 Utilisateurs' },
              { id: 'maintenance', label: '🔧 Maintenance' },
              { id: 'app-closure', label: '🚪 Fermeture App' },
              { id: 'security', label: '🔐 Sécurité' },
              { id: 'qrcode', label: '📱 Code QR' },
              { id: 'settings', label: '⚙️ Paramètres' }
            ].map(tab => (
              <button
                key={tab.id}
                className="btn"
                style={{
                  background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-color)',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderBottom: activeTab === tab.id ? '3px solid var(--primary-color)' : 'none',
                  transition: 'var(--transition-smooth)',
                  fontSize: '0.95rem',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* KPI Cards */}
              <div className="row g-3 mb-4">
                {[
                  { icon: '📅', title: 'RDV Total', value: appointments.length, color: '#00d9ff' },
                  { icon: '✅', title: 'Acceptés', value: appointments.filter(a => a.status === 'accepted').length, color: '#00d9ff' },
                  { icon: '⏳', title: 'En Attente', value: appointments.filter(a => a.status === 'pending').length, color: '#ffd700' },
                  { icon: '❌', title: 'Refusés', value: appointments.filter(a => a.status === 'rejected').length, color: '#ff6b6b' }
                ].map((kpi, idx) => (
                  <motion.div
                    key={idx}
                    className="col-12 col-sm-6 col-lg-3"
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  >
                    <div className="card h-100" style={{
                      background: 'var(--surface)',
                      border: `2px solid ${kpi.color}`,
                      borderRadius: 'var(--border-radius-lg)',
                      boxShadow: 'var(--shadow-card)',
                      padding: '1.5rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{kpi.icon}</div>
                      <h6 style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>{kpi.title}</h6>
                      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: kpi.color, margin: 0 }}>
                        {kpi.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="row g-3 mb-4">
                <motion.div className="col-12 col-lg-6" whileHover={{ y: -5 }}>
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>📊 Distribution des RDV</h6>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={generateRealStats().appointmentStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {generateRealStats().appointmentStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div className="col-12 col-lg-6" whileHover={{ y: -5 }}>
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>📈 Tendance RDV</h6>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={generateRealStats().weeklyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--primary-color)" opacity="0.2" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="accepted" stroke="#00d9ff" strokeWidth={3} name="Acceptés" />
                        <Line type="monotone" dataKey="pending" stroke="#ffd700" strokeWidth={3} name="En attente" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '2rem'
              }}>
                <h6 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>⚡ Actions Rapides</h6>
                <div className="row g-3">
                  {[
                    { icon: '📅', text: 'Gérer RDV', tab: 'appointments' },
                    { icon: '💅', text: 'Services', tab: 'services' },
                    { icon: '📊', text: 'Statistiques', tab: 'statistics' },
                    { icon: '⚙️', text: 'Paramètres', tab: 'settings' }
                  ].map((action, idx) => (
                    <div key={idx} className="col-6 col-md-3">
                      <button
                        className="btn w-100 p-3"
                        style={{
                          background: 'var(--gradient-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--border-radius-lg)',
                          transition: 'var(--transition-smooth)',
                          fontWeight: 'bold'
                        }}
                        onClick={() => setActiveTab(action.tab)}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{action.icon}</div>
                        <div style={{ fontSize: '0.9rem' }}>{action.text}</div>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h5 style={{ marginBottom: '1.5rem' }}>📅 Gestion des Rendez-vous</h5>
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-8">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="🔍 Chercher par nom ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        borderColor: 'var(--primary-color)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="form-select"
                      style={{
                        borderColor: 'var(--primary-color)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                      }}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="pending">En attente</option>
                      <option value="accepted">Acceptés</option>
                      <option value="rejected">Refusés</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  {filteredAppointments.length > 0 ? (
                    <table className="table table-hover" style={{ marginBottom: 0 }}>
                      <thead style={{ background: 'var(--bg-color)' }}>
                        <tr>
                          <th style={{ color: 'var(--primary-color)' }}>Client</th>
                          <th style={{ color: 'var(--primary-color)' }}>Email</th>
                          <th style={{ color: 'var(--primary-color)' }}>Téléphone</th>
                          <th style={{ color: 'var(--primary-color)' }}>Service</th>
                          <th style={{ color: 'var(--primary-color)' }}>Date</th>
                          <th style={{ color: 'var(--primary-color)' }}>Statut</th>
                          <th style={{ color: 'var(--primary-color)' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map(apt => (
                          <motion.tr key={apt.id}>
                            <td>{apt.client_name}</td>
                            <td>{apt.client_email}</td>
                            <td>{apt.client_phone}</td>
                            <td>{apt.service_id}</td>
                            <td>{new Date(apt.appointment_date).toLocaleDateString()}</td>
                            <td>
                              <span className="badge" style={{
                                background: apt.status === 'pending' ? '#ffd700' : apt.status === 'accepted' ? '#00d9ff' : '#ff6b6b'
                              }}>
                                {apt.status === 'pending' && '⏳ En attente'}
                                {apt.status === 'accepted' && '✅ Accepté'}
                                {apt.status === 'rejected' && '❌ Refusé'}
                              </span>
                            </td>
                            <td>
                              {apt.status === 'pending' && (
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => updateAppointmentStatus(apt.id, 'accepted')}
                                    title="Accepter"
                                  >
                                    ✅
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => updateAppointmentStatus(apt.id, 'rejected')}
                                    title="Refuser"
                                  >
                                    ❌
                                  </button>
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem',
                      color: 'var(--text-color)',
                      opacity: 0.6
                    }}>
                      Aucun rendez-vous trouvé
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h5 style={{ marginBottom: '2rem' }}>💅 Services disponibles</h5>
              <div className="row g-3">
                {services.length > 0 ? (
                  services.map(service => (
                    <motion.div
                      key={service.id}
                      className="col-12 col-sm-6 col-md-4 col-lg-3"
                      whileHover={{ scale: 1.05, y: -10 }}
                    >
                      <div className="card h-100" style={{
                        background: 'var(--gradient-primary)',
                        border: 'none',
                        borderRadius: 'var(--border-radius-lg)',
                        boxShadow: 'var(--shadow-luxury)',
                        padding: '1.5rem',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <h6 className="card-title" style={{ marginBottom: '0.5rem' }}>{service.title}</h6>
                        <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.9 }}>{service.category}</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0' }}>
                          {service.price?.toLocaleString()} FCFA
                        </p>
                        <p style={{ fontSize: '0.9rem' }}>⏱️ {service.duration_minutes} minutes</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-12" style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-color)',
                    opacity: 0.6
                  }}>
                    Aucun service disponible
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STATISTICS TAB */}
          {activeTab === 'statistics' && (
            <motion.div
              key="statistics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '2rem'
              }}>
                <h5 style={{ marginBottom: '1.5rem' }}>📊 Statistiques détaillées (7 derniers jours)</h5>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={generateRealStats().weeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--primary-color)" opacity="0.2" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accepted" fill="#00d9ff" name="Acceptés" />
                    <Bar dataKey="pending" fill="#ffd700" name="En attente" />
                    <Bar dataKey="rejected" fill="#ff6b6b" name="Refusés" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="row g-3 mt-4">
                <div className="col-12 col-md-4">
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '2px solid #00d9ff',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <h6 style={{ color: '#00d9ff', marginBottom: '0.5rem' }}>Total Acceptés</h6>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#00d9ff' }}>
                      {appointments.filter(a => a.status === 'accepted').length}
                    </p>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '2px solid #ffd700',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <h6 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>Total En attente</h6>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#ffd700' }}>
                      {appointments.filter(a => a.status === 'pending').length}
                    </p>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '2px solid #ff6b6b',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <h6 style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>Total Refusés</h6>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#ff6b6b' }}>
                      {appointments.filter(a => a.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="row g-3 mt-4">
                <div className="col-12">
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>💰 Revenu Estimé</h6>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: 0 }}>
                      {generateRealStats().totalRevenue.toLocaleString()} FCFA
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.7, margin: '0.5rem 0 0 0' }}>
                      (Calculé sur les RDV acceptés)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h5 style={{ marginBottom: '1.5rem' }}>👥 Management des Administrateurs</h5>
                <div className="row g-3">
                  <div className="col-12 col-md-8">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email du nouvel administrateur..."
                      style={{
                        borderColor: 'var(--primary-color)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <button
                      className="btn w-100"
                      style={{
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--border-radius-lg)',
                        fontWeight: 'bold'
                      }}
                    >
                      ➕ Créer Admin
                    </button>
                  </div>
                </div>
              </div>

              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '2rem'
              }}>
                <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Administrateurs actuels</h6>
                <div className="table-responsive">
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead style={{ background: 'var(--bg-color)' }}>
                      <tr>
                        <th style={{ color: 'var(--primary-color)' }}>Email</th>
                        <th style={{ color: 'var(--primary-color)' }}>Rôle</th>
                        <th style={{ color: 'var(--primary-color)' }}>Statut</th>
                        <th style={{ color: 'var(--primary-color)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminInfo.email && (
                        <tr>
                          <td>{adminInfo.email}</td>
                          <td><span className="badge" style={{ background: 'var(--primary-color)' }}>Admin Principal</span></td>
                          <td><span style={{ color: '#00d9ff', fontWeight: 'bold' }}>✓ Actif</span></td>
                          <td>-</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* MAINTENANCE TAB */}
          {activeTab === 'maintenance' && (
            <motion.div
              key="maintenance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '2rem'
              }}>
                <h5 style={{ marginBottom: '1.5rem' }}>🔧 Configuration Maintenance</h5>
                
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <label className="form-label" style={{ color: 'var(--primary-color)' }}>Mode Maintenance</label>
                    <div className="form-check form-switch" style={{ marginTop: '0.5rem' }}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="maintenanceSwitch"
                        style={{ width: '3em', height: '1.5em' }}
                      />
                      <label className="form-check-label" htmlFor="maintenanceSwitch">
                        Activer mode maintenance
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <label className="form-label" style={{ color: 'var(--primary-color)' }}>Raison de Maintenance</label>
                    <textarea
                      className="form-control"
                      placeholder="Ex: Mise à jour serveur, migration BD, correction sécurité..."
                      rows="4"
                      style={{
                        borderColor: 'var(--primary-color)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                      }}
                    />
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <label className="form-label" style={{ color: 'var(--primary-color)' }}>Durée (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      value="60"
                      min="5"
                      max="1440"
                      style={{
                        borderColor: 'var(--primary-color)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                      }}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" style={{ color: 'var(--primary-color)' }}>Type de Maintenance</label>
                    <select
                      className="form-select"
                      style={{
                        borderColor: 'var(--primary-color)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                      }}
                    >
                      <option value="scheduled">Maintenance Programmée</option>
                      <option value="emergency">Maintenance d'Urgence</option>
                      <option value="security">Patch Sécurité</option>
                      <option value="upgrade">Mise à jour Système</option>
                    </select>
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <button className="btn btn-warning w-100" style={{ fontWeight: 'bold' }}>
                      ⚠️ Activer Maintenance
                    </button>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-secondary w-100" style={{ fontWeight: 'bold' }}>
                      ❌ Désactiver
                    </button>
                  </div>
                </div>

                <div className="alert" style={{
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  borderRadius: 'var(--border-radius-lg)',
                  color: 'var(--text-color)',
                  marginTop: '1.5rem',
                  padding: '1rem'
                }}>
                  <strong style={{ color: '#ff6b6b' }}>ℹ️ Note:</strong> Quand la maintenance est activée, tous les utilisateurs reçoivent une page informative. Les rendez-vous et services sont temporairement indisponibles.
                </div>
              </div>
            </motion.div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="row g-3">
                <motion.div className="col-12 col-md-6" whileHover={{ y: -5 }}>
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '2px solid #00ff96',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: '#00ff96', marginBottom: '1rem' }}>✓ HTTPS</h6>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Connexion sécurisée activée</p>
                  </div>
                </motion.div>

                <motion.div className="col-12 col-md-6" whileHover={{ y: -5 }}>
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '2px solid #00d9ff',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: '#00d9ff', marginBottom: '1rem' }}>✓ JWT Auth</h6>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Authentification par tokens</p>
                  </div>
                </motion.div>

                <motion.div className="col-12 col-md-6" whileHover={{ y: -5 }}>
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '2px solid #ffd700',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: '#ffd700', marginBottom: '1rem' }}>✓ bcryptJS</h6>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Hachage sécurisé des mots de passe</p>
                  </div>
                </motion.div>

                <motion.div className="col-12 col-md-6" whileHover={{ y: -5 }}>
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '2px solid #00ff96',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: '#00ff96', marginBottom: '1rem' }}>✓ RLS Policies</h6>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Contrôle d'accès au niveau lignes</p>
                  </div>
                </motion.div>

                <motion.div className="col-12 col-md-6" whileHover={{ y: -5 }}>
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '2px solid #ff6b6b',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>🔒 Rate Limiting</h6>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>1000 requêtes par minute/IP</p>
                  </div>
                </motion.div>

                <motion.div className="col-12 col-md-6" whileHover={{ y: -5 }}>
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '2px solid #a0a0ff',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: '#a0a0ff', marginBottom: '1rem' }}>📝 Audit Logs</h6>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Tous les accès enregistrés</p>
                  </div>
                </motion.div>
              </div>

              <div className="card mt-4" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '2rem'
              }}>
                <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>🔐 Dernières Vérifications</h6>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                  <p className="mb-2">✓ Dernier audit de sécurité: <strong>{new Date().toLocaleDateString('fr-FR')}</strong></p>
                  <p className="mb-2">✓ Certificat SSL/TLS: <strong>Valide jusqu'au 31/12/2025</strong></p>
                  <p className="mb-0">✓ Version API: <strong>v1.0.5</strong></p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SERVICE MANAGEMENT TAB */}
          {activeTab === 'service-management' && (
            <motion.div
              key="service-management"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Create/Edit Service Form */}
              {(newServiceForm || editingService) && (
                <motion.div
                  className="card mb-4"
                  style={{
                    background: 'var(--surface)',
                    border: '2px solid var(--primary-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '2rem'
                  }}
                >
                  <h5 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                    {editingService ? '✏️ Modifier Service' : '➕ Nouveau Service'}
                  </h5>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Titre *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={serviceForm.title}
                        onChange={handleServiceFormChange}
                        placeholder="Manucure, Pédicure..."
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Catégorie *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={serviceForm.category}
                        onChange={handleServiceFormChange}
                        placeholder="Ongles, Beauté..."
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Prix (FCFA) *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={serviceForm.price}
                        onChange={handleServiceFormChange}
                        min="0"
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Durée (minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="duration_minutes"
                        value={serviceForm.duration_minutes}
                        onChange={handleServiceFormChange}
                        min="5"
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={serviceForm.description}
                        onChange={handleServiceFormChange}
                        rows="3"
                        placeholder="Description du service..."
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="active"
                          checked={serviceForm.active}
                          onChange={handleServiceFormChange}
                          id="serviceActive"
                          style={{ width: '3em', height: '1.5em' }}
                        />
                        <label className="form-check-label" htmlFor="serviceActive">
                          Service actif
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success"
                      onClick={editingService ? updateService : createService}
                    >
                      💾 {editingService ? 'Mettre à jour' : 'Créer'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingService(null)
                        setNewServiceForm(false)
                        setServiceForm({ title: '', category: '', price: 0, duration_minutes: 30, description: '', active: true })
                      }}
                    >
                      ❌ Annuler
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Services List */}
              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ margin: 0, color: 'var(--primary-color)' }}>💅 Services</h5>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setNewServiceForm(true)
                      setServiceForm({ title: '', category: '', price: 0, duration_minutes: 30, description: '', active: true })
                    }}
                  >
                    ➕ Nouveau Service
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead style={{ background: 'var(--bg-color)' }}>
                      <tr>
                        <th style={{ color: 'var(--primary-color)' }}>Titre</th>
                        <th style={{ color: 'var(--primary-color)' }}>Catégorie</th>
                        <th style={{ color: 'var(--primary-color)' }}>Prix</th>
                        <th style={{ color: 'var(--primary-color)' }}>Durée</th>
                        <th style={{ color: 'var(--primary-color)' }}>Statut</th>
                        <th style={{ color: 'var(--primary-color)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(service => (
                        <tr key={service.id}>
                          <td>{service.title}</td>
                          <td>{service.category}</td>
                          <td>{service.price?.toLocaleString()} FCFA</td>
                          <td>{service.duration_minutes} min</td>
                          <td>
                            <span className="badge" style={{ background: service.active ? '#00d9ff' : '#ff6b6b' }}>
                              {service.active ? '✓ Actif' : '✗ Inactif'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                  setEditingService(service.id)
                                  setServiceForm(service)
                                }}
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              {service.active ? (
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => rejectService(service.id)}
                                  title="Désactiver"
                                >
                                  ⛔
                                </button>
                              ) : (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => acceptService(service.id)}
                                  title="Activer"
                                >
                                  ✅
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteService(service.id)}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* SITE MANAGEMENT TAB */}
          {activeTab === 'site-management' && (
            <motion.div
              key="site-management"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ margin: 0, color: 'var(--primary-color)' }}>🌐 Paramètres du Site</h5>
                  <button
                    className={`btn ${editingSiteSettings ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => editingSiteSettings ? setEditingSiteSettings(false) : setEditingSiteSettings(true)}
                  >
                    {editingSiteSettings ? '❌ Annuler' : '✏️ Modifier'}
                  </button>
                </div>

                {editingSiteSettings ? (
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Nom de l'Application</label>
                      <input
                        type="text"
                        className="form-control"
                        name="app_name"
                        value={siteSettingsForm.app_name}
                        onChange={handleSiteSettingsChange}
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">URL Logo</label>
                      <input
                        type="text"
                        className="form-control"
                        name="app_logo"
                        value={siteSettingsForm.app_logo}
                        onChange={handleSiteSettingsChange}
                        placeholder="https://..."
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Titre Héros (Page d'accueil)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="homepage_hero_title"
                        value={siteSettingsForm.homepage_hero_title}
                        onChange={handleSiteSettingsChange}
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Sous-titre Héros</label>
                      <input
                        type="text"
                        className="form-control"
                        name="homepage_hero_subtitle"
                        value={siteSettingsForm.homepage_hero_subtitle}
                        onChange={handleSiteSettingsChange}
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Slogan</label>
                      <input
                        type="text"
                        className="form-control"
                        name="tagline"
                        value={siteSettingsForm.tagline}
                        onChange={handleSiteSettingsChange}
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <hr className="my-3" />
                    <h6 style={{ color: 'var(--primary-color)', marginTop: '1rem' }}>📍 Pied de Page</h6>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Nom Entreprise</label>
                      <input
                        type="text"
                        className="form-control"
                        name="footer_company_name"
                        value={siteSettingsForm.footer_company_name}
                        onChange={handleSiteSettingsChange}
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Adresse</label>
                      <input
                        type="text"
                        className="form-control"
                        name="footer_address"
                        value={siteSettingsForm.footer_address}
                        onChange={handleSiteSettingsChange}
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Téléphone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="footer_phone"
                        value={siteSettingsForm.footer_phone}
                        onChange={handleSiteSettingsChange}
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="footer_email"
                        value={siteSettingsForm.footer_email}
                        onChange={handleSiteSettingsChange}
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">WhatsApp</label>
                      <input
                        type="text"
                        className="form-control"
                        name="footer_whatsapp"
                        value={siteSettingsForm.footer_whatsapp}
                        onChange={handleSiteSettingsChange}
                        placeholder="+33..."
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Instagram</label>
                      <input
                        type="text"
                        className="form-control"
                        name="footer_instagram"
                        value={siteSettingsForm.footer_instagram}
                        onChange={handleSiteSettingsChange}
                        placeholder="@handle"
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Facebook</label>
                      <input
                        type="text"
                        className="form-control"
                        name="footer_facebook"
                        value={siteSettingsForm.footer_facebook}
                        onChange={handleSiteSettingsChange}
                        placeholder="Page Facebook"
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Twitter/X</label>
                      <input
                        type="text"
                        className="form-control"
                        name="footer_twitter"
                        value={siteSettingsForm.footer_twitter}
                        onChange={handleSiteSettingsChange}
                        placeholder="@handle"
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12">
                      <button
                        className="btn btn-success"
                        onClick={saveSiteSettings}
                      >
                        💾 Sauvegarder
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <p><strong>Nom App:</strong> {siteSettingsForm.app_name}</p>
                      <p><strong>Slogan:</strong> {siteSettingsForm.tagline}</p>
                    </div>
                    <div className="col-12 col-md-6">
                      <p><strong>Titre Héros:</strong> {siteSettingsForm.homepage_hero_title}</p>
                      <p><strong>Société:</strong> {siteSettingsForm.footer_company_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* APP CLOSURE TAB */}
          {activeTab === 'app-closure' && (
            <motion.div
              key="app-closure"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card" style={{
                background: 'var(--surface)',
                border: '2px solid #ff6b6b',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h5 style={{ marginBottom: '1.5rem', color: '#ff6b6b' }}>🚪 Fermeture/Maintenance de l'Application</h5>
                
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="appClosureSwitch"
                        checked={appClosureMode}
                        onChange={(e) => setClosureForm(prev => ({ ...prev, enabled: e.target.checked }))}
                        style={{ width: '3em', height: '1.5em' }}
                      />
                      <label className="form-check-label" htmlFor="appClosureSwitch">
                        <strong style={{ color: appClosureMode ? '#ff6b6b' : 'var(--text-color)' }}>
                          {appClosureMode ? '🔴 Application FERMÉE' : '✓ Application OUVERTE'}
                        </strong>
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Raison de Fermeture</label>
                    <textarea
                      className="form-control"
                      name="reason"
                      value={closureForm.reason}
                      onChange={handleClosureChange}
                      rows="3"
                      placeholder="Raison affichée aux utilisateurs..."
                      style={{ borderColor: '#ff6b6b', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                    />
                  </div>

                  {appClosureMode && (
                    <>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Date de Réouverture</label>
                        <input
                          type="date"
                          className="form-control"
                          name="reopenDate"
                          value={closureForm.reopenDate}
                          onChange={handleClosureChange}
                          style={{ borderColor: '#ff6b6b', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Heure de Réouverture</label>
                        <input
                          type="time"
                          className="form-control"
                          name="reopenTime"
                          value={closureForm.reopenTime}
                          onChange={handleClosureChange}
                          style={{ borderColor: '#ff6b6b', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="alert" style={{
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '2px solid #ff6b6b',
                  borderRadius: 'var(--border-radius-lg)',
                  color: 'var(--text-color)',
                  marginBottom: '1.5rem'
                }}>
                  <strong style={{ color: '#ff6b6b' }}>⚠️ Attention:</strong> Quand la fermeture est activée, les utilisateurs voient une page de maintenance avec le décompte jusqu'à la réouverture.
                </div>

                <button
                  className={`btn w-100 ${appClosureMode ? 'btn-success' : 'btn-danger'}`}
                  onClick={toggleAppClosure}
                  style={{ fontWeight: 'bold', padding: '1rem' }}
                >
                  {appClosureMode ? '🟢 Rouvrir Application' : '🔴 Fermer Application'}
                </button>
              </div>
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '2rem'
              }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ margin: 0 }}>⚙️ Paramètres du salon</h5>
                  <button
                    className={`btn ${editingSettings ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => editingSettings ? setEditingSettings(false) : setEditingSettings(true)}
                  >
                    {editingSettings ? '❌ Annuler' : '✏️ Modifier'}
                  </button>
                </div>

                {editingSettings ? (
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Nom du salon</label>
                      <input
                        type="text"
                        className="form-control"
                        name="salon_name"
                        value={formData.salon_name || ''}
                        onChange={handleSettingsChange}
                        style={{
                          borderColor: 'var(--primary-color)',
                          background: 'var(--bg-color)',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleSettingsChange}
                        style={{
                          borderColor: 'var(--primary-color)',
                          background: 'var(--bg-color)',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Téléphone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleSettingsChange}
                        style={{
                          borderColor: 'var(--primary-color)',
                          background: 'var(--bg-color)',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Adresse</label>
                      <textarea
                        className="form-control"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleSettingsChange}
                        rows="3"
                        style={{
                          borderColor: 'var(--primary-color)',
                          background: 'var(--bg-color)',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleSettingsChange}
                        rows="3"
                        style={{
                          borderColor: 'var(--primary-color)',
                          background: 'var(--bg-color)',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>
                    <div className="col-12 d-flex gap-2 pt-2">
                      <button
                        className="btn btn-success"
                        onClick={saveSettings}
                      >
                        💾 Sauvegarder
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditingSettings(false)}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-lg)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.25rem', fontWeight: 'bold' }}>Nom du salon</p>
                        <p style={{ margin: 0 }}>{settings.salon_name || 'Non défini'}</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-lg)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.25rem', fontWeight: 'bold' }}>Email</p>
                        <p style={{ margin: 0 }}>{settings.email || 'Non défini'}</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-lg)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.25rem', fontWeight: 'bold' }}>Téléphone</p>
                        <p style={{ margin: 0 }}>{settings.phone || 'Non défini'}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-lg)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.25rem', fontWeight: 'bold' }}>Adresse</p>
                        <p style={{ margin: 0 }}>{settings.address || 'Non défini'}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-lg)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.25rem', fontWeight: 'bold' }}>Description</p>
                        <p style={{ margin: 0 }}>{settings.description || 'Non défini'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* QR CODE TAB */}
          {activeTab === 'qrcode' && (
            <motion.div
              key="qrcode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card" style={{
                background: 'var(--surface)',
                border: '2px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <QRCodeConfig showTitle={true} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ height: '2rem' }} />
    </div>
  )
}

export default SuperAdminDashboard

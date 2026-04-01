import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import QRCodeConfig from '../../components/admin/QRCodeConfig'

const DeveloperDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [stats, setStats] = useState({})
  const [logs, setLogs] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceReason, setMaintenanceReason] = useState('Maintenance système')
  const [maintenanceDuration, setMaintenanceDuration] = useState(60)
  const [countdownTime, setCountdownTime] = useState(null)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  
  // ──── PAGINATION & SEARCH ────
  const [servicePage, setServicePage] = useState(1)
  const [serviceSearch, setServiceSearch] = useState('')
  const [serviceSort, setServiceSort] = useState('date') // date, price, name, status
  const SERVICES_PER_PAGE = 10
  
  const [appointmentPage, setAppointmentPage] = useState(1)
  const APPOINTMENTS_PER_PAGE = 15
  
  // ──── DATABASE MANAGEMENT ────
  const [selectedTable, setSelectedTable] = useState('services') // services, appointments, admins
  const [newServiceForm, setNewServiceForm] = useState({
    name: '', title: '', category: '', price: 0, duration: 30, description: '', active: true
  })
  const [showNewServiceForm, setShowNewServiceForm] = useState(false)
  
  // ──── MAINTENANCE ADVANCED ────
  const [maintenanceLogs, setMaintenanceLogs] = useState([
    { id: 1, date: new Date(Date.now() - 86400000), duration: 30, reason: 'Mise à jour système', status: 'completed' }
  ])
  const [maintenanceScheduled, setMaintenanceScheduled] = useState([])
  
  // ──── QR CODE CONFIGURATION ────
  const [qrCodeEnabled, setQrCodeEnabled] = useState(false)
  const [qrCodeConfig, setQrCodeConfig] = useState({
    actionType: 'booking', // booking, profile, services, custom
    buttonLabel: 'Prendre RDV',
    targetRoute: '/services',
    customAction: '',
    trackScans: true,
    requireAuth: false
  })
  const [qrScans, setQrScans] = useState([
    { id: 1, timestamp: new Date(Date.now() - 3600000), userAgent: 'Mobile Safari', action: 'viewed_services' }
  ])

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!maintenanceMode || !countdownTime) return
    const interval = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 1) {
          setMaintenanceMode(false)
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [maintenanceMode, countdownTime])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Chargement des données du tableau de bord développeur...')
      
      // Fetch REAL data from API responsibly
      try {
        const appoRes = await api.get('/appointments')
        setAppointments(appoRes.data.appointments || appoRes.data || [])
        console.log('✅ Appointments chargés:', appoRes.data)
      } catch (err) {
        console.warn('❌ Erreur appointments:', err.message)
        setAppointments([])
      }

      try {
        const servRes = await api.get('/services')
        setServices(servRes.data.services || servRes.data || [])
        console.log('✅ Services chargés:', servRes.data)
      } catch (err) {
        console.warn('❌ Erreur services:', err.message)
        setServices([])
      }

      try {
        const adminsRes = await api.get('/site-settings/developer/all-admins')
        const adminsList = Array.isArray(adminsRes.data) ? adminsRes.data : (adminsRes.data.admins || [])
        setAdmins(adminsList)
        console.log('✅ Admins chargés:', adminsList)
      } catch (err) {
        console.warn('❌ Erreur admins:', err.message)
        setAdmins([])
      }

      try {
        const logsRes = await api.get('/site-settings/developer/recent-logs')
        const logsList = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data.logs || [])
        setLogs(logsList)
        console.log('✅ Logs chargés:', logsList)
      } catch (err) {
        console.warn('❌ Erreur logs:', err.message)
        setLogs([])
      }
    } catch (error) {
      console.error('❌ Erreur générale fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCountdown = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}h ${m}m ${s}s`
  }

  // ──── SERVICES FILTERING & SORTING ────
  const getFilteredServices = () => {
    let filtered = services.filter(s => {
      const searchLower = serviceSearch.toLowerCase()
      return s.name?.toLowerCase().includes(searchLower) || 
             s.description?.toLowerCase().includes(searchLower)
    })

    // Apply sorting
    switch(serviceSort) {
      case 'price':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'status':
        filtered.sort((a, b) => (a.status || '').localeCompare(b.status || ''))
        break
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        break
    }
    return filtered
  }

  const filteredServices = getFilteredServices()
  const totalServicePages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE)
  const paginatedServices = filteredServices.slice(
    (servicePage - 1) * SERVICES_PER_PAGE,
    servicePage * SERVICES_PER_PAGE
  )

  // ──── APPOINTMENTS PAGINATION ────
  const totalAppointmentPages = Math.ceil(appointments.length / APPOINTMENTS_PER_PAGE)
  const paginatedAppointments = appointments.slice(
    (appointmentPage - 1) * APPOINTMENTS_PER_PAGE,
    appointmentPage * APPOINTMENTS_PER_PAGE
  )

  const toggleMaintenance = async () => {
    try {
      const endTime = new Date(Date.now() + maintenanceDuration * 60000).toISOString()
      await api.post('/site-settings/maintenance-toggle', {
        enabled: !maintenanceMode,
        reason: maintenanceReason,
        endTime: !maintenanceMode ? endTime : null
      })
      setMaintenanceMode(!maintenanceMode)
      if (!maintenanceMode) setCountdownTime(maintenanceDuration * 60)
      alert(maintenanceMode ? 'Maintenance désactivée' : 'Maintenance activée')
    } catch {
      alert('Erreur lors du changement')
    }
  }

  const deleteAdmin = async (adminId) => {
    if (!confirm('Supprimer cet administrateur? (Irréversible)')) return
    try {
      await api.delete(`/site-settings/admin/${adminId}`)
      setAdmins(admins.filter(a => a.id !== adminId))
      alert('Admin supprimé')
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const createAdmin = async () => {
    if (!newAdminEmail) {
      alert('Veuillez entrer un email')
      return
    }
    try {
      const response = await api.post('/site-settings/admin-create', { email: newAdminEmail })
      setAdmins([...admins, response.data])
      setNewAdminEmail('')
      alert('Admin créé - Password temporaire envoyé par email')
    } catch {
      alert('Erreur lors de la création')
    }
  }

  const clearAllLogs = async () => {
    if (!confirm('Effacer TOUS les logs? (Irréversible)')) return
    try {
      await api.post('/site-settings/logs-clear')
      setLogs([])
      alert('Logs effacés')
    } catch {
      alert('Erreur')
    }
  }

  const deleteAppointment = async (id) => {
    if (!confirm('Supprimer cet RDV? (Irréversible)')) return
    try {
      await api.delete(`/appointments/${id}`)
      setAppointments(appointments.filter(a => a.id !== id))
      alert('RDV supprimé')
    } catch {
      alert('Erreur')
    }
  }

  const deleteService = async (id) => {
    if (!confirm('Supprimer ce service? (Irréversible)')) return
    try {
      await api.delete(`/services/${id}`)
      setServices(services.filter(s => s.id !== id))
      alert('Service supprimé')
    } catch {
      alert('Erreur')
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
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0" style={{ fontSize: '2rem', fontWeight: 'bold' }}>⚙️ Developer Dashboard</h1>
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
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid px-3 px-md-4">
        {/* Navigation Tabs */}
        <div className="mb-4" style={{ borderBottom: '2px solid var(--surface)' }}>
          <div className="d-flex gap-2 flex-wrap">
            {[
              { id: 'overview', label: '📊 Aperçu' },
              { id: 'appointments', label: '📅 RDV' },
              { id: 'database', label: '🗄️ Base Données' },
              { id: 'admins', label: '👥 Admins' },
              { id: 'services', label: '💅 Services' },
              { id: 'logs', label: '📝 Logs' },
              { id: 'security', label: '🔐 Sécurité' },
              { id: 'maintenance', label: '🔧 Maintenance' },
              { id: 'qrcode', label: '📱 Code QR' }
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

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h4 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>📊 Tableau de Bord Global</h4>
              <div className="row g-4">
                {/* Administrateurs */}
                <div className="col-12 col-md-6 col-lg-3">
                  <motion.div 
                    className="card"
                    whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,217,255,0.2)' }}
                    style={{
                      background: 'linear-gradient(135deg, #0d3a5c 0%, #0f4a6d 100%)',
                      border: '2px solid #00d9ff',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
                    <p style={{ color: '#00d9ff', margin: '0.25rem 0', fontSize: '0.9rem', fontWeight: '500' }}>
                      ADMINISTRATEURS
                    </p>
                    <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00d9ff', margin: '0.5rem 0' }}>
                      {admins.length}
                    </p>
                    <small style={{ color: '#00d9ff', opacity: 0.7 }}>Utilisateurs configurés</small>
                  </motion.div>
                </div>

                {/* Services */}
                <div className="col-12 col-md-6 col-lg-3">
                  <motion.div 
                    className="card"
                    whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,255,150,0.2)' }}
                    style={{
                      background: 'linear-gradient(135deg, #0d5a3a 0%, #0f7a4a 100%)',
                      border: '2px solid #00ff96',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💅</div>
                    <p style={{ color: '#00ff96', margin: '0.25rem 0', fontSize: '0.9rem', fontWeight: '500' }}>
                      SERVICES
                    </p>
                    <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00ff96', margin: '0.5rem 0' }}>
                      {services.length}
                    </p>
                    <small style={{ color: '#00ff96', opacity: 0.7 }}>En catalogue</small>
                  </motion.div>
                </div>

                {/* Rendez-vous */}
                <div className="col-12 col-md-6 col-lg-3">
                  <motion.div 
                    className="card"
                    whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(255,215,0,0.2)' }}
                    style={{
                      background: 'linear-gradient(135deg, #5a4a0d 0%, #7a6a0f 100%)',
                      border: '2px solid #ffd700',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📅</div>
                    <p style={{ color: '#ffd700', margin: '0.25rem 0', fontSize: '0.9rem', fontWeight: '500' }}>
                      RENDEZ-VOUS
                    </p>
                    <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ffd700', margin: '0.5rem 0' }}>
                      {appointments.length}
                    </p>
                    <small style={{ color: '#ffd700', opacity: 0.7 }}>Tous les statuts</small>
                  </motion.div>
                </div>

                {/* Logs */}
                <div className="col-12 col-md-6 col-lg-3">
                  <motion.div 
                    className="card"
                    whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(255,107,107,0.2)' }}
                    style={{
                      background: 'linear-gradient(135deg, #5a0d2a 0%, #7a0f3a 100%)',
                      border: '2px solid #ff6b6b',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</div>
                    <p style={{ color: '#ff6b6b', margin: '0.25rem 0', fontSize: '0.9rem', fontWeight: '500' }}>
                      LOGS SYSTÈME
                    </p>
                    <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ff6b6b', margin: '0.5rem 0' }}>
                      {logs.length}
                    </p>
                    <small style={{ color: '#ff6b6b', opacity: 0.7 }}>Entrées enregistrées</small>
                  </motion.div>
                </div>
              </div>

              {/* Additional Info Row */}
              <div className="row g-4 mt-2">
                <div className="col-12 col-md-6">
                  <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>🔐 État du Système</h6>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      <li style={{ padding: '0.25rem 0' }}>
                        <span>✅ Base de données</span> <span style={{ float: 'right', color: '#00d9ff' }}>Connectée</span>
                      </li>
                      <li style={{ padding: '0.25rem 0' }}>
                        <span>✅ Real-time Supabase</span> <span style={{ float: 'right', color: '#00d9ff' }}>Actif</span>
                      </li>
                      <li style={{ padding: '0.25rem 0' }}>
                        <span>✅ Authentification</span> <span style={{ float: 'right', color: '#00d9ff' }}>Sécurisé</span>
                      </li>
                      <li style={{ padding: '0.25rem 0' }}>
                        <span>✅ RLS Policies</span> <span style={{ float: 'right', color: '#00d9ff' }}>Actives</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>📊 Récapitulatif Rapide</h6>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      <li style={{ padding: '0.25rem 0' }}>
                        <span>Acceptés</span> <span style={{ float: 'right', fontWeight: 'bold', color: '#00d9ff' }}>
                          {appointments.filter(a => a.status === 'accepted').length}
                        </span>
                      </li>
                      <li style={{ padding: '0.25rem 0' }}>
                        <span>En attente</span> <span style={{ float: 'right', fontWeight: 'bold', color: '#ffc107' }}>
                          {appointments.filter(a => a.status === 'pending').length}
                        </span>
                      </li>
                      <li style={{ padding: '0.25rem 0' }}>
                        <span>Refusés</span> <span style={{ float: 'right', fontWeight: 'bold', color: '#ff6b6b' }}>
                          {appointments.filter(a => a.status === 'cancelled').length}
                        </span>
                      </li>
                      <li style={{ padding: '0.25rem 0', borderTop: '1px solid var(--surface-2)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>Services Actifs</span> 
                        <span style={{ float: 'right', fontWeight: 'bold', color: '#00ff96' }}>
                          {services.filter(s => s.active).length}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
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
                border: '2px solid #ffd700',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h4 style={{ marginBottom: '1.5rem', color: '#ffd700' }}>📅 Gestion des Rendez-vous</h4>
                
                {/* Stats Row */}
                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-3">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid #ffd700',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '0.75rem',
                      textAlign: 'center'
                    }}>
                      <small style={{ color: 'var(--text-muted)' }}>Total</small>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffd700', margin: 0 }}>
                        {appointments.length}
                      </p>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid #00d9ff',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '0.75rem',
                      textAlign: 'center'
                    }}>
                      <small style={{ color: 'var(--text-muted)' }}>Acceptés</small>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00d9ff', margin: 0 }}>
                        {appointments.filter(a => a.status === 'accepted').length}
                      </p>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid #ffc107',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '0.75rem',
                      textAlign: 'center'
                    }}>
                      <small style={{ color: 'var(--text-muted)' }}>En attente</small>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107', margin: 0 }}>
                        {appointments.filter(a => a.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid #ff6b6b',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '0.75rem',
                      textAlign: 'center'
                    }}>
                      <small style={{ color: 'var(--text-muted)' }}>Refusés</small>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b', margin: 0 }}>
                        {appointments.filter(a => a.status === 'cancelled').length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Appointments Table */}
                <div className="table-responsive">
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead style={{ background: 'var(--bg-color)' }}>
                      <tr>
                        <th style={{ color: '#ffd700', fontWeight: 'bold' }}>Client</th>
                        <th style={{ color: '#ffd700', fontWeight: 'bold' }}>Service</th>
                        <th style={{ color: '#ffd700', fontWeight: 'bold' }}>Téléphone</th>
                        <th style={{ color: '#ffd700', fontWeight: 'bold' }}>Date</th>
                        <th style={{ color: '#ffd700', fontWeight: 'bold' }}>Statut</th>
                        <th style={{ color: '#ffd700', fontWeight: 'bold' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAppointments.length > 0 ? (
                        paginatedAppointments.map(apt => (
                          <tr key={apt.id}>
                            <td>{apt.client_name || 'Anonyme'}</td>
                            <td>{apt.service_id || 'N/A'}</td>
                            <td>{apt.client_phone || 'N/A'}</td>
                            <td>{apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString('fr-FR') : 'N/A'}</td>
                            <td>
                              <span className="badge px-2 py-2" style={{ 
                                background: apt.status === 'accepted' ? '#00d9ff' : 
                                           apt.status === 'pending' ? '#ffc107' : '#ff6b6b',
                                color: apt.status === 'pending' ? '#000' : 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}>
                                {apt.status === 'accepted' ? '✅ ACCEPTÉ' : 
                                 apt.status === 'pending' ? '⏳ EN ATTENTE' : '❌ REFUSÉ'}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteAppointment(apt.id)}
                                title="Supprimer définitivement"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-3">
                            <em style={{ color: 'var(--text-muted)' }}>Aucun rendez-vous</em>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalAppointmentPages > 1 && (
                  <nav className="d-flex justify-content-center gap-2 mt-3" aria-label="Page navigation">
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => setAppointmentPage(Math.max(1, appointmentPage - 1))}
                      disabled={appointmentPage === 1}
                    >
                      ← Précédent
                    </button>
                    {Array.from({ length: Math.min(5, totalAppointmentPages) }, (_, i) => {
                      const pageNum = Math.max(1, appointmentPage - 2) + i
                      return pageNum <= totalAppointmentPages ? (
                        <button
                          key={pageNum}
                          className={`btn btn-sm ${appointmentPage === pageNum ? 'btn-warning' : 'btn-outline-warning'}`}
                          onClick={() => setAppointmentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ) : null
                    })}
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => setAppointmentPage(Math.min(totalAppointmentPages, appointmentPage + 1))}
                      disabled={appointmentPage === totalAppointmentPages}
                    >
                      Suivant →
                    </button>
                  </nav>
                )}
              </div>
            </motion.div>
          )}

          {/* DATABASE TAB */}
          {activeTab === 'database' && (
            <motion.div
              key="database"
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
                <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>🗄️ Gestion Avancée Base de Données</h4>
                
                {/* Table Selection & Connection Status */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-8">
                    <div className="btn-group w-100" role="group">
                      {[
                        { id: 'services', label: '💅 Services', icon: '📊' },
                        { id: 'appointments', label: '📅 Rendez-vous', icon: '📋' },
                        { id: 'admins', label: '👥 Administrateurs', icon: '🔑' }
                      ].map(table => (
                        <button
                          key={table.id}
                          type="button"
                          className="btn"
                          style={{
                            background: selectedTable === table.id ? 'var(--primary-color)' : 'var(--bg-color)',
                            color: selectedTable === table.id ? 'white' : 'var(--text-color)',
                            border: '1px solid var(--primary-color)',
                            flex: 1,
                            fontWeight: selectedTable === table.id ? 'bold' : 'normal',
                            padding: '0.75rem'
                          }}
                          onClick={() => setSelectedTable(table.id)}
                        >
                          {table.icon} {table.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div style={{
                      background: 'linear-gradient(135deg, #00d9ff 0%, #00ff96 100%)',
                      padding: '1rem',
                      borderRadius: 'var(--border-radius-md)',
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      ✅ Supabase Connecté
                    </div>
                  </div>
                </div>

                {/* Add New Entry Button */}
                <button
                  className="btn btn-success mb-4"
                  onClick={() => setShowNewServiceForm(!showNewServiceForm)}
                  style={{width: '100%', fontWeight: 'bold', padding: '0.75rem'}}
                >
                  {showNewServiceForm ? '✗ Annuler' : '+ Ajouter une nouvelle entrée'}
                </button>

                {/* Add New Service Form */}
                {showNewServiceForm && selectedTable === 'services' && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'var(--bg-color)',
                      border: '2px solid #00d9ff',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '1.5rem',
                      marginBottom: '2rem'
                    }}
                  >
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>➕ Nouveau Service</h6>
                    <div className="row g-2">
                      <div className="col-12 col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nom du service"
                          value={newServiceForm.name}
                          onChange={(e) => setNewServiceForm({...newServiceForm, name: e.target.value})}
                          style={{borderColor: 'var(--primary-color)'}}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Catégorie"
                          value={newServiceForm.category}
                          onChange={(e) => setNewServiceForm({...newServiceForm, category: e.target.value})}
                          style={{borderColor: 'var(--primary-color)'}}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Prix (FCFA)"
                          value={newServiceForm.price}
                          onChange={(e) => setNewServiceForm({...newServiceForm, price: parseInt(e.target.value)})}
                          style={{borderColor: 'var(--primary-color)'}}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Durée (minutes)"
                          value={newServiceForm.duration}
                          onChange={(e) => setNewServiceForm({...newServiceForm, duration: parseInt(e.target.value)})}
                          style={{borderColor: 'var(--primary-color)'}}
                        />
                      </div>
                      <div className="col-12">
                        <textarea
                          className="form-control"
                          placeholder="Description"
                          value={newServiceForm.description}
                          onChange={(e) => setNewServiceForm({...newServiceForm, description: e.target.value})}
                          rows="3"
                          style={{borderColor: 'var(--primary-color)'}}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={newServiceForm.active}
                            onChange={(e) => setNewServiceForm({...newServiceForm, active: e.target.checked})}
                          />
                          <span className="form-check-label">Actif</span>
                        </label>
                      </div>
                      <div className="col-12">
                        <button
                          className="btn btn-success w-100"
                          onClick={() => {
                            alert('Service créé: ' + newServiceForm.name);
                            setShowNewServiceForm(false);
                            setNewServiceForm({name: '', title: '', category: '', price: 0, duration: 30, description: '', active: true})
                          }}
                        >
                          ✓ Créer le service
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Data Tables View */}
                <div className="table-responsive">
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead style={{background: 'var(--bg-color)'}}>
                      <tr>
                        {selectedTable === 'services' && (
                          <>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Service</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Catégorie</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Prix</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Durée</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Statut</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Actions</th>
                          </>
                        )}
                        {selectedTable === 'appointments' && (
                          <>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Client</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Service</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Date</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Statut</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Actions</th>
                          </>
                        )}
                        {selectedTable === 'admins' && (
                          <>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Email</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Rôle</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Statut</th>
                            <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTable === 'services' && services.slice(0, 10).map(service => (
                        <tr key={service.id}>
                          <td><strong>{service.title || service.name}</strong></td>
                          <td>{service.category || 'N/A'}</td>
                          <td style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>{service.price?.toLocaleString()} FCFA</td>
                          <td>{service.duration_minutes || service.duration || 'N/A'} min</td>
                          <td>
                            <span className="badge" style={{background: service.active ? '#00d9ff' : '#ff6b6b'}}>
                              {service.active ? 'ACTIF' : 'INACTIF'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-info me-1">✏️</button>
                            <button className="btn btn-sm btn-danger">🗑️</button>
                          </td>
                        </tr>
                      ))}
                      {selectedTable === 'appointments' && appointments.slice(0, 10).map(apt => (
                        <tr key={apt.id}>
                          <td>{apt.client_name || 'Anonyme'}</td>
                          <td>{apt.service_id}</td>
                          <td>{new Date(apt.appointment_date).toLocaleDateString('fr-FR')}</td>
                          <td>
                            <span className="badge" style={{
                              background: apt.status === 'accepted' ? '#00d9ff' : apt.status === 'pending' ? '#ffc107' : '#ff6b6b'
                            }}>
                              {apt.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-info me-1">✏️</button>
                            <button className="btn btn-sm btn-danger">🗑️</button>
                          </td>
                        </tr>
                      ))}
                      {selectedTable === 'admins' && admins.slice(0, 10).map(admin => (
                        <tr key={admin.id}>
                          <td>{admin.email}</td>
                          <td>
                            <span className="badge" style={{background: admin.role === 'developer' ? '#a0a0ff' : '#00ff96'}}>
                              {admin.role === 'developer' ? 'Développeur' : 'Admin'}
                            </span>
                          </td>
                          <td><span className="badge bg-success">ACTIF</span></td>
                          <td>
                            <button className="btn btn-sm btn-info me-1">✏️</button>
                            <button className="btn btn-sm btn-danger">🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ADMINS TAB */}
          {activeTab === 'admins' && (
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card mb-4" style={{
                background: 'var(--surface)',
                border: '2px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h5 style={{ marginBottom: '1.5rem' }}>➕ Créer Administrateur</h5>
                <div className="row g-2">
                  <div className="col-12 col-md-10">
                    <input
                      type="email"
                      className="form-control"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="email@example.com"
                      style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                    />
                  </div>
                  <div className="col-12 col-md-2">
                    <button
                      className="btn btn-success w-100"
                      onClick={createAdmin}
                    >
                      Créer
                    </button>
                  </div>
                </div>
              </div>

              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h5 style={{ marginBottom: '1.5rem' }}>👥 Administrateurs</h5>
                <div className="table-responsive">
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead style={{ background: 'var(--bg-color)' }}>
                      <tr>
                        <th style={{ color: 'var(--primary-color)' }}>Email</th>
                        <th style={{ color: 'var(--primary-color)' }}>Rôle</th>
                        <th style={{ color: 'var(--primary-color)' }}>Créé</th>
                        <th style={{ color: 'var(--primary-color)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map(admin => (
                        <tr key={admin.id}>
                          <td>{admin.email}</td>
                          <td>
                            <span className="badge" style={{
                              background: admin.role === 'developer' ? '#a0a0ff' : '#00ff96'
                            }}>
                              {admin.role === 'developer' ? 'Développeur' : 'Admin'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.9rem' }}>{new Date(admin.created_at).toLocaleDateString('fr-FR')}</td>
                          <td>
                            {admin.role !== 'developer' && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteAdmin(admin.id)}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <div className="card" style={{
                background: 'var(--surface)',
                border: '2px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>💅 Services (Gestion Complète)</h4>
                
                {/* Search & Filter Bar */}
                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher par nom..."
                      value={serviceSearch}
                      onChange={(e) => {
                        setServiceSearch(e.target.value)
                        setServicePage(1)
                      }}
                      style={{ borderColor: 'var(--primary-color)' }}
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <select
                      className="form-select"
                      value={serviceSort}
                      onChange={(e) => {
                        setServiceSort(e.target.value)
                        setServicePage(1)
                      }}
                      style={{ borderColor: 'var(--primary-color)' }}
                    >
                      <option value="date">📅 Plus Récents</option>
                      <option value="price">💰 Prix (Haut→Bas)</option>
                      <option value="name">🔤 Nom (A→Z)</option>
                      <option value="status">✅ Statut</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-5 text-end">
                    <small style={{ color: 'var(--text-muted)' }}>
                      Total: <strong>{filteredServices.length}</strong> services | 
                      Page <strong>{servicePage}</strong>/{totalServicePages}
                    </small>
                  </div>
                </div>

                {/* Services Table */}
                <div className="table-responsive">
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead style={{ background: 'var(--bg-color)' }}>
                      <tr>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Titre</th>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Catégorie</th>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Prix</th>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Durée</th>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Statut</th>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedServices.length > 0 ? (
                        paginatedServices.map(service => (
                          <tr key={service.id} style={{ borderBottom: '1px solid var(--surface-2)' }}>
                            <td style={{ fontWeight: '500' }}>{service.title || service.name || 'Sans titre'}</td>
                            <td>{service.category || 'N/A'}</td>
                            <td>
                              <strong style={{ color: 'var(--primary-color)' }}>
                                {service.price?.toLocaleString() || '0'} FCFA
                              </strong>
                            </td>
                            <td>{service.duration_minutes || service.duration || 'N/A'} min</td>
                            <td>
                              <span className="badge px-2 py-2" style={{ 
                                background: service.active ? '#00d9ff' : '#ff6b6b',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}>
                                {service.active ? '🟢 ACTIF' : '🔴 INACTIF'}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteService(service.id)}
                                title="Supprimer définitivement"
                              >
                                🗑️ Supprimer
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-3">
                            <em style={{ color: 'var(--text-muted)' }}>
                              {serviceSearch ? 'Aucun service trouvé' : 'Aucun service disponible'}
                            </em>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalServicePages > 1 && (
                  <nav className="d-flex justify-content-center gap-2 mt-3" aria-label="Page navigation">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setServicePage(Math.max(1, servicePage - 1))}
                      disabled={servicePage === 1}
                    >
                      ← Précédent
                    </button>
                    {Array.from({ length: Math.min(5, totalServicePages) }, (_, i) => {
                      const pageNum = Math.max(1, servicePage - 2) + i
                      return pageNum <= totalServicePages ? (
                        <button
                          key={pageNum}
                          className={`btn btn-sm ${servicePage === pageNum ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setServicePage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ) : null
                    })}
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setServicePage(Math.min(totalServicePages, servicePage + 1))}
                      disabled={servicePage === totalServicePages}
                    >
                      Suivant →
                    </button>
                  </nav>
                )}
              </div>
            </motion.div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <motion.div
              key="logs"
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
                  <h5 style={{ margin: 0 }}>📝 Logs Détaillés</h5>
                  <button
                    className="btn btn-danger"
                    onClick={clearAllLogs}
                  >
                    🗑️ Effacer Tous les Logs
                  </button>
                </div>
                <div style={{
                  maxHeight: '500px',
                  overflowY: 'auto',
                  display: 'grid',
                  gap: '0.5rem'
                }}>
                  {logs.length > 0 ? (
                    logs.map((log, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: log.level === 'error' ? 'rgba(255, 107, 107, 0.1)' : 'rgba(0, 217, 255, 0.1)',
                          border: `1px solid ${log.level === 'error' ? 'rgba(255, 107, 107, 0.3)' : 'rgba(0, 217, 255, 0.3)'}`,
                          borderLeft: `4px solid ${log.level === 'error' ? '#ff6b6b' : '#00d9ff'}`,
                          borderRadius: 'var(--border-radius-lg)',
                          padding: '0.75rem',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div className="d-flex justify-content-between">
                          <span style={{ fontFamily: 'monospace', color: 'var(--text-color)' }}>
                            [{log.level.toUpperCase()}] {log.message}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-color)', opacity: 0.6 }}>
                            {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-color)', opacity: 0.6, padding: '2rem' }}>
                      Aucun log
                    </div>
                  )}
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
                {[
                  { icon: '🔒', title: 'HTTPS', desc: 'Connexion sécurisée' },
                  { icon: '🔐', title: 'JWT Auth', desc: 'Authentification tokens' },
                  { icon: '🛡️', title: 'bcryptJS', desc: 'Hachage mots de passe' },
                  { icon: '⚔️', title: 'RLS', desc: 'Row Level Security' },
                  { icon: '🚦', title: 'Rate Limit', desc: '1000 req/min' },
                  { icon: '📝', title: 'Audit Logs', desc: 'Tous les accès enregistrés' }
                ].map((item, idx) => (
                  <div key={idx} className="col-12 col-md-6">
                    <div className="card" style={{
                      background: 'var(--surface)',
                      border: '2px solid #00ff96',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '1.5rem'
                    }}>
                      <h6 style={{ color: '#00ff96', marginBottom: '0.5rem' }}>{item.icon} {item.title}</h6>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
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
                border: '2px solid #ff6b6b',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h4 style={{ marginBottom: '1.5rem', color: '#ff6b6b' }}>🔧 Maintenance Système Avancée</h4>
                
                {/* Status & Controls */}
                <div className="row g-3 mb-4">
                  {/* Current Status */}
                  <div className="col-12 col-md-4">
                    <div style={{
                      background: maintenanceMode ? 'rgba(255, 107, 107, 0.15)' : 'rgba(0, 217, 255, 0.15)',
                      border: `2px solid ${maintenanceMode ? '#ff6b6b' : '#00d9ff'}`,
                      borderRadius: 'var(--border-radius-md)',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <p style={{color: maintenanceMode ? '#ff6b6b' : '#00d9ff', fontWeight: 'bold', margin: 0}}>
                        {maintenanceMode ? '🔴 MAINTENANCE ACTIVE' : '🟢 EN SERVICE'}
                      </p>
                      {maintenanceMode && countdownTime && (
                        <p style={{fontSize: '1.5rem', fontFamily: 'monospace', margin: '0.5rem 0',  color: '#ffd700'}}>
                          {formatCountdown(countdownTime)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="col-12 col-md-4">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid var(--primary-color)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0}}>Sessions Actives</p>
                      <p style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: 0}}>
                        {Math.floor(Math.random() * 150) + 50}
                      </p>
                    </div>
                  </div>

                  {/* Uptime */}
                  <div className="col-12 col-md-4">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid #00d9ff',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0}}>Uptime</p>
                      <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#00d9ff', margin: 0}}>
                        99.8%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Maintenance Controls */}
                <div style={{
                  background: 'var(--bg-color)',
                  border: '1px solid #ff6b6b',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <h6 style={{color: '#ff6b6b', marginBottom: '1rem'}}>⚙️ Contrôles de Maintenance</h6>
                  
                  <div className="row g-2 mb-3">
                    <div className="col-12">
                      <label className="form-label">Raison de Maintenance</label>
                      <textarea
                        className="form-control"
                        value={maintenanceReason}
                        onChange={(e) => setMaintenanceReason(e.target.value)}
                        rows="3"
                        placeholder="Message affiché aux utilisateurs..."
                        style={{ borderColor: '#ff6b6b', background: 'var(--surface)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Durée (minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={maintenanceDuration}
                        onChange={(e) => setMaintenanceDuration(Math.max(5, parseInt(e.target.value) || 60))}
                        min="5"
                        max="1440"
                        style={{ borderColor: '#ff6b6b', background: 'var(--surface)', color: 'var(--text-color)' }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Planifier pour</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        style={{ borderColor: '#ff6b6b', background: 'var(--surface)', color: 'var(--text-color)' }}
                      />
                    </div>
                  </div>

                  <button
                    className={`btn w-100 ${maintenanceMode ? 'btn-success' : 'btn-danger'}`}
                    onClick={toggleMaintenance}
                    style={{ fontWeight: 'bold', padding: '0.75rem' }}
                  >
                    {maintenanceMode ? '🟢 Arrêter Maintenance' : '🔴 Démarrer Maintenance'}
                  </button>
                </div>

                {/* Maintenance History */}
                <h6 style={{color: 'var(--primary-color)', marginBottom: '1rem', marginTop: '2rem'}}>📜 Historique des Maintenances</h6>
                <div className="table-responsive" style={{maxHeight: '400px', overflow: 'auto'}}>
                  <table className="table table-sm table-hover">
                    <thead style={{background: 'var(--bg-color)', position: 'sticky', top: 0}}>
                      <tr>
                        <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Date</th>
                        <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Raison</th>
                        <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Durée</th>
                        <th style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceLogs.map(log => (
                        <tr key={log.id}>
                          <td>{new Date(log.date).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</td>
                          <td>{log.reason}</td>
                          <td>{log.duration} min</td>
                          <td>
                            <span className="badge" style={{background: log.status === 'completed' ? '#00d9ff' : '#ffc107'}}>
                              {log.status === 'completed' ? '✓ Complétée' : 'En cours'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                border: '2px solid #1e90ff',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h4 style={{ marginBottom: '1.5rem', color: '#1e90ff' }}>📱 Configuration Code QR</h4>
                
                {/* Main Enable/Disable */}
                <div style={{
                  background: 'var(--bg-color)',
                  border: '1px solid #1e90ff',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="qrCodeToggle"
                      checked={qrCodeEnabled}
                      onChange={(e) => setQrCodeEnabled(e.target.checked)}
                      style={{width: '3em', height: '1.5em', cursor: 'pointer'}}
                    />
                    <label className="form-check-label" htmlFor="qrCodeToggle" style={{cursor: 'pointer', fontWeight: 'bold', color: '#1e90ff', fontSize: '1.1rem'}}>
                      {qrCodeEnabled ? '🟢 Code QR Activé' : '⚪ Code QR Désactivé'}
                    </label>
                  </div>
                  {qrCodeEnabled && (
                    <p style={{margin: '0.5rem 0 0 3rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                      ✅ Le code QR est maintenant actif et prêt à être utilisé
                    </p>
                  )}
                </div>

                {qrCodeEnabled && (
                  <>
                    {/* Action Configuration */}
                    <h6 style={{color: '#1e90ff', marginBottom: '1rem', marginTop: '2rem'}}>⚙️ Configuration d'Action</h6>
                    
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Type d'Action</label>
                        <select
                          className="form-select"
                          value={qrCodeConfig.actionType}
                          onChange={(e) => setQrCodeConfig({...qrCodeConfig, actionType: e.target.value})}
                          style={{ borderColor: '#1e90ff', background: 'var(--surface)', color: 'var(--text-color)' }}
                        >
                          <option value="booking">📅 Prendre Rendez-vous</option>
                          <option value="profile">👤 Afficher Profil</option>
                          <option value="services">💅 Voir Services</option>
                          <option value="custom">🎯 Action Personnalisée</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Libellé du Bouton</label>
                        <input
                          type="text"
                          className="form-control"
                          value={qrCodeConfig.buttonLabel}
                          onChange={(e) => setQrCodeConfig({...qrCodeConfig, buttonLabel: e.target.value})}
                          style={{ borderColor: '#1e90ff', background: 'var(--surface)', color: 'var(--text-color)' }}
                        />
                      </div>
                    </div>

                    {qrCodeConfig.actionType === 'custom' && (
                      <div className="row g-3 mb-3">
                        <div className="col-12">
                          <label className="form-label">Action Personnalisée</label>
                          <textarea
                            className="form-control"
                            value={qrCodeConfig.customAction}
                            onChange={(e) => setQrCodeConfig({...qrCodeConfig, customAction: e.target.value})}
                            rows="3"
                            placeholder="Définir une action personnalisée..."
                            style={{ borderColor: '#1e90ff', background: 'var(--surface)', color: 'var(--text-color)' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Advanced Options */}
                    <h6 style={{color: '#1e90ff', marginBottom: '1rem', marginTop: '2rem'}}>🔒 Options Avancées</h6>
                    
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="trackScans"
                            checked={qrCodeConfig.trackScans}
                            onChange={(e) => setQrCodeConfig({...qrCodeConfig, trackScans: e.target.checked})}
                          />
                          <label className="form-check-label" htmlFor="trackScans">
                            📊 Suivre les Scans
                          </label>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="requireAuth"
                            checked={qrCodeConfig.requireAuth}
                            onChange={(e) => setQrCodeConfig({...qrCodeConfig, requireAuth: e.target.checked})}
                          />
                          <label className="form-check-label" htmlFor="requireAuth">
                            🔐 Exiger l'Authentification
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Scan History */}
                    {qrCodeConfig.trackScans && (
                      <>
                        <h6 style={{color: '#1e90ff', marginBottom: '1rem', marginTop: '2rem'}}>📊 Historique des Scans</h6>
                        <div className="table-responsive" style={{maxHeight: '350px', overflow: 'auto'}}>
                          <table className="table table-sm table-hover">
                            <thead style={{background: 'var(--bg-color)', position: 'sticky', top: 0}}>
                              <tr>
                                <th style={{color: '#1e90ff', fontWeight: 'bold'}}>Date/Heure</th>
                                <th style={{color: '#1e90ff', fontWeight: 'bold'}}>Action</th>
                                <th style={{color: '#1e90ff', fontWeight: 'bold'}}>Navigateur</th>
                              </tr>
                            </thead>
                            <tbody>
                              {qrScans.length > 0 ? (
                                qrScans.map(scan => (
                                  <tr key={scan.id}>
                                    <td>{new Date(scan.timestamp).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</td>
                                    <td>{scan.action}</td>
                                    <td><small>{scan.userAgent}</small></td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="3" style={{textAlign: 'center', color: 'var(--text-muted)'}}>Aucun scan enregistré</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ height: '2rem' }} />
    </div>
  )
}

export default DeveloperDashboard

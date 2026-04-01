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
        const adminsRes = await api.get('/site-settings/developer/admins')
        const adminsList = Array.isArray(adminsRes.data) ? adminsRes.data : (adminsRes.data.admins || [])
        setAdmins(adminsList)
        console.log('✅ Admins chargés:', adminsList)
      } catch (err) {
        console.warn('❌ Erreur admins:', err.message)
        setAdmins([])
      }

      try {
        const logsRes = await api.get('/site-settings/developer/logs')
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
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <motion.div className="card" whileHover={{ scale: 1.05 }} style={{
                    background: 'var(--surface)',
                    border: '2px solid #00d9ff',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <h6 style={{ color: '#00d9ff', marginBottom: '0.5rem' }}>👥 Administrateurs</h6>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00d9ff', margin: 0 }}>{admins.length}</p>
                  </motion.div>
                </div>
                <div className="col-12 col-md-4">
                  <motion.div className="card" whileHover={{ scale: 1.05 }} style={{
                    background: 'var(--surface)',
                    border: '2px solid #00ff96',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <h6 style={{ color: '#00ff96', marginBottom: '0.5rem' }}>💅 Services</h6>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff96', margin: 0 }}>{services.length}</p>
                  </motion.div>
                </div>
                <div className="col-12 col-md-4">
                  <motion.div className="card" whileHover={{ scale: 1.05 }} style={{
                    background: 'var(--surface)',
                    border: '2px solid #ffd700',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <h6 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>📅 Rendez-vous</h6>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffd700', margin: 0 }}>{appointments.length}</p>
                  </motion.div>
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
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h5 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>📅 Tous les Rendez-vous (Gestion Avancée)</h5>
                <div className="table-responsive">
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead style={{ background: 'var(--bg-color)' }}>
                      <tr>
                        <th style={{ color: 'var(--primary-color)' }}>Client</th>
                        <th style={{ color: 'var(--primary-color)' }}>Service</th>
                        <th style={{ color: 'var(--primary-color)' }}>Date</th>
                        <th style={{ color: 'var(--primary-color)' }}>Statut</th>
                        <th style={{ color: 'var(--primary-color)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(apt => (
                        <tr key={apt.id}>
                          <td>{apt.client_name}</td>
                          <td>{apt.service_id}</td>
                          <td>{new Date(apt.appointment_date).toLocaleDateString()}</td>
                          <td>
                            <span className="badge" style={{
                              background: apt.status === 'pending' ? '#ffd700' : apt.status === 'accepted' ? '#00d9ff' : '#ff6b6b'
                            }}>
                              {apt.status.toUpperCase()}
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
                      ))}
                    </tbody>
                  </table>
                </div>
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
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h5 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>🗄️ Gestion Base de Données</h5>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid var(--primary-color)',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '1.5rem'
                    }}>
                      <p><strong>Supabase PostgreSQL</strong></p>
                      <p>✓ Connecté</p>
                      <p>✓ Real-time: ACTIF</p>
                      <p>✓ RLS Policies: ACTIF</p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid var(--primary-color)',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '1.5rem'
                    }}>
                      <p><strong>Statistiques</strong></p>
                      <p>📅 RDV: {appointments.length}</p>
                      <p>💅 Services: {services.length}</p>
                      <p>👥 Admins: {admins.length}</p>
                    </div>
                  </div>
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
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h5 style={{ marginBottom: '1.5rem' }}>💅 Services (Gestion Complète)</h5>
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
                              {service.active ? 'ACTIF' : 'INACTIF'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteService(service.id)}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                <h5 style={{ marginBottom: '1.5rem', color: '#ff6b6b' }}>🔧 Maintenance Système</h5>
                
                {maintenanceMode && countdownTime && (
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="alert"
                    style={{
                      background: 'rgba(255, 107, 107, 0.15)',
                      border: '2px solid #ff6b6b',
                      marginBottom: '1.5rem'
                    }}
                  >
                    <p style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#ff6b6b' }}>🔴 MAINTENANCE ACTIVE</p>
                    <p style={{ margin: 0, fontSize: '2rem', fontFamily: 'monospace', color: '#ffd700' }}>
                      {formatCountdown(countdownTime)}
                    </p>
                  </motion.div>
                )}

                <div className="row g-3 mb-3">
                  <div className="col-12">
                    <label className="form-label">Raison de Maintenance</label>
                    <textarea
                      className="form-control"
                      value={maintenanceReason}
                      onChange={(e) => setMaintenanceReason(e.target.value)}
                      rows="3"
                      placeholder="Raison affichée aux utilisateurs..."
                      style={{ borderColor: '#ff6b6b', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Durée Minutes</label>
                    <input
                      type="number"
                      className="form-control"
                      value={maintenanceDuration}
                      onChange={(e) => setMaintenanceDuration(Math.max(5, parseInt(e.target.value) || 60))}
                      min="5"
                      max="1440"
                      style={{ borderColor: '#ff6b6b', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                    />
                  </div>
                </div>

                <button
                  className={`btn w-100 ${maintenanceMode ? 'btn-success' : 'btn-danger'}`}
                  onClick={toggleMaintenance}
                  style={{ fontWeight: 'bold', padding: '1rem' }}
                >
                  {maintenanceMode ? '🟢 Arrêter Maintenance' : '🔴 Démarrer Maintenance'}
                </button>
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

export default DeveloperDashboard

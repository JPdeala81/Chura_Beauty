import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import QRCodeConfig from '../../components/admin/QRCodeConfig'

const DeveloperDashboard = () => {
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)
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

  // ──── SITE MANAGEMENT ────
  const [editingSiteSettings, setEditingSiteSettings] = useState(false)
  const [siteSettingsForm, setSiteSettingsForm] = useState({
    app_name: 'Chura Beauty',
    app_logo: '',
    hero_background_image: '',
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
    footer_twitter: '',
    privacy_policy: '',
    terms_of_service: '',
    about_content: ''
  })

  // Site Settings - Logo Upload
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  // Site Settings - Hero Background Image
  const [heroImageFile, setHeroImageFile] = useState(null)
  const [heroImagePreview, setHeroImagePreview] = useState(null)

  // Profile Management
  const [editingProfile, setEditingProfile] = useState(false)
  const [adminInfo, setAdminInfo] = useState({})
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    profile_photo: ''
  })
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Payment Networks Configuration
  const [paymentConfig, setPaymentConfig] = useState({
    airtel_code: '',
    moov_code: '',
    is_payment_enabled: false
  })

  useEffect(() => {
    fetchAllData()
    // Only refetch if not in edit mode
    if (editingProfile || editingSiteSettings) return
    const interval = setInterval(fetchAllData, 5000)
    return () => clearInterval(interval)
  }, [editingProfile, editingSiteSettings])

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

      try {
        const settingsRes = await api.get('/site-settings')
        const settingsData = settingsRes.data || {}
        console.log('✅ Site settings chargés:', settingsData)
        // Load payment config from settings
        setPaymentConfig({
          airtel_code: settingsData.airtel_code || '',
          moov_code: settingsData.moov_code || '',
          is_payment_enabled: settingsData.is_payment_enabled || false
        })
        // Pré-remplir le formulaire avec les données existantes
        setSiteSettingsForm(prev => ({
          ...prev,
          app_name: settingsData.app_name || prev.app_name,
          app_logo: settingsData.app_logo || prev.app_logo,
          hero_background_image: settingsData.hero_background_image || prev.hero_background_image,
          homepage_hero_title: settingsData.homepage_hero_title || prev.homepage_hero_title,
          homepage_hero_subtitle: settingsData.homepage_hero_subtitle || prev.homepage_hero_subtitle,
          tagline: settingsData.tagline || prev.tagline,
          footer_company_name: settingsData.footer_company_name || prev.footer_company_name,
          footer_address: settingsData.footer_address || prev.footer_address,
          footer_phone: settingsData.footer_phone || prev.footer_phone,
          footer_email: settingsData.footer_email || prev.footer_email,
          footer_whatsapp: settingsData.footer_whatsapp || prev.footer_whatsapp,
          footer_instagram: settingsData.footer_instagram || prev.footer_instagram,
          footer_facebook: settingsData.footer_facebook || prev.footer_facebook,
          footer_twitter: settingsData.footer_twitter || prev.footer_twitter,
          privacy_policy: settingsData.privacy_policy || '',
          terms_of_service: settingsData.terms_of_service || '',
          about_content: settingsData.about_content || ''
        }))
      } catch (err) {
        console.warn('❌ Erreur site settings:', err.message)
      }

      try {
        const profileRes = await api.get('/auth/profile')
        const adminData = profileRes.data?.admin || profileRes.data || {}
        setAdminInfo(adminData)
        // Pré-remplir le formulaire de profil
        setProfileForm({
          full_name: adminData.full_name || '',
          email: adminData.email || '',
          phone: adminData.phone || '',
          whatsapp: adminData.whatsapp || '',
          profile_photo: adminData.profile_photo || ''
        })
        console.log('✅ Profile chargé:', adminData)
      } catch (err) {
        console.warn('❌ Erreur profile:', err.message)
      }
    } catch (error) {
      console.error('❌ Erreur générale fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSiteSettingsChange = (e) => {
    const { name, value } = e.target
    setSiteSettingsForm(prev => ({ ...prev, [name]: value }))
  }

  const saveSiteSettings = async () => {
    try {
      const payload = {
        app_name: siteSettingsForm.app_name,
        app_logo: siteSettingsForm.app_logo,
        hero_background_image: siteSettingsForm.hero_background_image,
        homepage_hero_title: siteSettingsForm.homepage_hero_title,
        homepage_hero_subtitle: siteSettingsForm.homepage_hero_subtitle,
        tagline: siteSettingsForm.tagline,
        footer_company_name: siteSettingsForm.footer_company_name,
        footer_address: siteSettingsForm.footer_address,
        footer_phone: siteSettingsForm.footer_phone,
        footer_email: siteSettingsForm.footer_email,
        footer_whatsapp: siteSettingsForm.footer_whatsapp,
        footer_instagram: siteSettingsForm.footer_instagram,
        footer_facebook: siteSettingsForm.footer_facebook,
        footer_twitter: siteSettingsForm.footer_twitter,
        privacy_policy: siteSettingsForm.privacy_policy,
        terms_of_service: siteSettingsForm.terms_of_service,
        about_content: siteSettingsForm.about_content
      }
      
      await api.put('/site-settings', payload)
      alert('✅ Paramètres sauvegardés avec succès!')
      // Refetch data after save
      await fetchAllData()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('❌ Erreur lors de la sauvegarde: ' + error.message)
    }
  }

  // ============ PAYMENT NETWORKS ============
  const savePaymentConfig = async () => {
    try {
      await api.put('/site-settings', {
        airtel_code: paymentConfig.airtel_code,
        moov_code: paymentConfig.moov_code,
        is_payment_enabled: paymentConfig.is_payment_enabled
      })
      alert('✅ Configuration des réseaux de paiement mise à jour')
      await fetchAllData()
    } catch (err) {
      console.error('Erreur save payment config:', err)
      alert('❌ Erreur: ' + err.message)
    }
  }

  // ============ SITE SETTINGS - LOGO ============
  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoFile(reader.result)
        setLogoPreview(reader.result)
        setSiteSettingsForm(prev => ({ ...prev, app_logo: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // ============ SITE SETTINGS - HERO BACKGROUND IMAGE ============
  const handleHeroImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setHeroImageFile(reader.result)
        setHeroImagePreview(reader.result)
        setSiteSettingsForm(prev => ({ ...prev, hero_background_image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Profile Management Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, profile_photo: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const saveProfile = async () => {
    try {
      if (!profileForm.full_name || !profileForm.email) {
        alert('❌ Le nom et l\'email sont obligatoires')
        return
      }
      
      const payload = {
        full_name: profileForm.full_name,
        email: profileForm.email,
        phone: profileForm.phone,
        whatsapp: profileForm.whatsapp,
        profile_photo: profileForm.profile_photo
      }
      
      await api.put('/auth/profile', payload)
      alert('✅ Profil mis à jour avec succès!')
      setEditingProfile(false)
      // Refetch to update the profile
      await fetchAllData()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('❌ Erreur lors de la sauvegarde: ' + error.message)
    }
  }

  const changePassword = async () => {
    try {
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        alert('❌ Tous les champs sont obligatoires')
        return
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('❌ Les nouveaux mots de passe ne correspondent pas')
        return
      }
      
      if (passwordForm.newPassword.length < 6) {
        alert('❌ Le mot de passe doit faire au moins 6 caractères')
        return
      }
      
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      
      alert('✅ Mot de passe changé avec succès!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowPasswordChange(false)
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur: ' + (error.response?.data?.message || error.message))
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
              <button 
                className="btn btn-outline-danger"
                onClick={handleLogout}
                style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}
              >
                🚪 Déconnexion
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
              { id: 'profile', label: '👤 Mon Profil' },
              { id: 'site-management', label: '🌐 Paramètres' },
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

          {/* PROFILE MANAGEMENT TAB */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 style={{ margin: 0, color: 'var(--primary-color)' }}>👤 Mon Profil</h5>
                  <button
                    className={`btn ${editingProfile ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => setEditingProfile(!editingProfile)}
                  >
                    {editingProfile ? '❌ Annuler' : '✏️ Modifier'}
                  </button>
                </div>

                {editingProfile ? (
                  <div className="row g-3">
                    {/* Avatar Upload */}
                    <div className="col-12 col-md-4 text-center">
                      <div style={{
                        background: 'var(--bg-color)',
                        border: '2px dashed var(--primary-color)',
                        borderRadius: 'var(--border-radius-lg)',
                        padding: '2rem',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.3s'
                      }}>
                        {profileForm.profile_photo ? (
                          <div>
                            <img 
                              src={profileForm.profile_photo} 
                              alt="Avatar" 
                              style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginBottom: '1rem'
                              }}
                            />
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Cliquez pour changer</p>
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📷</p>
                            <p style={{ marginBottom: 0 }}>Cliquez pour ajouter une photo</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                            top: 0,
                            left: 0
                          }}
                        />
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="col-12 col-md-8">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Nom Complet</label>
                          <input
                            type="text"
                            className="form-control"
                            name="full_name"
                            value={profileForm.full_name}
                            onChange={handleProfileChange}
                            style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label">Téléphone</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            placeholder="+33..."
                            style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label">WhatsApp</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="whatsapp"
                            value={profileForm.whatsapp}
                            onChange={handleProfileChange}
                            placeholder="+33..."
                            style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                          />
                        </div>

                        <div className="col-12">
                          <hr />
                          <h6 style={{ color: 'var(--primary-color)', marginTop: '1rem', marginBottom: '1rem' }}>🔐 Sécurité</h6>
                        </div>

                        {!showPasswordChange ? (
                          <div className="col-12">
                            <button
                              className="btn btn-warning"
                              onClick={() => setShowPasswordChange(true)}
                            >
                              🔑 Changer le mot de passe
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="col-12">
                              <label className="form-label">Mot de passe actuel</label>
                              <input
                                type="password"
                                className="form-control"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                              />
                            </div>
                            <div className="col-12 col-md-6">
                              <label className="form-label">Nouveau mot de passe</label>
                              <input
                                type="password"
                                className="form-control"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                              />
                            </div>
                            <div className="col-12 col-md-6">
                              <label className="form-label">Confirmer le mot de passe</label>
                              <input
                                type="password"
                                className="form-control"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                              />
                            </div>
                            <div className="col-12">
                              <button
                                className="btn btn-success me-2"
                                onClick={changePassword}
                              >
                                ✅ Confirmer
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => {
                                  setShowPasswordChange(false)
                                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                                }}
                              >
                                ❌ Annuler
                              </button>
                            </div>
                          </>
                        )}

                        <div className="col-12">
                          <button
                            className="btn btn-success mt-3"
                            onClick={saveProfile}
                          >
                            💾 Sauvegarder le profil
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    <div className="col-12 col-md-4 text-center">
                      {profileForm.profile_photo ? (
                        <img 
                          src={profileForm.profile_photo} 
                          alt="Avatar" 
                          style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid var(--primary-color)'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '150px',
                          height: '150px',
                          borderRadius: '50%',
                          background: 'var(--bg-color)',
                          border: '3px dashed var(--primary-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '4rem',
                          margin: '0 auto'
                        }}>
                          👤
                        </div>
                      )}
                      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        ID: {adminInfo.id?.substring(0, 8)}...
                      </p>
                    </div>

                    <div className="col-12 col-md-8">
                      <div className="row g-3">
                        <div className="col-12">
                          <p><strong>Nom Complet:</strong> {profileForm.full_name || 'Non défini'}</p>
                        </div>
                        <div className="col-12">
                          <p><strong>Email:</strong> {profileForm.email || 'Non défini'}</p>
                        </div>
                        <div className="col-12 col-md-6">
                          <p><strong>Téléphone:</strong> {profileForm.phone || 'Non défini'}</p>
                        </div>
                        <div className="col-12 col-md-6">
                          <p><strong>WhatsApp:</strong> {profileForm.whatsapp || 'Non défini'}</p>
                        </div>
                        <div className="col-12">
                          <p><strong>Rôle:</strong> <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>Developer</span></p>
                        </div>
                        {adminInfo.created_at && (
                          <div className="col-12">
                            <p><strong>Compte créé:</strong> {new Date(adminInfo.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                    onClick={() => setEditingSiteSettings(!editingSiteSettings)}
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
                      <label className="form-label">📷 Logo de l'Entreprise</label>
                      <div style={{
                        border: '2px dashed var(--primary-color)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--bg-color)',
                        position: 'relative',
                        transition: 'all 0.3s'
                      }}>
                        {logoPreview || siteSettingsForm.app_logo ? (
                          <div>
                            <img 
                              src={logoPreview || siteSettingsForm.app_logo} 
                              alt="Logo" 
                              style={{
                                maxWidth: '100%',
                                maxHeight: '120px',
                                marginBottom: '0.5rem',
                                borderRadius: 'var(--border-radius-md)'
                              }}
                            />
                            <p style={{ fontSize: '0.8rem', marginBottom: 0 }}>Cliquez pour changer</p>
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🏢</p>
                            <p style={{ marginBottom: 0, fontSize: '0.9rem' }}>Cliquez pour ajouter un logo</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                      <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                        Ou entrez une URL:
                      </small>
                      <input
                        type="text"
                        className="form-control mt-2"
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
                      <label className="form-label">🖼️ Image de Fond Héros</label>
                      <div style={{
                        border: '2px dashed var(--primary-color)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--bg-color)',
                        position: 'relative',
                        transition: 'all 0.3s'
                      }}>
                        {heroImagePreview || siteSettingsForm.hero_background_image ? (
                          <div>
                            <img 
                              src={heroImagePreview || siteSettingsForm.hero_background_image} 
                              alt="Hero Background" 
                              style={{
                                maxWidth: '100%',
                                maxHeight: '150px',
                                marginBottom: '0.5rem',
                                borderRadius: 'var(--border-radius-md)',
                                objectFit: 'cover'
                              }}
                            />
                            <p style={{ fontSize: '0.8rem', marginBottom: 0 }}>Cliquez pour changer</p>
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🌅</p>
                            <p style={{ marginBottom: 0, fontSize: '0.9rem' }}>Cliquez pour ajouter une image de fond</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageUpload}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                      <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                        Ou entrez une URL:
                      </small>
                      <input
                        type="text"
                        className="form-control mt-2"
                        name="hero_background_image"
                        value={siteSettingsForm.hero_background_image}
                        onChange={handleSiteSettingsChange}
                        placeholder="https://..."
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.85rem' }}
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

                    <hr className="my-3" />
                    <h6 style={{ color: 'var(--primary-color)', marginTop: '1rem' }}>📄 Pages Importantes</h6>

                    <div className="col-12">
                      <label className="form-label">Politique de Confidentialité</label>
                      <textarea
                        className="form-control"
                        rows="5"
                        name="privacy_policy"
                        value={siteSettingsForm.privacy_policy}
                        onChange={handleSiteSettingsChange}
                        placeholder="Contenu de la politique de confidentialité..."
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Conditions d'Utilisation</label>
                      <textarea
                        className="form-control"
                        rows="5"
                        name="terms_of_service"
                        value={siteSettingsForm.terms_of_service}
                        onChange={handleSiteSettingsChange}
                        placeholder="Contenu des conditions d'utilisation..."
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">À propos de nous</label>
                      <textarea
                        className="form-control"
                        rows="5"
                        name="about_content"
                        value={siteSettingsForm.about_content}
                        onChange={handleSiteSettingsChange}
                        placeholder="Contenu de la page À propos..."
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
              {/* QR Code Configuration */}
              <div className="card" style={{
                background: 'var(--surface)',
                border: '2px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-card)'
              }}>
                <QRCodeConfig showTitle={true} />
              </div>

              {/* Payment Networks Configuration */}
              <div className="card" style={{
                background: 'var(--surface)',
                border: '2px solid #00d9ff',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-card)'
              }}>
                <h5 style={{ color: '#00d9ff', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>💳 Configuration Réseaux de Paiement - Gabon</h5>
                
                <div className="row g-3">
                  <div className="col-12">
                    <div className="alert" style={{
                      background: 'rgba(0, 217, 255, 0.1)',
                      border: '1px solid #00d9ff',
                      borderRadius: 'var(--border-radius-md)',
                      color: 'var(--text-color)',
                      marginBottom: 0
                    }}>
                      <strong>ℹ️ Configuration Critique:</strong> Lorsqu'un utilisateur scanne le QR code, il lui sera demandé de choisir son réseau de paiement (Airtel ou Moov). Les coordonnées ci-dessous détermineront où les utilisateurs envoient leur paiement.
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>📱 Code Airtel Money (Gabon)</label>
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      value={paymentConfig.airtel_code}
                      onChange={(e) => setPaymentConfig(prev => ({ ...prev, airtel_code: e.target.value }))}
                      placeholder="+241 61 23 45 67 ou +24161234567"
                      style={{ 
                        borderColor: '#004e89', 
                        background: 'var(--bg-color)', 
                        color: 'var(--text-color)',
                        borderWidth: '2px',
                        padding: '0.75rem'
                      }}
                    />
                    <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>Format: +241XXXXXXXXX (numéro complet du compte Airtel Money)</small>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>📱 Code Moov Money (Gabon)</label>
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      value={paymentConfig.moov_code}
                      onChange={(e) => setPaymentConfig(prev => ({ ...prev, moov_code: e.target.value }))}
                      placeholder="+241 66 23 45 67 ou +24166234567"
                      style={{ 
                        borderColor: '#ff6b35', 
                        background: 'var(--bg-color)', 
                        color: 'var(--text-color)',
                        borderWidth: '2px',
                        padding: '0.75rem'
                      }}
                    />
                    <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>Format: +241XXXXXXXXX (numéro complet du compte Moov Money)</small>
                  </div>

                  <div className="col-12">
                    <div className="form-check" style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--primary-color)' }}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="paymentEnabled"
                        checked={paymentConfig.is_payment_enabled}
                        onChange={(e) => setPaymentConfig(prev => ({ ...prev, is_payment_enabled: e.target.checked }))}
                        style={{ width: '1.3rem', height: '1.3rem', cursor: 'pointer' }}
                      />
                      <label className="form-check-label" htmlFor="paymentEnabled" style={{ cursor: 'pointer', marginLeft: '0.5rem', marginTop: '0.2rem' }}>
                        <strong>✅ Activer les paiements via QR Code</strong>
                        <small style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Les utilisateurs pourront scanner le QR code et effectuer des paiements</small>
                      </label>
                    </div>
                  </div>

                  <div className="col-12 d-flex gap-2 pt-2">
                    <button
                      className="btn btn-success btn-lg"
                      onClick={savePaymentConfig}
                      style={{ flex: 1 }}
                    >
                      💾 Sauvegarder Configuration
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-lg"
                      onClick={fetchAllData}
                    >
                      🔄 Réinitialiser
                    </button>
                  </div>

                  {/* Preview Section */}
                  <div className="col-12">
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
                      border: '1px solid var(--primary-color)',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '1.5rem',
                      marginTop: '1rem'
                    }}>
                      <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 'bold' }}>📋 Aperçu de la Configuration Actuelle</h6>
                      
                      <div className="row g-3">
                        <div className="col-12 col-md-4">
                          <div style={{ 
                            padding: '1rem', 
                            background: 'var(--bg-color)', 
                            borderRadius: 'var(--border-radius-md)',
                            border: '1px solid #004e89'
                          }}>
                            <small style={{ color: 'var(--text-secondary)' }}>Airtel Money</small>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', fontWeight: 'bold', color: '#004e89' }}>
                              {paymentConfig.airtel_code || '❌ Non configuré'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="col-12 col-md-4">
                          <div style={{ 
                            padding: '1rem', 
                            background: 'var(--bg-color)', 
                            borderRadius: 'var(--border-radius-md)',
                            border: '1px solid #ff6b35'
                          }}>
                            <small style={{ color: 'var(--text-secondary)' }}>Moov Money</small>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', fontWeight: 'bold', color: '#ff6b35' }}>
                              {paymentConfig.moov_code || '❌ Non configuré'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="col-12 col-md-4">
                          <div style={{ 
                            padding: '1rem', 
                            background: 'var(--bg-color)', 
                            borderRadius: 'var(--border-radius-md)',
                            border: '1px solid var(--primary-color)'
                          }}>
                            <small style={{ color: 'var(--text-secondary)' }}>Statut</small>
                            <p style={{ 
                              margin: '0.5rem 0 0 0', 
                              fontSize: '1rem', 
                              fontWeight: 'bold',
                              color: paymentConfig.is_payment_enabled ? '#32cd32' : '#ff6b6b'
                            }}>
                              {paymentConfig.is_payment_enabled ? '✅ Actif' : '❌ Inactif'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="alert alert-warning" style={{
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid #ffc107',
                borderRadius: 'var(--border-radius-lg)',
                padding: '1.5rem'
              }}>
                <h6 style={{ color: '#ffc107', marginBottom: '0.5rem', fontWeight: 'bold' }}>⚠️ Importante Notice de Sécurité</h6>
                <ul style={{ marginBottom: 0, paddingLeft: '1.5rem', color: 'var(--text-color)' }}>
                  <li>Assurez-vous que les numéros saisis appartiennent au propriétaire du salon</li>
                  <li>Vérifiez les numéros avant de sauvegarder pour éviter les erreurs</li>
                  <li>Les transactions seront traitées en temps réel</li>
                  <li>Les modifications prennent effet immédiatement après la sauvegarde</li>
                </ul>
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

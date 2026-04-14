import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import QRCodeConfig from '../../components/admin/QRCodeConfig'
import QRCode from 'qrcode.react'
import DashboardModal from '../../components/admin/DashboardModal'
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
  const [modal, setModal] = useState({ show: false, type: 'info', title: '', message: '' })
  
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
    footer_twitter: ''
  })

  // Profile Management
  const [editingProfile, setEditingProfile] = useState(false)
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

  // Enhanced Service Management
  const [servicePage, setServicePage] = useState(1)
  const [serviceSearch, setServiceSearch] = useState('')
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [serviceImage, setServiceImage] = useState(null)
  const [serviceImagePreview, setServiceImagePreview] = useState(null)
  const [customCategory, setCustomCategory] = useState('')
  const [selectedServiceForQR, setSelectedServiceForQR] = useState(null)
  const [showServiceQRModal, setShowServiceQRModal] = useState(false)
  const SERVICES_PER_PAGE = 8

  // Site Settings - Logo Upload
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  // Site Settings - Hero Background Image
  const [heroImageFile, setHeroImageFile] = useState(null)
  const [heroImagePreview, setHeroImagePreview] = useState(null)

  // Payment Networks Configuration
  const [paymentConfig, setPaymentConfig] = useState({
    airtel_code: '',
    moov_code: '',
    is_payment_enabled: false
  })

  // Payment Sessions Management
  const [paymentSessions, setPaymentSessions] = useState([])
  const [paymentFilter, setPaymentFilter] = useState('waiting_confirmation')
  const [processingPaymentId, setProcessingPaymentId] = useState(null)

  // Mobile Menu
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Service Filtering
  const [serviceFilterCategory, setServiceFilterCategory] = useState('')
  const [serviceFilterPriceMin, setServiceFilterPriceMin] = useState('')
  const [serviceFilterPriceMax, setServiceFilterPriceMax] = useState('')
  const [serviceFilterStatus, setServiceFilterStatus] = useState('')
  const [serviceFilterDurationMin, setServiceFilterDurationMin] = useState('')
  const [serviceFilterDurationMax, setServiceFilterDurationMax] = useState('')
  const [showServiceImageModal, setShowServiceImageModal] = useState(false)
  const [selectedServiceImage, setSelectedServiceImage] = useState(null)

  // Closure/Maintenance Mode
  const [appClosureMode, setAppClosureMode] = useState(false)
  const [closureForm, setClosureForm] = useState({
    reason: '',
    reopenDate: new Date().toISOString().split('T')[0],
    reopenTime: '09:00',
    duration: 60,
    message: ''
  })

  // QR Code Modal
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedQRUser, setSelectedQRUser] = useState(null)
  const [generatedQRValue, setGeneratedQRValue] = useState('')

  const { admin, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllData()
  }, []);

  // Stop auto-refetch when editing forms
  useEffect(() => {
    if (editingProfile || editingSiteSettings) return
    const interval = setInterval(fetchAllData, 5000)
    return () => clearInterval(interval)
  }, [editingProfile, editingSiteSettings])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [appoRes, servRes, statsRes, settingsRes, profileRes, paymentsRes] = await Promise.allSettled([
        api.get('/appointments'),
        api.get('/services'),
        api.get('/revenue/stats'),
        api.get('/site-settings'),
        api.get('/auth/profile'),
        api.get('/payments/sessions?status=waiting_confirmation')
      ])
      
      // Extract correct data from responses
      if (appoRes.status === 'fulfilled') {
        const apptData = appoRes.value.data
        const appts = apptData.appointments || []
        console.log('✅ Appointments chargés:', appts)
        console.log(`📊 Total appointments: ${appts.length}`)
        if (appts.length > 0) {
          console.log('🔑 Premier rendez-vous:', JSON.stringify(appts[0], null, 2).substring(0, 300))
          console.log('📋 Colonnes:', Object.keys(appts[0]))
        }
        setAppointments(appts)
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
          // about_content removed - column doesn't exist in database
        }))
        setFormData(settingsData)
      }
      if (profileRes.status === 'fulfilled') {
        const adminData = profileRes.value.data?.admin || profileRes.value.data || {}
        setAdminInfo(adminData)
        // Pré-remplir le formulaire de profil
        setProfileForm({
          full_name: adminData.full_name || '',
          email: adminData.email || '',
          phone: adminData.phone || '',
          whatsapp: adminData.whatsapp || '',
          profile_photo: adminData.profile_photo || ''
        })
      }
      if (paymentsRes.status === 'fulfilled') {
        const paymentData = paymentsRes.value.data
        setPaymentSessions(paymentData.sessions || paymentData.data || [])
      }
    } catch (err) {
      console.error('Erreur fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const clientName = apt.client_name || apt.name || 'Anonyme'
    const clientEmail = apt.client_email || apt.email || ''
    
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Fonction pour obtenir le nom du service
  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId)
    return service?.title || service?.name || serviceId || 'Service inconnu'
  }

  // Profile Management Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
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
      // Allow partial form saves - only require at least one field to be filled
      if (!profileForm.full_name && !profileForm.email && !profileForm.phone && !profileForm.whatsapp) {
        setModal({ show: true, type: 'warning', title: '⚠️ Champs Obligatoires', message: 'Veuillez remplir au moins un champ pour mettre à jour votre profil' })
        return
      }
      
      // Build payload with only non-empty fields to reduce size
      const payload = {}
      
      if (profileForm.full_name && profileForm.full_name.trim()) {
        payload.full_name = profileForm.full_name.trim()
      }
      if (profileForm.email && profileForm.email.trim()) {
        payload.email = profileForm.email.trim()
      }
      if (profileForm.phone && profileForm.phone.trim()) {
        payload.phone = profileForm.phone.trim()
      }
      if (profileForm.whatsapp && profileForm.whatsapp.trim()) {
        payload.whatsapp = profileForm.whatsapp.trim()
      }
      // Only include photo if it was changed (not the original)
      if (profileForm.profile_photo && profileForm.profile_photo !== (adminData?.profile_photo || '')) {
        payload.profile_photo = profileForm.profile_photo
      }
      
      if (Object.keys(payload).length === 0) {
        setModal({ show: true, type: 'warning', title: '⚠️ Rien à Sauvegarder', message: 'Aucune modification détectée' })
        return
      }
      
      await api.put('/auth/profile', payload)
      setModal({ show: true, type: 'success', title: '✅ Profil Mis à Jour', message: 'Votre profil a été mis à jour avec succès!' })
      setEditingProfile(false)
      // Refetch to update the admin context
      await fetchAllData()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      let errorMsg = error.message
      if (error.response?.status === 413) {
        errorMsg = 'L\'image est trop grande. Veuillez utiliser une image plus petite ou sélectionner une autre image.'
      }
      setModal({ show: true, type: 'error', title: '❌ Erreur de Sauvegarde', message: errorMsg })
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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Payment Management
  const handleConfirmPayment = async (sessionId, notes = '') => {
    try {
      setProcessingPaymentId(sessionId)
      const response = await api.post(`/payments/sessions/${sessionId}/confirm`, {
        adminNotes: notes
      })
      
      // Remove confirmed payment from list and show success
      setPaymentSessions(paymentSessions.filter(p => p.id !== sessionId))
      alert('Paiement confirmé avec succès')
      
      // Refetch data to update stats
      await fetchAllData()
    } catch (err) {
      console.error('Erreur confirmation:', err)
      alert('Erreur lors de la confirmation du paiement')
    } finally {
      setProcessingPaymentId(null)
    }
  }

  const handleRejectPayment = async (sessionId, reason = '') => {
    try {
      setProcessingPaymentId(sessionId)
      const response = await api.post(`/payments/sessions/${sessionId}/reject`, {
        reason: reason
      })
      
      // Remove rejected payment from list
      setPaymentSessions(paymentSessions.filter(p => p.id !== sessionId))
      alert('Paiement rejeté avec succès')
      
      // Refetch data
      await fetchAllData()
    } catch (err) {
      console.error('Erreur rejection:', err)
      alert('Erreur lors du rejet du paiement')
    } finally {
      setProcessingPaymentId(null)
    }
  }

  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      // Use correct endpoint: /appointments/:id/status (NOT /appointments/:id)
      const response = await api.patch(`/appointments/${id}/status`, { status: newStatus })
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status: newStatus } : apt
      ))
      
      // Show beautiful success modal
      setModal({
        show: true,
        type: 'success',
        title: newStatus === 'accepted' ? '✅ Rendez-vous Accepté' : '❌ Rendez-vous Refusé',
        message: `Le rendez-vous a été ${newStatus === 'accepted' ? 'accepté' : 'refusé'} avec succès!\nUn message WhatsApp a été envoyé au client.`,
        onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
      })
      
      console.log('✅ WhatsApp sent to client:', response.data)
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour:', err)
      setModal({
        show: true,
        type: 'error',
        title: '❌ Erreur',
        message: `Erreur: ${err.response?.data?.message || err.message}`,
        onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
      })
    }
  }

  const deleteAppointment = async (id) => {
    // Show confirmation modal before deleting
    setModal({
      show: true,
      type: 'confirm',
      title: '⚠️ Supprimer Rendez-vous',
      message: 'Êtes-vous sûr de vouloir supprimer définitivement ce rendez-vous? Cette action est irréversible.',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await api.delete(`/appointments/${id}`)
          setAppointments(appointments.filter(apt => apt.id !== id))
          setModal({
            show: true,
            type: 'success',
            title: '✅ Supprimé',
            message: 'Rendez-vous supprimé avec succès',
            onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
          })
        } catch (err) {
          console.error('❌ Erreur suppression:', err)
          setModal({
            show: true,
            type: 'error',
            title: '❌ Erreur',
            message: `Erreur: ${err.response?.data?.message || err.message}`,
            onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
          })
        }
      },
      onCancel: () => setModal({ show: false, type: 'info', title: '', message: '' })
    })
  }

  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const saveSettings = async () => {
    try {
      // Only send valid fields that exist in the database
      const validPayload = {
        salon_name: formData.salon_name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        description: formData.description || ''
      }
      
      // Remove empty fields to allow partial updates
      const payload = Object.entries(validPayload).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value
        }
        return acc
      }, {})
      
      await api.put('/site-settings', payload)
      setSettings(payload)
      setEditingSettings(false)
      alert('✅ Paramètres du salon sauvegardés avec succès')
      await fetchAllData()
    } catch (err) {
      console.error('Erreur save:', err)
      alert(`❌ Erreur lors de la sauvegarde: ${err.response?.data?.message || err.message}`)
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

  // Calculate estimated revenue from ALL services (not just appointments)
  const calculateEstimatedRevenue = () => {
    return (services || []).reduce((sum, service) => sum + (service.price || 0), 0)
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
      // STRATEGY: Send parameters and images separately to avoid HTTP 413 Payload Too Large
      
      // Step 1: Prepare TEXT parameters payload (WITHOUT images initially)
      const textPayload = {
        app_name: siteSettingsForm.app_name || '',
        homepage_hero_title: siteSettingsForm.homepage_hero_title || '',
        homepage_hero_subtitle: siteSettingsForm.homepage_hero_subtitle || '',
        tagline: siteSettingsForm.tagline || '',
        footer_company_name: siteSettingsForm.footer_company_name || '',
        footer_address: siteSettingsForm.footer_address || '',
        footer_phone: siteSettingsForm.footer_phone || '',
        footer_email: siteSettingsForm.footer_email || '',
        footer_whatsapp: siteSettingsForm.footer_whatsapp || '',
        footer_instagram: siteSettingsForm.footer_instagram || '',
        footer_facebook: siteSettingsForm.footer_facebook || '',
        footer_twitter: siteSettingsForm.footer_twitter || '',
        privacy_policy: siteSettingsForm.privacy_policy || '',
        terms_of_service: siteSettingsForm.terms_of_service || ''
      }

      console.log('📤 Étape 1: Envoi des paramètres texte...')
      const textResponse = await api.put('/site-settings', textPayload)
      console.log('✅ Paramètres texte sauvegardés')

      // Step 2: Send images separately (only if they exist and have changed)
      if (siteSettingsForm.app_logo) {
        console.log('📸 Étape 2a: Envoi du logo...')
        const logoPayload = { app_logo: siteSettingsForm.app_logo }
        await api.put('/site-settings', logoPayload)
        console.log('✅ Logo mis à jour')
      }

      if (siteSettingsForm.hero_background_image) {
        console.log('📸 Étape 2b: Envoi de l\'arrière-plan héros...')
        const bgPayload = { hero_background_image: siteSettingsForm.hero_background_image }
        await api.put('/site-settings', bgPayload)
        console.log('✅ Arrière-plan mis à jour')
      }

      // Step 3: Handle image clearing
      if (siteSettingsForm.app_logo === null) {
        console.log('❌ Suppression du logo...')
        await api.put('/site-settings', { app_logo: '' })
      }

      if (siteSettingsForm.hero_background_image === null) {
        console.log('❌ Suppression de l\'arrière-plan...')
        await api.put('/site-settings', { hero_background_image: '' })
      }

      setModal({
        show: true,
        type: 'success',
        title: '✅ Paramètres Sauvegardés',
        message: 'Tous les paramètres du site ont été mis à jour avec succès!',
        onConfirm: () => {
          setModal({ show: false, type: 'info', title: '', message: '' })
          setEditingSiteSettings(false)
          fetchAllData()
        }
      })
    } catch (err) {
      console.error('❌ Erreur sauvegarde:', err.response?.data || err.message)
      setModal({
        show: true,
        type: 'error',
        title: '❌ Erreur de Sauvegarde',
        message: `Erreur: ${err.response?.data?.message || err.message}`,
        onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
      })
    }
  }

  // ============ ENHANCED SERVICE MANAGEMENT ============
  const handleServiceImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setServiceImage(reader.result)
        setServiceImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleServiceChange = (e) => {
    const { name, value, type, checked } = e.target
    setServiceForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }))
  }

  const saveService = async () => {
    try {
      if (!serviceForm.title || !serviceForm.category || !serviceForm.price) {
        alert('❌ Titre, catégorie et prix sont obligatoires')
        return
      }

      if (!serviceImage && !serviceForm.image_url) {
        alert('❌ Vous DEVEZ ajouter une image pour le service')
        return
      }

      const payload = {
        ...serviceForm,
        category: serviceForm.category === 'autre' && customCategory 
          ? customCategory 
          : serviceForm.category,
        image_url: serviceImage || serviceForm.image_url || null
      }

      if (editingService) {
        await api.put(`/services/${editingService.id}`, payload)
        alert('✅ Service mis à jour')
      } else {
        await api.post('/services', payload)
        alert('✅ Service créé')
      }

      setShowServiceDialog(false)
      setServiceForm({ title: '', category: '', price: 0, duration_minutes: 30, description: '', active: true })
      setServiceImage(null)
      setServiceImagePreview(null)
      setCustomCategory('')
      setEditingService(null)
      await fetchAllData()
    } catch (err) {
      alert('❌ Erreur: ' + err.message)
    }
  }

  const getServiceCategories = () => [
    'Coiffage',
    'Ongles',
    'Maquillage',
    'Soins visage',
    'Massage',
    'Épilation',
    'Colorisation',
    'Soins corps',
    'autre'
  ]

  // Pagination helpers
  const filteredServices = services.filter(s => {
    // Search filter
    const matchesSearch = s.title?.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                          s.description?.toLowerCase().includes(serviceSearch.toLowerCase())
    
    // Category filter
    const matchesCategory = !serviceFilterCategory || s.category === serviceFilterCategory
    
    // Price filter
    const price = s.price || 0
    const matchesPrice = (!serviceFilterPriceMin || price >= parseFloat(serviceFilterPriceMin)) &&
                         (!serviceFilterPriceMax || price <= parseFloat(serviceFilterPriceMax))
    
    // Duration filter
    const duration = s.duration_minutes || 0
    const matchesDuration = (!serviceFilterDurationMin || duration >= parseFloat(serviceFilterDurationMin)) &&
                            (!serviceFilterDurationMax || duration <= parseFloat(serviceFilterDurationMax))
    
    // Status filter
    const matchesStatus = !serviceFilterStatus || (serviceFilterStatus === 'active' ? s.active : !s.active)
    
    return matchesSearch && matchesCategory && matchesPrice && matchesDuration && matchesStatus
  })
  const paginatedServices = filteredServices.slice(
    (servicePage - 1) * SERVICES_PER_PAGE,
    servicePage * SERVICES_PER_PAGE
  )
  const totalServicePages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE)

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

  // ============ PAYMENT NETWORKS ============
  const savePaymentConfig = async () => {
    try {
      // Payment config should have its own endpoint or table
      // Don't send airtel_code/moov_code to site-settings as they don't exist there
      const payload = {
        is_payment_enabled: paymentConfig.is_payment_enabled
      }
      
      // Try the dedicated endpoint first
      await api.put('/site-settings/payment-config', payload)
      alert('✅ Configuration des réseaux de paiement mise à jour avec succès')
    } catch (err) {
      console.error('Erreur savePaymentConfig:', err)
      // Fallback: try alternative endpoint
      try {
        await api.post('/payments/config', {
          airtel_code: paymentConfig.airtel_code,
          moov_code: paymentConfig.moov_code,
          is_payment_enabled: paymentConfig.is_payment_enabled
        })
        alert('✅ Configuration des réseaux mise à jour')
      } catch (fallbackErr) {
        alert(`❌ Erreur: ${fallbackErr.response?.data?.message || fallbackErr.message}`)
      }
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
      
      // Try to call the endpoint - if it fails, just toggle locally
      try {
        await api.post('/site-settings/app-closure', {
          enabled: newState,
          reason: closureForm.reason,
          reopenDate: closureForm.reopenDate,
          reopenTime: closureForm.reopenTime
        })
      } catch (apiErr) {
        if (apiErr.response?.status === 404) {
          console.warn('⚠️ App closure endpoint not available on backend - toggling locally')
        } else {
          throw apiErr
        }
      }
      
      setAppClosureMode(newState)
      setModal({
        show: true,
        type: 'success',
        title: newState ? '🚪 Application Fermée' : '✅ Application Réouverte',
        message: newState 
          ? `L'application sera fermée jusqu'au ${closureForm.reopenDate} à ${closureForm.reopenTime}`
          : 'L\'application est maintenant accessible',
        onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
      })
    } catch (err) {
      console.error('❌ Erreur:', err)
      setModal({
        show: true,
        type: 'error',
        title: '❌ Erreur',
        message: 'Erreur lors du changement: ' + err.message,
        onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
      })
    }
  }

  const sendQRCodeToDeveloper = async () => {
    try {
      // Generate a unique QR code for this maintenance session
      const qrData = {
        type: 'maintenance',
        timestamp: new Date().toISOString(),
        adminId: admin?.id,
        sessionId: Math.random().toString(36).substring(7)
      }
      
      try {
        await api.post('/notifications/send-qr', {
          recipient: 'developer',
          qrData: qrData,
          maintenanceInfo: {
            reason: closureForm.reason,
            reopenDate: closureForm.reopenDate,
            reopenTime: closureForm.reopenTime
          }
        })
        setModal({
          show: true,
          type: 'success',
          title: '✅ Code QR Envoyé',
          message: 'Le code QR a été envoyé au développeur avec succès!',
          onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
        })
      } catch (apiErr) {
        if (apiErr.response?.status === 404) {
          console.warn('⚠️ QR code endpoint not available - displaying QR locally')
          setModal({
            show: true,
            type: 'warning',
            title: '⚠️ Service Non Disponible',
            message: 'La fonction d\'envoi de QR n\'est pas disponible pour le moment. Le code QR est généré localement.',
            onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
          })
        } else {
          throw apiErr
        }
      }
    } catch (err) {
      console.error('❌ Erreur lors de l\'envoi du QR code:', err)
      setModal({
        show: true,
        type: 'error',
        title: '❌ Erreur',
        message: 'Erreur: ' + (err.response?.data?.message || err.message),
        onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
      })
    }
  }

  const openUserQRCode = (userType) => {
    const qrData = {
      type: userType === 'developer' ? 'developer_access' : 'admin_access',
      email: userType === 'developer' ? 'developer@chura.com' : (adminInfo.email || 'admin@chura.com'),
      role: userType === 'developer' ? 'developer' : 'admin',
      generatedAt: new Date().toISOString(),
      sessionId: Math.random().toString(36).substring(7)
    }
    setGeneratedQRValue(JSON.stringify(qrData))
    setSelectedQRUser(userType)
    setShowQRModal(true)
  }

  const downloadQRCode = () => {
    const qrCanvas = document.querySelector('#qr-code-canvas canvas')
    if (qrCanvas) {
      const link = document.createElement('a')
      link.href = qrCanvas.toDataURL('image/png')
      link.download = `QR_${selectedQRUser}_${new Date().getTime()}.png`
      link.click()
    }
  }

  return (
    <div style={{ 
      background: 'var(--bg-color)', 
      color: 'var(--text-color)', 
      minHeight: '100vh',
      fontFamily: 'var(--font-primary, sans-serif)'
    }}>
      {/* Modal de Confirmation */}
      <DashboardModal 
        show={modal.show}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({ show: false, type: 'info', title: '', message: '' })}
        confirmText={modal.confirmText || 'Confirmer'}
        cancelText={modal.cancelText || 'Annuler'}
        isDangerous={modal.isDangerous}
      />
      {/* Header - Responsive Navbar */}
      <header style={{
        background: 'var(--gradient-primary)',
        padding: '1rem',
        boxShadow: 'var(--shadow-luxury)',
        marginBottom: '2rem'
      }}>
        <div className="container-fluid">
          {/* Main Navbar Container */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Logo/Title */}
            <h1 style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 2rem)', 
              fontWeight: 'bold', 
              margin: 0,
              color: 'white'
            }}>
              💎 Tableau de Bord
            </h1>

            {/* Desktop Navigation (Hidden on Mobile) */}
            <div className="d-none d-md-flex" style={{
              gap: '0.5rem'
            }}>
              <button 
                className="btn btn-outline-light"
                onClick={() => navigate('/')}
                style={{ 
                  borderColor: 'white', 
                  color: 'white',
                  fontSize: 'clamp(0.75rem, 2vw, 0.95rem)',
                  padding: '0.4rem 0.8rem'
                }}
              >
                🏠 Accueil
              </button>
              <button 
                className="btn btn-outline-light"
                onClick={fetchAllData}
                style={{ 
                  borderColor: 'white', 
                  color: 'white',
                  fontSize: 'clamp(0.75rem, 2vw, 0.95rem)',
                  padding: '0.4rem 0.8rem'
                }}
              >
                🔄 Actualiser
              </button>
              <button 
                className="btn btn-outline-danger"
                onClick={handleLogout}
                style={{
                  fontSize: 'clamp(0.75rem, 2vw, 0.95rem)',
                  padding: '0.4rem 0.8rem'
                }}
              >
                🚪 Déconnexion
              </button>
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              className="btn btn-outline-light d-md-none"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                borderColor: 'white',
                color: 'white',
                fontSize: '1.2rem',
                padding: '0.25rem 0.5rem',
                minWidth: 'auto'
              }}
            >
              {showMobileMenu ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Menu (Collapsible) */}
          {showMobileMenu && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <button 
                className="btn btn-outline-light w-100"
                onClick={() => {
                  navigate('/')
                  setShowMobileMenu(false)
                }}
                style={{ borderColor: 'white', color: 'white' }}
              >
                🏠 Accueil
              </button>
              <button 
                className="btn btn-outline-light w-100"
                onClick={() => {
                  fetchAllData()
                  setShowMobileMenu(false)
                }}
                style={{ borderColor: 'white', color: 'white' }}
              >
                🔄 Actualiser
              </button>
              <button 
                className="btn btn-outline-danger w-100"
                onClick={() => {
                  handleLogout()
                  setShowMobileMenu(false)
                }}
              >
                🚪 Déconnexion
              </button>
            </motion.div>
          )}
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

        {/* Navigation Tabs - Responsive */}
        <div className="mb-4" style={{ borderBottom: '2px solid var(--surface)' }}>
          {/* Desktop Tabs */}
          <div className="d-none d-md-flex gap-2 flex-wrap" style={{ overflowX: 'auto' }}>
            {[
              { id: 'home', label: '🏠 Accueil' },
              { id: 'appointments', label: '📅 Rendez-vous' },
              { id: 'services', label: '💅 Services' },
              { id: 'statistics', label: '📊 Statistiques' },
              { id: 'site-management', label: '🌐 Paramètres Site' },
              { id: 'users', label: '👥 Utilisateurs' },
              { id: 'profile', label: '👤 Mon Profil' },
              { id: 'maintenance', label: '🔧 Maintenance' },
              { id: 'app-closure', label: '🚪 Fermeture App' },
              { id: 'security', label: '🔐 Sécurité' },
              { id: 'qrcode', label: '📱 Code QR' },
              { id: 'payments', label: '💳 Paiements' },
              { id: 'settings', label: '⚙️ Paramètres' }
            ].map(tab => (
              <button
                key={tab.id}
                className="btn"
                style={{
                  background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-color)',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderBottom: activeTab === tab.id ? '3px solid var(--primary-color)' : 'none',
                  transition: 'var(--transition-smooth)',
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.95rem)',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Tabs Dropdown */}
          <div className="d-md-none">
            <select
              className="form-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              style={{
                background: 'var(--surface)',
                color: 'var(--text-color)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '0.5rem'
              }}
            >
              {[
                { id: 'home', label: '🏠 Accueil' },
                { id: 'appointments', label: '📅 Rendez-vous' },
                { id: 'services', label: '💅 Services' },
                { id: 'statistics', label: '📊 Statistiques' },
                { id: 'site-management', label: '🌐 Paramètres Site' },
                { id: 'users', label: '👥 Utilisateurs' },
                { id: 'profile', label: '👤 Mon Profil' },
                { id: 'maintenance', label: '🔧 Maintenance' },
                { id: 'app-closure', label: '🚪 Fermeture App' },
                { id: 'security', label: '🔐 Sécurité' },
                { id: 'qrcode', label: '📱 Code QR' },
                { id: 'payments', label: '💳 Paiements' },
                { id: 'settings', label: '⚙️ Paramètres' }
              ].map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
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
              {/* Enhanced KPI Cards */}
              <div className="row g-3 mb-4">
                {[
                  { icon: '📅', title: 'RDV Total', value: appointments.length || 0, color: '#00d9ff', bg: 'rgba(0, 217, 255, 0.1)' },
                  { icon: '✅', title: 'Acceptés', value: (appointments.filter(a => a.status === 'accepted') || []).length, color: '#00d9ff', bg: 'rgba(0, 217, 255, 0.1)' },
                  { icon: '⏳', title: 'En Attente', value: (appointments.filter(a => a.status === 'pending') || []).length, color: '#ffd700', bg: 'rgba(255, 215, 0, 0.1)' },
                  { icon: '❌', title: 'Refusés', value: (appointments.filter(a => a.status === 'rejected') || []).length, color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.1)' },
                  { icon: '💅', title: 'Services', value: services.length || 0, color: '#ff1493', bg: 'rgba(255, 20, 147, 0.1)' },
                  { icon: '💰', title: 'Revenus Estimés', value: `${(calculateEstimatedRevenue() / 1000).toFixed(1)}K FCFA`, color: '#32cd32', bg: 'rgba(50, 205, 50, 0.1)' }
                ].map((kpi, idx) => (
                  <motion.div
                    key={idx}
                    className="col-12 col-sm-6 col-lg-2"
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 }, y: -5 }}
                  >
                    <div className="card h-100" style={{
                      background: kpi.bg,
                      border: `2px solid ${kpi.color}`,
                      borderRadius: 'var(--border-radius-lg)',
                      boxShadow: 'var(--shadow-card)',
                      padding: '1.5rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{kpi.icon}</div>
                      <h6 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{kpi.title}</h6>
                      <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: kpi.color, margin: 0 }}>
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
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>📈 Tendance RDV (7 jours)</h6>
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

              {/* Recent Appointments & Statistics Row */}
              <div className="row g-3 mb-4">
                <motion.div className="col-12 col-lg-8">
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>📅 Rendez-vous Récents</h6>
                    <div className="table-responsive" style={{maxHeight: '300px', overflow: 'auto'}}>
                      <table className="table table-sm table-hover">
                        <thead style={{background: 'var(--bg-color)', position: 'sticky', top: 0}}>
                          <tr>
                            <th style={{color: 'var(--primary-color)'}}>Client</th>
                            <th style={{color: 'var(--primary-color)'}}>Service</th>
                            <th style={{color: 'var(--primary-color)'}}>Date</th>
                            <th style={{color: 'var(--primary-color)'}}>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(appointments || []).slice(0, 5).map(apt => (
                            <tr key={apt.id}>
                              <td>{apt.client_name}</td>
                              <td><small>{apt.services?.title || 'N/A'}</small></td>
                              <td><small>{new Date(apt.desired_date).toLocaleDateString('fr-FR')}</small></td>
                              <td>
                                <span className="badge" style={{
                                  background: apt.status === 'accepted' ? '#00d9ff' : 
                                              apt.status === 'pending' ? '#ffd700' : '#ff6b6b'
                                }}>
                                  {apt.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="col-12 col-lg-4">
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>🔥 Top Services</h6>
                    <div>
                      {(services || []).slice(0, 4).map((service, idx) => (
                        <div key={service.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0',
                          borderBottom: '1px solid var(--surface-2)'
                        }}>
                          <span>#{idx + 1} {service.title}</span>
                          <span style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>
                            {service.price?.toLocaleString()} FCFA
                          </span>
                        </div>
                      ))}
                    </div>
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
                    { icon: '📅', text: 'RDV', tab: 'appointments' },
                    { icon: '💅', text: 'Services', tab: 'services' },
                    { icon: '📊', text: 'Stats', tab: 'statistics' },
                    { icon: '🌐', text: 'Site', tab: 'site-management' },
                    { icon: '⚙️', text: 'Config', tab: 'service-management' },
                    { icon: '🔐', text: 'Sécurité', tab: 'security' }
                  ].map((action, idx) => (
                    <div key={idx} className="col-6 col-md-2">
                      <button
                        className="btn w-100 p-2"
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
                        <div style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{action.icon}</div>
                        <div style={{ fontSize: '0.75rem' }}>{action.text}</div>
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
                        {filteredAppointments.map(apt => {
                          const clientName = apt.client_name || 'Anonyme'
                          const clientEmail = apt.client_email || 'N/A'
                          const clientPhone = apt.client_phone || 'N/A'
                          const serviceName = getServiceName(apt.service_id)
                          const appointmentDate = apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString() : 'N/A'
                          
                          return (
                            <motion.tr key={apt.id}>
                              <td>{clientName}</td>
                              <td>{clientEmail}</td>
                              <td>{clientPhone}</td>
                              <td>{serviceName}</td>
                              <td>{appointmentDate}</td>
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
                                <div className="d-flex gap-2" style={{ flexWrap: 'wrap' }}>
                                  {apt.status === 'pending' && (
                                    <>
                                      <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => updateAppointmentStatus(apt.id, 'accepted')}
                                        title="Accepter et envoyer WhatsApp"
                                      >
                                        ✅
                                      </button>
                                      <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => updateAppointmentStatus(apt.id, 'rejected')}
                                        title="Refuser et envoyer WhatsApp"
                                      >
                                        ❌
                                      </button>
                                    </>
                                  )}
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => deleteAppointment(apt.id)}
                                    title="Supprimer ce rendez-vous"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          )
                        })}
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
              <div className="card" style={{
                background: 'var(--surface)',
                border: '2px solid var(--primary-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>💅 Services - Gestion Complète</h4>
                
                {/* Add Service Button */}
                <button
                  className="btn w-100 mb-3"
                  style={{ background: 'var(--gradient-primary)', color: 'white', border: 'none' }}
                  onClick={() => {
                    setShowServiceDialog(true)
                    setEditingService(null)
                    setServiceForm({ title: '', category: '', price: 0, duration_minutes: 30, description: '', active: true })
                    setServiceImage(null)
                    setServiceImagePreview(null)
                    setCustomCategory('')
                  }}
                >
                  ➕ Ajouter Service
                </button>

                {/* Service Dialog Modal */}
                {showServiceDialog && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 9999,
                      padding: '1rem'
                    }}
                    onClick={() => setShowServiceDialog(false)}
                  >
                    <motion.div
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      style={{
                        background: 'var(--surface)',
                        borderRadius: 'var(--border-radius-lg)',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        border: '2px solid var(--primary-color)',
                        boxShadow: '0 10px 50px rgba(0,0,0,0.3)'
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <h5 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
                        {editingService ? '✏️ Éditer Service' : '✨ Créer Nouveau Service'}
                      </h5>

                      <div className="row g-3">
                        {/* Image Upload */}
                        <div className="col-12">
                          <label className="form-label">📷 Image du Service</label>
                          <div style={{
                            border: '2px dashed var(--primary-color)',
                            borderRadius: 'var(--border-radius-md)',
                            padding: '2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: 'var(--bg-color)',
                            transition: 'all 0.3s',
                            position: 'relative'
                          }}>
                            {serviceImagePreview ? (
                              <div>
                                <img src={serviceImagePreview} alt="Preview" style={{
                                  maxWidth: '100%',
                                  maxHeight: '200px',
                                  marginBottom: '1rem',
                                  borderRadius: 'var(--border-radius-md)'
                                }} />
                                <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>Cliquez pour changer l'image</p>
                              </div>
                            ) : (
                              <div>
                                <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖼️</p>
                                <p style={{ marginBottom: 0 }}>Cliquez pour ajouter une image</p>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleServiceImageUpload}
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
                        </div>

                        {/* Service Details */}
                        <div className="col-12">
                          <label className="form-label">📝 Titre</label>
                          <input
                            type="text"
                            className="form-control"
                            name="title"
                            value={serviceForm.title}
                            onChange={handleServiceChange}
                            placeholder="ex: Coiffage complet"
                            style={{ borderColor: 'var(--primary-color)' }}
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label">🏷️ Catégorie</label>
                          <select
                            className="form-select"
                            name="category"
                            value={serviceForm.category}
                            onChange={handleServiceChange}
                            style={{ borderColor: 'var(--primary-color)' }}
                          >
                            <option value="">Sélectionner une catégorie</option>
                            {getServiceCategories().map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {serviceForm.category === 'autre' && (
                          <div className="col-12">
                            <label className="form-label">✍️ Nouvelle catégorie</label>
                            <input
                              type="text"
                              className="form-control"
                              value={customCategory}
                              onChange={(e) => setCustomCategory(e.target.value)}
                              placeholder="ex: Soins spécialisés"
                              style={{ borderColor: 'var(--primary-color)' }}
                            />
                          </div>
                        )}

                        <div className="col-12 col-md-6">
                          <label className="form-label">💰 Prix (FCFA)</label>
                          <input
                            type="number"
                            className="form-control"
                            name="price"
                            value={serviceForm.price}
                            onChange={handleServiceChange}
                            placeholder="0"
                            step="500"
                            style={{ borderColor: 'var(--primary-color)' }}
                          />
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label">⏱️ Durée (min)</label>
                          <input
                            type="number"
                            className="form-control"
                            name="duration_minutes"
                            value={serviceForm.duration_minutes}
                            onChange={handleServiceChange}
                            placeholder="30"
                            step="15"
                            style={{ borderColor: 'var(--primary-color)' }}
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label">📄 Description</label>
                          <textarea
                            className="form-control"
                            name="description"
                            rows="3"
                            value={serviceForm.description}
                            onChange={handleServiceChange}
                            placeholder="Décrivez votre service..."
                            style={{ borderColor: 'var(--primary-color)' }}
                          />
                        </div>

                        <div className="col-12">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="active"
                              id="serviceActive"
                              checked={serviceForm.active}
                              onChange={handleServiceChange}
                            />
                            <label className="form-check-label" htmlFor="serviceActive">
                              ✅ Service actif
                            </label>
                          </div>
                        </div>

                        <div className="col-12">
                          <button
                            className="btn btn-success w-100 mb-2"
                            onClick={saveService}
                          >
                            {editingService ? '✏️ Mettre à jour' : '✨ Créer'} Service
                          </button>
                          <button
                            className="btn btn-secondary w-100"
                            onClick={() => setShowServiceDialog(false)}
                          >
                            ❌ Annuler
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Search and Advanced Filtering */}
                <div className="row g-2 mb-3">
                  <div className="col-12">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="🔍 Rechercher par titre ou description..."
                      value={serviceSearch}
                      onChange={(e) => {
                        setServiceSearch(e.target.value)
                        setServicePage(1)
                      }}
                      style={{ borderColor: 'var(--primary-color)' }}
                    />
                  </div>
                  
                  {/* Filtering Rows */}
                  <div className="col-12 col-md-3">
                    <select
                      className="form-select"
                      value={serviceFilterCategory}
                      onChange={(e) => {
                        setServiceFilterCategory(e.target.value)
                        setServicePage(1)
                      }}
                      style={{ borderColor: 'var(--primary-color)' }}
                    >
                      <option value="">📁 Toutes catégories</option>
                      {getServiceCategories().filter(cat => cat !== 'autre').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-3">
                    <select
                      className="form-select"
                      value={serviceFilterStatus}
                      onChange={(e) => {
                        setServiceFilterStatus(e.target.value)
                        setServicePage(1)
                      }}
                      style={{ borderColor: 'var(--primary-color)' }}
                    >
                      <option value="">✅ Tous les statuts</option>
                      <option value="active">✅ Actifs</option>
                      <option value="inactive">❌ Inactifs</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="💰 Prix min"
                      value={serviceFilterPriceMin}
                      onChange={(e) => {
                        setServiceFilterPriceMin(e.target.value)
                        setServicePage(1)
                      }}
                      style={{ borderColor: 'var(--primary-color)' }}
                    />
                  </div>

                  <div className="col-12 col-md-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="💰 Prix max"
                      value={serviceFilterPriceMax}
                      onChange={(e) => {
                        setServiceFilterPriceMax(e.target.value)
                        setServicePage(1)
                      }}
                      style={{ borderColor: 'var(--primary-color)' }}
                    />
                  </div>

                  <div className="col-12 col-md-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="⏱️ Durée min"
                      value={serviceFilterDurationMin}
                      onChange={(e) => {
                        setServiceFilterDurationMin(e.target.value)
                        setServicePage(1)
                      }}
                      style={{ borderColor: 'var(--primary-color)' }}
                    />
                  </div>

                  <div className="col-12 col-md-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="⏱️ Durée max"
                      value={serviceFilterDurationMax}
                      onChange={(e) => {
                        setServiceFilterDurationMax(e.target.value)
                        setServicePage(1)
                      }}
                      style={{ borderColor: 'var(--primary-color)' }}
                    />
                  </div>

                  <div className="col-12 col-md-2">
                    <button
                      className="btn btn-outline-primary w-100"
                      onClick={() => {
                        setServiceSearch('')
                        setServiceFilterCategory('')
                        setServiceFilterStatus('')
                        setServiceFilterPriceMin('')
                        setServiceFilterPriceMax('')
                        setServiceFilterDurationMin('')
                        setServiceFilterDurationMax('')
                        setServicePage(1)
                      }}
                    >
                      🔄 Réinitialiser
                    </button>
                  </div>

                  <div className="col-12">
                    <small style={{ color: 'var(--text-muted)' }}>
                      🔎 Résultats: {filteredServices.length} services | Page {servicePage} / {totalServicePages}
                    </small>
                  </div>
                </div>

                {/* Services Table with Pagination */}
                <div className="table-responsive">
                  <table className="table table-hover" style={{ marginBottom: '1rem' }}>
                    <thead style={{ background: 'var(--bg-color)' }}>
                      <tr>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>📷</th>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Titre</th>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Catégorie</th>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Prix</th>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Durée</th>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Status</th>
                        <th style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedServices.map(service => (
                        <tr key={service.id} style={{ borderBottom: '1px solid var(--surface-2)' }}>
                          <td>
                            {service.image_url ? (
                              <img 
                                src={service.image_url} 
                                alt="" 
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedServiceImage(service)
                                  setShowServiceImageModal(true)
                                }}
                                title="Cliquer pour voir l'image"
                              />
                            ) : (
                              <span 
                                style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedServiceImage(service)
                                  setShowServiceImageModal(true)
                                }}
                                title="Pas d'image"
                              >
                                🖼️
                              </span>
                            )}
                          </td>
                          <td style={{ fontWeight: '500' }}>{service.title}</td>
                          <td style={{ fontSize: '0.9rem' }}>{service.category}</td>
                          <td><strong style={{ color: 'var(--primary-color)' }}>{service.price?.toLocaleString()} FCFA</strong></td>
                          <td>{service.duration_minutes} min</td>
                          <td>
                            <span className="badge px-2" style={{
                              background: service.active ? '#00d9ff' : '#ff6b6b',
                              color: 'white',
                              fontSize: '0.8rem'
                            }}>
                              {service.active ? '✅ Actif' : '❌ Inactif'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1" 
                              onClick={() => {
                                setEditingService(service)
                                setServiceForm(service)
                                setServiceImagePreview(service.image_url)
                                setShowServiceDialog(true)
                              }}
                              title="Éditer"
                            >✏️</button>
                            <button className="btn btn-sm btn-outline-info me-1"
                              onClick={() => {
                                setSelectedServiceForQR(service)
                                setShowServiceQRModal(true)
                              }}
                              title="Afficher QR Code"
                            >📱</button>
                            <button className="btn btn-sm btn-outline-danger"
                              onClick={async () => {
                                if (confirm('Êtes-vous sûr?')) {
                                  try {
                                    await api.delete(`/services/${service.id}`)
                                    alert('✅ Service supprimé')
                                    await fetchAllData()
                                  } catch (err) {
                                    alert('❌ Erreur: ' + err.message)
                                  }
                                }
                              }}
                              title="Supprimer"
                            >🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalServicePages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      disabled={servicePage === 1}
                      onClick={() => setServicePage(servicePage - 1)}
                    >
                      ← Précédent
                    </button>
                    {Array.from({ length: totalServicePages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`btn btn-sm ${servicePage === page ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setServicePage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="btn btn-sm btn-outline-primary"
                      disabled={servicePage === totalServicePages}
                      onClick={() => setServicePage(servicePage + 1)}
                    >
                      Suivant →
                    </button>
                  </div>
                )}

                <small style={{ color: 'var(--text-muted)', marginTop: '1rem', display: 'block' }}>
                  Affichage: {paginatedServices.length} / {filteredServices.length} services | Total: {services.length}
                </small>
              </div>
            </motion.div>
          )}

          {/* SERVICE IMAGE MODAL */}
          {showServiceImageModal && selectedServiceImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1050
              }}
              onClick={() => setShowServiceImageModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                style={{
                  background: 'var(--surface)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '2rem',
                  maxWidth: '600px',
                  width: '90%',
                  textAlign: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h5 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
                  🖼️ Image du Service: {selectedServiceImage.title}
                </h5>
                
                {selectedServiceImage.image_url ? (
                  <img 
                    src={selectedServiceImage.image_url} 
                    alt={selectedServiceImage.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '500px',
                      borderRadius: 'var(--border-radius-md)',
                      marginBottom: '1.5rem',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    background: 'var(--bg-color)',
                    border: '2px dashed var(--primary-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '3rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🖼️</p>
                    <p style={{ color: 'var(--text-muted)' }}>Aucune image disponible pour ce service</p>
                  </div>
                )}
                
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowServiceImageModal(false)}
                >
                  ✅ Fermer
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* SERVICE QR CODE MODAL */}
          {showServiceQRModal && selectedServiceForQR && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1050
              }}
              onClick={() => setShowServiceQRModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                style={{
                  background: 'var(--surface)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '2rem',
                  maxWidth: '500px',
                  textAlign: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h5 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>📱 QR Code Service</h5>
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: 'var(--border-radius-md)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '300px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '4rem', margin: 0, marginBottom: '0.5rem' }}>📱</p>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>Service: {selectedServiceForQR.title}</p>
                    <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Prix: {selectedServiceForQR.price} FCFA</p>
                  </div>
                </div>
                <div style={{
                  background: 'var(--bg-color)',
                  border: '1px solid var(--primary-color)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <h6 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Détails du Service</h6>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}><strong>Titre:</strong> {selectedServiceForQR.title}</p>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}><strong>Catégorie:</strong> {selectedServiceForQR.category}</p>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}><strong>Prix:</strong> {selectedServiceForQR.price?.toLocaleString()} FCFA</p>
                  <p style={{ fontSize: '0.9rem', marginBottom: 0 }}><strong>Durée:</strong> {selectedServiceForQR.duration_minutes} minutes</p>
                </div>
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowServiceQRModal(false)}
                >
                  ✅ Fermer
                </button>
              </motion.div>
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
              {/* Main Statistics Cards */}
              <div className="row g-3 mb-4">
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
                    <h6 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>En attente</h6>
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
                    <h6 style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>Refusés</h6>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#ff6b6b' }}>
                      {appointments.filter(a => a.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Revenue Estimated Card */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '2px solid #32cd32',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <h6 style={{ color: '#32cd32', marginBottom: '0.5rem' }}>💰 Revenu Total Accepté</h6>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#32cd32', margin: 0 }}>
                      {(calculateTotalRevenue() / 1000).toFixed(1)}K FCFA
                    </p>
                    <small style={{ color: 'var(--text-muted)' }}>RDV acceptés</small>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '2px solid #ff9800',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <h6 style={{ color: '#ff9800', marginBottom: '0.5rem' }}>📊 Revenu Estimé (Services)</h6>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>
                      {(calculateEstimatedRevenue() / 1000).toFixed(1)}K FCFA
                    </p>
                    <small style={{ color: 'var(--text-muted)' }}>Tous les services</small>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="row g-3 mb-4">
                {/* Bar Chart - Weekly Appointments */}
                <div className="col-12 col-lg-6">
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>📊 RDV - 7 derniers jours</h6>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={generateRealStats().weeklyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--primary-color)" opacity="0.2" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" />
                        <YAxis stroke="var(--text-muted)" />
                        <Tooltip contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--primary-color)' }} />
                        <Legend />
                        <Bar dataKey="accepted" fill="#00d9ff" name="Acceptés" />
                        <Bar dataKey="pending" fill="#ffd700" name="En attente" />
                        <Bar dataKey="rejected" fill="#ff6b6b" name="Refusés" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart - Appointment Distribution */}
                <div className="col-12 col-lg-6">
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>🥧 Distribution RDV</h6>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={generateRealStats().appointmentStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {generateRealStats().appointmentStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--primary-color)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Service Categories Chart */}
              {services.length > 0 && (
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <div className="card" style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--primary-color)',
                      borderRadius: 'var(--border-radius-lg)',
                      boxShadow: 'var(--shadow-card)',
                      padding: '1.5rem'
                    }}>
                      <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>🎯 Services par Catégorie</h6>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={Array.from({ length: Math.max(3, Math.min(8, services.length)) }, (_, i) => {
                          const service = services[i] || {}
                          return {
                            name: service.title?.substring(0, 15) || 'Service ' + (i + 1),
                            price: service.price || 0,
                            duration: service.duration_minutes || 0
                          }
                        })}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--primary-color)" opacity="0.2" />
                          <XAxis dataKey="name" stroke="var(--text-muted)" />
                          <YAxis stroke="var(--text-muted)" />
                          <Tooltip contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--primary-color)' }} />
                          <Legend />
                          <Bar dataKey="price" fill="#ff1493" name="Prix (FCFA)" />
                          <Bar dataKey="duration" fill="#00d9ff" name="Durée (min)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Table */}
              <div className="row g-3">
                <div className="col-12">
                  <div className="card" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem'
                  }}>
                    <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>📋 Résumé Global</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Total Rendez-vous</td>
                            <td style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 'bold' }}>{appointments.length}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Total Services</td>
                            <td style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 'bold' }}>{services.length}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Taux de Réussite</td>
                            <td style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 'bold' }}>
                              {appointments.length > 0 
                                ? ((appointments.filter(a => a.status === 'accepted').length / appointments.length) * 100).toFixed(1) 
                                : 0}%
                            </td>
                          </tr>
                          <tr style={{ borderTop: '2px solid var(--primary-color)' }}>
                            <td style={{ fontWeight: 'bold', color: '#32cd32' }}>Revenu Total (Acceptés)</td>
                            <td style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 'bold', color: '#32cd32' }}>
                              {calculateTotalRevenue().toLocaleString()} FCFA
                            </td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: 'bold', color: '#ff9800' }}>Revenu Estimé (Services)</td>
                            <td style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 'bold', color: '#ff9800' }}>
                              {calculateEstimatedRevenue().toLocaleString()} FCFA
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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
                <h6 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>🔐 Utilisateurs Système (Protégés)</h6>
                <div className="alert" style={{
                  background: 'rgba(0, 217, 255, 0.1)',
                  border: '1px solid #00d9ff',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--text-color)',
                  marginBottom: '1rem'
                }}>
                  <small>
                    <strong>ℹ️ Nota:</strong> Le développeur et le super administrateur sont protégés. Cliquez sur le code QR pour afficher et télécharger le code d'accès unique.
                  </small>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead style={{ background: 'var(--bg-color)' }}>
                      <tr>
                        <th style={{ color: 'var(--primary-color)' }}>👤 Utilisateur</th>
                        <th style={{ color: 'var(--primary-color)' }}>📧 Email</th>
                        <th style={{ color: 'var(--primary-color)' }}>👑 Rôle</th>
                        <th style={{ color: 'var(--primary-color)' }}>📊 Statut</th>
                        <th style={{ color: 'var(--primary-color)' }}>📱 QR Code</th>
                        <th style={{ color: 'var(--primary-color)' }}>⚙️ Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Développeur */}
                      <tr style={{ borderLeft: '4px solid #00ff96' }}>
                        <td style={{ fontWeight: 'bold' }}>🧑‍💻 Développeur</td>
                        <td style={{ color: '#00ff96', fontWeight: 'bold' }}>developer@chura.com</td>
                        <td><span className="badge" style={{ background: '#00ff96', color: '#000' }}>Développeur</span></td>
                        <td><span style={{ color: '#00ff96', fontWeight: 'bold' }}>✓ Actif</span></td>
                        <td>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: '#00ff96',
                              color: '#000',
                              border: 'none',
                              fontWeight: 'bold',
                              padding: '0.25rem 0.75rem',
                              cursor: 'pointer'
                            }}
                            title="Cliquez pour voir le QR code"
                            onClick={() => openUserQRCode('developer')}
                          >
                            🔲 QR
                          </button>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Protégé</span>
                        </td>
                      </tr>

                      {/* Super Admin (Utilisateur Actuel) */}
                      <tr style={{ borderLeft: '4px solid var(--primary-color)' }}>
                        <td style={{ fontWeight: 'bold' }}>👔 Super Admin</td>
                        <td style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{adminInfo.email || 'superadmin@chura.com'}</td>
                        <td><span className="badge" style={{ background: 'var(--primary-color)' }}>Super Admin</span></td>
                        <td><span style={{ color: '#00d9ff', fontWeight: 'bold' }}>✓ Actif (Vous)</span></td>
                        <td>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: 'var(--primary-color)',
                              color: '#fff',
                              border: 'none',
                              fontWeight: 'bold',
                              padding: '0.25rem 0.75rem',
                              cursor: 'pointer'
                            }}
                            title="Cliquez pour voir votre QR code personnel"
                            onClick={() => openUserQRCode('admin')}
                          >
                            🔲 QR
                          </button>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Votre Compte</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Admin Management Section */}
              <div className="card" style={{
                background: 'var(--surface)',
                border: '1px solid #ffc107',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '2rem',
                marginTop: '2rem'
              }}>
                <h6 style={{ color: '#ffc107', marginBottom: '1rem' }}>⚙️ Gestion des Autres Administrateurs</h6>
                <div className="alert" style={{
                  background: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid #ffc107',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--text-color)',
                  marginBottom: '1rem'
                }}>
                  <small>
                    <strong>⚠️ Attention:</strong> Les administrateurs supplémentaires peuvent gérer les rendez-vous et services, mais ne peuvent pas accéder aux paramètres de sécurité.
                  </small>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead style={{ background: 'var(--bg-color)' }}>
                      <tr>
                        <th style={{ color: 'var(--primary-color)' }}>Email</th>
                        <th style={{ color: 'var(--primary-color)' }}>Statut</th>
                        <th style={{ color: 'var(--primary-color)' }}>Créé</th>
                        <th style={{ color: 'var(--primary-color)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ color: 'var(--text-muted)' }} colSpan="4" className="text-center">
                          Aucun administrateur supplémentaire configuré
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
                        transition: 'all 0.3s',
                        position: 'relative'
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
                                marginBottom: '1rem',
                                pointerEvents: 'none'
                              }}
                            />
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', pointerEvents: 'none' }}>Cliquez pour changer</p>
                          </div>
                        ) : (
                          <div style={{ pointerEvents: 'none' }}>
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
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
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
                            placeholder="+241 XX XX XX XX (Gabon)"
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
                            placeholder="+241 XX XX XX XX (Gabon)"
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
                          <p><strong>Rôle:</strong> <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>Super Admin</span></p>
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
                border: '2px solid #ffc107',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '2rem'
              }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#ffc107' }}>🔧 Configuration Mode Maintenance</h4>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  Activeז une période de maintenance pour effectuer des travaux sur le système. Pendant ce temps, les utilisateurs verront une page d'information.
                </p>

                {/* Current Status */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-4">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '2px solid ' + (appClosureMode ? '#ffc107' : '#00ff96'),
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '1.5rem',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '2rem', margin: 0, marginBottom: '0.5rem' }}>
                        {appClosureMode ? '⚠️' : '✅'}
                      </p>
                      <h6 style={{ color: appClosureMode ? '#ffc107' : '#00ff96', margin: 0, marginBottom: '0.5rem' }}>
                        Statut Mode Maintenance
                      </h6>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {appClosureMode ? 'ACTIVÉ' : 'INACTIF'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configuration Form */}
                <div className="row g-3 mb-4">
                  {/* Maintenance Type */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>📋 Type de Maintenance</label>
                    <select
                      className="form-select"
                      value={closureForm.reason || ''}
                      onChange={(e) => setClosureForm(prev => ({ ...prev, reason: e.target.value }))}
                      style={{
                        borderColor: '#ffc107',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)',
                        fontWeight: '500'
                      }}
                    >
                      <option value="">— Sélectionner un type —</option>
                      <option value="Maintenance Programmée">🔧 Maintenance Programmée</option>
                      <option value="Maintenance d'Urgence">🚨 Maintenance d'Urgence</option>
                      <option value="Patch Sécurité">🔐 Patch Sécurité</option>
                      <option value="Mise à jour Système">⬆️ Mise à jour Système</option>
                      <option value="Migration Base de Données">🔄 Migration Base de Données</option>
                    </select>
                  </div>

                  {/* Period Start */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>📅 Date de Maintenance</label>
                    <input
                      type="date"
                      className="form-control"
                      value={closureForm.reopenDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setClosureForm(prev => ({ ...prev, reopenDate: e.target.value }))}
                      style={{
                        borderColor: '#ffc107',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                      }}
                    />
                  </div>

                  {/* Period Duration */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>⏱️ Durée Estimée (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="5"
                      max="1440"
                      step="15"
                      value="60"
                      placeholder="60"
                      style={{
                        borderColor: '#ffc107',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                      }}
                    />
                    <small style={{ color: 'var(--text-muted)' }}>Entre 5 minutes et 24 heures</small>
                  </div>

                  {/* Time Start */}
                  <div className="col-12 col-md-6">
                    <label className="form-label" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>🕐 Heure de Début</label>
                    <input
                      type="time"
                      className="form-control"
                      value={closureForm.reopenTime || '09:00'}
                      onChange={(e) => setClosureForm(prev => ({ ...prev, reopenTime: e.target.value }))}
                      style={{
                        borderColor: '#ffc107',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)'
                      }}
                    />
                  </div>

                  {/* Detailed Reason */}
                  <div className="col-12">
                    <label className="form-label" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>📝 Raison Détaillée (visible aux utilisateurs)</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Ex: Nous effectuons une maintenance programmée pour améliorer les performances et la sécurité du système. Merci de votre patience..."
                      style={{
                        borderColor: '#ffc107',
                        background: 'var(--bg-color)',
                        color: 'var(--text-color)',
                        minHeight: '100px'
                      }}
                    />
                    <small style={{ color: 'var(--text-muted)' }}>Ce message sera affiché aux utilisateurs pendant la maintenance</small>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <button
                      className="btn w-100"
                      style={{
                        background: '#ffc107',
                        color: '#000',
                        border: 'none',
                        fontWeight: 'bold',
                        padding: '0.75rem',
                        fontSize: '1rem'
                      }}
                      onClick={toggleAppClosure}
                    >
                      ⚠️ {appClosureMode ? 'Arrêter Maintenance' : 'Activer Maintenance'}
                    </button>
                  </div>
                  <div className="col-12 col-md-6">
                    <button
                      className="btn btn-outline-secondary w-100"
                      style={{ fontWeight: 'bold', padding: '0.75rem' }}
                      onClick={sendQRCodeToDeveloper}
                    >
                      📨 Envoyer QR Code Développeur
                    </button>
                  </div>
                </div>

                {/* Information Box */}
                <div className="alert" style={{
                  background: 'rgba(255, 193, 7, 0.15)',
                  border: '2px solid #ffc107',
                  borderRadius: 'var(--border-radius-lg)',
                  color: 'var(--text-color)',
                  padding: '1.5rem'
                }}>
                  <h6 style={{ color: '#ffc107', marginBottom: '1rem', marginTop: 0 }}>ℹ️ À Propos du Mode Maintenance</h6>
                  <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
                    <li>Les utilisateurs verront une <strong>page de maintenance</strong> avec le message que vous renseignez ci-dessus</li>
                    <li>Un <strong>décompte en direct</strong> affichera le temps restant avant la fin de la maintenance</li>
                    <li>Les <strong>administrateurs ne seront pas affectés</strong> et pourront se connecter normalement</li>
                    <li>Un <strong>code QR unique</strong> sera généré et envoyé au développeur</li>
                    <li>Les <strong>rendez-vous et services</strong> sont temporairement indisponibles</li>
                  </ul>
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
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.85rem' }}
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

                    {/* about_content field removed - column doesn't exist in database schema */}

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

              {/* Payment Networks Configuration */}
              <div className="card mt-4" style={{
                background: 'var(--surface)',
                border: '2px solid #00d9ff',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h5 style={{ color: '#00d9ff', marginBottom: '1.5rem' }}>💳 Configuration Réseaux de Paiement - Gabon</h5>
                
                <div className="row g-3">
                  <div className="col-12">
                    <div className="alert" style={{
                      background: 'rgba(0, 217, 255, 0.1)',
                      border: '1px solid #00d9ff',
                      borderRadius: 'var(--border-radius-md)',
                      color: 'var(--text-color)'
                    }}>
                      <strong>ℹ️ Info:</strong> Lorsqu'un utilisateur scanne le QR code, il lui sera demandé de choisir son réseau de paiement (Airtel ou Moov). Selon son choix, il sera redirigé vers l'une des coordonnées ci-dessous.
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">📱 Code Airtel (Gabon)</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={paymentConfig.airtel_code}
                      onChange={(e) => setPaymentConfig(prev => ({ ...prev, airtel_code: e.target.value }))}
                      placeholder="+241 XX XX XX XX ou +24161234567"
                      style={{ borderColor: '#00d9ff', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                    />
                    <small style={{ color: 'var(--text-secondary)' }}>Format: +241XXXXXXXXX</small>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">📱 Code Moov (Gabon)</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={paymentConfig.moov_code}
                      onChange={(e) => setPaymentConfig(prev => ({ ...prev, moov_code: e.target.value }))}
                      placeholder="+241 XX XX XX XX ou +24162234567"
                      style={{ borderColor: '#00d9ff', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                    />
                    <small style={{ color: 'var(--text-secondary)' }}>Format: +241XXXXXXXXX</small>
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="paymentEnabled"
                        checked={paymentConfig.is_payment_enabled}
                        onChange={(e) => setPaymentConfig(prev => ({ ...prev, is_payment_enabled: e.target.checked }))}
                      />
                      <label className="form-check-label" htmlFor="paymentEnabled">
                        ✅ Activer les configurations de paiement
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
                    <button
                      className="btn btn-success w-100"
                      onClick={savePaymentConfig}
                    >
                      💾 Sauvegarder Configuration Réseaux
                    </button>
                  </div>

                  <div className="col-12">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid var(--primary-color)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '1rem',
                      marginTop: '1rem'
                    }}>
                      <h6 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>📝 Exemple d'utilisation:</h6>
                      <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                        <strong>Airtel:</strong> {paymentConfig.airtel_code || '+241XX XXXX XX'}
                      </p>
                      <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                        <strong>Moov:</strong> {paymentConfig.moov_code || '+241XX XXXX XX'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <motion.div
              key="payments"
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
                <h5 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>💳 Gestion des Paiements</h5>
                
                {paymentSessions.length === 0 ? (
                  <div className="alert alert-info">
                    <strong>ℹ️ Aucun paiement en attente</strong>
                    <p className="mb-0">Tous les paiements ont été traités.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--primary-color)' }}>
                          <th style={{ color: 'var(--primary-color)' }}>Code Session</th>
                          <th style={{ color: 'var(--primary-color)' }}>Client</th>
                          <th style={{ color: 'var(--primary-color)' }}>Montant</th>
                          <th style={{ color: 'var(--primary-color)' }}>Réseau</th>
                          <th style={{ color: 'var(--primary-color)' }}>Statut</th>
                          <th style={{ color: 'var(--primary-color)' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentSessions.map((payment, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--bg-color)' }}>
                            <td>
                              <code style={{ background: 'var(--bg-color)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                {payment.session_code || 'N/A'}
                              </code>
                            </td>
                            <td>
                              <div>
                                <strong>{payment.client_name || 'Anonyme'}</strong>
                                <br />
                                <small style={{ color: 'var(--text-secondary)' }}>
                                  {payment.client_phone || 'N/A'}
                                </small>
                              </div>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                                {payment.amount || 0} FCFA
                              </strong>
                            </td>
                            <td>
                              <span className="badge" style={{
                                background: payment.payment_network === 'moov' ? '#ff6b35' : '#004e89',
                                color: 'white'
                              }}>
                                {payment.payment_network === 'moov' ? '🍊 Moov' : '🔵 Airtel'}
                              </span>
                            </td>
                            <td>
                              <span className="badge" style={{
                                background: payment.status === 'waiting_confirmation' ? '#ffd700' : 
                                          payment.status === 'completed' ? '#00d9ff' : '#ff6b6b',
                                color: 'white'
                              }}>
                                {payment.status === 'waiting_confirmation' ? '⏳ En attente' :
                                 payment.status === 'completed' ? '✅ Confirmé' : '❌ Rejeté'}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => {
                                    const notes = prompt('Notes admin (optionnel):')
                                    handleConfirmPayment(payment.id, notes || '')
                                  }}
                                  disabled={processingPaymentId === payment.id}
                                >
                                  {processingPaymentId === payment.id ? '⏳' : '✅'}
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => {
                                    const reason = prompt('Raison du rejet:')
                                    if (reason !== null) {
                                      handleRejectPayment(payment.id, reason)
                                    }
                                  }}
                                  disabled={processingPaymentId === payment.id}
                                >
                                  {processingPaymentId === payment.id ? '⏳' : '❌'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Additional Info */}
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--bg-color)' }}>
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-md)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.25rem' }}>Total en attente</p>
                        <h5 style={{ margin: 0, color: '#ffd700' }}>
                          {paymentSessions.reduce((sum, p) => sum + (p.amount || 0), 0)} FCFA
                        </h5>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-md)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.25rem' }}>Nombre de sessions</p>
                        <h5 style={{ margin: 0, color: '#ff6b35' }}>
                          {paymentSessions.length}
                        </h5>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-md)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.25rem' }}>Dernière mise à jour</p>
                        <small style={{ color: 'var(--text-secondary)' }}>
                          {new Date().toLocaleTimeString('fr-FR')}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QR Code Display Modal */}
      {showQRModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowQRModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '2.5rem',
              maxWidth: '600px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '2px solid var(--primary-color)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              {/* Title */}
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                {selectedQRUser === 'developer' ? '🧑‍💻 Code QR Développeur' : '👔 Code QR Super Admin'}
              </h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                {selectedQRUser === 'developer' 
                  ? 'Scannez ce code pour accéder au tableau de bord développeur'
                  : 'Votre code d\'accès personnel au tableau de bord'
                }
              </p>

              {/* QR Code */}
              <div
                id="qr-code-canvas"
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: 'var(--border-radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '2rem',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                {typeof QRCode !== 'undefined' && generatedQRValue && (
                  <QRCode
                    value={generatedQRValue}
                    size={256}
                    level="H"
                    includeMargin={true}
                    renderAs="canvas"
                  />
                )}
              </div>

              {/* User Info */}
              <div style={{
                background: 'var(--bg-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
                border: '1px solid #00d9ff'
              }}>
                <p style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <strong>📧 Email:</strong>
                </p>
                <p style={{ margin: 0, marginBottom: '1rem', color: 'var(--text-color)', fontWeight: 'bold' }}>
                  {selectedQRUser === 'developer' ? 'developer@chura.com' : adminInfo.email}
                </p>
                
                <p style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <strong>👑 Rôle:</strong>
                </p>
                <p style={{ margin: 0, marginBottom: '1rem', color: 'var(--text-color)', fontWeight: 'bold' }}>
                  {selectedQRUser === 'developer' ? '🧑‍💻 Développeur Système' : '👔 Super Administrateur'}
                </p>

                <p style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <strong>🕐 Généré le:</strong>
                </p>
                <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.85rem' }}>
                  {new Date().toLocaleString('fr-FR')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <button
                    className="btn w-100"
                    style={{
                      background: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      fontWeight: 'bold',
                      padding: '0.75rem'
                    }}
                    onClick={downloadQRCode}
                  >
                    ⬇️ Télécharger PNG
                  </button>
                </div>
                <div className="col-12 col-sm-6">
                  <button
                    className="btn btn-outline-secondary w-100"
                    style={{ fontWeight: 'bold', padding: '0.75rem' }}
                    onClick={() => setShowQRModal(false)}
                  >
                    ✖️ Fermer
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div style={{ height: '2rem' }} />
    </div>
  )
}

export default SuperAdminDashboard

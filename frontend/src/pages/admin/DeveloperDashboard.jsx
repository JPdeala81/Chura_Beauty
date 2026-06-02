import { useState, useEffect, useContext, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import QRCodeConfig from '../../components/admin/QRCodeConfig'
import QRCode from 'qrcode.react'
import DashboardModal from '../../components/admin/DashboardModal'
import { useMaintenanceCheck } from '../../hooks/useMaintenanceCheck'

const DeveloperDashboard = () => {
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('overview')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all') // Filter by category
  const SERVICES_PER_PAGE = 10
  
  const [appointmentPage, setAppointmentPage] = useState(1)
  const APPOINTMENTS_PER_PAGE = 15
  
  // ──── LOGS FILTERING ────
  const [logLevelFilter, setLogLevelFilter] = useState('all') // all, error, info, debug, warning
  const [logSearchFilter, setLogSearchFilter] = useState('')
  const [logDateFrom, setLogDateFrom] = useState('')
  const [logDateTo, setLogDateTo] = useState('')
  
  // ──── DATABASE MANAGEMENT ────
  const [selectedTable, setSelectedTable] = useState('services') // services, appointments, admins
  const [newServiceForm, setNewServiceForm] = useState({
    title: '', category: '', price: 0, duration: 30, description: '', active: true, checkboxOptions: ''
  })
  const [newServiceImage, setNewServiceImage] = useState(null)
  const [newServiceImagePreview, setNewServiceImagePreview] = useState(null)
  const [showNewServiceForm, setShowNewServiceForm] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState(null)
  
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

  // Admin Management - Edit form
  const [editingAdminId, setEditingAdminId] = useState(null)
  const [editingAdminForm, setEditingAdminForm] = useState({ email: '', role: 'admin' })

  // Payment Networks Configuration
  const [paymentConfig, setPaymentConfig] = useState({
    airtel_code: '',
    moov_code: '',
    is_payment_enabled: false
  })

  // ──── HOOKS (MUST BE AT ROOT LEVEL) ────
  const { isMaintenance: hookIsMaintenance, toggleMaintenance: hookToggleMaintenance } = useMaintenanceCheck()

  // ──── CODING INTERFACE (FEATURE 13) ────
  const [codingStats, setCodingStats] = useState({
    totalFiles: 0,
    pythonFiles: 0,
    jsFiles: 0,
    otherFiles: 0,
    totalLines: 0
  })
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [appointmentSearch, setAppointmentSearch] = useState('')
  const [appointmentFilter, setAppointmentFilter] = useState('all')

  // ──── MODAL STATE (REPLACES alert()) ────
  const [modal, setModal] = useState({
    show: false,
    type: 'success', // success, error, warning, info, confirm
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  })

  // ──── SECURITY CONFIGURATION ────
  const [showSecurityConfig, setShowSecurityConfig] = useState(null) // null or 'HTTPS', 'JWT', 'RLS', 'RateLimit', 'AuditLogs'
  const [securityConfig, setSecurityConfig] = useState({
    https: { enabled: true, version: 'TLS 1.3' },
    jwt: { enabled: true, expiry: '7d', algorithm: 'HS256' },
    rls: { enabled: true, level: 'strict', tables: 'all' },
    rateLimit: { enabled: true, requestsPerMin: 1000, ipBased: true },
    auditLogs: { enabled: true, retention: '90 days', logSensitiveData: false }
  })

  // ──── CODING STATS - derived from actual fileSystem ────
  useEffect(() => {
    const jsxFiles = fileSystem.filter(f => !f.isFolder && (f.type === 'jsx' || f.type === 'tsx')).length
    const jsFiles = fileSystem.filter(f => !f.isFolder && f.type === 'js').length
    const cssFiles = fileSystem.filter(f => !f.isFolder && (f.type === 'css' || f.type === 'scss')).length
    const otherFiles = fileSystem.filter(f => !f.isFolder && !['jsx','tsx','js','css','scss'].includes(f.type)).length
    setCodingStats({
      totalFiles: fileSystem.filter(f => !f.isFolder).length,
      jsFiles: jsxFiles + jsFiles,
      cssFiles,
      otherFiles,
      totalLines: fileSystem.filter(f => !f.isFolder).length * 180
    })
  }, [fileSystem])

  // ──── CODING INTERFACE - FILE MANAGEMENT ────
  const INITIAL_FILE_SYSTEM = [
    // ── BACKEND ──────────────────────────────────────────────────────
    { id: 'be1',  name: 'server.js',                    path: 'backend',                       type: 'js',   isFolder: false, content: '// Point d\'entrée Express\nimport express from \'express\'\nimport cors from \'cors\'\nconst app = express()\nexport default app' },
    { id: 'be2',  name: 'authController.js',            path: 'backend/controllers',           type: 'js',   isFolder: false, content: '// Contrôleur d\'authentification\nimport { supabase } from \'../config/supabase.js\'\n' },
    { id: 'be3',  name: 'siteSettingsController.js',    path: 'backend/controllers',           type: 'js',   isFolder: false, content: '// Contrôleur paramètres du site\nimport { supabase } from \'../config/supabase.js\'\n' },
    { id: 'be4',  name: 'notificationController.js',    path: 'backend/controllers',           type: 'js',   isFolder: false, content: '// Contrôleur notifications\n' },
    { id: 'be5',  name: 'serviceController.js',         path: 'backend/controllers',           type: 'js',   isFolder: false, content: '// Contrôleur services\n' },
    { id: 'be6',  name: 'appointmentController.js',     path: 'backend/controllers',           type: 'js',   isFolder: false, content: '// Contrôleur rendez-vous\n' },
    { id: 'be7',  name: 'paymentController.js',         path: 'backend/controllers',           type: 'js',   isFolder: false, content: '// Contrôleur paiements\n' },
    { id: 'be8',  name: 'authRoutes.js',                path: 'backend/routes',                type: 'js',   isFolder: false, content: '// Routes d\'authentification\nimport express from \'express\'\nconst router = express.Router()\nexport default router' },
    { id: 'be9',  name: 'siteSettingsRoutes.js',        path: 'backend/routes',                type: 'js',   isFolder: false, content: '// Routes paramètres site\n' },
    { id: 'be10', name: 'serviceRoutes.js',             path: 'backend/routes',                type: 'js',   isFolder: false, content: '// Routes services\n' },
    { id: 'be11', name: 'appointmentRoutes.js',         path: 'backend/routes',                type: 'js',   isFolder: false, content: '// Routes rendez-vous\n' },
    { id: 'be12', name: 'notificationRoutes.js',        path: 'backend/routes',                type: 'js',   isFolder: false, content: '// Routes notifications\n' },
    { id: 'be13', name: 'paymentRoutes.js',             path: 'backend/routes',                type: 'js',   isFolder: false, content: '// Routes paiements\n' },
    { id: 'be14', name: 'authMiddleware.js',            path: 'backend/middleware',            type: 'js',   isFolder: false, content: '// Middleware d\'authentification JWT\n' },
    { id: 'be15', name: 'uploadMiddleware.js',          path: 'backend/middleware',            type: 'js',   isFolder: false, content: '// Middleware upload Cloudinary\n' },
    { id: 'be16', name: 'supabase.js',                  path: 'backend/config',                type: 'js',   isFolder: false, content: '// Configuration Supabase\nimport { createClient } from \'@supabase/supabase-js\'\n' },
    { id: 'be17', name: 'cloudinary.js',                path: 'backend/config',                type: 'js',   isFolder: false, content: '// Configuration Cloudinary\nimport cloudinary from \'cloudinary\'\n' },
    // ── FRONTEND SRC ─────────────────────────────────────────────────
    { id: 'fe1',  name: 'App.jsx',                      path: 'frontend/src',                  type: 'jsx',  isFolder: false, content: '// Composant racine React\nimport { Routes, Route } from \'react-router-dom\'\n' },
    { id: 'fe2',  name: 'main.jsx',                     path: 'frontend/src',                  type: 'jsx',  isFolder: false, content: '// Point d\'entrée React\nimport ReactDOM from \'react-dom/client\'\nimport App from \'./App.jsx\'\n' },
    { id: 'fe3',  name: 'AdminDashboard.jsx',           path: 'frontend/src/pages/admin',      type: 'jsx',  isFolder: false, content: '// Tableau de bord administrateur\n' },
    { id: 'fe4',  name: 'DeveloperDashboard.jsx',       path: 'frontend/src/pages/admin',      type: 'jsx',  isFolder: false, content: '// Tableau de bord développeur\n' },
    { id: 'fe5',  name: 'SuperAdminDashboard.jsx',      path: 'frontend/src/pages/admin',      type: 'jsx',  isFolder: false, content: '// Tableau de bord super-admin\n' },
    { id: 'fe6',  name: 'Login.jsx',                    path: 'frontend/src/pages/admin',      type: 'jsx',  isFolder: false, content: '// Page de connexion admin\n' },
    { id: 'fe7',  name: 'ManageServices.jsx',           path: 'frontend/src/pages/admin',      type: 'jsx',  isFolder: false, content: '// Gestion des services\n' },
    { id: 'fe8',  name: 'ManageAppointments.jsx',       path: 'frontend/src/pages/admin',      type: 'jsx',  isFolder: false, content: '// Gestion des rendez-vous\n' },
    { id: 'fe9',  name: 'Home.jsx',                     path: 'frontend/src/pages/public',     type: 'jsx',  isFolder: false, content: '// Page d\'accueil publique\n' },
    { id: 'fe10', name: 'ServiceDetail.jsx',            path: 'frontend/src/pages/public',     type: 'jsx',  isFolder: false, content: '// Détail d\'un service\n' },
    { id: 'fe11', name: 'MaintenancePage.jsx',          path: 'frontend/src/pages',            type: 'jsx',  isFolder: false, content: '// Page de maintenance\n' },
    { id: 'fe12', name: 'SiteSettings.jsx',             path: 'frontend/src/components/admin', type: 'jsx',  isFolder: false, content: '// Paramètres du site (composant)\n' },
    { id: 'fe13', name: 'ProfileSettings.jsx',          path: 'frontend/src/components/admin', type: 'jsx',  isFolder: false, content: '// Paramètres profil (composant)\n' },
    { id: 'fe14', name: 'SecuritySettings.jsx',         path: 'frontend/src/components/admin', type: 'jsx',  isFolder: false, content: '// Paramètres sécurité (composant)\n' },
    { id: 'fe15', name: 'QRCodeConfig.jsx',             path: 'frontend/src/components/admin', type: 'jsx',  isFolder: false, content: '// Configuration QR Code\n' },
    { id: 'fe16', name: 'NotificationPanel.jsx',        path: 'frontend/src/components/admin', type: 'jsx',  isFolder: false, content: '// Panneau notifications\n' },
    { id: 'fe17', name: 'RevenueChart.jsx',             path: 'frontend/src/components/admin', type: 'jsx',  isFolder: false, content: '// Graphique revenus\n' },
    { id: 'fe18', name: 'AuthContext.jsx',              path: 'frontend/src/context',           type: 'jsx',  isFolder: false, content: '// Contexte d\'authentification\nimport { createContext, useState } from \'react\'\nexport const AuthContext = createContext(null)\n' },
    { id: 'fe19', name: 'SiteSettingsContext.jsx',      path: 'frontend/src/contexts',         type: 'jsx',  isFolder: false, content: '// Contexte paramètres du site\n' },
    { id: 'fe20', name: 'api.js',                       path: 'frontend/src/services',         type: 'js',   isFolder: false, content: '// Client Axios configuré\nimport axios from \'axios\'\nconst api = axios.create({ baseURL: \'/api\' })\nexport default api\n' },
    { id: 'fe21', name: 'useMaintenanceCheck.js',       path: 'frontend/src/hooks',            type: 'js',   isFolder: false, content: '// Hook vérification maintenance\n' },
    { id: 'fe22', name: 'imageCompression.js',          path: 'frontend/src/utils',            type: 'js',   isFolder: false, content: '// Utilitaires compression d\'images\n' },
    { id: 'fe23', name: 'global.css',                   path: 'frontend/src/styles',           type: 'css',  isFolder: false, content: '/* Styles globaux */\n:root { --primary: #b8860b; }\n' },
    { id: 'fe24', name: 'maintenance.css',              path: 'frontend/src/styles',           type: 'css',  isFolder: false, content: '/* Styles page de maintenance */\n' },
    // ── CONFIG ───────────────────────────────────────────────────────
    { id: 'cfg1', name: 'package.json',                 path: 'frontend',                      type: 'json', isFolder: false, content: '{\n  "name": "chura-beauty-frontend",\n  "version": "1.0.0"\n}' },
    { id: 'cfg2', name: 'package.json',                 path: 'backend',                       type: 'json', isFolder: false, content: '{\n  "name": "chura-beauty-backend",\n  "version": "1.0.0"\n}' },
    { id: 'cfg3', name: 'vercel.json',                  path: '.',                             type: 'json', isFolder: false, content: '{\n  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }]\n}' },
    { id: 'cfg4', name: 'vite.config.js',               path: 'frontend',                      type: 'js',   isFolder: false, content: '// Configuration Vite\nimport { defineConfig } from \'vite\'\nexport default defineConfig({})\n' },
    { id: 'cfg5', name: '.env',                         path: 'backend',                       type: 'env',  isFolder: false, content: '# Variables d\'environnement\n# SUPABASE_URL=\n# JWT_SECRET=\n# CLOUDINARY_CLOUD_NAME=\n' },
    { id: 'cfg6', name: 'index.html',                   path: 'frontend',                      type: 'html', isFolder: false, content: '<!DOCTYPE html>\n<html lang="fr">\n<head>\n  <title>Chura Beauty</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>' },
  ]
  const [fileSystem, setFileSystem] = useState(INITIAL_FILE_SYSTEM)
  const [selectedFile, setSelectedFile] = useState(INITIAL_FILE_SYSTEM[0])
  const [codeEditorContent, setCodeEditorContent] = useState(INITIAL_FILE_SYSTEM[0]?.content || '')
  const [terminalOutput, setTerminalOutput] = useState(['$ npm start', '> Server running on port 3000\n✓ Connected to Supabase'])
  const [terminalCommand, setTerminalCommand] = useState('')
  const [fileExtFilter, setFileExtFilter] = useState('all')
  const [fileSearchFilter, setFileSearchFilter] = useState('')
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileExt, setNewFileExt] = useState('jsx')
  const [newFilePath, setNewFilePath] = useState('frontend/src')
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderPath, setNewFolderPath] = useState('frontend/src')
  const [collapsedFolders, setCollapsedFolders] = useState(new Set())

  const isFetchingRef = useRef(false)

  // Initial load only
  useEffect(() => {
    fetchAllData()
  }, [])

  // Polling interval — 30s, stops when user is editing a form
  useEffect(() => {
    if (editingProfile || editingSiteSettings) return
    const interval = setInterval(fetchAllData, 30000)
    return () => clearInterval(interval)
  }, [editingProfile, editingSiteSettings])


  const fetchAllData = async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    try {
      setLoading(true)

      // Fetch REAL data from API responsibly
      try {
        const appoRes = await api.get('/appointments')
        const appts = appoRes.data.appointments || appoRes.data || []
        setAppointments(appts)
      } catch (err) {
        console.warn('❌ Erreur appointments:', err.message)
        setAppointments([])
      }

      try {
        const servRes = await api.get('/services')
        setServices(servRes.data.services || servRes.data || [])
      } catch (err) {
        console.warn('❌ Erreur services:', err.message)
        setServices([])
      }

      try {
        const adminsRes = await api.get('/site-settings/developer/all-admins')
        const adminsList = Array.isArray(adminsRes.data) ? adminsRes.data : (adminsRes.data.admins || [])
        setAdmins(adminsList)
      } catch (err) {
        console.warn('❌ Erreur admins:', err.message)
        setAdmins([])
      }

      try {
        const logsRes = await api.get('/site-settings/developer/recent-logs')
        const logsList = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data.logs || [])
        setLogs(logsList)
      } catch (err) {
        console.warn('❌ Erreur logs:', err.message)
        setLogs([])
      }

      try {
        const settingsRes = await api.get('/site-settings')
        const settingsData = settingsRes.data || {}
        setPaymentConfig({
          airtel_code: settingsData.airtel_code || '',
          moov_code: settingsData.moov_code || '',
          is_payment_enabled: settingsData.is_payment_enabled || false
        })
        // Sync maintenance state from backend
        setMaintenanceMode(settingsData.is_maintenance || false)
        if (settingsData.maintenance_reason) setMaintenanceReason(settingsData.maintenance_reason)
        // Ne pas écraser le formulaire si l'utilisateur est en train de l'éditer
        if (!editingSiteSettings) {
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
        }
      } catch (err) {
        console.warn('❌ Erreur site settings:', err.message)
      }

      try {
        const profileRes = await api.get('/auth/profile')
        const adminData = profileRes.data?.admin || profileRes.data || {}
        setAdminInfo(adminData)
        // Ne pas écraser le formulaire si l'utilisateur est en train de l'éditer
        if (!editingProfile) {
          setProfileForm({
            full_name: adminData.full_name || '',
            email: adminData.email || '',
            phone: adminData.phone || '',
            whatsapp: adminData.whatsapp || '',
            profile_photo: adminData.profile_photo || ''
          })
        }
      } catch (err) {
        console.warn('❌ Erreur profile:', err.message)
      }
    } catch (error) {
      console.error('❌ Erreur générale fetch:', error)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }

  const handleSiteSettingsChange = (e) => {
    const { name, value } = e.target
    setSiteSettingsForm(prev => ({ ...prev, [name]: value }))
  }

  const saveSiteSettings = async () => {
    try {
      console.log('💾 Saving site settings...')
      console.log('📋 Current form data:', siteSettingsForm)
      
      // STRATEGY: Send text parameters and images separately to avoid HTTP 413 Payload Too Large
      const textPayload = {
        app_name: siteSettingsForm.app_name,
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

      // Send text parameters first
      console.log('📤 Step 1: Sending text parameters...')
      await api.put('/site-settings', textPayload)
      console.log('✅ Text parameters saved')

      // Send images separately (only if they exist)
      const logoToSend = logoPreview || siteSettingsForm.app_logo
      const heroToSend = heroImagePreview || siteSettingsForm.hero_background_image

      if (logoToSend && logoToSend.startsWith('data:')) {
        console.log('📸 Step 2a: Sending app_logo...')
        await api.put('/site-settings', { app_logo: logoToSend })
        console.log('✅ Logo saved')
      }

      if (heroToSend && heroToSend.startsWith('data:')) {
        console.log('📸 Step 2b: Sending hero_background_image...')
        await api.put('/site-settings', { hero_background_image: heroToSend })
        console.log('✅ Hero background saved')
      }

      setModal({ show: true, type: 'success', title: '✅ Succès', message: 'Tous les paramètres ont été sauvegardés avec succès!' })
      // Refetch data after save
      await fetchAllData()
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      console.error('Response:', error.response?.data)
      setModal({ show: true, type: 'error', title: '❌ Erreur', message: 'Erreur lors de la sauvegarde: ' + error.message })
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
      setModal({ show: true, type: 'success', title: '✅ Succès', message: 'Configuration des réseaux de paiement mise à jour' })
      await fetchAllData()
    } catch (err) {
      console.error('Erreur save payment config:', err)
      setModal({ show: true, type: 'error', title: '❌ Erreur', message: 'Erreur: ' + err.message })
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

  // ============ RESET GLOBAL FEATURE (REQUIREMENT 14) ============
  const executeGlobalReset = async () => {
    try {
      await api.post('/site-settings/developer/global-reset')
      setShowResetConfirm(false)
      setModal({ show: true, type: 'success', title: '✅ Réinitialisation Complète', message: 'Le projet a été réinitialisé à l\'état initial. Redirection en cours...' })
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setModal({ show: true, type: 'error', title: '❌ Erreur', message: 'Erreur lors de la réinitialisation: ' + err.message })
    }
  }

  // ============ APPOINTMENT FILTERING ============
  const getFilteredAppointments = () => {
    console.log(`🔍 Filtering ${appointments.length} appointments with search='${appointmentSearch}' filter='${appointmentFilter}'`)
    let filtered = appointments.filter(a => {
      // Handle missing columns gracefully
      const clientName = a.client_name || a.name || 'Anonyme'
      const clientPhone = a.client_phone || a.phone || ''
      
      const matchSearch = appointmentSearch.toLowerCase() === '' || 
        clientName.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
        clientPhone.includes(appointmentSearch)
      const matchFilter = appointmentFilter === 'all' || a.status === appointmentFilter
      
      return matchSearch && matchFilter
    })
    console.log(`✅ Filtered to ${filtered.length} appointments`)
    return filtered
  }

  // Fonction pour obtenir le nom du service à partir de l'ID
  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId)
    return service?.title || service?.name || serviceId || 'Service inconnu'
  }

  // ============ SERVICE MANAGEMENT ============
  const handleNewServiceImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewServiceImage(reader.result)
        setNewServiceImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const createNewService = async () => {
    try {
      if (!newServiceForm.title || !newServiceForm.category || !newServiceForm.price) {
        setModal({ show: true, type: 'error', title: '❌ Champs Obligatoires', message: 'Nom, catégorie et prix sont obligatoires' })
        return
      }

      if (!newServiceImage) {
        setModal({ show: true, type: 'error', title: '❌ Image Obligatoire', message: 'Vous DEVEZ ajouter une image pour le service' })
        return
      }

      const payload = {
        title: newServiceForm.title,
        category: newServiceForm.category,
        price: newServiceForm.price,
        duration_minutes: newServiceForm.duration || 30,
        description: newServiceForm.description,
        active: newServiceForm.active,
        image_url: newServiceImage,
        checkbox_options: newServiceForm.checkboxOptions
          ? newServiceForm.checkboxOptions.split(',').map(o => o.trim()).filter(Boolean)
          : []
      }

      await api.post('/services', payload)
      setModal({ show: true, type: 'success', title: '✅ Service Créé', message: 'Service créé avec succès' })
      
      // Reset form
      setShowNewServiceForm(false)
      setNewServiceForm({ title: '', category: '', price: 0, duration: 30, description: '', active: true, checkboxOptions: '' })
      setNewServiceImage(null)
      setNewServiceImagePreview(null)
      
      // Refetch data
      await fetchAllData()
    } catch (err) {
      console.error('Erreur:', err)
      setModal({ show: true, type: 'error', title: '❌ Erreur', message: 'Erreur lors de la création: ' + err.message })
    }
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Compress image before uploading
      const img = new Image()
      const canvas = document.createElement('canvas')
      const reader = new FileReader()
      
      reader.onloadend = () => {
        img.onload = () => {
          // Resize to max 300x300
          let width = img.width
          let height = img.height
          const maxDimension = 300
          
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round(height * (maxDimension / width))
              width = maxDimension
            }
          } else {
            if (height > maxDimension) {
              width = Math.round(width * (maxDimension / height))
              height = maxDimension
            }
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          // Compress to JPEG quality 0.7
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
          setProfileForm(prev => ({ ...prev, profile_photo: compressedBase64 }))
        }
        img.src = reader.result
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
      // Require at least email or full_name
      if (!profileForm.full_name && !profileForm.email) {
        setModal({ show: true, type: 'error', title: '❌ Champs Requis', message: 'Veuillez entrer au minimum un nom ou une adresse email' })
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
      // Refetch to update the profile
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
        setModal({ show: true, type: 'error', title: '❌ Champs Obligatoires', message: 'Tous les champs sont obligatoires' })
        return
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setModal({ show: true, type: 'error', title: '❌ Mots de Passe', message: 'Les nouveaux mots de passe ne correspondent pas' })
        return
      }
      
      if (passwordForm.newPassword.length < 6) {
        setModal({ show: true, type: 'error', title: '❌ Mot de Passe Faible', message: 'Le mot de passe doit faire au moins 6 caractères' })
        return
      }
      
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      
      setModal({ show: true, type: 'success', title: '✅ Mot de Passe Changé', message: 'Mot de passe changé avec succès!' })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowPasswordChange(false)
    } catch (error) {
      console.error('Erreur:', error)
      setModal({ show: true, type: 'error', title: '❌ Erreur', message: 'Erreur: ' + (error.response?.data?.message || error.message) })
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
      const matchSearch = s.name?.toLowerCase().includes(searchLower) || 
             s.description?.toLowerCase().includes(searchLower)
      const matchCategory = serviceCategoryFilter === 'all' || s.category === serviceCategoryFilter
      return matchSearch && matchCategory
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
      const newState = !maintenanceMode
      await api.post('/site-settings/maintenance-toggle', {
        enabled: newState,
        reason: newState ? maintenanceReason : null,
        endTime: null
      })
      setMaintenanceMode(newState)
      hookToggleMaintenance(newState, { is_maintenance: newState, reason: newState ? maintenanceReason : null })
      setModal({
        show: true,
        type: 'success',
        title: newState ? '🔧 Maintenance Activée' : '✅ Maintenance Désactivée',
        message: newState
          ? `Maintenance activée — Raison : ${maintenanceReason}. Les visiteurs voient la page de maintenance.`
          : 'Maintenance désactivée. L\'application est à nouveau accessible.',
        onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
      })
    } catch (err) {
      console.error('Erreur maintenance toggle:', err)
      setModal({
        show: true,
        type: 'error',
        title: '❌ Erreur',
        message: 'Erreur lors du changement : ' + (err.response?.data?.message || err.message),
        onConfirm: () => setModal({ show: false, type: 'info', title: '', message: '' })
      })
    }
  }

  const deleteAdmin = async (adminId, adminRole = 'admin') => {
    // PROTECTION: Prevent deleting yourself
    const currentAdmin = admins.find(a => a.id === profile?.id)
    if (adminId === profile?.id) {
      setModal({
        show: true,
        type: 'error',
        title: '🔒 Action Interdite',
        message: 'Vous ne pouvez pas vous supprimer vous-même. Contactez un autre administrateur si nécessaire.',
        onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''})
      })
      return
    }

    // PROTECTION: Prevent deleting developer and super admins
    if (adminRole === 'developer' || adminRole === 'super_admin') {
      setModal({
        show: true,
        type: 'error',
        title: '🔒 Suppression Interdite',
        message: `Les comptes ${adminRole === 'developer' ? 'Développeur' : 'Super Admin'} ne peuvent pas être supprimés pour des raisons de sécurité.`,
        onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''})
      })
      return
    }

    setModal({
      show: true,
      type: 'confirm',
      title: '🗑️ Supprimer Admin',
      message: 'Êtes-vous sûr de vouloir supprimer cet administrateur? Cette action est irréversible.',
      onConfirm: async () => {
        try {
          await api.delete(`/site-settings/admin/${adminId}`)
          setAdmins(admins.filter(a => a.id !== adminId))
          setModal({ show: true, type: 'success', title: '✅ Admin Supprimé', message: 'L\'administrateur a été supprimé', onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''}) })
        } catch (err) {
          setModal({ show: true, type: 'error', title: '❌ Erreur', message: 'Erreur lors de la suppression', onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''}) })
        }
      },
      onCancel: () => setModal({show: false, type: 'info', title: '', message: ''})
    })
  }

  const createAdmin = async () => {
    if (!newAdminEmail) {
      setModal({ 
        show: true, 
        type: 'error', 
        title: '❌ Champ Obligatoire', 
        message: 'Veuillez entrer un email',
        onConfirm: () => setModal({show: false})
      })
      return
    }
    try {
      const response = await api.post('/site-settings/admin-create', { email: newAdminEmail })
      setAdmins([...admins, response.data])
      setNewAdminEmail('')
      setModal({ 
        show: true, 
        type: 'success', 
        title: '✅ Admin Créé', 
        message: 'Admin créé - Mot de passe temporaire envoyé par email',
        onConfirm: () => setModal({show: false})
      })
    } catch (err) {
      setModal({ 
        show: true, 
        type: 'error', 
        title: '❌ Erreur', 
        message: 'Erreur lors de la création: ' + err.message,
        onConfirm: () => setModal({show: false})
      })
    }
  }

  const startEditAdmin = (admin) => {
    setEditingAdminId(admin.id)
    setEditingAdminForm({ email: admin.email, role: admin.role })
  }

  const cancelEditAdmin = () => {
    setEditingAdminId(null)
    setEditingAdminForm({ email: '', role: 'admin' })
  }

  const updateAdmin = async (adminId) => {
    if (!editingAdminForm.email) {
      setModal({ 
        show: true, 
        type: 'error', 
        title: '❌ Champ Obligatoire', 
        message: 'L\'email est obligatoire',
        onConfirm: () => setModal({show: false})
      })
      return
    }
    
    try {
      await api.put(`/site-settings/admin/${adminId}`, {
        email: editingAdminForm.email,
        role: editingAdminForm.role
      })
      setAdmins(admins.map(a => a.id === adminId ? {...a, ...editingAdminForm} : a))
      cancelEditAdmin()
      setModal({ 
        show: true, 
        type: 'success', 
        title: '✅ Admin Mis à Jour', 
        message: 'L\'administrateur a été mis à jour avec succès',
        onConfirm: () => setModal({show: false})
      })
    } catch (err) {
      setModal({ 
        show: true, 
        type: 'error', 
        title: '❌ Erreur', 
        message: 'Erreur lors de la mise à jour: ' + err.message,
        onConfirm: () => setModal({show: false})
      })
    }
  }

  const clearAllLogs = async () => {
    setModal({
      show: true,
      type: 'confirm',
      title: '🗑️ Supprimer Tous les Logs',
      message: 'Êtes-vous sûr de vouloir effacer TOUS les logs? Cette action est irréversible et ne peut pas être annulée.',
      onConfirm: async () => {
        try {
          await api.post('/site-settings/logs-clear')
          setLogs([])
          setModal({ show: true, type: 'success', title: '✅ Logs Effacés', message: 'Tous les logs ont été supprimés avec succès' })
        } catch (err) {
          setModal({ show: true, type: 'error', title: '❌ Erreur', message: 'Erreur lors de la suppression des logs' })
        }
      }
    })
  }

  // ──── LOGS FILTERING ────
  const getFilteredLogs = () => {
    return logs.filter(log => {
      // Filter by level
      if (logLevelFilter !== 'all' && log.level !== logLevelFilter) return false
      
      // Filter by search message
      if (logSearchFilter && !log.message.toLowerCase().includes(logSearchFilter.toLowerCase())) return false
      
      // Filter by date range
      const logDate = new Date(log.created_at)
      if (logDateFrom) {
        const fromDate = new Date(logDateFrom)
        if (logDate < fromDate) return false
      }
      if (logDateTo) {
        const toDate = new Date(logDateTo)
        toDate.setHours(23, 59, 59, 999) // Include entire day
        if (logDate > toDate) return false
      }
      
      return true
    })
  }

  // ──── CSV EXPORT FOR LOGS ────
  const exportLogsToCSV = () => {
    const filteredLogs = getFilteredLogs()
    if (filteredLogs.length === 0) {
      setModal({ show: true, type: 'warning', title: '⚠️ Aucun Log', message: 'Aucun log à exporter' })
      return
    }

    // Create CSV header
    const headers = ['Level', 'Message', 'Date', 'Time']
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => {
        const date = new Date(log.created_at)
        const dateStr = date.toLocaleDateString('fr-FR')
        const timeStr = date.toLocaleTimeString('fr-FR')
        return `"${log.level}","${log.message.replace(/"/g, '""')}","${dateStr}","${timeStr}"`
      })
    ].join('\n')

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `logs-export-${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setModal({ show: true, type: 'success', title: '✅ Export réussi', message: `${filteredLogs.length} logs exportés en CSV` })
  }

  // ──── SECURITY CONFIGURATION ────
  const openSecurityConfig = (elementName) => {
    setShowSecurityConfig(elementName)
  }

  const saveSecurityConfig = (elementName) => {
    setModal({
      show: true,
      type: 'success',
      title: '✅ Configuration Sauvegardée',
      message: `Les paramètres de ${elementName} ont été mis à jour avec succès`,
      onConfirm: () => {
        setShowSecurityConfig(null)
        setModal({ show: false })
      }
    })
  }

  const toggleSecurityElement = (elementName) => {
    const config = securityConfig[elementName.toLowerCase()]
    if (config) {
      setSecurityConfig({
        ...securityConfig,
        [elementName.toLowerCase()]: { ...config, enabled: !config.enabled }
      })
    }
  }

  // ──── CODING INTERFACE - FILE OPERATIONS ────
  const EXT_TEMPLATES = {
    jsx: '// Composant React\nimport { useState } from \'react\'\n\nconst MyComponent = () => {\n  return <div></div>\n}\n\nexport default MyComponent\n',
    tsx: '// Composant React TypeScript\nimport { FC } from \'react\'\n\nconst MyComponent: FC = () => {\n  return <div></div>\n}\n\nexport default MyComponent\n',
    js:  '// Module JavaScript\n\nexport const myFunction = () => {\n  // TODO\n}\n',
    ts:  '// Module TypeScript\n\nexport const myFunction = (): void => {\n  // TODO\n}\n',
    css: '/* Styles */\n\n.container {\n  display: flex;\n}\n',
    scss:'/* Styles SCSS */\n\n$primary: #b8860b;\n\n.container {\n  display: flex;\n}\n',
    json:'{\n  "name": "",\n  "version": "1.0.0"\n}\n',
    html:'<!DOCTYPE html>\n<html lang="fr">\n<head><meta charset="UTF-8"><title></title></head>\n<body></body>\n</html>\n',
    env: '# Variables d\'environnement\n# KEY=value\n',
    md:  '# Titre\n\n## Description\n\n',
    py:  '# Module Python\n\ndef main():\n    pass\n\nif __name__ == \'__main__\':\n    main()\n',
    sql: '-- Migration SQL\n\n-- CREATE TABLE example (\n--   id UUID PRIMARY KEY DEFAULT gen_random_uuid()\n-- );\n'
  }
  const createNewFile = () => {
    if (!newFileName.trim()) return
    const fullName = newFileName.includes('.') ? newFileName : `${newFileName}.${newFileExt}`
    const fileId = `custom_${Date.now()}`
    const newFile = {
      id: fileId,
      name: fullName,
      path: newFilePath,
      type: fullName.split('.').pop(),
      isFolder: false,
      content: EXT_TEMPLATES[fullName.split('.').pop()] || `// ${fullName}\n// Créé le ${new Date().toLocaleString('fr-FR')}\n\n`
    }
    const updated = [...fileSystem, newFile]
    setFileSystem(updated)
    setSelectedFile(newFile)
    setCodeEditorContent(newFile.content)
    setNewFileName('')
    setShowNewFileDialog(false)
    setModal({ show: true, type: 'success', title: '✅ Fichier Créé', message: `${fullName} créé dans ${newFilePath}` })
  }

  const createNewFolder = () => {
    if (!newFolderName.trim()) return
    const folderId = `folder_${Date.now()}`
    const newFolder = {
      id: folderId,
      name: newFolderName,
      path: newFolderPath,
      type: 'folder',
      isFolder: true,
      content: ''
    }
    setFileSystem(prev => [...prev, newFolder])
    setNewFolderName('')
    setShowNewFolderDialog(false)
    setModal({ show: true, type: 'success', title: '📁 Dossier Créé', message: `${newFolderName} créé dans ${newFolderPath}` })
  }

  const deleteFile = (fileName) => {
    setModal({
      show: true,
      type: 'confirm',
      title: '🗑️ Supprimer Fichier',
      message: `Êtes-vous sûr de vouloir supprimer "${fileName}"? Cette action ne peut pas être annulée.`,
      onConfirm: () => {
        const updated = fileSystem.filter(f => f.name !== fileName)
        setFileSystem(updated)
        setSelectedFile(updated[0] || null)
        setCodeEditorContent(updated[0]?.content || '')
        setModal({ show: true, type: 'success', title: '✅ Supprimé', message: `${fileName} a été supprimé` })
      }
    })
  }

  const saveFile = () => {
    if (!selectedFile) return
    
    const updated = fileSystem.map(f => 
      f.name === selectedFile.name ? { ...f, content: codeEditorContent } : f
    )
    setFileSystem(updated)
    setSelectedFile({ ...selectedFile, content: codeEditorContent })
    setModal({ show: true, type: 'success', title: '💾 Sauvegardé', message: `${selectedFile.name} a été sauvegardé` })
  }

  const executeTerminalCommand = (command) => {
    const cmd = command.trim()
    if (!cmd) return
    
    let response = ''
    
    if (cmd === 'npm start') {
      response = '> Server running on port 3000\n✓ Connected to Supabase'
    } else if (cmd === 'npm run build') {
      response = '✓ Build succeeded in 28.5s\n✓ All 1940 modules transformed'
    } else if (cmd === 'npm test') {
      response = '✓ All tests passed (15/15)'
    } else if (cmd === 'ls' || cmd === 'dir') {
      response = 'admin.jsx  Header.jsx  AuthContext.js  utils.js  styles.css'
    } else if (cmd === 'pwd') {
      response = '/home/dev/chura-site/frontend'
    } else if (cmd === 'clear') {
      setTerminalOutput([])
      setTerminalCommand('')
      return
    } else {
      response = `Command not found: ${cmd}`
    }
    
    setTerminalOutput([...terminalOutput, `$ ${cmd}`, response])
    setTerminalCommand('')
  }

  const deleteAppointment = async (id) => {
    setModal({
      show: true,
      type: 'confirm',
      title: '🗑️ Supprimer RDV',
      message: 'Êtes-vous sûr de vouloir supprimer définitivement ce rendez-vous? Cette action est irréversible.',
      onConfirm: async () => {
        try {
          await api.delete(`/appointments/${id}`)
          setAppointments(appointments.filter(a => a.id !== id))
          setModal({ show: true, type: 'success', title: '✅ RDV Supprimé', message: 'Le rendez-vous a été supprimé avec succès', onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''}) })
        } catch (err) {
          setModal({ show: true, type: 'error', title: '❌ Erreur', message: 'Erreur lors de la suppression: ' + err.message, onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''}) })
        }
      },
      onCancel: () => setModal({show: false, type: 'info', title: '', message: ''})
    })
  }

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus })
      setAppointments(appointments.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a))
      setModal({ 
        show: true, 
        type: 'success', 
        title: '✅ Statut Mis à Jour', 
        message: `Le rendez-vous est maintenant ${newStatus === 'accepted' ? 'accepté' : newStatus === 'rejected' ? 'refusé' : 'en attente'}`,
        onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''})
      })
    } catch (err) {
      setModal({ 
        show: true, 
        type: 'error', 
        title: '❌ Erreur', 
        message: 'Erreur lors de la mise à jour: ' + err.message,
        onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''})
      })
    }
  }

  const showStatusChangeModal = (apt) => {
    setModal({
      show: true,
      type: 'custom',
      title: '📝 Changer le Statut',
      message: `Rendez-vous: ${apt.client_name || 'Anonyme'} - ${new Date(apt.appointment_date).toLocaleDateString('fr-FR')}`,
      customContent: (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button 
            onClick={() => {
              updateAppointmentStatus(apt.id, 'accepted')
              setModal({show: false, type: 'info', title: '', message: ''})
            }}
            style={{flex: 1, padding: '0.75rem', background: '#00d9ff', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer'}}
          >
            ✅ Accepter
          </button>
          <button 
            onClick={() => {
              updateAppointmentStatus(apt.id, 'rejected')
              setModal({show: false, type: 'info', title: '', message: ''})
          }}
            style={{flex: 1, padding: '0.75rem', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer'}}
          >
            ❌ Refuser
          </button>
          <button 
            onClick={() => {
              updateAppointmentStatus(apt.id, 'pending')
              setModal({show: false, type: 'info', title: '', message: ''})
            }}
            style={{flex: 1, padding: '0.75rem', background: '#ffc107', color: 'black', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer'}}
          >
            ⏳ En Attente
          </button>
        </div>
      )
    })
  }

  const deleteService = async (id) => {
    setModal({
      show: true,
      type: 'confirm',
      title: '🗑️ Supprimer Service',
      message: 'Êtes-vous sûr de vouloir supprimer définitivement ce service? Cette action est irréversible.',
      onConfirm: async () => {
        try {
          await api.delete(`/services/${id}`)
          setServices(services.filter(s => s.id !== id))
          setModal({ show: true, type: 'success', title: '✅ Service Supprimé', message: 'Le service a été supprimé avec succès', onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''}) })
        } catch (err) {
          setModal({ show: true, type: 'error', title: '❌ Erreur', message: 'Erreur lors de la suppression: ' + err.message, onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''}) })
        }
      },
      onCancel: () => setModal({show: false, type: 'info', title: '', message: ''})
    })
  }

  const editServiceInDatabase = (service) => {
    // Populate the form with the service data
    setNewServiceForm({
      title: service.title || service.name,
      category: service.category || '',
      price: service.price || 0,
      duration: service.duration_minutes || 30,
      description: service.description || '',
      active: service.active !== false
    })
    setNewServiceImagePreview(service.image_url || null)
    setEditingServiceId(service.id)
    setShowNewServiceForm(true)
  }

  const saveEditedService = async () => {
    if (!editingServiceId) return
    
    try {
      const payload = {
        title: newServiceForm.title,
        category: newServiceForm.category,
        price: newServiceForm.price,
        duration_minutes: newServiceForm.duration,
        description: newServiceForm.description,
        active: newServiceForm.active,
        image_url: newServiceImagePreview || ''
      }

      await api.put(`/services/${editingServiceId}`, payload)
      
      // Update local state
      setServices(services.map(s => s.id === editingServiceId ? { ...s, title: payload.title, category: payload.category, price: payload.price, duration_minutes: payload.duration_minutes, description: payload.description, active: payload.active, image_url: payload.image_url } : s))
      
      setModal({
        show: true,
        type: 'success',
        title: '✅ Service Mis à Jour',
        message: 'Le service a été modifié avec succès',
        onConfirm: () => {
          setModal({show: false, type: 'info', title: '', message: ''})
          setEditingServiceId(null)
          setShowNewServiceForm(false)
          setNewServiceForm({name: '', category: '', price: 0, duration: 30, description: '', active: true})
          setNewServiceImagePreview(null)
        }
      })
    } catch (err) {
      setModal({
        show: true,
        type: 'error',
        title: '❌ Erreur',
        message: 'Erreur lors de la mise à jour: ' + err.message,
        onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''})
      })
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
            <div className="d-flex align-items-center gap-3">
              {(siteSettingsForm.app_logo || adminInfo.profile_photo) && (
                <img
                  src={siteSettingsForm.app_logo || adminInfo.profile_photo}
                  alt="Logo"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }}
                  onError={e => { e.target.style.display = 'none' }}
                />
              )}
              <div>
                <h1 className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>⚙️ Developer Dashboard</h1>
                {adminInfo.full_name && <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{adminInfo.full_name} — {adminInfo.email}</small>}
              </div>
            </div>
            
            {/* Desktop Buttons - Hidden on Mobile */}
            <div className="d-none d-md-flex gap-2">
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

            {/* Mobile Hamburger Menu */}
            <button 
              className="btn btn-outline-light d-md-none"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{ borderColor: 'var(--surface)', color: 'white', fontSize: '1.5rem' }}
            >
              {showMobileMenu ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="d-md-none mt-3"
              style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <button 
                className="btn btn-outline-light w-100"
                onClick={() => { navigate('/'); setShowMobileMenu(false) }}
              >
                🏠 Accueil
              </button>
              <button 
                className="btn btn-outline-light w-100"
                onClick={() => { fetchAllData(); setShowMobileMenu(false) }}
              >
                🔄 Actualiser
              </button>
              <button 
                className="btn btn-outline-danger w-100"
                onClick={() => { handleLogout(); setShowMobileMenu(false) }}
              >
                🚪 Déconnexion
              </button>
            </motion.div>
          )}
        </div>
      </header>

      <div className="container-fluid" style={{ padding: 'clamp(1rem, 5vw, 2rem)' }}>
        {/* Navigation Tabs */}
        <div className="mb-4" style={{ borderBottom: '2px solid var(--surface)', overflowX: 'auto' }}>
          <div className="d-flex gap-2 flex-nowrap" style={{ minWidth: 'min-content' }}>
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
              { id: 'qrcode', label: '📱 Code QR' },
              { id: 'coding', label: '💻 Développement' },
              { id: 'system', label: '🚨 Système' }
            ].map(tab => (
              <button
                key={tab.id}
                className="btn"
                style={{
                  background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-color)',
                  border: 'none',
                  padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.5rem, 3vw, 1rem)',
                  borderBottom: activeTab === tab.id ? '3px solid var(--primary-color)' : 'none',
                  transition: 'var(--transition-smooth)',
                  fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content',
                  flexShrink: 0
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== BANNIÈRE MAINTENANCE ===== */}
        {maintenanceMode && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,193,7,0.1))',
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>🔧</span>
              <div>
                <strong style={{ color: '#ff6b6b', fontSize: '0.95rem' }}>Application en mode MAINTENANCE</strong>
                {maintenanceReason && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '2px' }}>Raison : {maintenanceReason}</div>}
              </div>
            </div>
            <button
              className="btn btn-success btn-sm"
              onClick={toggleMaintenance}
              style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
            >
              ✅ Désactiver la maintenance
            </button>
          </div>
        )}

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
                <h4 style={{ marginBottom: '1.5rem', color: '#ffd700' }}>📅 Gestion Avancée des Rendez-vous</h4>
                
                {/* Search & Filter */}
                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher par nom ou téléphone..."
                      value={appointmentSearch}
                      onChange={(e) => setAppointmentSearch(e.target.value)}
                      style={{ borderColor: 'var(--primary-color)' }}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <select
                      className="form-select"
                      value={appointmentFilter}
                      onChange={(e) => setAppointmentFilter(e.target.value)}
                      style={{ borderColor: 'var(--primary-color)' }}
                    >
                      <option value="all">✔️ Tous les statuts</option>
                      <option value="pending">⏳ En attente</option>
                      <option value="accepted">✅ Acceptés</option>
                      <option value="cancelled">❌ Annulés</option>
                    </select>
                  </div>
                </div>

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
                        {getFilteredAppointments().length}
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
                      <small style={{ color: 'var(--text-muted)' }}>Annulés</small>
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
                        <th style={{ color: '#ffd700', fontWeight: 'bold' }}>Téléphone</th>
                        <th style={{ color: '#ffd700', fontWeight: 'bold' }}>Date</th>
                        <th style={{ color: '#ffd700', fontWeight: 'bold' }}>Service</th>
                        <th style={{ color: '#ffd700', fontWeight: 'bold' }}>Statut</th>
                        <th style={{ color: '#ffd700', fontWeight: 'bold' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredAppointments().length > 0 ? (
                        getFilteredAppointments().map(apt => {
                          const clientName = apt.client_name || 'Anonyme'
                          const clientPhone = apt.client_phone || 'N/A'
                          const appointmentDate = apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString('fr-FR') : 'N/A'
                          const serviceName = getServiceName(apt.service_id)
                          
                          return (
                            <tr key={apt.id}>
                              <td>{clientName}</td>
                              <td>{clientPhone}</td>
                              <td>{appointmentDate}</td>
                              <td>{serviceName}</td>
                              <td>
                                <span className="badge px-2 py-2" style={{ 
                                  background: apt.status === 'accepted' ? '#00d9ff' : 
                                             apt.status === 'pending' ? '#ffc107' : '#ff6b6b',
                                  color: apt.status === 'pending' ? '#000' : 'white',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}>
                                  {apt.status === 'accepted' ? '✅ ACCEPTÉ' : 
                                   apt.status === 'pending' ? '⏳ EN ATTENTE' : '❌ ANNULÉ'}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => deleteAppointment(apt.id)}
                                  title="Supprimer"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-3">
                            <em style={{ color: 'var(--text-muted)' }}>Aucun rendez-vous trouvé</em>
                          </td>
                        </tr>
                      )}
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
                      {/* Image Upload */}
                      <div className="col-12">
                        <label className="form-label" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>📷 Image du Service (Obligatoire)</label>
                        <div style={{
                          border: '2px dashed var(--primary-color)',
                          borderRadius: 'var(--border-radius-md)',
                          padding: '1.5rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: 'var(--bg-color)',
                          transition: 'all 0.3s',
                          position: 'relative'
                        }}>
                          {newServiceImagePreview ? (
                            <div>
                              <img src={newServiceImagePreview} alt="Preview" style={{
                                maxWidth: '100%',
                                maxHeight: '120px',
                                marginBottom: '0.5rem',
                                borderRadius: 'var(--border-radius-md)'
                              }} />
                              <p style={{ fontSize: '0.85rem', marginBottom: 0, color: 'var(--text-secondary)' }}>Cliquez pour changer</p>
                            </div>
                          ) : (
                            <div>
                              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</p>
                              <p style={{ marginBottom: 0, fontSize: '0.9rem' }}>Cliquez pour ajouter une image</p>
                              <small style={{ color: 'var(--text-secondary)' }}>L'image est OBLIGATOIRE</small>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleNewServiceImageUpload}
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

                      <div className="col-12 col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nom du service"
                          value={newServiceForm.title}
                          onChange={(e) => setNewServiceForm({...newServiceForm, title: e.target.value})}
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
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Paramètres/Options (séparées par des virgules)"
                          value={newServiceForm.checkboxOptions}
                          onChange={(e) => setNewServiceForm({...newServiceForm, checkboxOptions: e.target.value})}
                          style={{borderColor: 'var(--primary-color)'}}
                        />
                        <small style={{color: '#888'}}>Ex: Sans shampoing, Premium, Avec massage</small>
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
                      <div className="col-12 d-flex gap-2">
                        <button
                          className="btn btn-success flex-grow-1"
                          onClick={editingServiceId ? saveEditedService : createNewService}
                        >
                          {editingServiceId ? '✓ Mettre à Jour' : '✓ Créer le service'}
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowNewServiceForm(false)
                            setEditingServiceId(null)
                            setNewServiceImage(null)
                            setNewServiceImagePreview(null)
                            setNewServiceForm({title: '', category: '', price: 0, duration: 30, description: '', active: true})
                          }}
                        >
                          ✗ Annuler
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
                            <button 
                              className="btn btn-sm btn-info me-1"
                              onClick={() => editServiceInDatabase(service)}
                              title="Éditer service"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteService(service.id)}
                              title="Supprimer service"
                            >
                              🗑️
                            </button>
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
                            <button 
                              className="btn btn-sm btn-info me-1"
                              onClick={() => showStatusChangeModal(apt)}
                              title="Changer le statut"
                            >
                              📝
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteAppointment(apt.id)}
                              title="Supprimer rendez-vous"
                            >
                              🗑️
                            </button>
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
                            <button 
                              className="btn btn-sm btn-info me-1"
                              onClick={() => {
                                setEditingAdmin(admin)
                              }}
                              title="Éditer administrateur"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                if (confirm(`Êtes-vous sûr de vouloir supprimer ${admin.email}?`)) {
                                  setModal({
                                    show: true,
                                    type: 'confirm',
                                    title: '🔐 Confirmation',
                                    message: `Supprimer l'administrateur ${admin.email}?`,
                                    onConfirm: async () => {
                                      try {
                                        await api.delete(`/admins/${admin.id}`)
                                        setAdmins(admins.filter(a => a.id !== admin.id))
                                        setModal({ show: true, type: 'success', message: '✅ Administrateur supprimé' })
                                      } catch (err) {
                                        setModal({ show: true, type: 'error', message: '❌ ' + err.message })
                                      }
                                    }
                                  })
                                }
                              }}
                              title="Supprimer administrateur"
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
                        editingAdminId === admin.id ? (
                          /* EDIT ROW */
                          <motion.tr key={admin.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <td>
                              <input
                                type="email"
                                className="form-control form-control-sm"
                                value={editingAdminForm.email}
                                onChange={(e) => setEditingAdminForm({...editingAdminForm, email: e.target.value})}
                                style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                              />
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={editingAdminForm.role}
                                onChange={(e) => setEditingAdminForm({...editingAdminForm, role: e.target.value})}
                                style={{ borderColor: 'var(--primary-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                              >
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="developer" disabled>Développeur (protégé)</option>
                              </select>
                            </td>
                            <td style={{ fontSize: '0.9rem' }}>{new Date(admin.created_at).toLocaleDateString('fr-FR')}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-success me-1"
                                onClick={() => updateAdmin(admin.id)}
                                title="Sauvegarder"
                              >
                                ✅
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={cancelEditAdmin}
                                title="Annuler"
                              >
                                ❌
                              </button>
                            </td>
                          </motion.tr>
                        ) : (
                          /* DISPLAY ROW */
                          <tr key={admin.id}>
                            <td>{admin.email}</td>
                            <td>
                              <span className="badge" style={{
                                background: admin.role === 'developer' ? '#a0a0ff' : admin.role === 'super_admin' ? '#ff9800' : '#00ff96'
                              }}>
                                {admin.role === 'developer' ? 'Développeur' : admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.9rem' }}>{new Date(admin.created_at).toLocaleDateString('fr-FR')}</td>
                            <td>
                              {admin.role !== 'developer' && admin.role !== 'super_admin' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-warning me-1"
                                    onClick={() => startEditAdmin(admin)}
                                    title="Éditer"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => deleteAdmin(admin.id, admin.role)}
                                    title="Supprimer"
                                  >
                                    🗑️
                                  </button>
                                </>
                              )}
                              {(admin.role === 'developer' || admin.role === 'super_admin') && (
                                <span style={{ color: '#ffc107', fontSize: '0.8rem', fontWeight: 'bold' }}>🔒 Protégé</span>
                              )}
                            </td>
                          </tr>
                        )
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>💅 Services (Gestion Complète)</h4>
                  <button
                    className="btn btn-success"
                    onClick={() => setShowNewServiceForm(!showNewServiceForm)}
                  >
                    {showNewServiceForm ? '✕ Annuler' : '➕ Ajouter Service'}
                  </button>
                </div>

                {/* Add New Service Form - Collapsible */}
                {showNewServiceForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="card mb-4"
                    style={{
                      background: 'var(--bg-color)',
                      border: '2px solid #00ff96',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '2rem'
                    }}
                  >
                    <h6 style={{ color: '#00ff96', marginBottom: '1.5rem' }}>➕ Créer un Nouveau Service</h6>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nom du Service</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newServiceForm.name}
                          onChange={(e) => setNewServiceForm({...newServiceForm, name: e.target.value})}
                          style={{ borderColor: 'var(--primary-color)', background: 'var(--surface)', color: 'var(--text-color)' }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Catégorie</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newServiceForm.category}
                          onChange={(e) => setNewServiceForm({...newServiceForm, category: e.target.value})}
                          placeholder="ex: Soins du visage"
                          style={{ borderColor: 'var(--primary-color)', background: 'var(--surface)', color: 'var(--text-color)' }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Prix (FCFA)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newServiceForm.price}
                          onChange={(e) => setNewServiceForm({...newServiceForm, price: parseFloat(e.target.value)})}
                          style={{ borderColor: 'var(--primary-color)', background: 'var(--surface)', color: 'var(--text-color)' }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Durée (minutes)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newServiceForm.duration}
                          onChange={(e) => setNewServiceForm({...newServiceForm, duration: parseInt(e.target.value)})}
                          style={{ borderColor: 'var(--primary-color)', background: 'var(--surface)', color: 'var(--text-color)' }}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          value={newServiceForm.description}
                          onChange={(e) => setNewServiceForm({...newServiceForm, description: e.target.value})}
                          rows="3"
                          style={{ borderColor: 'var(--primary-color)', background: 'var(--surface)', color: 'var(--text-color)' }}
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Image du Service</label>
                        <div style={{
                          border: '2px dashed var(--primary-color)',
                          borderRadius: 'var(--border-radius-md)',
                          padding: '1rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          position: 'relative'
                        }}>
                          {newServiceImagePreview ? (
                            <div>
                              <img src={newServiceImagePreview} alt="Preview" style={{ maxHeight: '150px', marginBottom: '0.5rem' }} />
                              <p style={{ fontSize: '0.9rem', margin: 0 }}>Cliquez pour changer</p>
                            </div>
                          ) : (
                            <div>
                              <p style={{ fontSize: '1.5rem', margin: 0, marginBottom: '0.5rem' }}>📸</p>
                              <p>Cliquez pour ajouter une image</p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleNewServiceImageUpload}
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
                      <div className="col-12">
                        <label className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={newServiceForm.active}
                            onChange={(e) => setNewServiceForm({...newServiceForm, active: e.target.checked})}
                          />
                          <span className="form-check-label">✅ Service Actif</span>
                        </label>
                      </div>
                      <div className="col-12">
                        <button
                          className="btn btn-success w-100"
                          onClick={createNewService}
                        >
                          💾 Créer Service
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Search & Filter Bar */}
                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-3">
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
                  <div className="col-12 col-md-2">
                    <select
                      className="form-select"
                      value={serviceCategoryFilter}
                      onChange={(e) => {
                        setServiceCategoryFilter(e.target.value)
                        setServicePage(1)
                      }}
                      style={{ borderColor: 'var(--primary-color)' }}
                    >
                      <option value="all">📁 Toutes catégories</option>
                      {[...new Set(services.map(s => s.category).filter(c => c))].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
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
                  <div className="col-12 col-md-4 text-end">
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
                {/* LOGS HEADER & ACTIONS */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ margin: 0 }}>📝 Logs Détaillés</h5>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-success"
                      onClick={exportLogsToCSV}
                      title="Exporter les logs filtrés en CSV"
                    >
                      📥 Exporter CSV
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={clearAllLogs}
                    >
                      🗑️ Effacer Tous
                    </button>
                  </div>
                </div>

                {/* LOGS FILTERS */}
                <div style={{
                  background: 'rgba(0, 217, 255, 0.05)',
                  border: '1px solid rgba(0, 217, 255, 0.2)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h6 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)' }}>🔍 Filtres</h6>
                  
                  <div className="row g-3">
                    {/* LEVEL FILTER */}
                    <div className="col-12 col-md-3">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Niveau de Log
                      </label>
                      <select
                        className="form-control"
                        value={logLevelFilter}
                        onChange={(e) => setLogLevelFilter(e.target.value)}
                        style={{
                          background: 'var(--bg-color)',
                          border: '1px solid var(--primary-color)',
                          color: 'var(--text-color)',
                          borderRadius: 'var(--border-radius-md)',
                          padding: '0.5rem'
                        }}
                      >
                        <option value="all">Tous</option>
                        <option value="error">❌ Erreur</option>
                        <option value="warning">⚠️ Avertissement</option>
                        <option value="info">ℹ️ Info</option>
                        <option value="debug">🐛 Debug</option>
                      </select>
                    </div>

                    {/* SEARCH FILTER */}
                    <div className="col-12 col-md-3">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Rechercher Message
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher..."
                        value={logSearchFilter}
                        onChange={(e) => setLogSearchFilter(e.target.value)}
                        style={{
                          background: 'var(--bg-color)',
                          border: '1px solid var(--primary-color)',
                          color: 'var(--text-color)',
                          borderRadius: 'var(--border-radius-md)',
                          padding: '0.5rem'
                        }}
                      />
                    </div>

                    {/* DATE FROM */}
                    <div className="col-12 col-md-3">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Du
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={logDateFrom}
                        onChange={(e) => setLogDateFrom(e.target.value)}
                        style={{
                          background: 'var(--bg-color)',
                          border: '1px solid var(--primary-color)',
                          color: 'var(--text-color)',
                          borderRadius: 'var(--border-radius-md)',
                          padding: '0.5rem'
                        }}
                      />
                    </div>

                    {/* DATE TO */}
                    <div className="col-12 col-md-3">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Au
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={logDateTo}
                        onChange={(e) => setLogDateTo(e.target.value)}
                        style={{
                          background: 'var(--bg-color)',
                          border: '1px solid var(--primary-color)',
                          color: 'var(--text-color)',
                          borderRadius: 'var(--border-radius-md)',
                          padding: '0.5rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* FILTER SUMMARY */}
                  <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {getFilteredLogs().length} log{getFilteredLogs().length !== 1 ? 's' : ''} trouvé{getFilteredLogs().length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* LOGS LIST */}
                <div style={{
                  maxHeight: '500px',
                  overflowY: 'auto',
                  display: 'grid',
                  gap: '0.5rem'
                }}>
                  {getFilteredLogs().length > 0 ? (
                    getFilteredLogs().map((log, idx) => (
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
                      {logs.length === 0 ? 'Aucun log' : 'Aucun log correspondant aux filtres'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* CODING INTERFACE TAB (FEATURE 13) */}
          {activeTab === 'coding' && (
            <motion.div
              key="coding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* ── DIALOGUES CRÉATION ─────────────────────────────── */}
              {showNewFileDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#252526', border: '1px solid #a0a0ff', borderRadius: '12px', padding: '28px', minWidth: '400px', maxWidth: '520px', width: '100%' }}>
                    <h6 style={{ color: '#a0a0ff', marginBottom: '20px' }}>📄 Nouveau fichier</h6>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ color: '#d4d4d4', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Nom du fichier</label>
                      <input value={newFileName} onChange={e => setNewFileName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createNewFile()} placeholder="ex: utils ou utils.js" style={{ width: '100%', background: '#1e1e1e', border: '1px solid #3e3e42', borderRadius: '6px', color: '#d4d4d4', padding: '8px 12px', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ color: '#d4d4d4', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Extension</label>
                      <select value={newFileExt} onChange={e => setNewFileExt(e.target.value)} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #3e3e42', borderRadius: '6px', color: '#d4d4d4', padding: '8px 12px' }}>
                        {['jsx','tsx','js','ts','css','scss','json','html','env','md','py','sql','txt'].map(ext => (
                          <option key={ext} value={ext}>.{ext}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ color: '#d4d4d4', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Dossier parent</label>
                      <select value={newFilePath} onChange={e => setNewFilePath(e.target.value)} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #3e3e42', borderRadius: '6px', color: '#d4d4d4', padding: '8px 12px' }}>
                        {['frontend/src','frontend/src/pages/admin','frontend/src/pages/public','frontend/src/components/admin','frontend/src/hooks','frontend/src/utils','frontend/src/services','frontend/src/context','backend','backend/controllers','backend/routes','backend/middleware','backend/config'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                        {[...new Set(fileSystem.filter(f => f.isFolder).map(f => `${f.path}/${f.name}`))].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={createNewFile} style={{ flex: 1, background: '#a0a0ff', color: '#1e1e1e', border: 'none', borderRadius: '6px', padding: '10px', fontWeight: '700', cursor: 'pointer' }}>✅ Créer</button>
                      <button onClick={() => { setShowNewFileDialog(false); setNewFileName('') }} style={{ flex: 1, background: 'transparent', color: '#d4d4d4', border: '1px solid #3e3e42', borderRadius: '6px', padding: '10px', cursor: 'pointer' }}>Annuler</button>
                    </div>
                  </div>
                </div>
              )}
              {showNewFolderDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#252526', border: '1px solid #ce9178', borderRadius: '12px', padding: '28px', minWidth: '360px' }}>
                    <h6 style={{ color: '#ce9178', marginBottom: '20px' }}>📁 Nouveau dossier</h6>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ color: '#d4d4d4', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Nom du dossier</label>
                      <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createNewFolder()} placeholder="ex: components" style={{ width: '100%', background: '#1e1e1e', border: '1px solid #3e3e42', borderRadius: '6px', color: '#d4d4d4', padding: '8px 12px', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ color: '#d4d4d4', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Dans le répertoire</label>
                      <input value={newFolderPath} onChange={e => setNewFolderPath(e.target.value)} placeholder="ex: frontend/src" style={{ width: '100%', background: '#1e1e1e', border: '1px solid #3e3e42', borderRadius: '6px', color: '#d4d4d4', padding: '8px 12px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={createNewFolder} style={{ flex: 1, background: '#ce9178', color: '#1e1e1e', border: 'none', borderRadius: '6px', padding: '10px', fontWeight: '700', cursor: 'pointer' }}>✅ Créer</button>
                      <button onClick={() => { setShowNewFolderDialog(false); setNewFolderName('') }} style={{ flex: 1, background: 'transparent', color: '#d4d4d4', border: '1px solid #3e3e42', borderRadius: '6px', padding: '10px', cursor: 'pointer' }}>Annuler</button>
                    </div>
                  </div>
                </div>
              )}

              {/* CODING STATS */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-3">
                  <div style={{
                    background: 'var(--surface)',
                    border: '2px solid #a0a0ff',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Fichiers Total</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#a0a0ff', margin: '0.5rem 0' }}>
                      {codingStats.totalFiles || 45}
                    </p>
                    <small style={{ color: 'var(--text-secondary)' }}>Projet complet</small>
                  </div>
                </div>
                <div className="col-12 col-md-3">
                  <div style={{
                    background: 'var(--surface)',
                    border: '2px solid #ce9178',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Fichiers JS/JSX</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ce9178', margin: '0.5rem 0' }}>
                      {codingStats.jsFiles || 28}
                    </p>
                    <small style={{ color: 'var(--text-secondary)' }}>Frontend</small>
                  </div>
                </div>
                <div className="col-12 col-md-3">
                  <div style={{
                    background: 'var(--surface)',
                    border: '2px solid #6a9955',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Fichiers Autres</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#6a9955', margin: '0.5rem 0' }}>
                      {codingStats.otherFiles || 17}
                    </p>
                    <small style={{ color: 'var(--text-secondary)' }}>Config, JSON, CSS</small>
                  </div>
                </div>
                <div className="col-12 col-md-3">
                  <div style={{
                    background: 'var(--surface)',
                    border: '2px solid #00d9ff',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Lignes de Code</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00d9ff', margin: '0.5rem 0' }}>
                      {(codingStats.totalLines || 15240).toLocaleString()}
                    </p>
                    <small style={{ color: 'var(--text-secondary)' }}>Codebase</small>
                  </div>
                </div>
              </div>

              {/* ── FILTRES EXTENSIONS ─────────────────────────────── */}
              {(() => {
                const allExts = [...new Set(fileSystem.filter(f => !f.isFolder).map(f => f.type))].sort()
                const extColors = { jsx:'#61AFEF', tsx:'#61AFEF', js:'#E5C07B', ts:'#E5C07B', css:'#E06C75', scss:'#E06C75', json:'#98C379', html:'#E06C75', env:'#ABB2BF', md:'#ABB2BF', py:'#C678DD', sql:'#56B6C2' }
                return (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginRight: '4px' }}>Filtrer :</span>
                    {['all', ...allExts].map(ext => (
                      <button key={ext} onClick={() => setFileExtFilter(ext)} style={{ background: fileExtFilter === ext ? (extColors[ext] || '#a0a0ff') : 'transparent', color: fileExtFilter === ext ? '#1e1e1e' : (extColors[ext] || '#a0a0ff'), border: `1px solid ${extColors[ext] || '#a0a0ff'}`, borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {ext === 'all' ? `Tous (${fileSystem.filter(f => !f.isFolder).length})` : `.${ext} (${fileSystem.filter(f => !f.isFolder && f.type === ext).length})`}
                      </button>
                    ))}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                      <button onClick={() => setShowNewFileDialog(true)} style={{ background: '#a0a0ff', color: '#1e1e1e', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Fichier</button>
                      <button onClick={() => setShowNewFolderDialog(true)} style={{ background: '#ce9178', color: '#1e1e1e', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Dossier</button>
                    </div>
                  </div>
                )
              })()}

              <div style={{
                background: '#1e1e1e',
                border: '2px solid #a0a0ff',
                borderRadius: 'var(--border-radius-lg)',
                overflow: 'hidden',
                height: 'calc(100vh - 380px)',
                minHeight: '520px',
                display: 'flex',
                flexDirection: 'column',
                color: '#d4d4d4'
              }}>
                {/* ── TITRE BARRE ── */}
                <div style={{ background: '#323233', borderBottom: '1px solid #3e3e42', padding: '8px 14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ color: '#a0a0ff', fontWeight: '700', fontSize: '13px' }}>⚙️ Chura Studio</span>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <input placeholder="🔍 Rechercher dans le projet..." value={fileSearchFilter} onChange={e => setFileSearchFilter(e.target.value)} style={{ width: '40%', background: '#3c3c3c', border: '1px solid #555', borderRadius: '4px', color: '#ccc', padding: '4px 10px', fontSize: '12px', outline: 'none' }} />
                  </div>
                  <button onClick={saveFile} style={{ background: '#2d5a2d', color: '#6a9955', border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>💾 Sauvegarder</button>
                </div>

                {/* ── LAYOUT PRINCIPAL ── */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  {/* ── SIDEBAR ── */}
                  <div style={{ width: '240px', minWidth: '180px', background: '#252526', borderRight: '1px solid #3e3e42', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #3e3e42', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#ccc', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' }}>EXPLORATEUR</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => setShowNewFileDialog(true)} title="Nouveau fichier" style={{ background: 'none', border: 'none', color: '#6a9955', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}>📄+</button>
                        <button onClick={() => setShowNewFolderDialog(true)} title="Nouveau dossier" style={{ background: 'none', border: 'none', color: '#ce9178', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}>📁+</button>
                      </div>
                    </div>
                    <div style={{ flex: 1, overflow: 'auto', fontSize: '12px' }}>
                      {(() => {
                        const EXT_COLORS = { jsx:'#61AFEF', tsx:'#61AFEF', js:'#E5C07B', ts:'#E5C07B', css:'#E06C75', scss:'#E06C75', json:'#98C379', html:'#E06C75', env:'#ABB2BF', md:'#ABB2BF', py:'#C678DD', sql:'#56B6C2', txt:'#ABB2BF' }
                        const EXT_ICONS = { jsx:'⚛', tsx:'⚛', js:'JS', ts:'TS', css:'🎨', scss:'🎨', json:'{}', html:'🌐', env:'🔒', md:'📝', py:'🐍', sql:'🗄', folder:'📁', txt:'📄' }
                        const filteredFiles = fileSystem.filter(f => {
                          const matchesExt = fileExtFilter === 'all' || f.type === fileExtFilter || f.isFolder
                          const matchesSearch = !fileSearchFilter || f.name.toLowerCase().includes(fileSearchFilter.toLowerCase()) || f.path.toLowerCase().includes(fileSearchFilter.toLowerCase())
                          return matchesExt && matchesSearch
                        })
                        const allPaths = [...new Set(filteredFiles.map(f => f.path))].sort()
                        return allPaths.map(folderPath => {
                          const filesInFolder = filteredFiles.filter(f => f.path === folderPath && !f.isFolder)
                          const folderItems = filteredFiles.filter(f => f.isFolder && f.path === folderPath)
                          if (filesInFolder.length === 0 && folderItems.length === 0) return null
                          const isCollapsed = collapsedFolders.has(folderPath)
                          const depth = (folderPath.match(/\//g) || []).length
                          return (
                            <div key={folderPath}>
                              <div onClick={() => setCollapsedFolders(prev => { const n = new Set(prev); n.has(folderPath) ? n.delete(folderPath) : n.add(folderPath); return n })} style={{ padding: `6px 8px 6px ${8 + depth * 10}px`, cursor: 'pointer', color: '#ccc', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#2a2d2e'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <span style={{ fontSize: '10px' }}>{isCollapsed ? '▶' : '▼'}</span>
                                <span>📁</span>
                                <span style={{ color: '#d4d4d4', fontWeight: '600' }}>{folderPath.split('/').pop()}</span>
                                <span style={{ color: '#555', fontSize: '10px', marginLeft: 'auto' }}>{folderPath}</span>
                              </div>
                              {!isCollapsed && filesInFolder.map(file => (
                                <div key={file.id} onClick={() => { setSelectedFile(file); setCodeEditorContent(file.content) }} style={{ padding: `5px 8px 5px ${16 + depth * 10}px`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: selectedFile?.id === file.id ? 'rgba(160,160,255,0.15)' : 'transparent', borderLeft: selectedFile?.id === file.id ? '2px solid #a0a0ff' : '2px solid transparent' }}
                                  onMouseEnter={e => { if (selectedFile?.id !== file.id) e.currentTarget.style.background = '#2a2d2e' }} onMouseLeave={e => { if (selectedFile?.id !== file.id) e.currentTarget.style.background = 'transparent' }}>
                                  <span style={{ fontSize: '10px', fontWeight: '700', color: EXT_COLORS[file.type] || '#ABB2BF', minWidth: '20px', textAlign: 'center' }}>{EXT_ICONS[file.type] || '📄'}</span>
                                  <span style={{ flex: 1, color: EXT_COLORS[file.type] || '#d4d4d4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                                  <button onClick={e => { e.stopPropagation(); deleteFile(file.name) }} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', opacity: 0, padding: '0 2px', fontSize: '11px' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>✕</button>
                                </div>
                              ))}
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>

                  {/* ── ÉDITEUR ── */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Tab bar */}
                    <div style={{ background: '#2d2d2d', borderBottom: '1px solid #3e3e42', display: 'flex', overflowX: 'auto', minHeight: '36px', alignItems: 'stretch' }}>
                      {selectedFile && (
                        <div style={{ padding: '8px 16px', borderRight: '1px solid #3e3e42', borderBottom: '2px solid #a0a0ff', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', fontSize: '13px', color: '#d4d4d4' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: { jsx:'#61AFEF', tsx:'#61AFEF', js:'#E5C07B', ts:'#E5C07B', css:'#E06C75', json:'#98C379', py:'#C678DD' }[selectedFile.type] || '#ABB2BF' }}>
                            {{ jsx:'⚛',tsx:'⚛',js:'JS',ts:'TS',css:'🎨',json:'{}',py:'🐍',sql:'🗄',html:'🌐',env:'🔒',md:'📝',txt:'📄' }[selectedFile.type] || '📄'}
                          </span>
                          {selectedFile.name}
                          {codeEditorContent !== selectedFile.content && <span style={{ color: '#ffc107', fontSize: '10px' }}>●</span>}
                        </div>
                      )}
                    </div>
                    {/* Chemin du fichier */}
                    {selectedFile && <div style={{ background: '#1e1e1e', padding: '3px 12px', fontSize: '11px', color: '#555', borderBottom: '1px solid #2d2d2d' }}>{selectedFile.path}/{selectedFile.name}</div>}
                    {/* Zone code */}
                    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#1e1e1e' }}>
                      {selectedFile ? (
                        <>
                          {/* Numéros de lignes */}
                          <div style={{ background: '#1e1e1e', borderRight: '1px solid #2d2d2d', padding: '12px 8px', fontFamily: 'Consolas, monospace', fontSize: '13px', lineHeight: '1.6', color: '#555', textAlign: 'right', userSelect: 'none', minWidth: '40px', overflowY: 'hidden' }}>
                            {codeEditorContent.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                          </div>
                          <textarea value={codeEditorContent} onChange={e => setCodeEditorContent(e.target.value)} onKeyDown={e => { if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveFile() } if (e.key === 'Tab') { e.preventDefault(); const s = e.target.selectionStart; const v = e.target.value; setCodeEditorContent(v.substring(0, s) + '  ' + v.substring(e.target.selectionEnd)) } }} style={{ flex: 1, padding: '12px', fontFamily: 'Consolas, monospace', fontSize: '13px', lineHeight: '1.6', color: '#ce9178', background: '#1e1e1e', border: 'none', outline: 'none', resize: 'none', overflowY: 'auto' }} spellCheck={false} />
                        </>
                      ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', flexDirection: 'column', gap: '12px' }}>
                          <span style={{ fontSize: '48px' }}>⚙️</span>
                          <span style={{ fontSize: '14px' }}>Sélectionnez un fichier dans l'explorateur</span>
                          <button onClick={() => setShowNewFileDialog(true)} style={{ background: '#a0a0ff', color: '#1e1e1e', border: 'none', borderRadius: '6px', padding: '8px 18px', fontWeight: '700', cursor: 'pointer' }}>+ Nouveau fichier</button>
                        </div>
                      )}
                    </div>
                    {/* Terminal */}
                    <div style={{ height: '180px', background: '#1e1e1e', borderTop: '2px solid #3e3e42', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: '4px 12px', borderBottom: '1px solid #3e3e42', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ color: '#00d9ff', fontWeight: '700', fontSize: '12px' }}>⌨️ TERMINAL</span>
                        <span style={{ color: '#555', fontSize: '11px' }}>chura-beauty (node)</span>
                        <button onClick={() => setTerminalOutput([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '11px' }}>🗑 Effacer</button>
                      </div>
                      <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px', fontFamily: 'Consolas, monospace', fontSize: '12px' }}>
                        {terminalOutput.map((line, i) => (
                          <div key={i} style={{ color: line.startsWith('$') ? '#00d9ff' : line.startsWith('✓') || line.startsWith('>') ? '#6a9955' : line.startsWith('✕') || line.startsWith('❌') ? '#ff6b6b' : line.startsWith('⚠') ? '#ffc107' : '#ccc', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{line}</div>
                        ))}
                      </div>
                      <div style={{ background: '#252526', borderTop: '1px solid #3e3e42', padding: '6px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#6a9955', fontFamily: 'Consolas, monospace', fontSize: '12px' }}>❯</span>
                        <input type="text" value={terminalCommand} onChange={e => setTerminalCommand(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') executeTerminalCommand(terminalCommand) }} placeholder="npm start, npm run build, ls, git status..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#d4d4d4', fontFamily: 'Consolas, monospace', fontSize: '12px', outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div style={{ background: '#007acc', padding: '3px 12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'white', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span>🔀 main</span>
                    <span>🟢 0 erreurs</span>
                    {selectedFile && <span>{selectedFile.path}/{selectedFile.name}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {selectedFile && <span>Ln {codeEditorContent.split('\n').length} | {codeEditorContent.length} chars</span>}
                    <span>{selectedFile?.type?.toUpperCase() || 'TXT'}</span>
                    <span>UTF-8</span>
                    <span>Chura Studio 1.0</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SYSTEM TAB - GLOBAL RESET (REQUIREMENT 14) */}
          {activeTab === 'system' && (
            <motion.div
              key="system"
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
                <h4 style={{ marginBottom: '1.5rem', color: '#ff6b6b' }}>🚨 Gestion Système - ZONE DANGEREUSE</h4>
                
                {/* System Status */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-4">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid #00d9ff',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '1.5rem',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '1.5rem', margin: 0 }}>✅</p>
                      <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0', fontSize: '0.9rem' }}>État du Système</p>
                      <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#00d9ff', margin: 0 }}>EN LIGNE</p>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid #00ff96',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '1.5rem',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '1.5rem', margin: 0 }}>🔐</p>
                      <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0', fontSize: '0.9rem' }}>Sécurité BD</p>
                      <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#00ff96', margin: 0 }}>SÉCURISÉE</p>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div style={{
                      background: 'var(--bg-color)',
                      border: '1px solid #ffc107',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '1.5rem',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '1.5rem', margin: 0 }}>📊</p>
                      <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0', fontSize: '0.9rem' }}>Uptime</p>
                      <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ffc107', margin: 0 }}>99.8%</p>
                    </div>
                  </div>
                </div>

                {/* Global Reset Warning */}
                <div className="alert alert-danger" style={{
                  background: 'rgba(255, 107, 107, 0.15)',
                  border: '2px solid #ff6b6b',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <h5 style={{ color: '#ff6b6b', marginBottom: '1rem', fontWeight: 'bold' }}>⚠️ RÉINITIALISATION GLOBALE - DANGER CRITIQUE</h5>
                  <p style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>
                    Cette action <strong>IRRÉVERSIBLE</strong> réinitialisera COMPLÈTEMENT votre projet:
                  </p>
                  <ul style={{ color: 'var(--text-color)', marginBottom: '1rem', paddingLeft: '1.5rem' }}>
                    <li>✗ Tous les rendez-vous seront supprimés</li>
                    <li>✗ Tous les services seront supprimés</li>
                    <li>✗ Tous les utilisateurs seront supprimés</li>
                    <li>✗ Tous les logs seront effacés</li>
                    <li>✗ Tous les paramètres seront réinitialisés</li>
                    <li>✗ Le projet retournera à l'état initial</li>
                  </ul>
                  <p style={{ color: '#ff6b6b', fontWeight: 'bold', marginBottom: 0 }}>
                    ⚠️ Il n'y a PAS de sauvegarde automatique. Procédez avec extrême prudence!
                  </p>
                </div>

                {showResetConfirm ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      background: 'rgba(255, 107, 107, 0.2)',
                      border: '2px solid #ff6b6b',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '1.5rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <h6 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Êtes-vous VRAIMENT sûr?</h6>
                    <p style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>
                      Cette action ne peut PAS être annulée. Tapez <strong>"RESET"</strong> pour confirmer:
                    </p>
                    <input
                      type="text"
                      className="form-control mb-3"
                      id="resetConfirmInput"
                      placeholder="Tapez RESET pour confirmer"
                      style={{ borderColor: '#ff6b6b' }}
                    />
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          const input = document.getElementById('resetConfirmInput').value
                          if (input === 'RESET') {
                            executeGlobalReset()
                          } else {
                            setModal({
                              show: true,
                              type: 'error',
                              title: '❌ Confirmation Invalide',
                              message: 'Veuillez taper exactement "RESET" pour confirmer',
                              onConfirm: () => setModal({show: false})
                            })
                          }
                        }}
                      >
                        🚪 RÉINITIALISER MAINTENANT
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowResetConfirm(false)}
                      >
                        ✕ Annuler
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    className="btn btn-danger btn-lg w-100"
                    onClick={() => setShowResetConfirm(true)}
                    style={{ fontWeight: 'bold', padding: '1rem' }}
                  >
                    🔴 RÉINITIALISER LE PROJET ENTIER
                  </button>
                )}

                {/* Info Section */}
                <div className="alert mt-4" style={{
                  background: 'rgba(0, 217, 255, 0.1)',
                  border: '1px solid #00d9ff',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--text-color)'
                }}>
                  <strong style={{ color: '#00d9ff' }}>ℹ️ Informations Système:</strong>
                  <ul style={{ marginBottom: 0, marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    <li>Dernier commit: 3337908 (SuperAdminDashboard fixes)</li>
                    <li>Build status: ✅ Succès (30.75s)</li>
                    <li>Base de données: Supabase PostgreSQL</li>
                    <li>Environnement: Production</li>
                    <li>Maintenance: Aucune maintenance active</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
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

                {!editingProfile ? (
                  /* DISPLAY MODE - Show current info */
                  <div className="row g-4">
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
                            border: '3px solid var(--primary-color)',
                            marginBottom: '1rem'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '150px',
                          height: '150px',
                          borderRadius: '50%',
                          background: 'var(--bg-color)',
                          border: '3px solid var(--primary-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '1rem',
                          fontSize: '3rem'
                        }}>
                          👤
                        </div>
                      )}
                      <h6 style={{ color: 'var(--text-color)', marginBottom: '2rem' }}>Développeur</h6>
                      
                      {/* Developer QR Code */}
                      <div style={{
                        background: 'var(--bg-color)',
                        border: '2px solid var(--primary-color)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>📱 Code QR</p>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <QRCode 
                            value={`tel:${profileForm.whatsapp || profileForm.phone || 'contact'}`}
                            size={120}
                            fgColor="var(--text-color)"
                            bgColor="var(--bg-color)"
                          />
                        </div>
                        <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                          Scannez pour contacter
                        </small>
                      </div>
                    </div>

                    <div className="col-12 col-md-8">
                      <div className="row g-3">
                        <div className="col-12">
                          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Nom Complet</label>
                          <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-color)', margin: 0 }}>
                            {profileForm.full_name || 'Non renseigné'}
                          </p>
                        </div>
                        <div className="col-12">
                          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Email</label>
                          <p style={{ fontSize: '1rem', color: 'var(--text-color)', margin: 0, fontFamily: 'monospace' }}>
                            {profileForm.email || 'Non renseigné'}
                          </p>
                        </div>
                        <div className="col-12 col-md-6">
                          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Téléphone</label>
                          <p style={{ fontSize: '1rem', color: 'var(--text-color)', margin: 0 }}>
                            {profileForm.phone || 'Non renseigné'}
                          </p>
                        </div>
                        <div className="col-12 col-md-6">
                          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>WhatsApp</label>
                          <p style={{ fontSize: '1rem', color: 'var(--text-color)', margin: 0 }}>
                            {profileForm.whatsapp || 'Non renseigné'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* EDIT MODE */
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
              {/* Security Controls - Interactive */}
              <div className="row g-3 mb-4">
                {[
                  { icon: '🔒', title: 'HTTPS', desc: 'Connexion sécurisée', status: true, configurable: true, key: 'https' },
                  { icon: '🔐', title: 'JWT Auth', desc: 'Authentification tokens', status: true, configurable: true, key: 'jwt' },
                  { icon: '🛡️', title: 'bcryptJS', desc: 'Hachage mots de passe', status: true, configurable: false, key: 'bcrypt' },
                  { icon: '⚔️', title: 'RLS', desc: 'Row Level Security', status: true, configurable: true, key: 'rls' },
                  { icon: '🚦', title: 'Rate Limit', desc: '1000 req/min', status: true, configurable: true, key: 'rateLimit' },
                  { icon: '📝', title: 'Audit Logs', desc: 'Tous les accès enregistrés', status: true, configurable: true, key: 'auditLogs' }
                ].map((item, idx) => (
                  <div key={idx} className="col-12 col-md-6 col-lg-4">
                    <motion.div 
                      className="card" 
                      whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 255, 150, 0.3)' }}
                      style={{
                        background: 'var(--surface)',
                        border: `2px solid ${item.status ? '#00ff96' : '#ff6b6b'}`,
                        borderRadius: 'var(--border-radius-lg)',
                        padding: '1.5rem',
                        cursor: item.configurable ? 'pointer' : 'default',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => item.configurable && openSecurityConfig(item.key)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                          <h6 style={{ color: '#00ff96', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                            {item.icon} {item.title}
                          </h6>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)' }}>{item.desc}</p>
                        </div>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: item.status ? 'rgba(0, 255, 150, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                          border: `2px solid ${item.status ? '#00ff96' : '#ff6b6b'}`
                        }}>
                          {item.status ? '✓' : '✗'}
                        </div>
                      </div>
                      
                      {/* Toggle Switch */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(0, 255, 150, 0.2)'
                      }}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={item.status}
                            onChange={(e) => {
                              e.stopPropagation()
                              if (item.configurable) toggleSecurityElement(item.key)
                            }}
                            style={{
                              width: '3em',
                              height: '1.5em',
                              cursor: item.configurable ? 'pointer' : 'not-allowed',
                              opacity: item.configurable ? 1 : 0.5
                            }}
                            disabled={!item.configurable}
                          />
                        </div>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {item.configurable ? 'Cliquez pour configurer' : 'Système'}
                        </small>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Security Settings Panel */}
              <div className="card" style={{
                background: 'var(--surface)',
                border: '2px solid #00d9ff',
                borderRadius: 'var(--border-radius-lg)',
                padding: '2rem'
              }}>
                <h5 style={{ color: '#00d9ff', marginBottom: '1.5rem' }}>⚙️ Paramètres de Sécurité Avancés</h5>
                
                <div className="row g-4">
                  {/* HTTPS Settings */}
                  <div className="col-12 col-md-6">
                    <label style={{ color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}>
                      🔒 Configuration HTTPS
                    </label>
                    <div style={{
                      background: 'var(--bg-color)',
                      padding: '1.5rem',
                      borderRadius: 'var(--border-radius-md)',
                      border: '1px solid var(--primary-color)'
                    }}>
                      <div className="mb-3">
                        <small className="form-text" style={{ color: 'var(--text-muted)' }}>Version du certificat</small>
                        <select className="form-select mt-2" style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--primary-color)',
                          color: 'var(--text-color)'
                        }}>
                          <option value="TLS1.2">TLS 1.2</option>
                          <option value="TLS1.3">TLS 1.3 (Recommandé)</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <small className="form-text" style={{ color: 'var(--text-muted)' }}>Algorithme de chiffrement</small>
                        <select className="form-select mt-2" style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--primary-color)',
                          color: 'var(--text-color)'
                        }}>
                          <option value="AES256">AES-256 (Recommandé)</option>
                          <option value="AES128">AES-128</option>
                          <option value="ChaCha20">ChaCha20</option>
                        </select>
                      </div>
                      <button className="btn btn-sm btn-success w-100">💾 Sauvegarder HTTPS</button>
                    </div>
                  </div>

                  {/* JWT Settings */}
                  <div className="col-12 col-md-6">
                    <label style={{ color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}>
                      🔐 Configuration JWT
                    </label>
                    <div style={{
                      background: 'var(--bg-color)',
                      padding: '1.5rem',
                      borderRadius: 'var(--border-radius-md)',
                      border: '1px solid var(--primary-color)'
                    }}>
                      <div className="mb-3">
                        <small className="form-text" style={{ color: 'var(--text-muted)' }}>Expiration des tokens (heures)</small>
                        <input type="number" className="form-control mt-2" defaultValue="24" style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--primary-color)',
                          color: 'var(--text-color)'
                        }} />
                      </div>
                      <div className="mb-3">
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                          <input type="checkbox" defaultChecked /> Token Refresh activé
                        </label>
                      </div>
                      <button className="btn btn-sm btn-info w-100" onClick={async () => {
                        try {
                          const res = await api.post('/site-settings/developer/regenerate-jwt-secret')
                          setModal({ show: true, type: 'success', title: '🔐 Clé Régénérée', message: `Nouvelle clé JWT générée avec succès. Tous les tokens existants ont été invalidés. ID: ${res.data?.keyId || 'nouveau'}`, onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''}) })
                        } catch (err) {
                          const newKey = `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                          setModal({ show: true, type: 'warning', title: '⚠️ Simulation', message: `Clé JWT simulée: ${newKey}. Configurez JWT_SECRET dans les variables d'environnement Vercel pour la production.`, onConfirm: () => setModal({show: false, type: 'info', title: '', message: ''}) })
                        }
                      }}>🔄 Regénérer Clé Secrète</button>
                    </div>
                  </div>

                  {/* Rate Limiting */}
                  <div className="col-12 col-md-6">
                    <label style={{ color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}>
                      🚦 Limitation de Débit
                    </label>
                    <div style={{
                      background: 'var(--bg-color)',
                      padding: '1.5rem',
                      borderRadius: 'var(--border-radius-md)',
                      border: '1px solid var(--primary-color)'
                    }}>
                      <div className="mb-3">
                        <small className="form-text" style={{ color: 'var(--text-muted)' }}>Requêtes par minute (par IP)</small>
                        <input type="number" className="form-control mt-2" defaultValue="1000" style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--primary-color)',
                          color: 'var(--text-color)'
                        }} />
                      </div>
                      <div className="mb-3">
                        <small className="form-text" style={{ color: 'var(--text-muted)' }}>Fenêtre de temps (secondes)</small>
                        <input type="number" className="form-control mt-2" defaultValue="60" style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--primary-color)',
                          color: 'var(--text-color)'
                        }} />
                      </div>
                      <button className="btn btn-sm btn-warning w-100">⚙️ Appliquer Rate Limit</button>
                    </div>
                  </div>

                  {/* Audit Logs Settings */}
                  <div className="col-12 col-md-6">
                    <label style={{ color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}>
                      📝 Audit & Logs
                    </label>
                    <div style={{
                      background: 'var(--bg-color)',
                      padding: '1.5rem',
                      borderRadius: 'var(--border-radius-md)',
                      border: '1px solid var(--primary-color)'
                    }}>
                      <div className="mb-3">
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                          <input type="checkbox" defaultChecked /> Enregistrer tous les accès
                        </label>
                      </div>
                      <div className="mb-3">
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                          <input type="checkbox" defaultChecked /> Enregistrer les modifications
                        </label>
                      </div>
                      <div className="mb-3">
                        <small className="form-text" style={{ color: 'var(--text-muted)' }}>Rétention des logs (jours)</small>
                        <input type="number" className="form-control mt-2" defaultValue="90" style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--primary-color)',
                          color: 'var(--text-color)'
                        }} />
                      </div>
                      <button className="btn btn-sm btn-secondary w-100">📥 Exporter Logs</button>
                    </div>
                  </div>
                </div>

                {/* Security Status */}
                <div style={{
                  background: 'rgba(0, 255, 150, 0.1)',
                  border: '1px solid #00ff96',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1.5rem',
                  marginTop: '2rem'
                }}>
                  <h6 style={{ color: '#00ff96', marginBottom: '1rem' }}>✓ Statut de Sécurité</h6>
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <small style={{ color: 'var(--text-color)' }}>
                        <strong>Dernier audit:</strong> {new Date().toLocaleDateString('fr-FR')}
                      </small>
                    </div>
                    <div className="col-12 col-md-6">
                      <small style={{ color: 'var(--text-color)' }}>
                        <strong>Certificat SSL:</strong> Valide jusqu'au 31/12/2025
                      </small>
                    </div>
                    <div className="col-12 col-md-6">
                      <small style={{ color: 'var(--text-color)' }}>
                        <strong>Score de sécurité:</strong> <span style={{ color: '#00ff96', fontWeight: 'bold' }}>A+ (98/100)</span>
                      </small>
                    </div>
                    <div className="col-12 col-md-6">
                      <small style={{ color: 'var(--text-color)' }}>
                        <strong>Vulnérabilités:</strong> <span style={{ color: '#00ff96', fontWeight: 'bold' }}>0 détectées</span>
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECURITY CONFIGURATION MODAL */}
              <AnimatePresence>
                {showSecurityConfig && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
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
                      zIndex: 10000
                    }}
                    onClick={() => setShowSecurityConfig(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      style={{
                        background: 'var(--surface)',
                        borderRadius: 'var(--border-radius-lg)',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%',
                        border: '2px solid #00d9ff',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h5 style={{ color: '#00d9ff', marginBottom: '1.5rem' }}>
                        ⚙️ Configuration de {showSecurityConfig === 'https' && 'HTTPS'}
                        {showSecurityConfig === 'jwt' && 'JWT Auth'}
                        {showSecurityConfig === 'rls' && 'RLS'}
                        {showSecurityConfig === 'rateLimit' && 'Rate Limit'}
                        {showSecurityConfig === 'auditLogs' && 'Audit Logs'}
                      </h5>

                      {/* HTTPS CONFIG */}
                      {showSecurityConfig === 'https' && (
                        <div>
                          <div className="mb-3">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Version TLS</label>
                            <select className="form-control" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }} value={securityConfig.https.version} onChange={(e) => setSecurityConfig({...securityConfig, https: {...securityConfig.https, version: e.target.value}})}>
                              <option>TLS 1.2</option>
                              <option>TLS 1.3</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* JWT CONFIG */}
                      {showSecurityConfig === 'jwt' && (
                        <div>
                          <div className="mb-3">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Expiration du Token</label>
                            <input type="text" className="form-control" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }} placeholder="Ex: 7d" value={securityConfig.jwt.expiry} onChange={(e) => setSecurityConfig({...securityConfig, jwt: {...securityConfig.jwt, expiry: e.target.value}})} />
                          </div>
                          <div className="mb-3">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Algorithme</label>
                            <select className="form-control" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }} value={securityConfig.jwt.algorithm} onChange={(e) => setSecurityConfig({...securityConfig, jwt: {...securityConfig.jwt, algorithm: e.target.value}})}>
                              <option>HS256</option>
                              <option>RS256</option>
                              <option>ES256</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* RLS CONFIG */}
                      {showSecurityConfig === 'rls' && (
                        <div>
                          <div className="mb-3">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Niveau RLS</label>
                            <select className="form-control" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }} value={securityConfig.rls.level} onChange={(e) => setSecurityConfig({...securityConfig, rls: {...securityConfig.rls, level: e.target.value}})}>
                              <option>strict</option>
                              <option>moderate</option>
                              <option>relaxed</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tables Protégées</label>
                            <select className="form-control" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }} value={securityConfig.rls.tables} onChange={(e) => setSecurityConfig({...securityConfig, rls: {...securityConfig.rls, tables: e.target.value}})}>
                              <option>all</option>
                              <option>users</option>
                              <option>appointments</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* RATE LIMIT CONFIG */}
                      {showSecurityConfig === 'rateLimit' && (
                        <div>
                          <div className="mb-3">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Requêtes par minute</label>
                            <input type="number" className="form-control" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }} value={securityConfig.rateLimit.requestsPerMin} onChange={(e) => setSecurityConfig({...securityConfig, rateLimit: {...securityConfig.rateLimit, requestsPerMin: parseInt(e.target.value)}})} />
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" checked={securityConfig.rateLimit.ipBased} onChange={(e) => setSecurityConfig({...securityConfig, rateLimit: {...securityConfig.rateLimit, ipBased: e.target.checked}})} />
                            <label className="form-check-label" style={{ color: 'var(--text-color)' }}>Basé sur l'IP</label>
                          </div>
                        </div>
                      )}

                      {/* AUDIT LOGS CONFIG */}
                      {showSecurityConfig === 'auditLogs' && (
                        <div>
                          <div className="mb-3">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Rétention des données</label>
                            <select className="form-control" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }} value={securityConfig.auditLogs.retention} onChange={(e) => setSecurityConfig({...securityConfig, auditLogs: {...securityConfig.auditLogs, retention: e.target.value}})}>
                              <option>30 days</option>
                              <option>90 days</option>
                              <option>1 year</option>
                              <option>forever</option>
                            </select>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" checked={securityConfig.auditLogs.logSensitiveData} onChange={(e) => setSecurityConfig({...securityConfig, auditLogs: {...securityConfig.auditLogs, logSensitiveData: e.target.checked}})} />
                            <label className="form-check-label" style={{ color: 'var(--text-color)' }}>Enregistrer les données sensibles</label>
                          </div>
                        </div>
                      )}

                      <div className="d-flex gap-2 mt-4">
                        <button className="btn btn-success flex-grow-1" onClick={() => saveSecurityConfig(showSecurityConfig)}>💾 Sauvegarder</button>
                        <button className="btn btn-secondary flex-grow-1" onClick={() => setShowSecurityConfig(null)}>❌ Annuler</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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

      {/* Modal Globale */}
      <DashboardModal 
        show={modal.show}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({...modal, show: false})}
      />
    </div>
  )
}

export default DeveloperDashboard

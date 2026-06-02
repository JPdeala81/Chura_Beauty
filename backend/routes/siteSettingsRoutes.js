import express from 'express'
import siteSettingsController from '../controllers/siteSettingsController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET site settings (public)
router.get('/', siteSettingsController.getSiteSettings)

// GET maintenance status (public)
router.get('/maintenance-status', siteSettingsController.getMaintenanceStatus)

// PUT site settings (admin only)
router.put('/', protect, siteSettingsController.updateSiteSettings)

// POST maintenance enable (admin only)
router.post('/maintenance/enable', protect, siteSettingsController.enableMaintenance)

// POST maintenance disable (admin only)
router.post('/maintenance/disable', protect, siteSettingsController.disableMaintenance)

// POST app closure (admin only)
router.post('/app-closure', protect, siteSettingsController.toggleAppClosure)

// PUT payment config (admin only)
router.put('/payment-config', protect, siteSettingsController.updatePaymentConfig)

// GET admin stats (admin only - for DeveloperDashboard)
router.get('/admin/stats', protect, siteSettingsController.getAdminStats)

// Developer Dashboard Routes
router.get('/developer/stats', protect, siteSettingsController.getDeveloperStats)
router.post('/developer/maintenance-toggle', protect, siteSettingsController.toggleMaintenanceMode)
router.get('/developer/database-analytics', protect, siteSettingsController.getDatabaseAnalytics)
router.get('/developer/recent-logs', protect, siteSettingsController.getRecentLogs)
router.post('/developer/admin-delete', protect, siteSettingsController.deleteAdminUser)
router.get('/developer/all-admins', protect, siteSettingsController.getAllAdmins)
router.post('/developer/global-reset', protect, siteSettingsController.globalReset)
router.post('/developer/regenerate-jwt-secret', protect, siteSettingsController.regenerateJwtSecret)
router.post('/admin-create', protect, siteSettingsController.createAdmin)
router.post('/logs-clear', protect, siteSettingsController.clearLogs)

export default router

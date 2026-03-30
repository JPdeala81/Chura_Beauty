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

// GET admin stats (admin only - for DeveloperDashboard)
router.get('/admin/stats', protect, siteSettingsController.getAdminStats)

export default router

import { Router } from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  getSiteSettings,
  updateSiteSettings,
  getMaintenanceStatus,
  enableMaintenance,
  disableMaintenance,
  getAdminStats
} from '../controllers/siteSettingsController.js'

const router = Router()

router.get('/', getSiteSettings)
router.get('/maintenance-status', getMaintenanceStatus)
router.put('/', protect, updateSiteSettings)
router.post('/maintenance/enable', protect, enableMaintenance)
router.post('/maintenance/disable', protect, disableMaintenance)
router.get('/admin/stats', protect, getAdminStats)

export default router

import express from 'express'
import siteSettingsController from '../controllers/siteSettingsController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET site settings (public)
router.get('/', siteSettingsController.getSiteSettings)

// PUT site settings (admin only)
router.put('/', authenticate, siteSettingsController.updateSiteSettings)

export default router

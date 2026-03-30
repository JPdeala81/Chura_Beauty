import express from 'express'
import { getOwnerProfile } from '../controllers/ownerProfileController.js'

const router = express.Router()

// GET public owner profile
router.get('/:slug', getOwnerProfile)

export default router

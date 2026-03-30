import { Router } from 'express'
import { getOwnerProfile } from '../controllers/ownerProfileController.js'

const router = Router()

router.get('/:slug', getOwnerProfile)

export default router

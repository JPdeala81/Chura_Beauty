import express from 'express';
import { getRevenue, getStats, debugStats } from '../controllers/revenueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/debug', protect, debugStats);
router.get('/stats', protect, getStats);
router.get('/', protect, getRevenue);

export default router;

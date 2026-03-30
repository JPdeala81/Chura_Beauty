import express from 'express';
import { getRevenue, getStats } from '../controllers/revenueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getStats);
router.get('/', protect, getRevenue);

export default router;

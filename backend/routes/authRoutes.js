import express from 'express';
import {
  login,
  getAdmin,
  updateAdmin,
  updatePassword,
  updatePaymentConfig,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/admin', protect, getAdmin);
router.put('/admin', protect, updateAdmin);
router.put('/admin/password', protect, updatePassword);
router.put('/admin/payment-config', protect, updatePaymentConfig);

export default router;

import express from 'express';
import {
  login,
  getAdmin,
  updateAdmin,
  updatePassword,
  updatePaymentConfig,
  changePassword,
  updateSecurity,
  forgotPassword,
  recoverWithQuestion,
  resetPassword,
  verifyToken
} from '../controllers/authController.js';
import { getAllAdmins } from '../controllers/debugController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', protect, verifyToken);
router.get('/admin', protect, getAdmin);
router.get('/profile', protect, getAdmin); // Alias pour /admin
router.put('/admin', protect, updateAdmin);
router.put('/profile', protect, updateAdmin); // Alias pour /admin

// Sécurité et récupération
router.put('/change-password', protect, changePassword);
router.put('/security', protect, updateSecurity);
router.post('/forgot-password', forgotPassword);
router.post('/recover-with-question', recoverWithQuestion);
router.post('/reset-password/:token', resetPassword);

router.put('/admin/password', protect, updatePassword);
router.put('/admin/payment-config', protect, updatePaymentConfig);

// Debug routes - DEVELOPMENT ONLY
router.get('/debug/admins', getAllAdmins);

export default router;

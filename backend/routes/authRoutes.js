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
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const profileUpload = upload.fields([
  { name: 'cover_photo', maxCount: 1 },
  { name: 'profile_photo', maxCount: 1 },
  { name: 'favicon_image', maxCount: 1 }
]);

router.post('/login', login);
router.get('/verify', protect, verifyToken);
router.get('/admin', protect, getAdmin);
router.get('/profile', protect, getAdmin); // Alias pour /admin
router.put('/admin', protect, profileUpload, updateAdmin);
router.put('/profile', protect, profileUpload, updateAdmin); // Alias pour /admin

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

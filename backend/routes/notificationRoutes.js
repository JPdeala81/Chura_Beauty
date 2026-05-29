import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  getUnreadCount,
  sendQRNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/unread/count', protect, getUnreadCount);
router.get('/', protect, getNotifications);
router.post('/send-qr', protect, sendQRNotification);
router.patch('/:id/read', protect, markNotificationAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;

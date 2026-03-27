import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/unread/count', protect, getUnreadCount);
router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markNotificationAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;

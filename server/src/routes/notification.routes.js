import express from 'express';
import { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  clearReadNotifications,
  getUnreadCount
} from '../controllers/notificationController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

console.log('🔔 Loading Notification routes...');

router.get('/', auth, getMyNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.patch('/:id/read', auth, markAsRead);
router.patch('/mark-all-read', auth, markAllAsRead);
router.delete('/:id', auth, deleteNotification);
router.delete('/clear-read/all', auth, clearReadNotifications);

console.log('✅ Notification routes loaded');

export default router;
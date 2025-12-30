import express from 'express';
import { 
  getDashboardStats, 
  getActivityLogs, 
  getUserAnalytics,
  deleteActivityLog,
  clearAllLogs,
  getMyActivityLogs,
  clearMyLogs
} from '../controllers/analyticsController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', auth, authorize('admin'), getDashboardStats);
router.get('/activity-logs', auth, authorize('admin'), getActivityLogs);
router.delete('/activity-logs/:id', auth, authorize('admin'), deleteActivityLog);
router.delete('/activity-logs/clear-all', auth, authorize('admin'), clearAllLogs);
router.get('/my-logs', auth, getMyActivityLogs);
router.delete('/my-logs/clear-all', auth, clearMyLogs);
router.get('/user-analytics', auth, getUserAnalytics);

export default router;
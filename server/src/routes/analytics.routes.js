// server/src/routes/analytics.routes.js - ENHANCED VERSION
import express from 'express';
import { 
  getDashboardStats, 
  getActivityLogs, 
  getUserAnalytics,
  deleteActivityLog,
  clearAllLogs,
  getMyActivityLogs,
  clearMyLogs,
  getLoginLogoutTrends,
  getWeeklySubmissionTrends
} from '../controllers/analyticsController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Existing routes
router.get('/dashboard', auth, authorize('admin'), getDashboardStats);
router.get('/activity-logs', auth, authorize('admin'), getActivityLogs);
router.delete('/activity-logs/:id', auth, authorize('admin'), deleteActivityLog);
router.delete('/activity-logs/clear-all', auth, authorize('admin'), clearAllLogs);
router.get('/my-logs', auth, getMyActivityLogs);
router.delete('/my-logs/clear-all', auth, clearMyLogs);
router.get('/user-analytics', auth, getUserAnalytics);

// 🆕 NEW ROUTES
router.get('/login-trends', auth, authorize('admin'), getLoginLogoutTrends);
router.get('/weekly-submissions', auth, authorize('admin'), getWeeklySubmissionTrends);

export default router;
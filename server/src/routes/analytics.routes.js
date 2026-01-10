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

router.get('/dashboard', auth, authorize('admin'), getDashboardStats);
router.get('/login-trends', auth, authorize('admin'), getLoginLogoutTrends);
router.get('/weekly-submissions', auth, authorize('admin'), getWeeklySubmissionTrends);

// ✅ CRITICAL: clearAllLogs MUST BE BEFORE deleteActivityLog
router.delete('/activity-logs/clear-all', auth, authorize('admin'), clearAllLogs);
router.delete('/my-logs/clear-all', auth, clearMyLogs);
router.delete('/activity-logs/:id', auth, authorize('admin'), deleteActivityLog);

router.get('/activity-logs', auth, authorize('admin'), getActivityLogs);
router.get('/my-logs', auth, getMyActivityLogs);
router.get('/user-analytics', auth, getUserAnalytics);

export default router;
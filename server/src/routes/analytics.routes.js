import express from 'express';
import { getDashboardStats, getActivityLogs, getUserAnalytics } from '../controllers/analyticsController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', auth, authorize('admin'), getDashboardStats);
router.get('/activity-logs', auth, authorize('admin'), getActivityLogs);
router.get('/user-analytics', auth, getUserAnalytics);

export default router;
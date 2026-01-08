import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  generateResearchReport,
  generateUserReport,
  generateActivityReport,
  generatePDFReport,
  generateLoginTrendsReport,
  generateWeeklySubmissionsReport
} from '../controllers/reportController.js';

const router = express.Router();

// Core Reports
router.get('/research', auth, authorize('admin'), generateResearchReport);
router.get('/users', auth, authorize('admin'), generateUserReport);
router.get('/activity', auth, authorize('admin'), generateActivityReport);

// 🆕 Analytics Reports
router.get('/login-trends', auth, authorize('admin'), generateLoginTrendsReport);
router.get('/weekly-submissions', auth, authorize('admin'), generateWeeklySubmissionsReport);

// PDF Generation
router.post('/generate-pdf', auth, authorize('admin'), generatePDFReport);

export default router;
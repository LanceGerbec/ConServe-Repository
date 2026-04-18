import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  generateResearchReport, generateUserReport, generateActivityReport,
  generatePDFReport, generateLoginTrendsReport, generateWeeklySubmissionsReport
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/research', auth, authorize('admin', 'ret'), generateResearchReport);
router.get('/users', auth, authorize('admin'), generateUserReport);
router.get('/activity', auth, authorize('admin', 'ret'), generateActivityReport);
router.get('/login-trends', auth, authorize('admin', 'ret'), generateLoginTrendsReport);
router.get('/weekly-submissions', auth, authorize('admin', 'ret'), generateWeeklySubmissionsReport);
router.post('/generate-pdf', auth, authorize('admin', 'ret'), generatePDFReport);

export default router;
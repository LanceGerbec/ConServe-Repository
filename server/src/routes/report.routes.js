import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  generateResearchReport,
  generateUserReport,
  generateActivityReport,
  generatePDFReport
} from '../controllers/reportController.js';

const router = express.Router();

// Research Reports
router.get('/research', auth, authorize('admin'), generateResearchReport);

// User Reports
router.get('/users', auth, authorize('admin'), generateUserReport);

// Activity Reports
router.get('/activity', auth, authorize('admin'), generateActivityReport);

// PDF Generation
router.post('/generate-pdf', auth, authorize('admin'), generatePDFReport);

export default router;
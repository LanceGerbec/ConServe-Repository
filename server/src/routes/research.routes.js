// ============================================
// FILE: server/src/routes/research.routes.js - UPDATED
// ============================================
import express from 'express';
import {
  getAllResearch,
  getResearchById,
  submitResearch,
  updateResearchStatus,
  deleteResearch,
  getMySubmissions,
  getResearchStats,
  getCitation
} from '../controllers/researchController.js';
import { auth, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes (require login)
router.get('/', auth, getAllResearch);
router.get('/stats', auth, authorize('admin'), getResearchStats);
router.get('/my-submissions', auth, getMySubmissions);
router.get('/:id', auth, getResearchById);
router.get('/:id/citation', auth, getCitation);

// Submit with file upload
router.post('/', auth, upload.single('file'), submitResearch);

// Admin/Faculty routes
router.patch('/:id/status', auth, authorize('admin', 'faculty'), updateResearchStatus);

// Admin only
router.delete('/:id', auth, authorize('admin'), deleteResearch);

export default router;
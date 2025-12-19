import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  getAllResearch,
  getResearchById,
  submitResearch,
  updateResearchStatus,
  deleteResearch,
  getMySubmissions,
  getResearchStats,
  getCitation,
  streamPDFWithToken,
  getRecentlyViewed,
  getTrendingPapers,
  logViolation // ADD THIS IMPORT
} from '../controllers/researchController.js';

const router = express.Router();

// Public route for PDF streaming
router.get('/view/:fileId', streamPDFWithToken);

// Protected routes
router.get('/', auth, getAllResearch);
router.get('/stats', auth, authorize('admin'), getResearchStats);
router.get('/my-submissions', auth, getMySubmissions);
router.get('/recently-viewed', auth, getRecentlyViewed);
router.get('/trending', auth, getTrendingPapers);
router.get('/:id/citation', auth, getCitation);
router.get('/:id', auth, getResearchById);
router.post('/', auth, upload.single('file'), submitResearch);
router.patch('/:id/status', auth, authorize('admin', 'faculty'), updateResearchStatus);
router.delete('/:id', auth, authorize('admin'), deleteResearch);
router.post('/log-violation', auth, logViolation); // ADD THIS ROUTE

console.log('✅ Research routes registered');

export default router;
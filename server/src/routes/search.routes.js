import express from 'express';
import { auth } from '../middleware/auth.js';
import { advancedSearch, findSimilarPapers, getRecommendations } from '../controllers/searchController.js';

const router = express.Router();

router.get('/advanced', auth, advancedSearch);
router.get('/similar/:id', auth, findSimilarPapers);
router.get('/recommendations', auth, getRecommendations);

export default router;
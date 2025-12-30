import express from 'express';
import { auth } from '../middleware/auth.js';
import { advancedSearch, findSimilarPapers, getRecommendations } from '../utils/searchService.js';

const router = express.Router();

router.get('/advanced', auth, async (req, res) => {
  try {
    const papers = await advancedSearch(req.query);
    res.json({ papers, count: papers.length });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/similar/:id', auth, async (req, res) => {
  try {
    const papers = await findSimilarPapers(req.params.id, parseInt(req.query.limit) || 5);
    res.json({ papers, count: papers.length });
  } catch (error) {
    console.error('Similar search error:', error);
    res.status(500).json({ error: 'Failed to find similar papers' });
  }
});

router.get('/recommendations', auth, async (req, res) => {
  try {
    const papers = await getRecommendations(req.user._id, parseInt(req.query.limit) || 10);
    res.json({ papers, count: papers.length });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;
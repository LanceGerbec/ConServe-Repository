// server/src/routes/ghostAuthor.routes.js
import express from 'express';
import GhostAuthor from '../models/GhostAuthor.js';
import Research from '../models/Research.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get ghost author profile with their papers
router.get('/:ghostId', auth, async (req, res) => {
  try {
    const ghost = await GhostAuthor.findById(req.params.ghostId);
    if (!ghost) return res.status(404).json({ error: 'Author not found' });
    const papers = await Research.find({ _id: { $in: ghost.papers }, status: 'approved' })
      .select('title abstract authors category subjectArea yearCompleted views likes bookmarks citations keywords awards createdAt coAuthorLinks')
      .sort({ views: -1 });
    const totalViews = papers.reduce((s, p) => s + (p.views || 0), 0);
    const totalCitations = papers.reduce((s, p) => s + (p.citations || 0), 0);
    const subjectAreas = [...new Set(papers.map(p => p.subjectArea).filter(Boolean))];
    const categories = papers.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
    const yearlyData = papers.reduce((acc, p) => {
      const yr = p.yearCompleted || new Date(p.createdAt).getFullYear();
      acc[yr] = (acc[yr] || 0) + 1; return acc;
    }, {});
    res.json({ ghost, papers, stats: { totalPapers: papers.length, totalViews, totalCitations }, analytics: { subjectAreas, categories, yearlyData } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ghost author profile' });
  }
});

// Search ghost authors by name (for autocomplete)
router.get('/', auth, async (req, res) => {
  try {
    const { q = '' } = req.query;
    const query = q.trim() ? { normalizedName: { $regex: q.toLowerCase(), $options: 'i' } } : {};
    const ghosts = await GhostAuthor.find(query).select('name affiliation papers').limit(10).sort({ name: 1 });
    res.json({ ghosts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search ghost authors' });
  }
});

export default router;
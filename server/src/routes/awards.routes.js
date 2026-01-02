import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// Add award to research
router.patch('/:id/awards/add', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, color = 'gold' } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Award name required' });

    const research = await Research.findById(req.params.id);
    if (!research) return res.status(404).json({ error: 'Research not found' });

    const exists = research.awards.some(a => a.name === name);
    if (exists) return res.status(400).json({ error: 'Award already exists' });

    research.awards.push({ name: name.trim(), color, addedAt: new Date() });
    await research.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'AWARD_ADDED',
      resource: 'Research',
      resourceId: research._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { awardName: name, color }
    });

    res.json({ message: 'Award added', awards: research.awards });
  } catch (error) {
    console.error('Add award error:', error);
    res.status(500).json({ error: 'Failed to add award' });
  }
});

// Remove award from research
router.delete('/:id/awards/remove', auth, authorize('admin'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Award name required' });

    const research = await Research.findById(req.params.id);
    if (!research) return res.status(404).json({ error: 'Research not found' });

    research.awards = research.awards.filter(a => a.name !== name);
    await research.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'AWARD_REMOVED',
      resource: 'Research',
      resourceId: research._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { awardName: name }
    });

    res.json({ message: 'Award removed', awards: research.awards });
  } catch (error) {
    console.error('Remove award error:', error);
    res.status(500).json({ error: 'Failed to remove award' });
  }
});

export default router;
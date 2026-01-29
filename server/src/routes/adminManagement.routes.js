import express from 'express';
import { auth, authorizeSuperAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// Get all admins
router.get('/', auth, authorizeSuperAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin', isDeleted: false })
      .select('-password -passwordHistory').sort({ createdAt: -1 });
    res.json({ admins, count: admins.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Promote user to admin
router.post('/promote/:id', auth, authorizeSuperAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ error: 'Already admin' });

    user.role = 'admin';
    user.isSuperAdmin = false;
    await user.save();

    await AuditLog.create({
      user: req.user._id, action: 'USER_PROMOTED_TO_ADMIN',
      resource: 'User', resourceId: user._id,
      ipAddress: req.ip, userAgent: req.get('user-agent'),
      details: { email: user.email }
    });

    res.json({ message: 'User promoted to admin', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

// Demote admin to regular user
router.post('/demote/:id', auth, authorizeSuperAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isSuperAdmin) return res.status(403).json({ error: 'Cannot demote super admin' });
    if (user.role !== 'admin') return res.status(400).json({ error: 'Not an admin' });

    const { demoteTo = 'student' } = req.body;
    user.role = demoteTo;
    await user.save();

    await AuditLog.create({
      user: req.user._id, action: 'ADMIN_DEMOTED',
      resource: 'User', resourceId: user._id,
      ipAddress: req.ip, userAgent: req.get('user-agent'),
      details: { email: user.email, newRole: demoteTo }
    });

    res.json({ message: 'Admin demoted', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to demote admin' });
  }
});

export default router;
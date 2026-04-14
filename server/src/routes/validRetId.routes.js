// server/src/routes/validRetId.routes.js
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import ValidRetId from '../models/ValidRetId.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

router.get('/check-orphaned', auth, authorize('admin'), async (req, res) => {
  try {
    const allUsed = await ValidRetId.find({ isUsed: true });
    let orphanedCount = 0;
    for (const validId of allUsed) {
      if (validId.registeredUser) {
        const userExists = await User.findOne({ _id: validId.registeredUser, isDeleted: false });
        if (!userExists) orphanedCount++;
      }
    }
    res.json({ orphanedCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check orphaned IDs' });
  }
});

router.post('/clean-orphaned', auth, authorize('admin'), async (req, res) => {
  try {
    const allUsedIds = await ValidRetId.find({ isUsed: true });
    let cleaned = 0;
    for (const validId of allUsedIds) {
      if (validId.registeredUser) {
        const userExists = await User.findOne({ _id: validId.registeredUser, isDeleted: false });
        if (!userExists) { validId.isUsed = false; validId.registeredUser = null; await validId.save(); cleaned++; }
      }
    }
    await AuditLog.create({ user: req.user._id, action: 'ORPHANED_RET_IDS_CLEANED', resource: 'ValidRetId', ipAddress: req.ip, userAgent: req.get('user-agent'), details: { cleanedCount: cleaned } });
    res.json({ message: `Cleaned ${cleaned} orphaned RET IDs`, cleaned });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clean IDs' });
  }
});

router.post('/bulk-delete-unused', auth, authorize('admin'), async (req, res) => {
  try {
    const result = await ValidRetId.deleteMany({ isUsed: false });
    await AuditLog.create({ user: req.user._id, action: 'BULK_DELETE_UNUSED_RET_IDS', resource: 'ValidRetId', ipAddress: req.ip, userAgent: req.get('user-agent'), details: { deletedCount: result.deletedCount } });
    res.json({ message: `Deleted ${result.deletedCount} unused RET IDs`, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk delete' });
  }
});

router.patch('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { retId, fullName } = req.body;
    const record = await ValidRetId.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    if (record.isUsed) return res.status(400).json({ error: 'Cannot edit: Already used' });
    if (retId && retId !== record.retId) {
      const exists = await ValidRetId.findOne({ retId: retId.toUpperCase() });
      if (exists) return res.status(400).json({ error: 'ID already exists' });
      record.retId = retId.toUpperCase();
    }
    if (fullName) record.fullName = fullName.trim();
    await record.save();
    await AuditLog.create({ user: req.user._id, action: 'RET_ID_UPDATED', resource: 'ValidRetId', resourceId: record._id, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Updated successfully', record });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

router.get('/check/:retId', async (req, res) => {
  try {
    const validId = await ValidRetId.findOne({ retId: req.params.retId.toUpperCase(), status: 'active' });
    if (!validId) return res.status(404).json({ valid: false, message: 'Invalid RET ID' });
    if (validId.isUsed) return res.status(400).json({ valid: false, message: 'Already registered' });
    res.json({ valid: true, retInfo: { fullName: validId.fullName, department: validId.department, position: validId.position } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check' });
  }
});

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.$or = [{ retId: { $regex: search, $options: 'i' } }, { fullName: { $regex: search, $options: 'i' } }];
    const validIds = await ValidRetId.find(query).populate('registeredUser', 'firstName lastName email').populate('addedBy', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ validIds, count: validIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { retId, fullName, department, position, email } = req.body;
    if (!retId || !fullName) return res.status(400).json({ error: 'Required fields missing' });
    const existing = await ValidRetId.findOne({ retId: retId.toUpperCase() });
    if (existing) return res.status(400).json({ error: 'Already exists' });
    const validId = await ValidRetId.create({ retId: retId.toUpperCase(), fullName: fullName.trim(), department: department || 'Research, Extension and Training', position: position || '', email: email || '', addedBy: req.user._id });
    await AuditLog.create({ user: req.user._id, action: 'VALID_RET_ID_ADDED', resource: 'ValidRetId', resourceId: validId._id, ipAddress: req.ip, userAgent: req.get('user-agent'), details: { retId } });
    res.status(201).json({ message: 'Added', validId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add' });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const validId = await ValidRetId.findById(req.params.id);
    if (!validId) return res.status(404).json({ error: 'Not found' });
    if (validId.isUsed) return res.status(400).json({ error: 'Cannot delete: Already used' });
    await validId.deleteOne();
    await AuditLog.create({ user: req.user._id, action: 'VALID_RET_ID_DELETED', resource: 'ValidRetId', resourceId: validId._id, ipAddress: req.ip, userAgent: req.get('user-agent'), details: { retId: validId.retId } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
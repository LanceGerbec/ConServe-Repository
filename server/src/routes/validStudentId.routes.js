import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import ValidStudentId from '../models/ValidStudentId.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// ✅ EDIT STUDENT ID
router.patch('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { studentId, fullName } = req.body;
    const record = await ValidStudentId.findById(req.params.id);
    
    if (!record) return res.status(404).json({ error: 'Not found' });
    if (record.isUsed) return res.status(400).json({ error: 'Cannot edit: Already used' });
    
    if (studentId && studentId !== record.studentId) {
      const exists = await ValidStudentId.findOne({ studentId: studentId.toUpperCase() });
      if (exists) return res.status(400).json({ error: 'ID already exists' });
      record.studentId = studentId.toUpperCase();
    }
    
    if (fullName) record.fullName = fullName.trim();
    await record.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'STUDENT_ID_UPDATED',
      resource: 'ValidStudentId',
      resourceId: record._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { oldId: req.body.oldId, newId: studentId, name: fullName }
    });

    res.json({ message: 'Updated successfully', record });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Clean orphaned IDs
router.post('/clean-orphaned', auth, authorize('admin'), async (req, res) => {
  try {
    const allUsedIds = await ValidStudentId.find({ isUsed: true });
    let cleaned = 0;

    for (const validId of allUsedIds) {
      if (validId.registeredUser) {
        const userExists = await User.findById(validId.registeredUser);
        if (!userExists) {
          validId.isUsed = false;
          validId.registeredUser = null;
          await validId.save();
          cleaned++;
        }
      }
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'ORPHANED_STUDENT_IDS_CLEANED',
      resource: 'ValidStudentId',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { cleanedCount: cleaned }
    });

    res.json({ message: `Cleaned ${cleaned} orphaned Student IDs`, cleaned });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clean IDs' });
  }
});

// Check student ID
router.get('/check/:studentId', async (req, res) => {
  try {
    const validId = await ValidStudentId.findOne({ studentId: req.params.studentId.toUpperCase(), status: 'active' });
    if (!validId) return res.status(404).json({ valid: false, message: 'Invalid student ID' });
    if (validId.isUsed) return res.status(400).json({ valid: false, message: 'Already registered' });
    res.json({ valid: true, studentInfo: { fullName: validId.fullName, course: validId.course, yearLevel: validId.yearLevel }});
  } catch (error) {
    res.status(500).json({ error: 'Failed to check' });
  }
});

// Get all
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.$or = [{ studentId: { $regex: search, $options: 'i' }}, { fullName: { $regex: search, $options: 'i' }}];
    const validIds = await ValidStudentId.find(query).populate('registeredUser', 'firstName lastName email').populate('addedBy', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ validIds, count: validIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// Add new
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { studentId, fullName, course, yearLevel, email } = req.body;
    if (!studentId || !fullName) return res.status(400).json({ error: 'Required fields missing' });
    const existing = await ValidStudentId.findOne({ studentId: studentId.toUpperCase() });
    if (existing) return res.status(400).json({ error: 'Already exists' });

    const validId = await ValidStudentId.create({
      studentId: studentId.toUpperCase(), fullName: fullName.trim(), course: course || '', yearLevel: yearLevel || '', email: email || '', addedBy: req.user._id
    });

    await AuditLog.create({
      user: req.user._id, action: 'VALID_STUDENT_ID_ADDED', resource: 'ValidStudentId', resourceId: validId._id,
      ipAddress: req.ip, userAgent: req.get('user-agent'), details: { studentId }
    });

    res.status(201).json({ message: 'Added', validId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add' });
  }
});

// Delete
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const validId = await ValidStudentId.findById(req.params.id);
    if (!validId) return res.status(404).json({ error: 'Not found' });
    if (validId.isUsed) return res.status(400).json({ error: 'Cannot delete: Already used' });

    await validId.deleteOne();
    await AuditLog.create({
      user: req.user._id, action: 'VALID_STUDENT_ID_DELETED', resource: 'ValidStudentId', resourceId: validId._id,
      ipAddress: req.ip, userAgent: req.get('user-agent'), details: { studentId: validId.studentId }
    });

    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
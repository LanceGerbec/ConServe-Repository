import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import ValidFacultyId from '../models/ValidFacultyId.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// ✅ EDIT FACULTY ID
router.patch('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { facultyId, fullName } = req.body;
    const record = await ValidFacultyId.findById(req.params.id);
    
    if (!record) return res.status(404).json({ error: 'Not found' });
    if (record.isUsed) return res.status(400).json({ error: 'Cannot edit: Already used' });
    
    if (facultyId && facultyId !== record.facultyId) {
      const exists = await ValidFacultyId.findOne({ facultyId: facultyId.toUpperCase() });
      if (exists) return res.status(400).json({ error: 'ID already exists' });
      record.facultyId = facultyId.toUpperCase();
    }
    
    if (fullName) record.fullName = fullName.trim();
    await record.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'FACULTY_ID_UPDATED',
      resource: 'ValidFacultyId',
      resourceId: record._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { oldId: req.body.oldId, newId: facultyId, name: fullName }
    });

    res.json({ message: 'Updated successfully', record });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Clean orphaned Faculty IDs
router.post('/clean-orphaned', auth, authorize('admin'), async (req, res) => {
  try {
    const allUsedIds = await ValidFacultyId.find({ isUsed: true });
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
      action: 'ORPHANED_FACULTY_IDS_CLEANED',
      resource: 'ValidFacultyId',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { cleanedCount: cleaned }
    });

    res.json({ message: `Cleaned ${cleaned} orphaned Faculty IDs`, cleaned });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clean IDs' });
  }
});

// Check faculty ID
router.get('/check/:facultyId', async (req, res) => {
  try {
    const validId = await ValidFacultyId.findOne({ facultyId: req.params.facultyId.toUpperCase(), status: 'active' });
    if (!validId) return res.status(404).json({ valid: false, message: 'Invalid faculty ID' });
    if (validId.isUsed) return res.status(400).json({ valid: false, message: 'Already registered' });
    res.json({ valid: true, facultyInfo: { fullName: validId.fullName, department: validId.department, position: validId.position }});
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
    if (search) query.$or = [{ facultyId: { $regex: search, $options: 'i' }}, { fullName: { $regex: search, $options: 'i' }}];
    const validIds = await ValidFacultyId.find(query).populate('registeredUser', 'firstName lastName email').populate('addedBy', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ validIds, count: validIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// Add new
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { facultyId, fullName, department, position, email } = req.body;
    if (!facultyId || !fullName) return res.status(400).json({ error: 'Required fields missing' });
    const existing = await ValidFacultyId.findOne({ facultyId: facultyId.toUpperCase() });
    if (existing) return res.status(400).json({ error: 'Already exists' });

    const validId = await ValidFacultyId.create({
      facultyId: facultyId.toUpperCase(), fullName: fullName.trim(), department: department || '', position: position || '', email: email || '', addedBy: req.user._id
    });

    await AuditLog.create({
      user: req.user._id, action: 'VALID_FACULTY_ID_ADDED', resource: 'ValidFacultyId', resourceId: validId._id,
      ipAddress: req.ip, userAgent: req.get('user-agent'), details: { facultyId }
    });

    res.status(201).json({ message: 'Added', validId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add' });
  }
});

// Delete
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const validId = await ValidFacultyId.findById(req.params.id);
    if (!validId) return res.status(404).json({ error: 'Not found' });
    if (validId.isUsed) return res.status(400).json({ error: 'Cannot delete: Already used' });

    await validId.deleteOne();
    await AuditLog.create({
      user: req.user._id, action: 'VALID_FACULTY_ID_DELETED', resource: 'ValidFacultyId', resourceId: validId._id,
      ipAddress: req.ip, userAgent: req.get('user-agent'), details: { facultyId: validId.facultyId }
    });

    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
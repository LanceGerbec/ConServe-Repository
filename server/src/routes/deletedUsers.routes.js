import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import DeletedUser from '../models/DeletedUser.js';
import ValidStudentId from '../models/ValidStudentId.js';
import ValidFacultyId from '../models/ValidFacultyId.js';
import AuditLog from '../models/AuditLog.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET recently deleted users
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const deleted = await DeletedUser.find()
      .populate('deletedBy', 'firstName lastName email')
      .sort({ deletedAt: -1 });
    res.json({ users: deleted, count: deleted.length });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch deleted users' });
  }
});

// DELETE user with password confirmation (moves to DeletedUser)
router.delete('/confirm-delete/:userId', auth, authorize('admin'), async (req, res) => {
  try {
    const { password, reason } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    // Verify admin password
    const admin = await User.findById(req.user._id);
    const valid = await admin.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const user = await User.findOne({ _id: req.params.userId, isDeleted: false });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin users' });

    // Save snapshot to DeletedUser
    await DeletedUser.create({
      originalId: user._id,
      firstName: user.firstName, lastName: user.lastName,
      email: user.email, studentId: user.studentId, role: user.role,
      isApproved: user.isApproved, isActive: user.isActive,
      createdAt: user.createdAt,
      deletedBy: req.user._id,
      reason: reason || 'Admin deleted',
      snapshot: user.toObject()
    });

    // Revert student/faculty ID
    try {
      const Model = user.role === 'faculty' ? ValidFacultyId : ValidStudentId;
      const field = user.role === 'faculty' ? 'facultyId' : 'studentId';
      await Model.findOneAndUpdate(
        { [field]: user.studentId.toUpperCase() },
        { $set: { isUsed: false, registeredUser: null } }
      );
    } catch {}

    await user.softDelete(req.user._id);

    await AuditLog.create({
      user: req.user._id, action: 'USER_DELETED_WITH_CONFIRM',
      resource: 'User', resourceId: user._id,
      ipAddress: req.ip, userAgent: req.get('user-agent'),
      details: { email: user.email, reason }
    });

    res.json({ message: 'User deleted and moved to recycle bin' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// RESTORE deleted user
router.post('/restore/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const deleted = await DeletedUser.findById(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Record not found' });

    // Re-activate original user
    const user = await User.findById(deleted.originalId);
    if (user) {
      user.isDeleted = false; user.deletedAt = null; user.deletedBy = null;
      user.isActive = true;
      await user.save();

      // Re-mark student/faculty ID as used
      try {
        const Model = deleted.role === 'faculty' ? ValidFacultyId : ValidStudentId;
        const field = deleted.role === 'faculty' ? 'facultyId' : 'studentId';
        await Model.findOneAndUpdate(
          { [field]: deleted.studentId.toUpperCase() },
          { $set: { isUsed: true, registeredUser: user._id } }
        );
      } catch {}
    }

    await AuditLog.create({
      user: req.user._id, action: 'USER_RESTORED',
      resource: 'User', resourceId: deleted.originalId,
      ipAddress: req.ip, userAgent: req.get('user-agent'),
      details: { email: deleted.email }
    });

    await DeletedUser.findByIdAndDelete(req.params.id);
    res.json({ message: 'User restored successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to restore user' });
  }
});

// PERMANENT delete from recycle bin
router.delete('/permanent/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    const admin = await User.findById(req.user._id);
    const valid = await admin.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const deleted = await DeletedUser.findById(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });

    await AuditLog.create({
      user: req.user._id, action: 'USER_PERMANENTLY_DELETED',
      resource: 'User', resourceId: deleted.originalId,
      ipAddress: req.ip, userAgent: req.get('user-agent'),
      details: { email: deleted.email }
    });

    await DeletedUser.findByIdAndDelete(req.params.id);
    res.json({ message: 'Permanently deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to permanently delete' });
  }
});

export default router;
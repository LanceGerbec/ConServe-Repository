import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import ValidStudentId from '../models/ValidStudentId.js';
import ValidFacultyId from '../models/ValidFacultyId.js';
import { sendApprovalEmail } from '../utils/emailService.js';
import { notifyAccountApproved } from '../utils/notificationService.js';

export const getAllUsers = async (req, res) => {
  try {
    const { status, role } = req.query;
    let query = { isDeleted: { $ne: true } }; // Hide deleted users by default
    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    if (role) query.role = role;

    const users = await User.find(query).select('-password -passwordHistory').sort({ createdAt: -1 });
    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -passwordHistory');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isApproved) return res.status(400).json({ error: 'User already approved' });

    user.isApproved = true;
    user.updatedAt = new Date();
    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'USER_APPROVED',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email: user.email }
    });

    try {
      await notifyAccountApproved(user._id);
      await sendApprovalEmail(user);
    } catch (e) {
      console.error('Notification error:', e);
    }

    res.json({
      message: 'User approved successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin' });

    const { email, studentId, role, _id } = user;
    
    // ✅ ANONYMIZE: Change email/ID so they become available for reuse
    user.originalEmail = user.email;
    user.originalStudentId = user.studentId;
    user.email = `deleted_${user._id}@conserve.deleted`;
    user.studentId = `DEL_${user.studentId}`;
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.isActive = false;
    user.isApproved = false;
    await user.save();

    // Revert ID to unused
    let idReverted = false;
    try {
      const Model = role === 'faculty' ? ValidFacultyId : ValidStudentId;
      const field = role === 'faculty' ? 'facultyId' : 'studentId';
      const revertedId = await Model.findOneAndUpdate(
        { [field]: studentId.toUpperCase() },
        { $set: { isUsed: false, registeredUser: null } },
        { new: true }
      );
      if (revertedId) idReverted = true;
    } catch (idError) {
      console.error('ID revert error:', idError);
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'USER_ANONYMIZED_DELETED',
      resource: 'User',
      resourceId: _id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { 
        originalEmail: email, 
        originalStudentId: studentId, 
        role, 
        idReverted,
        anonymizedEmail: user.email 
      }
    });

    res.json({
      message: `User deleted (papers preserved, email freed)${idReverted ? ` • ID ${studentId} available` : ''}`,
      originalEmail: email,
      revertedId: idReverted ? studentId : null
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!['student', 'faculty', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    user.role = role;
    user.updatedAt = new Date();
    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'USER_ROLE_UPDATED',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email: user.email, newRole: role }
    });

    res.json({ message: 'Role updated', user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot deactivate admin' });

    user.isActive = !user.isActive;
    user.updatedAt = new Date();
    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email: user.email }
    });

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const [totalUsers, pendingApproval, activeUsers, studentCount, facultyCount, adminCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApproved: false }),
      User.countDocuments({ isActive: true, isApproved: true }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'admin' })
    ]);

    res.json({
      totalUsers,
      pendingApproval,
      activeUsers,
      byRole: { student: studentCount, faculty: facultyCount, admin: adminCount }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
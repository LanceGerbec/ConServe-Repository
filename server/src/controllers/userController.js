import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import ValidStudentId from '../models/ValidStudentId.js';
import ValidFacultyId from '../models/ValidFacultyId.js';
import { sendApprovalEmail } from '../utils/emailService.js';
import { notifyAccountApproved } from '../utils/notificationService.js';

export const getAllUsers = async (req, res) => {
  try {
    const { status, role } = req.query;
    let query = {};
    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    if (role) query.role = role;

    const users = await User.find(query).select('-password -passwordHistory').sort({ createdAt: -1 });
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -passwordHistory');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
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
      user: req.user._id, action: 'USER_APPROVED', resource: 'User', resourceId: user._id,
      ipAddress: req.ip, userAgent: req.get('user-agent'), details: { email: user.email }
    });

    try { await notifyAccountApproved(user._id); } catch (e) { }
    
    let emailSent = false, emailError = null;
    try {
      const emailResult = await sendApprovalEmail(user);
      if (emailResult?.success) emailSent = true;
    } catch (error) { emailError = error.message; }

    res.json({ 
      message: 'User approved successfully', 
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, isApproved: user.isApproved },
      emailSent, emailError: emailError || undefined
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

// ✅ FIXED: AUTO-REVERT VALID ID TO UNUSED WHEN USER IS DELETED
export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin' });

    const { email, studentId, role, _id } = user;

    // DELETE USER
    await user.deleteOne();
    console.log(`✅ User deleted: ${email}`);

    // ✅ AUTO-REVERT VALID ID BACK TO UNUSED
    let idReverted = false;
    try {
      const Model = role === 'faculty' ? ValidFacultyId : ValidStudentId;
      const field = role === 'faculty' ? 'facultyId' : 'studentId';
      
      const revertedId = await Model.findOneAndUpdate(
        { [field]: studentId.toUpperCase() },
        { $set: { isUsed: false, registeredUser: null } },
        { new: true }
      );
      
      if (revertedId) {
        idReverted = true;
        console.log(`✅ ${role === 'faculty' ? 'Faculty' : 'Student'} ID ${studentId} reverted to UNUSED`);
      }
    } catch (idError) {
      console.error('⚠️ ID revert failed:', idError.message);
    }

    await AuditLog.create({
      user: req.user._id, action: 'USER_DELETED', resource: 'User', resourceId: _id,
      ipAddress: req.ip, userAgent: req.get('user-agent'),
      details: { email, studentId, role, idReverted }
    });

    res.json({ 
      message: idReverted ? `User deleted and ${role === 'faculty' ? 'Faculty' : 'Student'} ID ${studentId} reverted to unused` : 'User deleted',
      revertedId: idReverted ? studentId : null
    });
  } catch (error) {
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
      user: req.user._id, action: 'USER_ROLE_UPDATED', resource: 'User', resourceId: user._id,
      ipAddress: req.ip, userAgent: req.get('user-agent'), details: { email: user.email, newRole: role }
    });

    res.json({ message: 'Role updated', user });
  } catch (error) {
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
      user: req.user._id, action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      resource: 'User', resourceId: user._id, ipAddress: req.ip, userAgent: req.get('user-agent'),
      details: { email: user.email }
    });

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
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
      totalUsers, pendingApproval, activeUsers,
      byRole: { student: studentCount, faculty: facultyCount, admin: adminCount }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
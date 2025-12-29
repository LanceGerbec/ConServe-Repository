// ============================================
// FILE: server/src/controllers/userController.js
// FIXED VERSION - COPY THIS ENTIRE FILE
// ============================================
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { sendApprovalEmail } from '../utils/emailService.js'; // ✅ DIRECT IMPORT
import { notifyAccountApproved } from '../utils/notificationService.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { status, role } = req.query;
    let query = {};

    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password -passwordHistory')
      .sort({ createdAt: -1 });

    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordHistory');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// ✅ APPROVE USER - FIXED VERSION
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.error('❌ User not found:', req.params.id);
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isApproved) {
      console.warn('⚠️ User already approved:', user.email);
      return res.status(400).json({ error: 'User is already approved' });
    }

    // Update user status
    user.isApproved = true;
    user.updatedAt = new Date();
    await user.save();

    console.log('✅ User approved in database:', user.email);

    // Log the action
    await AuditLog.create({
      user: req.user._id,
      action: 'USER_APPROVED',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email: user.email }
    });

    // Send in-app notification
    try {
      await notifyAccountApproved(user._id);
      console.log('✅ In-app notification sent');
    } catch (notifError) {
      console.error('⚠️ In-app notification failed:', notifError.message);
    }

    // ✅ SEND APPROVAL EMAIL - IMPROVED ERROR HANDLING
    let emailSent = false;
    let emailError = null;

    try {
      console.log('📧 Attempting to send approval email...');
      const emailResult = await sendApprovalEmail(user);
      
      if (emailResult && emailResult.success) {
        emailSent = true;
        console.log('✅ Approval email sent successfully:', emailResult.messageId);
      } else {
        console.error('❌ Email sending failed - no success flag');
      }
    } catch (error) {
      emailError = error.message;
      console.error('❌ CRITICAL EMAIL ERROR:', {
        message: error.message,
        stack: error.stack,
        userEmail: user.email
      });
    }

    // Return response with email status
    res.json({ 
      message: 'User approved successfully', 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      },
      emailSent,
      emailError: emailError || undefined
    });
  } catch (error) {
    console.error('❌ Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

// Reject/Delete user
export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admins
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    const userEmail = user.email;
    await user.deleteOne();

    // Log action
    await AuditLog.create({
      user: req.user._id,
      action: 'USER_REJECTED',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email: userEmail }
    });

    res.json({ message: 'User rejected and removed successfully' });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    user.role = role;
    user.updatedAt = new Date();
    await user.save();

    // Log action
    await AuditLog.create({
      user: req.user._id,
      action: 'USER_ROLE_UPDATED',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email: user.email, newRole: role }
    });

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot deactivate admin users' });
    }

    user.isActive = !user.isActive;
    user.updatedAt = new Date();
    await user.save();

    // Log action
    await AuditLog.create({
      user: req.user._id,
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email: user.email }
    });

    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, 
      user 
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingApproval = await User.countDocuments({ isApproved: false });
    const activeUsers = await User.countDocuments({ isActive: true, isApproved: true });
    const studentCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    res.json({
      totalUsers,
      pendingApproval,
      activeUsers,
      byRole: {
        student: studentCount,
        faculty: facultyCount,
        admin: adminCount
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};
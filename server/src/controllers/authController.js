// server/src/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import AuditLog from '../models/AuditLog.js';
import ValidStudentId from '../models/ValidStudentId.js';
import ValidFacultyId from '../models/ValidFacultyId.js';
import { sendWelcomeEmail, sendAdminNewUserNotification } from '../utils/emailService.js';
import { notifyNewUserRegistered } from '../utils/notificationService.js';
import Notification from '../models/Notification.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, studentId, password, role } = req.body;

    // 🆕 CHECK FOR SOFT-DELETED USER WITH SAME EMAIL
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase(), isDeleted: false },
        { studentId: studentId.toUpperCase(), isDeleted: false }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ 
          error: 'Email already registered. If you deleted your account, please use a different email or contact admin.' 
        });
      }
      return res.status(400).json({ error: 'Student/Faculty ID already in use' });
    }

    // 🆕 CHECK IF DELETED USER EXISTS (ALLOW RE-REGISTRATION)
    const deletedUser = await User.findOne({ 
      email: email.toLowerCase(), 
      isDeleted: true 
    });

    if (deletedUser) {
      console.log(`🔄 User ${email} previously deleted, allowing re-registration`);
      // Keep old user deleted, allow new registration
    }

    // Validate Student/Faculty ID
    if (role === 'faculty') {
      const validFacultyId = await ValidFacultyId.findOne({
        facultyId: studentId.toUpperCase(),
        status: 'active'
      });
      if (!validFacultyId) {
        return res.status(400).json({ error: 'Invalid faculty ID' });
      }
      if (validFacultyId.isUsed) {
        return res.status(400).json({ error: 'Faculty ID already registered' });
      }

      const user = await User.create({
        firstName, lastName, email: email.toLowerCase(), studentId, password, 
        role: 'faculty', isApproved: false, isDeleted: false
      });

      validFacultyId.isUsed = true;
      validFacultyId.registeredUser = user._id;
      await validFacultyId.save();

      await AuditLog.create({
        user: user._id,
        action: 'FACULTY_REGISTERED',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: { email, facultyId: studentId, wasDeleted: !!deletedUser }
      });

      try {
        await sendWelcomeEmail(user);
        await sendAdminNewUserNotification(user);
      } catch (e) {
        console.error('Email error:', e);
      }

      await Notification.create({
        recipient: user._id,
        type: 'ACCOUNT_APPROVED',
        title: 'Account Created Successfully',
        message: 'Your account has been created. Please wait for admin approval.',
        priority: 'high'
      });

      await notifyNewUserRegistered(user);

      return res.status(201).json({
        message: 'Registration successful. Check your email and await admin approval.',
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
      });
    }

    // Student registration
    const validStudentId = await ValidStudentId.findOne({
      studentId: studentId.toUpperCase(),
      status: 'active'
    });

    if (!validStudentId) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    if (validStudentId.isUsed) {
      return res.status(400).json({ error: 'Student ID already registered' });
    }

    const user = await User.create({
      firstName, lastName, email: email.toLowerCase(), studentId, password, 
      role: role || 'student', isApproved: false, isDeleted: false
    });

    validStudentId.isUsed = true;
    validStudentId.registeredUser = user._id;
    await validStudentId.save();

    await AuditLog.create({
      user: user._id,
      action: 'USER_REGISTERED',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email, studentId, wasDeleted: !!deletedUser }
    });

    try {
      await sendWelcomeEmail(user);
      await sendAdminNewUserNotification(user);
    } catch (e) {
      console.error('Email error:', e);
    }

    await Notification.create({
      recipient: user._id,
      type: 'ACCOUNT_APPROVED',
      title: 'Account Created Successfully',
      message: 'Your account has been created. Please wait for admin approval.',
      priority: 'high'
    });

    await notifyNewUserRegistered(user);

    res.status(201).json({
      message: 'Registration successful. Check your email and await admin approval.',
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'email') {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (field === 'studentId') {
        return res.status(400).json({ error: 'Student/Faculty ID already in use' });
      }
    }
    
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 🆕 EXCLUDE DELETED USERS FROM LOGIN
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isDeleted: false // Only active users can login
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isLocked()) {
      return res.status(423).json({ error: 'Account locked. Try again later.' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ error: 'Account pending admin approval' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account inactive. Contact administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { loginAttempts: 0, lastLogin: new Date() },
      $unset: { lockoutUntil: 1 }
    });

    const token = generateToken(user._id);

    await AuditLog.create({
      user: user._id,
      action: 'USER_LOGIN',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        studentId: user.studentId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const logout = async (req, res) => {
  try {
    await AuditLog.create({
      user: req.user._id,
      action: 'USER_LOGOUT',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -passwordHistory');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isDeleted: false 
    });

    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = jwt.sign(
      { id: user._id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000);
    await user.save();

    const { sendPasswordResetEmail } = await import('../utils/emailService.js');
    await sendPasswordResetEmail(user, resetToken);

    await AuditLog.create({
      user: user._id,
      action: 'PASSWORD_RESET_REQUESTED',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired token' });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ valid: false, error: 'Invalid token type' });
    }

    const user = await User.findOne({
      _id: decoded.id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
      isDeleted: false
    });

    if (!user) {
      return res.status(400).json({ valid: false, error: 'Token expired or already used' });
    }

    res.json({ valid: true, email: user.email });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ valid: false, error: 'Verification failed' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        error: 'Password must include uppercase, lowercase, number, and special character' 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    const user = await User.findOne({
      _id: decoded.id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
      isDeleted: false
    });

    if (!user) {
      return res.status(400).json({ error: 'Token expired or already used' });
    }

    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password cannot be the same as current password' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'PASSWORD_RESET_COMPLETED',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const { sendPasswordResetConfirmation } = await import('../utils/emailService.js');
    await sendPasswordResetConfirmation(user);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
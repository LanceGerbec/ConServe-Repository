// ============================================
// FILE: server/src/controllers/authController.js
// ============================================
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import AuditLog from '../models/AuditLog.js';
import ValidStudentId from '../models/ValidStudentId.js';
import ValidFacultyId from '../models/ValidFacultyId.js';
import { sendWelcomeEmail, sendAdminNewUserNotification } from '../utils/emailService.js';
import { notifyNewUserRegistered, notifyAccountApproved } from '../utils/notificationService.js';
import Notification from '../models/Notification.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, studentId, password, role } = req.body;

    const existingUser = await User.findOne({ 
  $or: [{ email }, { studentId }],
  isDeleted: { $ne: true } // Exclude deleted users
});
if (existingUser) {
      return res.status(400).json({ error: 'User with this email or ID already exists' });
    }

    if (role === 'faculty') {
      const validFacultyId = await ValidFacultyId.findOne({
        facultyId: studentId.toUpperCase(),
        status: 'active'
      });

      if (!validFacultyId) {
        return res.status(400).json({ error: 'Invalid faculty ID. Please contact the administrator.' });
      }

      if (validFacultyId.isUsed) {
        return res.status(400).json({ error: 'This faculty ID has already been registered.' });
      }

      const user = await User.create({
        firstName, lastName, email, studentId, password, role: 'faculty', isApproved: false
      });

      validFacultyId.isUsed = true;
      validFacultyId.registeredUser = user._id;
      await validFacultyId.save();

      await AuditLog.create({
        user: user._id,
        action: 'FACULTY_REGISTERED',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: { email, facultyId: studentId }
      });

      try {
        await sendWelcomeEmail(user);
        await sendAdminNewUserNotification(user);
      } catch (emailError) {
        console.error('⚠️ Email send failed:', emailError);
      }

      await Notification.create({
        recipient: user._id,
        type: 'ACCOUNT_APPROVED',
        title: '🎉 Account Created Successfully!',
        message: 'Your account has been created. Please wait for admin approval to access the system. You will receive a notification once approved.',
        priority: 'high'
      });

      await notifyNewUserRegistered(user);

      return res.status(201).json({
        message: 'Registration successful. Check your email and await admin approval.',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    }

    const validStudentId = await ValidStudentId.findOne({
      studentId: studentId.toUpperCase(),
      status: 'active'
    });

    if (!validStudentId) {
      return res.status(400).json({ error: 'Invalid student ID. Please contact the administrator.' });
    }

    if (validStudentId.isUsed) {
      return res.status(400).json({ error: 'This student ID has already been registered.' });
    }

    const user = await User.create({
      firstName, lastName, email, studentId, password, role: role || 'student', isApproved: false
    });

    validStudentId.isUsed = true;
    validStudentId.registeredUser = user._id;
    await validStudentId.save();

    await AuditLog.create({
      user: user._id,
      action: 'USER_REGISTERED',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email, studentId }
    });

    try {
      await sendWelcomeEmail(user);
      await sendAdminNewUserNotification(user);
    } catch (emailError) {
      console.error('⚠️ Email send failed:', emailError);
    }

    await Notification.create({
      recipient: user._id,
      type: 'ACCOUNT_APPROVED',
      title: '🎉 Account Created Successfully!',
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
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

   const user = await User.findOne({ email });
if (!user) {
  return res.status(401).json({ error: 'Invalid credentials' });
}

if (user.isDeleted) {
  return res.status(403).json({ 
    error: 'This account has been deleted. Please contact administrator if this is a mistake.' 
  });
}
    if (user.isLocked()) {
      return res.status(423).json({ error: 'Account is locked. Try again later.' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ error: 'Account pending admin approval' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive. Contact administrator.' });
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

// ============================================
// 🆕 FORGOT PASSWORD
// ============================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        message: 'If that email exists, a reset link has been sent.' 
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save token to database
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send reset email
    const { sendPasswordResetEmail } = await import('../utils/emailService.js');
    await sendPasswordResetEmail(user, resetToken);

    await AuditLog.create({
      user: user._id,
      action: 'PASSWORD_RESET_REQUESTED',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ 
      message: 'If that email exists, a reset link has been sent.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// ============================================
// 🆕 VERIFY RESET TOKEN
// ============================================
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token required' });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired token' });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ valid: false, error: 'Invalid token type' });
    }

    // Check if token exists in database and hasn't expired
    const user = await User.findOne({
      _id: decoded.id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
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

// ============================================
// 🆕 RESET PASSWORD
// ============================================
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }

    // Validate password strength
    if (newPassword.length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        error: 'Password must include uppercase, lowercase, number, and special character' 
      });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    // Find user with valid token
    const user = await User.findOne({
      _id: decoded.id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token expired or already used' });
    }

    // Check if new password is same as old password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password cannot be the same as current password' });
    }

    // Update password
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

    // Send confirmation email
    const { sendPasswordResetConfirmation } = await import('../utils/emailService.js');
    await sendPasswordResetConfirmation(user);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
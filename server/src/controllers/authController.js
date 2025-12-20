// ============================================
// FILE: server/src/controllers/authController.js
// REPLACE ENTIRE FILE WITH THIS
// ============================================
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import AuditLog from '../models/AuditLog.js';
import ValidStudentId from '../models/ValidStudentId.js';
import ValidFacultyId from '../models/ValidFacultyId.js';
import { sendWelcomeEmail, sendAdminNewUserNotification } from '../utils/emailService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, studentId, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or ID already exists' 
      });
    }

    // Validate based on role
    if (role === 'faculty') {
      const validFacultyId = await ValidFacultyId.findOne({
        facultyId: studentId.toUpperCase(),
        status: 'active'
      });

      if (!validFacultyId) {
        return res.status(400).json({ 
          error: 'Invalid faculty ID. Please contact the administrator.' 
        });
      }

      if (validFacultyId.isUsed) {
        return res.status(400).json({ 
          error: 'This faculty ID has already been registered.' 
        });
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        studentId,
        password,
        role: 'faculty',
        isApproved: false
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

      // SEND EMAILS - NEW CODE
      try {
        await sendWelcomeEmail(user);
        await sendAdminNewUserNotification(user);
        console.log('✅ Welcome & Admin notification emails sent');
      } catch (emailError) {
        console.error('⚠️ Email send failed:', emailError);
        // Don't block registration if email fails
      }

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

    // Student registration
    const validStudentId = await ValidStudentId.findOne({
      studentId: studentId.toUpperCase(),
      status: 'active'
    });

    if (!validStudentId) {
      return res.status(400).json({ 
        error: 'Invalid student ID. Please contact the administrator.' 
      });
    }

    if (validStudentId.isUsed) {
      return res.status(400).json({ 
        error: 'This student ID has already been registered.' 
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      studentId,
      password,
      role: role || 'student',
      isApproved: false
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

    // SEND EMAILS - NEW CODE
    try {
      await sendWelcomeEmail(user);
      await sendAdminNewUserNotification(user);
      console.log('✅ Welcome & Admin notification emails sent');
    } catch (emailError) {
      console.error('⚠️ Email send failed:', emailError);
      // Don't block registration if email fails
    }

    res.status(201).json({
      message: 'Registration successful. Check your email and await admin approval.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
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
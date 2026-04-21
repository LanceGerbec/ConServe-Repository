import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import AuditLog from '../models/AuditLog.js';
import BlacklistedToken from '../models/BlacklistedToken.js';
import ValidStudentId from '../models/ValidStudentId.js';
import ValidFacultyId from '../models/ValidFacultyId.js';
import Notification from '../models/Notification.js';
import { sendWelcomeEmail, sendAdminNewUserNotification, sendEmail } from '../utils/emailService.js';
import { notifyNewUserRegistered } from '../utils/notificationService.js';

const LOCKOUT_STEPS = [0.5, 1, 3, 5, 10, 30, 60]; // minutes (0.5 = 30s)
const ATTEMPTS_BEFORE_LOCK = 3;

const generateToken = (id) => {
  const jti = randomBytes(16).toString('hex');
  return jwt.sign({ id, jti }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const safeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  studentId: user.studentId,
  avatar: user.avatar || null,
  isSuperAdmin: Boolean(user.isSuperAdmin),
  canUploadOnBehalf: user.canUploadOnBehalf,
  isApproved: user.isApproved,
  isActive: user.isActive,
});

const formatLockDuration = (minutes) => {
  if (minutes < 1) return `${Math.round(minutes * 60)} seconds`;
  if (minutes >= 60) return `${minutes / 60} hour(s)`;
  return `${minutes} minute(s)`;
};

// ── Login alert email ──────────────────────────────────────────────────────
const sendLoginAlert = async (user, ip, userAgent, type = 'success') => {
  try {
    const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' });
    const device = userAgent?.substring(0, 80) || 'Unknown device';

    if (type === 'success') {
      await sendEmail({
        to: user.email,
        subject: 'New Login to Your CONserve Account',
        html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;padding:30px;border-radius:8px 8px 0 0;text-align:center">
            <h2 style="margin:0">New Login Detected</h2>
            <p style="margin:8px 0 0;opacity:.9;font-size:14px">Someone just signed in to your account</p>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;padding:25px;border-radius:0 0 8px 8px">
            <p>Hello <strong>${user.firstName}</strong>,</p>
            <p>A successful login was recorded for your CONserve account.</p>
            <div style="background:#f0f9ff;border-left:4px solid #3b82f6;padding:15px;border-radius:4px;margin:15px 0">
              <p style="margin:4px 0;font-size:14px"><strong>Time:</strong> ${time} (PHT)</p>
              <p style="margin:4px 0;font-size:14px"><strong>IP Address:</strong> ${ip}</p>
              <p style="margin:4px 0;font-size:14px"><strong>Device:</strong> ${device}</p>
            </div>
            <p style="color:#dc2626;font-size:14px">If this was not you, please <a href="${process.env.CLIENT_URL}/forgot-password" style="color:#1e3a8a">reset your password</a> immediately.</p>
            <p style="color:#6b7280;font-size:12px;margin-top:20px">© ${new Date().getFullYear()} CONserve — NEUST College of Nursing</p>
          </div>
        </div>`
      });
    } else if (type === 'failed') {
      await sendEmail({
        to: user.email,
        subject: 'Failed Login Attempt on Your CONserve Account',
        html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:linear-gradient(135deg,#dc2626,#f97316);color:#fff;padding:30px;border-radius:8px 8px 0 0;text-align:center">
            <h2 style="margin:0">Failed Login Attempt</h2>
            <p style="margin:8px 0 0;opacity:.9;font-size:14px">An unsuccessful login attempt was detected</p>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;padding:25px;border-radius:0 0 8px 8px">
            <p>Hello <strong>${user.firstName}</strong>,</p>
            <p>Someone tried to login to your CONserve account with an incorrect password.</p>
            <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:15px;border-radius:4px;margin:15px 0">
              <p style="margin:4px 0;font-size:14px"><strong>Time:</strong> ${time} (PHT)</p>
              <p style="margin:4px 0;font-size:14px"><strong>IP Address:</strong> ${ip}</p>
              <p style="margin:4px 0;font-size:14px"><strong>Device:</strong> ${device}</p>
            </div>
            <p style="font-size:14px">If this was you, you can safely ignore this email. If not, consider <a href="${process.env.CLIENT_URL}/forgot-password" style="color:#1e3a8a">resetting your password</a>.</p>
            <p style="color:#6b7280;font-size:12px;margin-top:20px">© ${new Date().getFullYear()} CONserve — NEUST College of Nursing</p>
          </div>
        </div>`
      });
    }
  } catch (e) {
    console.error('Login alert email error:', e.message);
  }
};

// ── Lockout alert email ────────────────────────────────────────────────────
const sendLockoutAlert = async (user, ip, lockMinutes) => {
  try {
    const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' });
    await sendEmail({
      to: user.email,
      subject: 'Your CONserve Account Has Been Temporarily Locked',
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#92400e,#d97706);color:#fff;padding:30px;border-radius:8px 8px 0 0;text-align:center">
          <h2 style="margin:0">Account Temporarily Locked</h2>
          <p style="margin:8px 0 0;opacity:.9;font-size:14px">Too many failed login attempts</p>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;padding:25px;border-radius:0 0 8px 8px">
          <p>Hello <strong>${user.firstName}</strong>,</p>
          <p>Your account has been <strong>temporarily locked</strong> due to multiple failed login attempts.</p>
          <div style="background:#fffbeb;border-left:4px solid #d97706;padding:15px;border-radius:4px;margin:15px 0">
            <p style="margin:4px 0;font-size:14px"><strong>Time:</strong> ${time} (PHT)</p>
            <p style="margin:4px 0;font-size:14px"><strong>IP Address:</strong> ${ip}</p>
            <p style="margin:4px 0;font-size:14px"><strong>Locked for:</strong> ${formatLockDuration(lockMinutes)}</p>
          </div>
          <p style="font-size:14px">If this was you, please wait and try again. If not, <a href="${process.env.CLIENT_URL}/forgot-password" style="color:#1e3a8a">reset your password immediately</a>.</p>
          <p style="color:#6b7280;font-size:12px;margin-top:20px">© ${new Date().getFullYear()} CONserve — NEUST College of Nursing</p>
        </div>
      </div>`
    });
  } catch (e) {
    console.error('Lockout alert email error:', e.message);
  }
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, studentId, password, role } = req.body;
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase(), isDeleted: false }, { studentId: studentId.toUpperCase(), isDeleted: false }]
    });
    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email.toLowerCase()
          ? 'Email already registered.' : 'Student/Faculty ID already in use'
      });
    }

    if (role === 'faculty') {
      const validFacultyId = await ValidFacultyId.findOne({ facultyId: studentId.toUpperCase(), status: 'active' });
      if (!validFacultyId) return res.status(400).json({ error: 'Invalid faculty ID' });
      if (validFacultyId.isUsed) return res.status(400).json({ error: 'Faculty ID already registered' });
      const user = await User.create({ firstName, lastName, email: email.toLowerCase(), studentId, password, role: 'faculty', isApproved: false, isDeleted: false });
      validFacultyId.isUsed = true; validFacultyId.registeredUser = user._id;
      await validFacultyId.save();
      await AuditLog.create({ user: user._id, action: 'FACULTY_REGISTERED', ipAddress: req.ip, userAgent: req.get('user-agent'), details: { email, facultyId: studentId } });
      try { await sendWelcomeEmail(user); await sendAdminNewUserNotification(user); } catch (e) { console.error('Email error:', e); }
      await Notification.create({ recipient: user._id, type: 'ACCOUNT_APPROVED', title: 'Account Created', message: 'Your account has been created. Please wait for admin approval.', priority: 'high' });
      await notifyNewUserRegistered(user);
      return res.status(201).json({ message: 'Registration successful. Await admin approval.', user: safeUser(user) });
    }

    const validStudentId = await ValidStudentId.findOne({ studentId: studentId.toUpperCase(), status: 'active' });
    if (!validStudentId) return res.status(400).json({ error: 'Invalid student ID' });
    if (validStudentId.isUsed) return res.status(400).json({ error: 'Student ID already registered' });
    const user = await User.create({ firstName, lastName, email: email.toLowerCase(), studentId, password, role: role || 'student', isApproved: false, isDeleted: false });
    validStudentId.isUsed = true; validStudentId.registeredUser = user._id;
    await validStudentId.save();
    await AuditLog.create({ user: user._id, action: 'USER_REGISTERED', ipAddress: req.ip, userAgent: req.get('user-agent'), details: { email, studentId } });
    try { await sendWelcomeEmail(user); await sendAdminNewUserNotification(user); } catch (e) { console.error('Email error:', e); }
    await Notification.create({ recipient: user._id, type: 'ACCOUNT_APPROVED', title: 'Account Created', message: 'Your account has been created. Please wait for admin approval.', priority: 'high' });
    await notifyNewUserRegistered(user);
    res.status(201).json({ message: 'Registration successful. Await admin approval.', user: safeUser(user) });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: field === 'email' ? 'Email already registered' : 'ID already in use' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Check lockout
    if (user.isLocked()) {
      const remaining = user.getLockoutRemainingSeconds();
      const mins = Math.ceil(remaining / 60);
      return res.status(423).json({
        error: `Account locked. Try again in ${mins > 1 ? `${mins} minutes` : `${remaining} seconds`}.`,
        lockoutSeconds: remaining
      });
    }

    if (!user.isApproved) return res.status(403).json({ error: 'Account pending admin approval' });
    if (!user.isActive) return res.status(403).json({ error: 'Account inactive. Contact administrator.' });

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      const newAttempts = user.loginAttempts + 1;
      const attemptsLeft = Math.max(0, ATTEMPTS_BEFORE_LOCK - newAttempts);

      // Determine what lockout will be applied
      const willLock = newAttempts >= ATTEMPTS_BEFORE_LOCK;
      const step = Math.min(user.lockoutStep || 0, LOCKOUT_STEPS.length - 1);
      const lockMinutes = LOCKOUT_STEPS[step];

      await user.incLoginAttempts();

      // Send email alerts async (don't block response)
      sendLoginAlert(user, req.ip, req.get('user-agent'), 'failed').catch(() => {});
      if (willLock) sendLockoutAlert(user, req.ip, lockMinutes).catch(() => {});

      // In-app notification — no emojis
      Notification.create({
        recipient: user._id,
        type: 'SECURITY_ALERT',
        title: 'Failed Login Attempt',
        message: `Failed login attempt detected from IP ${req.ip}.${willLock ? ` Account locked for ${formatLockDuration(lockMinutes)}.` : ` ${attemptsLeft} attempt(s) remaining before lockout.`}`,
        priority: 'urgent'
      }).catch(() => {});

      await AuditLog.create({
        user: user._id,
        action: 'LOGIN_FAILED',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: { willLock, lockMinutes: willLock ? lockMinutes : 0, lockoutStep: step, attemptsLeft }
      });

      return res.status(401).json({
        error: attemptsLeft > 0
          ? `Invalid credentials. ${attemptsLeft} attempt(s) remaining before lockout.`
          : 'Invalid credentials',
        lockoutSeconds: willLock ? Math.round(lockMinutes * 60) : 0
      });
    }

    // Success — reset attempts
    await User.findByIdAndUpdate(user._id, {
      $set: { loginAttempts: 0, lockoutStep: 0, lastLogin: new Date(), lastLoginIp: req.ip, lastLoginUserAgent: req.get('user-agent') },
      $unset: { lockoutUntil: 1 }
    });

    const token = generateToken(user._id);
    await AuditLog.create({ user: user._id, action: 'USER_LOGIN', ipAddress: req.ip, userAgent: req.get('user-agent') });

    // Send success email alert async
    sendLoginAlert(user, req.ip, req.get('user-agent'), 'success').catch(() => {});

    // In-app notification — no emojis
    Notification.create({
      recipient: user._id,
      type: 'LOGIN_ACTIVITY',
      title: 'New Login to Your Account',
      message: `Successful login from IP ${req.ip} on ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' })} PHT.`,
      priority: 'medium'
    }).catch(() => {});

    res.json({ token, user: safeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const logout = async (req, res) => {
  try {
    const decoded = req.tokenDecoded;
    if (decoded?.jti && decoded?.exp) {
      await BlacklistedToken.create({
        jti: decoded.jti,
        userId: req.user._id,
        expiresAt: new Date(decoded.exp * 1000)
      }).catch(() => {});
    }
    await AuditLog.create({ user: req.user._id, action: 'USER_LOGOUT', ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Logged out successfully' });
  } catch (error) { res.status(500).json({ error: 'Logout failed' }); }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -passwordHistory').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { ...safeUser(user), twoFactorEnabled: user.twoFactorEnabled, lastLogin: user.lastLogin, createdAt: user.createdAt } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const resetToken = jwt.sign(
      { id: user._id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const { sendPasswordResetEmail } = await import('../utils/emailService.js');
    await sendPasswordResetEmail(user, resetToken);
    await AuditLog.create({ user: user._id, action: 'PASSWORD_RESET_REQUESTED', ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ valid: false, error: 'Token required' });
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); } catch { return res.status(400).json({ valid: false, error: 'Invalid or expired token' }); }
    if (decoded.type !== 'password-reset') return res.status(400).json({ valid: false, error: 'Invalid token type' });
    const user = await User.findOne({ _id: decoded.id, passwordResetToken: token, passwordResetExpires: { $gt: Date.now() }, isDeleted: false });
    if (!user) return res.status(400).json({ valid: false, error: 'Token expired or already used' });
    res.json({ valid: true, email: user.email });
  } catch (error) {
    res.status(500).json({ valid: false, error: 'Verification failed' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/;
    if (!passwordRegex.test(newPassword)) return res.status(400).json({ error: 'Password must include uppercase, lowercase, number, and special character' });

    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); } catch { return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' }); }
    if (decoded.type !== 'password-reset') return res.status(400).json({ error: 'Invalid token type' });

    const user = await User.findOne({ _id: decoded.id, passwordResetToken: token, passwordResetExpires: { $gt: Date.now() }, isDeleted: false });
    if (!user) return res.status(400).json({ error: 'Reset link has expired (5 minutes). Please request a new one.' });

    const isSame = await user.comparePassword(newPassword);
    if (isSame) return res.status(400).json({ error: 'New password cannot be the same as current password' });

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await AuditLog.create({ user: user._id, action: 'PASSWORD_RESET_COMPLETED', ipAddress: req.ip, userAgent: req.get('user-agent') });
    const { sendPasswordResetConfirmation } = await import('../utils/emailService.js');
    await sendPasswordResetConfirmation(user);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
import express from 'express';
import { register, login, logout, getCurrentUser, forgotPassword, verifyResetToken, resetPassword } from '../controllers/authController.js';
import { auth, authorize } from '../middleware/auth.js';
import { sendEmail, testEmailConnection } from '../utils/emailService.js';
import { passwordResetLimiter, registerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', registerLimiter, register);   // 3 registrations/hour per IP
router.post('/login', login);                          // loginLimiter applied in server.js
router.post('/logout', auth, logout);
router.get('/me', auth, getCurrentUser);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

router.get('/test-email-connection', auth, authorize('admin'), async (req, res) => {
  try {
    const isConnected = await testEmailConnection();
    res.json({ success: isConnected, message: isConnected ? '✅ Email server connected' : '❌ Connection failed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-email', auth, authorize('admin'), async (req, res) => {
  try {
    await sendEmail({
      to: req.user.email,
      subject: '✅ ConServe Email Test',
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px"><h1 style="color:#10b981">✅ Email System is Working!</h1><p>Hello <strong>${req.user.firstName}</strong>,</p><p>This is a test email from ConServe. Configuration is working correctly!</p><p><strong>Time:</strong> ${new Date().toLocaleString()}</p></div>`
    });
    res.json({ success: true, message: `✅ Test email sent to ${req.user.email}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
});

export default router;
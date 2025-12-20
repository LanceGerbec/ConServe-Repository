// ============================================
// FILE: server/src/routes/auth.routes.js
// REPLACE ENTIRE FILE WITH THIS
// ============================================
import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController.js';
import { auth, authorize } from '../middleware/auth.js';  // ✅ ADDED authorize IMPORT
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/me', auth, getCurrentUser);

// Test Email Endpoint (Admin Only)
router.post('/test-email', auth, authorize('admin'), async (req, res) => {
  try {
    await sendEmail({
      to: req.user.email,
      subject: '✅ ConServe Email Test',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Email System is Working!</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${req.user.firstName}</strong>,</p>
              <p>This is a test email from ConServe Research Repository.</p>
              <p>If you're receiving this, your email configuration is <strong>working correctly!</strong></p>
              <p><strong>System Details:</strong></p>
              <ul>
                <li>Server: ${process.env.NODE_ENV}</li>
                <li>Time: ${new Date().toLocaleString()}</li>
                <li>Recipient: ${req.user.email}</li>
              </ul>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ConServe - NEUST College of Nursing</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    res.json({ 
      success: true, 
      message: `✅ Test email sent successfully to ${req.user.email}` 
    });
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email', 
      details: error.message 
    });
  }
});

export default router;
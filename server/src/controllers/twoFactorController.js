import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

export const setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `ConServe (${req.user.email})`,
      issuer: 'ConServe'
    });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    req.user.twoFactorSecret = secret.base32;
    await req.user.save();

    await AuditLog.create({
      user: req.user._id,
      action: '2FA_SETUP_INITIATED',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ qrCode, secret: secret.base32 });
  } catch (error) {
    res.status(500).json({ error: '2FA setup failed' });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;

    const verified = speakeasy.totp.verify({
      secret: req.user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid 2FA code' });
    }

    req.user.twoFactorEnabled = true;
    await req.user.save();

    await AuditLog.create({
      user: req.user._id,
      action: '2FA_ENABLED',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ error: '2FA verification failed' });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const { token } = req.body;

    const verified = speakeasy.totp.verify({
      secret: req.user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid 2FA code' });
    }

    req.user.twoFactorEnabled = false;
    req.user.twoFactorSecret = null;
    await req.user.save();

    await AuditLog.create({
      user: req.user._id,
      action: '2FA_DISABLED',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
};
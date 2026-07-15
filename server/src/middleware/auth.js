// server/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import BlacklistedToken from '../models/BlacklistedToken.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.jti) {
      const revoked = await BlacklistedToken.findOne({ jti: decoded.jti }).lean();
      if (revoked) return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    const user = await User.findOne({ _id: decoded.id, isDeleted: false }).select('-password');
    if (!user)         return res.status(401).json({ error: 'Authentication failed' });
    if (!user.isApproved) return res.status(403).json({ error: 'Account pending approval' });
    if (!user.isActive)   return res.status(403).json({ error: 'Account inactive' });

    // ── NEW: violation-triggered viewing restriction ──
    // Blocks PDF access routes while a temporary lock is active; everything else
    // (browsing, dashboard, etc.) still works normally.
    if (user.viewingRestrictedUntil && user.viewingRestrictedUntil > new Date()) {
      if (req.path.includes('/pdf')) {
        return res.status(403).json({
          error: 'Viewing access temporarily restricted due to repeated violations.',
          restrictedUntil: user.viewingRestrictedUntil
        });
      }
    }

    req.user = user;
    req.token = token;
    req.tokenDecoded = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ error: 'Access denied' });
  next();
};

export const authorizeSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' || !req.user.isSuperAdmin)
    return res.status(403).json({ error: 'Super admin access required' });
  next();
};
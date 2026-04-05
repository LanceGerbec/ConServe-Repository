import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import BlacklistedToken from '../models/BlacklistedToken.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Check token blacklist (protects against reuse after logout) ──────
    // Even if an attacker intercepts a valid JWT, it can't be used after logout.
    if (decoded.jti) {
      const revoked = await BlacklistedToken.findOne({ jti: decoded.jti }).lean();
      if (revoked) return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    const user = await User.findOne({ _id: decoded.id, isDeleted: false }).select('-password');
    if (!user)         return res.status(401).json({ error: 'Authentication failed' });
    if (!user.isApproved) return res.status(403).json({ error: 'Account pending approval' });
    if (!user.isActive)   return res.status(403).json({ error: 'Account inactive' });

    req.user = user;
    req.token = token;
    req.tokenDecoded = decoded; // needed by logout to blacklist the jti
    next();
  } catch (error) {
    // Generic message — don't reveal WHY it failed (expired vs invalid)
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
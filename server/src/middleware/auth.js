import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    console.log('🔐 Auth check:', {
      hasToken: !!token,
      tokenPreview: token?.substring(0, 20) + '...'
    });

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.error('❌ User not found:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isApproved) {
      console.error('❌ User not approved:', user.email);
      return res.status(403).json({ error: 'Account pending approval' });
    }

    if (!user.isActive) {
      console.error('❌ User not active:', user.email);
      return res.status(403).json({ error: 'Account inactive' });
    }

    if (user.isDeleted) {
  console.error('❌ User deleted:', user.email);
  return res.status(403).json({ error: 'Account has been deleted' });
}

    console.log('✅ Auth success:', user.email);
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
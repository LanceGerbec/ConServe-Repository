// server/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 🆕 EXCLUDE DELETED USERS
    const user = await User.findOne({ 
      _id: decoded.id,
      isDeleted: false 
    }).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found or deleted' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ error: 'Account pending approval' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account inactive' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
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
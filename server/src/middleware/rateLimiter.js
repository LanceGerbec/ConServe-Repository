import rateLimit from 'express-rate-limit';

const make = (windowMs, max, message, skipSuccess = false) => rateLimit({
  windowMs, max, message,
  standardHeaders: true, legacyHeaders: false,
  trustProxy: true, skipSuccessfulRequests: skipSuccess,
  handler: (req, res) => res.status(429).json({ error: message })
});

// 5 attempts per 15 min — prevents brute-force login
export const loginLimiter = make(15 * 60 * 1000, 5, 'Too many login attempts. Try again in 15 minutes.');

// 3 attempts per 15 min — prevents email-based DoS
export const passwordResetLimiter = make(15 * 60 * 1000, 3, 'Too many password reset attempts. Try again later.');

// 3 registrations per hour per IP — prevents fake account creation
export const registerLimiter = make(60 * 60 * 1000, 3, 'Too many registration attempts from this IP.');

// 10 uploads per hour — prevents storage DoS
export const uploadLimiter = make(60 * 60 * 1000, 10, 'Too many upload requests. Try again later.');

// 30 searches per minute — prevents search DoS
export const searchLimiter = make(60 * 1000, 30, 'Too many search requests. Slow down.');

// 100 requests per 15 min (skips successes) — general API protection
export const apiLimiter = make(15 * 60 * 1000, 100, 'Too many requests. Try again later.', true);
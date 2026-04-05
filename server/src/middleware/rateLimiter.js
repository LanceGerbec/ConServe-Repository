// server/src/middleware/rateLimiter.js
// RATIONALE: Prevents brute-force attacks, credential stuffing, and DDoS
// by limiting how many requests a single IP can make in a time window.
// Without this, an attacker can try millions of password combos automatically.

import rateLimit from 'express-rate-limit';

// ── Login: 5 attempts per 15 min ──────────────────────────────────────────
// WHY: Stops brute-force password guessing. After 5 fails, IP is blocked
//      for 15 minutes — too slow for automated attacks to be feasible.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count FAILED logins
});

// ── Registration: 3 per hour ──────────────────────────────────────────────
// WHY: Stops automated mass account creation (fake accounts, spam bots).
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many registration attempts. Try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Password Reset: 3 per 15 min ─────────────────────────────────────────
// WHY: Prevents email bombing (sending thousands of reset emails to a victim)
//      and avoids token enumeration attacks.
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many password reset attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── File Upload: 10 per 10 min ────────────────────────────────────────────
// WHY: Prevents storage exhaustion attacks where an attacker floods your
//      server/Cloudinary with massive files repeatedly.
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: 'Too many uploads. Please wait before uploading again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── General API: 100 per 15 min ───────────────────────────────────────────
// WHY: Overall API protection. Legitimate users rarely hit 100 req/15min,
//      but scrapers and bots will — this slows them down significantly.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// ── Search: 30 per minute ─────────────────────────────────────────────────
// WHY: Search queries are expensive (TF-IDF computation, DB scans).
//      Without limits, one user can overload the server for everyone else.
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Search rate limit exceeded. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
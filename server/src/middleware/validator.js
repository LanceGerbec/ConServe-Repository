// server/src/middleware/validator.js
// RATIONALE: Never trust user input. Validation ensures data has the correct
// type, length, and format BEFORE it touches your database. This prevents:
// - Buffer overflow attempts (huge payloads)
// - Type confusion attacks (sending objects where strings expected)
// - Stored XSS (malicious HTML stored in DB, executed when rendered)
// - Business logic bypass (submitting negative prices, invalid roles, etc.)

import { body, param, query, validationResult } from 'express-validator';

// ── Helper: Run validators and return errors ──────────────────────────────
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log validation failures — repeated failures may indicate attack probing
    console.warn(`[VALIDATION FAIL] ${req.method} ${req.path} | IP: ${req.ip} | Errors:`, errors.array());
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// ── Registration ──────────────────────────────────────────────────────────
// WHY: Without length limits, attacker can send a 100MB "firstName" and
//      crash your server or fill your database. Role validation prevents
//      users from registering themselves as 'admin'.
export const validateRegistration = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name contains invalid characters'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name contains invalid characters'),

  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Email too long'), // RFC 5321 limit

  body('studentId')
    .trim()
    .notEmpty().withMessage('ID is required')
    .isLength({ min: 3, max: 30 }).withMessage('ID must be 3-30 characters')
    .matches(/^[A-Za-z0-9\-]+$/).withMessage('ID contains invalid characters'),

  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    // WHY max 128: bcrypt truncates at 72 bytes — very long passwords with
    // repeated computation can cause DoS (bcrypt bomb attack)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password needs uppercase, lowercase, number, and special char'),

  body('role')
    .optional()
    .isIn(['student', 'faculty']).withMessage('Invalid role'),
    // WHY: Explicitly whitelist — never allow 'admin' via registration

  validate,
];

// ── Login ─────────────────────────────────────────────────────────────────
export const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Valid email required')
    .normalizeEmail()
    .isLength({ max: 254 }),

  body('password')
    .notEmpty().withMessage('Password required')
    .isLength({ max: 128 }).withMessage('Password too long'),
    // WHY max check: prevents bcrypt bomb even at login

  validate,
];

// ── Research Submission ───────────────────────────────────────────────────
// WHY: Validates all fields before they're stored. Prevents malicious
//      keywords like {"$where": "..."} or 10,000-character abstracts.
export const validateResearch = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 10, max: 500 }).withMessage('Title must be 10-500 characters'),

  body('abstract')
    .trim()
    .notEmpty().withMessage('Abstract is required')
    .isLength({ min: 100, max: 5000 }).withMessage('Abstract must be 100-5000 characters'),

  body('category')
    .isIn(['Completed', 'Published']).withMessage('Invalid category'),

  body('yearCompleted')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year'),

  body('subjectArea')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Subject area too long'),

  validate,
];

// ── Password Reset ────────────────────────────────────────────────────────
export const validatePasswordReset = [
  body('newPassword')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password needs uppercase, lowercase, number, and special char'),

  body('token')
    .notEmpty().withMessage('Reset token required')
    .isLength({ max: 1000 }).withMessage('Invalid token'),

  validate,
];

// ── MongoDB ObjectId params ───────────────────────────────────────────────
// WHY: If an attacker sends /research/../../../../etc/passwd as an ID,
//      Mongoose would throw an ugly error. Validating MongoID format first
//      means we reject it cleanly before it reaches the database.
export const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage(`Invalid ${paramName} format`),
  validate,
];

// ── Search Query ──────────────────────────────────────────────────────────
// WHY: Search queries are passed into regex patterns. A query like
//      (a+)+ can cause catastrophic backtracking (ReDoS attack) that
//      freezes your server for seconds per request.
export const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Search query too long')
    .not().matches(/[{}$]/).withMessage('Invalid search characters'),

  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Invalid page number'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),

  validate,
];
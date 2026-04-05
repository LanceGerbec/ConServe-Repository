// server/src/middleware/sanitize.js
// PURPOSE: Prevent NoSQL injection attacks by stripping MongoDB operators
// from user-supplied input (req.body, req.query, req.params).
// Also blocks XSS by removing <script> tags from strings.
// Add to server.js BEFORE routes: app.use(sanitize);

const MONGO_OP = /^\$|^\./; // blocks $gt, $where, .nested, etc.

const clean = (val, depth = 0) => {
  if (depth > 10) return val; // prevent infinite recursion
  if (Array.isArray(val)) return val.map(v => clean(v, depth + 1));
  if (val !== null && typeof val === 'object') {
    return Object.fromEntries(
      Object.entries(val)
        .filter(([k]) => !MONGO_OP.test(k))          // drop $operators
        .map(([k, v]) => [k, clean(v, depth + 1)])
    );
  }
  if (typeof val === 'string') {
    return val
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // basic XSS strip
      .replace(/\0/g, '');                                   // null bytes
  }
  return val;
};

const sanitize = (req, _res, next) => {
  if (req.body)   req.body   = clean(req.body);
  if (req.query)  req.query  = clean(req.query);
  if (req.params) req.params = clean(req.params);
  next();
};

export default sanitize;
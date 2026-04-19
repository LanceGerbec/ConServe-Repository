import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import { initGridFS } from './src/config/gridfs.js';

import authRoutes from './src/routes/auth.routes.js';
import researchRoutes from './src/routes/research.routes.js';
import userRoutes from './src/routes/user.routes.js';
import bookmarkRoutes from './src/routes/bookmark.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import settingsRoutes from './src/routes/settings.routes.js';
import validStudentIdRoutes from './src/routes/validStudentId.routes.js';
import validFacultyIdRoutes from './src/routes/validFacultyId.routes.js';
import teamRoutes from './src/routes/team.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import bulkUploadRoutes from './src/routes/bulkUpload.routes.js';
import searchRoutes from './src/routes/search.routes.js';
import awardsRoutes from './src/routes/awards.routes.js';
import reportRoutes from './src/routes/report.routes.js';
import deletedUsersRoutes from './src/routes/deletedUsers.routes.js';
import adminManagementRoutes from './src/routes/adminManagement.routes.js';
import authorProfileRoutes from './src/routes/authorProfile.routes.js';
import followRoutes from './src/routes/follow.routes.js';
import ghostAuthorRoutes from './src/routes/ghostAuthor.routes.js';
import likeRoutes from './src/routes/like.routes.js';

import { noSqlSanitize, xssSanitizer, paramPollution, securityHeaders, suspiciousPatternLogger } from './src/middleware/security.js';
import { apiLimiter, loginLimiter, searchLimiter, uploadLimiter } from './src/middleware/rateLimiter.js';
import { testEmailConnection } from './src/utils/emailService.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
connectDB();
initGridFS();

mongoose.connection.once('open', async () => {
  try {
    const col = mongoose.connection.db.collection('users');
    const indexes = await col.indexes();
    if (indexes.some(i => i.name === 'email_1' && !i.partialFilterExpression)) await col.dropIndex('email_1').catch(() => {});
    if (indexes.some(i => i.name === 'studentId_1' && !i.partialFilterExpression)) await col.dropIndex('studentId_1').catch(() => {});
  } catch (err) { console.log('Index check:', err.message); }
});

(async () => {
  const r = await testEmailConnection();
  console.log(r.success ? '✅ Email ready' : `❌ Email: ${r.error}`);
})();

const ALLOWED_ORIGINS = [
  'https://conserve-repository.onrender.com',
  'https://conserve-repository.vercel.app',
  'https://con-serve-repository.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin && !isProd) return cb(null, true);
    if (!origin) return cb(new Error('Origin required'), false);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

app.use(helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"], styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "blob:"], connectSrc: ["'self'", ...ALLOWED_ORIGINS, "https://api.cloudinary.com"], fontSrc: ["'self'", "https://fonts.gstatic.com"], objectSrc: ["'none'"], frameSrc: ["'none'"], upgradeInsecureRequests: isProd ? [] : null } },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false
}));

app.use(securityHeaders);
app.use((req, res, next) => {
  const o = req.headers.origin;
  if (o && ALLOWED_ORIGINS.includes(o)) { res.setHeader('Access-Control-Allow-Origin', o); res.setHeader('Access-Control-Allow-Credentials', 'true'); }
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});
app.use(suspiciousPatternLogger);
app.use(noSqlSanitize);
app.use(xssSanitizer);
app.use(paramPollution);
app.use(compression());
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => res.json({ message: 'ConServe API', status: 'running', timestamp: new Date().toISOString() }));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/api/auth',              authRoutes);
app.use('/api/auth/login',        loginLimiter);
app.use('/api/research',          researchRoutes);
app.use('/api/research',          uploadLimiter);
app.use('/api/deleted-users',     deletedUsersRoutes);
app.use('/api/users',             userRoutes);
app.use('/api/bookmarks',         bookmarkRoutes);
app.use('/api/reviews',           reviewRoutes);
app.use('/api/analytics',         analyticsRoutes);
app.use('/api/settings',          settingsRoutes);
app.use('/api/valid-student-ids', validStudentIdRoutes);
app.use('/api/valid-faculty-ids', validFacultyIdRoutes);
app.use('/api/team',              teamRoutes);
app.use('/api/notifications',     notificationRoutes);
app.use('/api/bulk-upload',       bulkUploadRoutes);
app.use('/api/search',            searchLimiter, searchRoutes);
app.use('/api/research',          awardsRoutes);
app.use('/api/reports',           reportRoutes);
app.use('/api/admin-management',  adminManagementRoutes);
app.use('/api/author-profiles',   authorProfileRoutes);
app.use('/api/follows',           followRoutes);
app.use('/api/ghost-authors',     ghostAuthorRoutes);
app.use('/api/likes',             likeRoutes);
app.use('/api',                   apiLimiter);

app.use((req, res) => res.status(404).json({ error: 'Route not found', path: req.originalUrl }));
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (err.message?.includes('CORS') || err.message?.includes('Origin')) return res.status(403).json({ error: 'Access denied' });
  res.status(err.status || 500).json({ error: isProd ? 'An error occurred' : err.message });
});

app.listen(PORT, '0.0.0.0', () => console.log(`\n🚀 ConServe API :${PORT} | ${process.env.NODE_ENV || 'dev'}\n`));
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
process.on('unhandledRejection', (r) => console.error('Unhandled:', r));
process.on('uncaughtException', (e) => { console.error('Uncaught:', e); process.exit(1); });

export default app;
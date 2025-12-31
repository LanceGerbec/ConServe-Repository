import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
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
import { apiLimiter } from './src/middleware/rateLimiter.js';
import { testEmailConnection } from './src/utils/emailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// TRUST PROXY - MUST BE FIRST
// ============================================
app.set('trust proxy', 1);

// ============================================
// DATABASE CONNECTION
// ============================================
connectDB();
initGridFS();

// ============================================
// EMAIL SERVICE CHECK
// ============================================
(async () => {
  const emailTest = await testEmailConnection();
  if (emailTest.success) {
    console.log('✅ Email service ready');
  } else {
    console.error('❌ Email service error:', emailTest.error);
    console.error('⚠️ Check EMAIL_USER and EMAIL_PASS in .env');
  }
})();

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  'https://conserve-repository.onrender.com',
  'https://conserve-repository.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Allow all origins in development
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// ============================================
// SECURITY HEADERS
// ============================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false
}));

// ============================================
// MANUAL CORS HEADERS (Backup)
// ============================================
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ============================================
// REQUEST LOGGING MIDDLEWARE
// ============================================
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// ============================================
// COMPRESSION & PARSING
// ============================================
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'ConServe API', 
    status: 'running', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ============================================
// API ROUTES - CRITICAL ORDER
// ============================================
console.log('📋 Registering routes...');

// RESEARCH ROUTES MUST BE FIRST (for /:id/pdf to work)
app.use('/api/research', researchRoutes);
console.log('✅ Research routes registered');

app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered');

app.use('/api/users', userRoutes);
console.log('✅ User routes registered');

app.use('/api/bookmarks', bookmarkRoutes);
console.log('✅ Bookmark routes registered');

app.use('/api/reviews', reviewRoutes);
console.log('✅ Review routes registered');

app.use('/api/analytics', analyticsRoutes);
console.log('✅ Analytics routes registered');

app.use('/api/settings', settingsRoutes);
console.log('✅ Settings routes registered');

app.use('/api/valid-student-ids', validStudentIdRoutes);
console.log('✅ Valid Student ID routes registered');

app.use('/api/valid-faculty-ids', validFacultyIdRoutes);
console.log('✅ Valid Faculty ID routes registered');

app.use('/api/team', teamRoutes);
console.log('✅ Team routes registered');

app.use('/api/notifications', notificationRoutes);
console.log('✅ Notification routes registered');

app.use('/api/bulk-upload', bulkUploadRoutes);
console.log('✅ Bulk Upload routes registered');

app.use('/api/search', searchRoutes);
console.log('✅ Search routes registered');

// Rate limiting for all API routes
app.use('/api', apiLimiter);
console.log('✅ Rate limiter applied');

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  console.log('❌ 404 Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.originalUrl, 
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack || err);
  
  // Don't send stack trace in production
  const errorResponse = {
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  };
  
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }
  
  res.status(err.status || 500).json(errorResponse);
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 ConServe Server Started`);
  console.log('='.repeat(60));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🔒 GridFS: ${process.env.MONGO_URI ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log('\n📋 Registered Routes:');
  console.log('   ✅ POST   /api/auth/register');
  console.log('   ✅ POST   /api/auth/login');
  console.log('   ✅ GET    /api/research (list)');
  console.log('   ✅ GET    /api/research/:id (details)');
  console.log('   ✅ GET    /api/research/:id/pdf (stream PDF)');
  console.log('   ✅ POST   /api/research (submit)');
  console.log('   ✅ PATCH  /api/research/:id/status');
  console.log('   ✅ GET    /api/bookmarks/my-bookmarks');
  console.log('   ✅ POST   /api/bookmarks/toggle/:id');
  console.log('   ✅ GET    /api/reviews/:researchId');
  console.log('   ✅ POST   /api/reviews (submit)');
  console.log('   ✅ GET    /api/analytics/dashboard');
  console.log('   ✅ GET    /api/settings');
  console.log('   ✅ GET    /api/notifications');
  console.log('   ✅ GET    /api/users (admin)');
  console.log('   ✅ POST   /api/search/advanced');
  console.log('='.repeat(60) + '\n');
  
  // Log important warnings
  if (!process.env.MONGO_URI) {
    console.error('⚠️  WARNING: MONGO_URI not set!');
  }
  if (!process.env.JWT_SECRET) {
    console.error('⚠️  WARNING: JWT_SECRET not set!');
  }
  if (!process.env.EMAIL_USER) {
    console.error('⚠️  WARNING: EMAIL_USER not set - emails will fail!');
  }
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// ============================================
// UNHANDLED REJECTIONS
// ============================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export default app;
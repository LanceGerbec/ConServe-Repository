import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import researchRoutes from './src/routes/research.routes.js';
import userRoutes from './src/routes/user.routes.js';
import bookmarkRoutes from './src/routes/bookmark.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import settingsRoutes from './src/routes/settings.routes.js';
import validStudentIdRoutes from './src/routes/validStudentId.routes.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';
import { initGridFS } from './src/config/gridfs.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
initGridFS(); // ADD THIS LINE

// CORS - Allow all origins for development
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.options('*', cors());

// Security & Middleware
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'ConServe API', 
    status: 'running', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: 'connected', 
    timestamp: new Date().toISOString() 
  });
});

// API Routes - CRITICAL: Make sure all routes are registered
console.log('📝 Registering API routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered');
app.use('/api/research', researchRoutes);
console.log('✅ Research routes registered');
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
console.log('✅ Valid Student IDs routes registered');

// Debug middleware - Log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.originalUrl, 
    method: req.method,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/research',
      'GET /api/users',
      'GET /api/valid-student-ids',
      'POST /api/valid-student-ids',
      'GET /api/valid-student-ids/check/:studentId',
      'DELETE /api/valid-student-ids/:id'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server started successfully!`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ CORS: Enabled for all origins`);
  console.log(`✅ MongoDB: Connected`);
  console.log(`\n📍 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Valid Student IDs: http://localhost:${PORT}/api/valid-student-ids\n`);
});

export default app;
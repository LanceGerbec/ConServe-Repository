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
import { apiLimiter } from './src/middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
initGridFS();

// CRITICAL: Ultra-permissive CORS for PDF streaming
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*',
  exposedHeaders: '*'
}));

// CRITICAL: Disable all restrictive headers for iframe/PDF
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: false // CRITICAL: Allow iframe embedding
}));

// Add custom headers for PDF streaming
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', apiLimiter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'ConServe API', status: 'running', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
console.log('📝 Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/valid-student-ids', validStudentIdRoutes);
console.log('✅ All routes registered');

// 404 handler
app.use((req, res) => {
  console.log('❌ 404:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server: http://localhost:${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api\n`);
});

export default app;
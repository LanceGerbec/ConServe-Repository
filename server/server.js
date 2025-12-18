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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      /\.vercel\.app$/,
      /con-serve-repository.*\.vercel\.app$/
    ];
    if (!origin) return callback(null, true);
    const isAllowed = allowed.some(p => typeof p === 'string' ? origin === p : p.test(origin));
    isAllowed ? callback(null, true) : callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', apiLimiter);

app.get('/', (req, res) => {
  res.json({ 
    message: 'ConServe API', 
    status: 'running', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      research: '/api/research',
      users: '/api/users',
      validStudentIds: '/api/valid-student-ids'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: 'connected', 
    timestamp: new Date().toISOString() 
  });
});

// CRITICAL: Register all routes
app.use('/api/auth', authRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/valid-student-ids', validStudentIdRoutes); // THIS IS THE IMPORTANT LINE

app.use((req, res) => {
  console.log('❌ 404:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message 
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
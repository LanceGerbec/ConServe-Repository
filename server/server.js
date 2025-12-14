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
import twoFactorRoutes from './src/routes/twoFactor.routes.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - ALLOW ALL VERCEL PREVIEW URLS
app.use(cors({
  origin: (origin, callback) => {
    // Allow no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel preview URLs and main domain
    if (
      origin.includes('.vercel.app') ||
      origin === 'http://localhost:5173' ||
      origin === 'http://localhost:3000'
    ) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.options('*', cors());

app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', apiLimiter);

app.get('/', (req, res) => {
  res.json({ 
    message: 'ConServe API Server',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: 'connected',
    cors: 'enabled for all Vercel URLs'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/2fa', twoFactorRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ CORS: Enabled for all Vercel URLs (*.vercel.app)`);
  console.log(`✅ MongoDB: Connecting...`);
});

export default app;
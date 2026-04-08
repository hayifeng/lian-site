import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import photoRoutes from './routes/photos.js';
import docsRoutes from './routes/docs.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger, performanceMonitor } from './middleware/logger.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging and monitoring
app.use(requestLogger);
app.use(performanceMonitor);

// Static file serving for uploads
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

// Health check with system info
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

// API info
app.get('/api', (_req, res) => {
  res.json({
    name: 'Photo Sharing API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user (auth required)',
        'PUT /api/auth/profile': 'Update profile (auth required)',
      },
      photos: {
        'GET /api/photos/public': 'Get public photos (paginated)',
        'POST /api/photos/upload': 'Upload photo (auth required)',
        'GET /api/photos': 'Get user photos (auth required)',
        'GET /api/photos/:id': 'Get single photo',
        'PUT /api/photos/:id': 'Update photo (auth required)',
        'DELETE /api/photos/:id': 'Delete photo (auth required)',
      },
    },
    documentation: '/api/docs',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/docs', docsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Photo Sharing API Server                             ║
║                                                           ║
║   Environment: ${NODE_ENV.padEnd(43)}║
║   Port: ${String(PORT).padEnd(48)}║
║   URL: http://localhost:${PORT}                            ║
║                                                           ║
║   Endpoints:                                              ║
║   • GET  /api/health - Health check                       ║
║   • POST /api/auth/register - Register user               ║
║   • POST /api/auth/login - Login user                     ║
║   • GET  /api/photos/public - Get public photos          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export { prisma };

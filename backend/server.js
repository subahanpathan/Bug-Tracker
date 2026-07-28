import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import { initializeSocketHandlers } from './utils/socketManager.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import bugRoutes from './routes/bugRoutes.js';
import userRoutes from './routes/userRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import attachmentRoutes from './routes/attachmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import filterRoutes from './routes/filterRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import emailPreferenceRoutes from './routes/emailPreferenceRoutes.js';

// Initialize Express App & HTTP Server
const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ MIDDLEWARE ============

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
const rawOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'];

const allowedOrigins = rawOrigins.map(o => o.trim());

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      process.env.NODE_ENV === 'development' ||
      /\.vercel\.app$/.test(origin) ||
      /\.onrender\.com$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

// Initialize Socket.IO Event Handlers
initializeSocketHandlers(io);
app.set('io', io);

// Request/Response Logger Middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    console.log(`[RESPONSE] ${req.method} ${req.originalUrl} - ${res.statusCode}`);
  });
  next();
});

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============ ROOT & HEALTH ENDPOINTS (UNLIMITED / NO RATE LIMIT) ============

// Root API Status Endpoint (GET & HEAD)
app.route('/')
  .get((req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Bug Tracker API is running'
    });
  })
  .head((req, res) => {
    res.status(200).end();
  });

// Health Check Endpoints (GET & HEAD)
app.route('/health')
  .get((req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  })
  .head((req, res) => {
    res.status(200).end();
  });

app.route('/api/health')
  .get((req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  })
  .head((req, res) => {
    res.status(200).end();
  });

// ============ RATE LIMITING FOR API ROUTES ============

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// ============ API ROUTES ============

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api', activityRoutes);
app.use('/api', emailPreferenceRoutes);

// ============ ERROR HANDLING ============

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============ SERVER START ============

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     Bug Tracker API Server Running     ║
╠════════════════════════════════════════╣
║  Port: ${PORT}                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}        ║
║  Root Endpoint: http://localhost:${PORT}/  ║
║  Health Endpoint: http://localhost:${PORT}/health
╚════════════════════════════════════════╝
  `);
});

export default app;


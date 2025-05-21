// Main Express application

import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync } from 'node:fs';

// Import middleware
import { securityHeadersMiddleware } from './middleware/security.js';
import { sessionMiddleware } from './middleware/session.js';
import { errorHandlerMiddleware } from './middleware/error-handler.js';

// Import routes
import apiRoutes from './routes/api.js';
import paymentRoutes from './routes/payment.js';
import debugRoutes from './routes/debug.js';
import mockPaymentRoutes from './routes/mock-payment-routes.js';

// Import utils
import { logger } from './utils/logger.js';
import { config } from './utils/config.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Go up one level from /src/backend to reach /src, then into frontend
const FRONTEND_DIR = join(__dirname, '../frontend');
console.log('Frontend directory:', FRONTEND_DIR);

// Verify the frontend directory exists
try {
  const files = readdirSync(FRONTEND_DIR);
  console.log('Frontend files:', files);
} catch (err) {
  console.error('Error reading frontend directory:', err);
  process.exit(1);
}

const app = express();

// Serve static files from the frontend directory
app.use(express.static(FRONTEND_DIR, {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['html', 'htm'],
  index: 'index.html',
  maxAge: '1d',
  redirect: true,
  setHeaders: (res, path) => {
    res.set('x-timestamp', Date.now().toString());
  }
}));

// Test endpoint to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Middleware
app.use(express.json());
app.use(session(sessionConfig));
app.use(securityHeadersMiddleware);
app.use(sessionMiddleware);

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Pay-Proof, X-USER-ID, X-Session-ID');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// API Routes - must come before the SPA fallback
app.use('/api', apiRoutes);
app.use('/payment', paymentRoutes);
app.use('/debug', debugRoutes);

// Mock payment routes (only in development or when MOCK_PAYMENT_ENABLED is true)
if (process.env.NODE_ENV === 'development' || process.env.MOCK_PAYMENT_ENABLED === 'true') {
  app.use(mockPaymentRoutes);
  logger.info('Mock payment routes enabled');
}

// Serve the frontend index.html for the root route
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: FRONTEND_DIR });
});

// Fallback for SPA routing - serve index.html for any other GET request
// This must be the last route
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: FRONTEND_DIR });
});

// Error handling middleware
app.use(errorHandlerMiddleware);

export default app;
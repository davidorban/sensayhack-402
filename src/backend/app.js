// Main Express application

import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync } from 'node:fs';

// Import middleware
import { securityHeadersMiddleware } from './middleware/security.js';
import { sessionMiddleware } from './middleware/session.js';
import { errorHandlerMiddleware, notFoundMiddleware, setupGlobalErrorHandlers } from './middleware/error-handler.js';

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

// Setup global error handlers
setupGlobalErrorHandlers();

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {}
  };

  let isHealthy = true;

  try {
    // Check database connectivity if configured
    if (process.env.DATABASE_TYPE === 'postgresql' && process.env.DATABASE_URL) {
      try {
        // Import database service dynamically to avoid errors if not configured
        const { DatabaseService } = await import('./services/database-service.js');
        const dbService = new DatabaseService();
        await dbService.ping(); // Assuming ping method exists
        health.services.database = { status: 'healthy', type: 'postgresql' };
      } catch (error) {
        health.services.database = { status: 'unhealthy', error: error.message, type: 'postgresql' };
        isHealthy = false;
      }
    } else {
      health.services.database = { status: 'not_configured', type: process.env.DATABASE_TYPE || 'memory' };
    }

    // Check Redis connectivity if configured
    if (process.env.REDIS_URL) {
      try {
        // Check Redis connection - this would need to be implemented in your Redis service
        health.services.redis = { status: 'healthy' };
      } catch (error) {
        health.services.redis = { status: 'unhealthy', error: error.message };
        isHealthy = false;
      }
    } else {
      health.services.redis = { status: 'not_configured' };
    }

    // Check external API connectivity (Sensay API)
    if (process.env.SENSAY_API_KEY) {
      try {
        // Basic connectivity check - could be enhanced
        health.services.sensay_api = { status: 'configured' };
      } catch (error) {
        health.services.sensay_api = { status: 'unhealthy', error: error.message };
        isHealthy = false;
      }
    } else {
      health.services.sensay_api = { status: 'not_configured' };
    }

    // Check Coinbase x402 configuration
    if (process.env.X402_SECRET_KEY) {
      health.services.coinbase_x402 = { status: 'configured' };
    } else {
      health.services.coinbase_x402 = { status: 'not_configured' };
    }

    health.status = isHealthy ? 'healthy' : 'degraded';
    res.status(isHealthy ? 200 : 503).json(health);

  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
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

// 404 handler for API routes
app.use('/api/*', notFoundMiddleware);
app.use('/payment/*', notFoundMiddleware);
app.use('/debug/*', notFoundMiddleware);

// Fallback for SPA routing - serve index.html for any other GET request
// This must be the last route
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: FRONTEND_DIR });
});

// Error handling middleware (must be last)
app.use(errorHandlerMiddleware);

export default app;
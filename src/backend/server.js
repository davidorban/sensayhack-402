// Server entry point
import app from './app.js';
import { logger } from './utils/logger.js';
import { persistentSessionStore } from './services/persistent-session-store.js';

const PORT = process.env.PORT || 3000;
let httpServer = null;

// Start the server
const startServer = async () => {
  // Initialize persistent session store
  await persistentSessionStore.initialize();
  
  httpServer = app.listen(PORT, async () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    
    const sessionCount = await persistentSessionStore.getSessionCount();
    const paymentsCount = await persistentSessionStore.getPendingPaymentsCount();
    const receiptsCount = await persistentSessionStore.getReceiptCacheCount();
    
    logger.info(`Active sessions: ${sessionCount}`);
    logger.info(`Pending payments: ${paymentsCount}`);
    logger.info(`Cached receipts: ${receiptsCount}`);
  });
};

// Start the server
startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

// Handle graceful shutdown
const shutdown = async () => {
  logger.info('Shutdown signal received. Shutting down gracefully...');
  
  try {
    // Close the HTTP server
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close(err => {
          if (err) {
            logger.error('Error closing server:', err);
            return reject(err);
          }
          logger.info('HTTP server closed');
          resolve();
        });
      });
    }
    
    // Close persistent session store
    await persistentSessionStore.close();
    
    // Add any additional cleanup here
    logger.info('Cleanup complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Export for testing
if (process.env.NODE_ENV === 'test') {
  module.exports = app;
}
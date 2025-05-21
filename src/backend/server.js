// Server entry point
import app from './app.js';
import { logger } from './utils/logger.js';
import { sessionStore } from './services/session-store.js';

const PORT = process.env.PORT || 3000;
let httpServer = null;

// Start the server
httpServer = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Active sessions: ${sessionStore.getSessionCount()}`);
  logger.info(`Pending payments: ${sessionStore.getPendingPaymentsCount()}`);
  logger.info(`Cached receipts: ${sessionStore.getReceiptCacheCount()}`);
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
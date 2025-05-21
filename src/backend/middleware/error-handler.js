// Error handling middleware
import { logger } from '../utils/logger.js';

/**
 * Global error handling middleware
 */
export function errorHandlerMiddleware(err, req, res, next) {
  // Log detailed error information
  const errorDetails = {
    error: err.stack || err.toString(),
    message: err.message,
    code: err.code,
    originalError: err.originalError ? err.originalError.message : undefined,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    path: err.path,
    syscall: err.syscall,
    errno: err.errno
  };
  
  logger.error('Unhandled error:', errorDetails);
  
  // In development, return more detailed error information
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
      details: errorDetails,
      timestamp: new Date().toISOString()
    });
  }
  
  // In production, return a generic error message
  res.status(500).json({
    status: 'error',
    error: 'Internal server error',
    message: 'Something went wrong',
    timestamp: new Date().toISOString()
  });
}
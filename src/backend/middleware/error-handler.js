// Enhanced error handling middleware
import { logger } from '../utils/logger.js';
import { AppError, normalizeError, logError } from '../utils/error-types.js';

/**
 * Enhanced error handling middleware
 */
export const errorHandlerMiddleware = (err, req, res, next) => {
  // Normalize the error to our custom error types
  const normalizedError = normalizeError(err, {
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Log the error with appropriate level
  logError(normalizedError, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.session?.userId,
    requestId: req.id
  });

  // Prepare error response
  const errorResponse = {
    status: 'error',
    error: {
      message: normalizedError.message,
      code: normalizedError.code,
      type: normalizedError.name
    },
    timestamp: normalizedError.timestamp,
    path: req.path
  };

  // Add request ID if available
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  // Add details for specific error types
  if (normalizedError.details && Object.keys(normalizedError.details).length > 0) {
    errorResponse.details = normalizedError.details;
  }

  // Add stack trace and full error info in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.debug = {
      stack: normalizedError.stack,
      originalError: err.message !== normalizedError.message ? err.message : undefined
    };
  }

  // Special handling for payment required errors
  if (normalizedError.statusCode === 402) {
    // Add payment-specific headers
    if (normalizedError.details.paymentUrl) {
      res.set('Pay', normalizedError.details.paymentUrl);
    }
    if (normalizedError.details.amount) {
      res.set('Pay-Amount', normalizedError.details.amount.toString());
    }
    if (normalizedError.details.asset) {
      res.set('Pay-Asset', normalizedError.details.asset);
    }
  }

  // Special handling for rate limit errors
  if (normalizedError.statusCode === 429) {
    if (normalizedError.details.retryAfter) {
      res.set('Retry-After', normalizedError.details.retryAfter.toString());
    }
  }

  // Send the error response
  res.status(normalizedError.statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler middleware
 */
export const notFoundMiddleware = (req, res, next) => {
  const error = new AppError(
    `Route ${req.method} ${req.path} not found`,
    404,
    'NOT_FOUND',
    {
      method: req.method,
      path: req.path,
      availableRoutes: [] // Could be populated with actual routes
    }
  );
  next(error);
};

/**
 * Global uncaught exception handler
 */
export const setupGlobalErrorHandlers = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Give the logger time to write, then exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
      timestamp: new Date().toISOString()
    });
    
    // Log but don't exit for unhandled rejections
  });
};

export default errorHandlerMiddleware;
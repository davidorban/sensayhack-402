// Custom error types for better error handling
import { logger } from './logger.js';

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

/**
 * Validation error - 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(message, field = null, value = null) {
    super(message, 400, 'VALIDATION_ERROR', {
      field,
      value: value ? String(value).substring(0, 100) : null
    });
  }
}

/**
 * Authentication error - 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization error - 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not found error - 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id = null) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND_ERROR', { resource, id });
  }
}

/**
 * Payment required error - 402 Payment Required
 */
export class PaymentRequiredError extends AppError {
  constructor(message = 'Payment required', paymentDetails = {}) {
    super(message, 402, 'PAYMENT_REQUIRED', paymentDetails);
  }
}

/**
 * Payment error - 400 Bad Request with payment context
 */
export class PaymentError extends AppError {
  constructor(message, paymentId = null, details = {}) {
    super(message, 400, 'PAYMENT_ERROR', { paymentId, ...details });
  }
}

/**
 * External service error - 502 Bad Gateway
 */
export class ExternalServiceError extends AppError {
  constructor(service, message, originalError = null) {
    super(
      `External service error: ${service} - ${message}`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      {
        service,
        originalMessage: message,
        originalError: originalError?.message
      }
    );
  }
}

/**
 * Database error - 500 Internal Server Error
 */
export class DatabaseError extends AppError {
  constructor(operation, message, originalError = null) {
    super(
      `Database error during ${operation}: ${message}`,
      500,
      'DATABASE_ERROR',
      {
        operation,
        originalMessage: message,
        originalError: originalError?.message
      }
    );
  }
}

/**
 * Configuration error - 500 Internal Server Error
 */
export class ConfigurationError extends AppError {
  constructor(setting, message = 'Invalid configuration') {
    super(
      `Configuration error: ${setting} - ${message}`,
      500,
      'CONFIGURATION_ERROR',
      { setting }
    );
  }
}

/**
 * Rate limit error - 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  constructor(limit, windowMs, retryAfter = null) {
    super(
      `Rate limit exceeded: ${limit} requests per ${windowMs}ms`,
      429,
      'RATE_LIMIT_ERROR',
      {
        limit,
        windowMs,
        retryAfter
      }
    );
  }
}

/**
 * Timeout error - 408 Request Timeout
 */
export class TimeoutError extends AppError {
  constructor(operation, timeoutMs) {
    super(
      `Operation timed out: ${operation} (${timeoutMs}ms)`,
      408,
      'TIMEOUT_ERROR',
      { operation, timeoutMs }
    );
  }
}

/**
 * Helper function to create appropriate error based on context
 */
export function createError(type, message, details = {}) {
  const errorMap = {
    validation: ValidationError,
    authentication: AuthenticationError,
    authorization: AuthorizationError,
    not_found: NotFoundError,
    payment_required: PaymentRequiredError,
    payment: PaymentError,
    external_service: ExternalServiceError,
    database: DatabaseError,
    configuration: ConfigurationError,
    rate_limit: RateLimitError,
    timeout: TimeoutError
  };

  const ErrorClass = errorMap[type] || AppError;
  return new ErrorClass(message, details);
}

/**
 * Helper function to handle and normalize errors from external sources
 */
export function normalizeError(error, context = {}) {
  // If it's already one of our custom errors, return as-is
  if (error instanceof AppError) {
    return error;
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return new ValidationError(error.message, context.field, context.value);
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new TimeoutError(context.operation || 'Unknown operation', context.timeout || 0);
  }

  if (error.response?.status === 401) {
    return new AuthenticationError(error.message);
  }

  if (error.response?.status === 403) {
    return new AuthorizationError(error.message);
  }

  if (error.response?.status === 404) {
    return new NotFoundError(context.resource || 'Resource', context.id);
  }

  if (error.response?.status === 402) {
    return new PaymentRequiredError(error.message, context.paymentDetails);
  }

  // Database errors
  if (error.code && (error.code.startsWith('23') || error.code.startsWith('42'))) {
    return new DatabaseError(context.operation || 'Unknown', error.message, error);
  }

  // External service errors (HTTP errors)
  if (error.response && error.response.status >= 500) {
    return new ExternalServiceError(
      context.service || 'Unknown service',
      error.message,
      error
    );
  }

  // Default to generic AppError
  return new AppError(
    error.message || 'An unexpected error occurred',
    error.statusCode || 500,
    error.code || 'UNKNOWN_ERROR',
    { originalError: error.message, context }
  );
}

/**
 * Helper function to log errors with appropriate level
 */
export function logError(error, context = {}) {
  const logData = {
    error: error.toJSON ? error.toJSON() : error,
    context,
    timestamp: new Date().toISOString()
  };

  if (error.statusCode >= 500) {
    logger.error('Server error:', logData);
  } else if (error.statusCode >= 400) {
    logger.warn('Client error:', logData);
  } else {
    logger.info('Handled error:', logData);
  }
}
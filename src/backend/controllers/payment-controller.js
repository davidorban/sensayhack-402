// Payment controller
import { coinbaseService } from '../services/coinbase-service.js';
import { sessionStore } from '../services/session-store.js';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';
import retry from 'async-retry';

// Constants
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 5000; // 5 seconds

/**
 * Payment Controller for handling payment verification and status checks
 */
export const PaymentController = {
  /**
   * Verify a payment using Coinbase x402 proof with retry logic
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyPayment(req, res) {
    const startTime = Date.now();
    const { proof, userId } = req.body;
    const effectiveUserId = userId || req.session?.userId;
    const requestTimestamp = new Date().toISOString();
    const logContext = {
      requestId: req.id || 'none',
      userId: effectiveUserId,
      proof: proof ? `${proof.substring(0, 8)}...` : 'none',
      timestamp: requestTimestamp
    };

    logger.info('Payment verification request received', logContext);
    
    // Input validation
    if (!proof) {
      const error = new Error('Payment proof is required');
      error.statusCode = 400;
      throw error;
    }

    if (!effectiveUserId) {
      const error = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    try {
      // Verify the payment with Coinbase with retry logic for transient failures
      const isValid = await retry(
        async (bail) => {
          try {
            const result = await coinbaseService.validateUserPayment(effectiveUserId, proof);
            logger.debug('Payment validation result', { ...logContext, result });
            return result;
          } catch (error) {
            // Don't retry on validation or authentication errors (4xx)
            if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
              logger.warn('Non-retriable error during payment validation', {
                ...logContext,
                error: error.message,
                statusCode: error.statusCode
              });
              return bail(error);
            }
            
            logger.warn('Retriable error during payment validation', {
              ...logContext,
              error: error.message,
              stack: error.stack,
              attempt: logContext.attempt || 1
            });
            throw error; // Will trigger a retry
          }
        },
        {
          retries: MAX_RETRIES,
          minTimeout: INITIAL_RETRY_DELAY,
          maxTimeout: MAX_RETRY_DELAY,
          factor: 2,
          onRetry: (error, attempt) => {
            logContext.attempt = attempt;
            logger.info(`Retry attempt ${attempt}/${MAX_RETRIES} for payment verification`, {
              ...logContext,
              error: error.message
            });
          }
        }
      );
      
      if (!isValid) {
        const error = new Error('Invalid or expired payment proof');
        error.statusCode = 402;
        error.suggestion = 'Please initiate a new payment request.';
        throw error;
      }
      
      // Get the payment info from session
      const paymentInfo = sessionStore.getPaymentInfo(effectiveUserId);
      
      if (!paymentInfo) {
        const error = new Error('Payment information not found in session');
        error.statusCode = 404;
        throw error;
      }
      
      const responseData = {
        status: 'success',
        message: 'Payment verified successfully',
        paymentId: paymentInfo.invoiceId,
        amount: paymentInfo.amount,
        asset: paymentInfo.asset,
        timestamp: paymentInfo.paidAt || new Date().toISOString(),
        userId: paymentInfo.userId,
        metadata: {
          paymentMethod: 'coinbase',
          transactionId: paymentInfo.invoiceId,
          invoiceId: paymentInfo.invoiceId,
          processingTimeMs: Date.now() - startTime
        }
      };
      
      logger.info('Payment verification successful', {
        ...logContext,
        paymentId: paymentInfo.invoiceId,
        amount: paymentInfo.amount,
        asset: paymentInfo.asset,
        processingTimeMs: responseData.metadata.processingTimeMs
      });
      
      res.json(responseData);
      
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const errorResponse = {
        status: 'error',
        error: error.message || 'Failed to verify payment',
        timestamp: new Date().toISOString(),
        requestId: req.id,
        ...(error.suggestion && { suggestion: error.suggestion }),
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
          ...(error.stack && { stack: error.stack })
        })
      };
      
      logger.error('Payment verification failed', {
        ...logContext,
        statusCode,
        error: error.message,
        stack: error.stack,
        processingTimeMs: Date.now() - startTime,
        ...(error.response?.data && { responseData: error.response.data })
      });
      
      res.status(statusCode).json(errorResponse);
    }
  },
  
  /**
   * Check payment status for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  /**
   * Check payment status for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  checkPaymentStatus(req, res) {
    const startTime = Date.now();
    const { userId } = req.params;
    const effectiveUserId = userId || req.session?.userId;
    const logContext = {
      requestId: req.id || 'none',
      userId: effectiveUserId,
      timestamp: new Date().toISOString()
    };

    logger.info('Payment status check requested', logContext);
    
    try {
      if (!effectiveUserId) {
        const error = new Error('User ID is required');
        error.statusCode = 400;
        throw error;
      }
      
      const paymentInfo = sessionStore.getPaymentInfo(effectiveUserId);
      
      if (!paymentInfo) {
        const error = new Error('No payment information found for this user');
        error.statusCode = 404;
        throw error;
      }
      
      const responseData = {
        status: 'success',
        payment: {
          status: paymentInfo.status || 'unknown',
          invoiceId: paymentInfo.invoiceId,
          amount: paymentInfo.amount,
          asset: paymentInfo.asset,
          paidAt: paymentInfo.paidAt,
          proof: paymentInfo.proof ? '***REDACTED***' : undefined
        },
        metadata: {
          userId: effectiveUserId,
          lastUpdated: paymentInfo.updatedAt,
          processingTimeMs: Date.now() - startTime
        }
      };
      
      logger.debug('Payment status retrieved', {
        ...logContext,
        paymentStatus: responseData.payment.status,
        processingTimeMs: responseData.metadata.processingTimeMs
      });
      
      res.json(responseData);
      
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const errorResponse = {
        status: statusCode === 404 ? 'not_found' : 'error',
        error: error.message || 'Failed to check payment status',
        timestamp: new Date().toISOString(),
        requestId: req.id,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
          ...(error.stack && { stack: error.stack })
        })
      };
      
      logger.error('Payment status check failed', {
        ...logContext,
        statusCode,
        error: error.message,
        stack: error.stack,
        processingTimeMs: Date.now() - startTime
      });
      
      res.status(statusCode).json(errorResponse);
    }
  }
};
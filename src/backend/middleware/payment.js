import { coinbaseService } from '../services/coinbase-service.js';
import { logger } from '../utils/logger.js';
import { sessionStore } from '../services/session-store.js';

/**
 * Middleware to check if payment is required and valid
 */
export const requirePayment = async (req, res, next) => {
  const { userId } = req.session;
  const proof = req.headers['pay-proof'];
  const messageId = req.body.metadata?.messageId || generateMessageId();

  try {
    // Check if user has a valid payment session
    const paymentInfo = sessionStore.getPaymentInfo(userId);
    
    if (paymentInfo?.status === 'paid') {
      // Check if the proof is still valid
      if (paymentInfo.proof && paymentInfo.validUntil > Date.now()) {
        return next();
      }
    }

    // If no proof is provided, request payment
    if (!proof) {
      const paymentUrl = await coinbaseService.generatePaymentUrl(userId, messageId);
      
      return res.status(402).set({
        'Pay': paymentUrl
      }).json({
        status: 'payment_required',
        message: 'Payment required to process this message',
        paymentUrl,
        messageId
      });
    }

    // Verify the provided proof
    const isValid = await coinbaseService.validateUserPayment(userId, proof);
    
    if (!isValid) {
      return res.status(402).json({
        status: 'payment_invalid',
        message: 'Invalid or expired payment proof',
        messageId
      });
    }

    // Payment is valid, continue to the next middleware
    next();
  } catch (error) {
    logger.error('Error in payment middleware:', {
      error: error.message,
      userId,
      messageId,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing your payment',
      messageId
    });
  }
};

// Helper function to generate a message ID if not provided
function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

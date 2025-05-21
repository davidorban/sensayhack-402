// Payment controller
import { PaymentService } from '../services/payment-service.js';
import { logger } from '../utils/logger.js';

export const PaymentController = {
  /**
   * Verify a payment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  verifyPayment(req, res) {
    try {
      const { paymentId, proof, userId, amount = '0.01', currency = 'USD' } = req.body;
      const requestTimestamp = new Date().toISOString();
      
      // Input validation
      if (!paymentId) {
        return res.status(400).json({
          status: 'error',
          error: 'Payment ID is required',
          timestamp: requestTimestamp,
          requestId: req.id
        });
      }

      // Verify the payment
      const verificationResult = PaymentService.verifyPayment(
        paymentId, 
        userId || req.session.userId, 
        proof, 
        amount, 
        currency
      );
      
      if (verificationResult.status === 'error') {
        return res.status(404).json({
          status: 'error',
          error: verificationResult.message,
          paymentId,
          timestamp: requestTimestamp,
          requestId: req.id,
          suggestion: 'Please initiate a new payment request.'
        });
      }
      
      // Return success response
      const receipt = verificationResult.receipt;
      res.json({
        status: 'success',
        message: verificationResult.message,
        paymentId,
        userId: receipt.userId,
        amount: receipt.amount,
        currency: receipt.currency,
        timestamp: requestTimestamp,
        requestId: req.id,
        metadata: {
          verifiedAt: receipt.verifiedAt,
          expiresAt: receipt.expiresAt
        }
      });
      
    } catch (error) {
      logger.error('Error in verify payment:', error);
      return res.status(500).json({
        status: 'error',
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.id,
        paymentId: req.body?.paymentId
      });
    }
  },
  
  /**
   * Check payment status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  checkPaymentStatus(req, res) {
    const { paymentId } = req.params;
    const userId = req.query.userId || req.session.userId;
    
    // Check payment status
    const status = PaymentService.checkPaymentStatus(paymentId, userId);
    
    // Handle different status responses
    if (status.status === 'error') {
      return res.status(404).json(status);
    }
    
    return res.json(status);
  }
};
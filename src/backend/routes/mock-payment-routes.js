import { Router } from 'express';
import { PaymentService } from '../services/payment-service.js';
import { sessionStore } from '../services/session-store.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * Mock payment endpoint
 * Simulates a payment and marks it as paid
 */
router.get('/mock-pay', async (req, res) => {
  try {
    const { paymentId } = req.query;
    
    if (!paymentId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Payment ID is required' 
      });
    }

    // Get the payment details
    const paymentDetails = sessionStore.getPendingPayment(paymentId);
    
    if (!paymentDetails) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Payment not found or already processed' 
      });
    }

    const { userId, amount, currency } = paymentDetails;
    
    // Verify the payment (mock verification)
    const verification = await PaymentService.verifyPayment(
      paymentId,
      userId,
      `mock-proof-${Date.now()}`,
      amount,
      currency
    );

    // Get the redirect URL from the original payment details or use a default
    const redirectUrl = paymentDetails.redirectUrl || '/';
    
    // Redirect to success page or return success response
    if (req.accepts('html')) {
      return res.redirect(`${redirectUrl}?payment=success&paymentId=${paymentId}`);
    }
    
    res.json({
      status: 'success',
      message: 'Payment processed successfully',
      paymentId,
      redirectUrl
    });
    
  } catch (error) {
    logger.error('Mock payment error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to process mock payment',
      error: error.message 
    });
  }
});

export default router;

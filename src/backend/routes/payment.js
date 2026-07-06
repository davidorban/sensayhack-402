// Payment routes
import express from 'express';
import { PaymentController } from '../controllers/payment-controller.js';
import { CoinbaseService } from '../services/coinbase-service.js';
import { sessionStore } from '../services/session-store.js';
import { logger } from '../utils/logger.js';
import config from '../config/index.js';

const router = express.Router();

// Payment verification endpoint
router.post('/verify', PaymentController.verifyPayment);

// Payment status endpoint
router.get('/status/:paymentId', PaymentController.checkPaymentStatus);

// Payment details endpoint
router.get('/details/:paymentId', PaymentController.getPaymentDetails);

// Coinbase webhook endpoint for payment notifications
router.post('/webhook/coinbase', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-cc-webhook-signature'];
    const body = req.body;
    
    // Verify webhook signature
    if (!config.coinbase.webhookSecret || !CoinbaseService.verifyWebhookSignature(body, signature)) {
      logger.warn('Invalid webhook signature received');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const event = JSON.parse(body.toString());
    logger.info('Received Coinbase webhook:', {
      type: event.type,
      chargeId: event.data?.id,
      status: event.data?.timeline?.[event.data.timeline.length - 1]?.status
    });
    
    // Handle different event types
    switch (event.type) {
      case 'charge:confirmed':
      case 'charge:resolved':
        await handleChargeConfirmed(event.data);
        break;
      case 'charge:failed':
      case 'charge:delayed':
        await handleChargeFailed(event.data);
        break;
      default:
        logger.info('Unhandled webhook event type:', event.type);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error processing Coinbase webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle successful payment confirmation
async function handleChargeConfirmed(charge) {
  try {
    const userId = charge.metadata?.user_id;
    const messageId = charge.metadata?.message_id;
    
    if (!userId) {
      logger.warn('No user ID found in charge metadata:', charge.id);
      return;
    }
    
    // Update session with confirmed payment
    sessionStore.updatePaymentInfo(userId, {
      status: 'confirmed',
      chargeId: charge.id,
      confirmedAt: new Date().toISOString(),
      amount: charge.pricing?.local?.amount,
      currency: charge.pricing?.local?.currency,
      timeline: charge.timeline
    });
    
    logger.info('Payment confirmed for user:', {
      userId,
      chargeId: charge.id,
      messageId,
      amount: charge.pricing?.local?.amount
    });
  } catch (error) {
    logger.error('Error handling charge confirmation:', error);
  }
}

// Handle failed payment
async function handleChargeFailed(charge) {
  try {
    const userId = charge.metadata?.user_id;
    
    if (!userId) {
      logger.warn('No user ID found in failed charge metadata:', charge.id);
      return;
    }
    
    // Update session with failed payment
    sessionStore.updatePaymentInfo(userId, {
      status: 'failed',
      chargeId: charge.id,
      failedAt: new Date().toISOString(),
      timeline: charge.timeline
    });
    
    logger.info('Payment failed for user:', {
      userId,
      chargeId: charge.id
    });
  } catch (error) {
    logger.error('Error handling charge failure:', error);
  }
}

// Payment completion redirect (from Coinbase hosted page)
router.get('/complete', (req, res) => {
  // Redirect to frontend with success message
  res.redirect('/?payment=success');
});

// Payment cancellation redirect
router.get('/cancel', (req, res) => {
  // Redirect to frontend with cancellation message
  res.redirect('/?payment=cancelled');
});

export default router;

// Export helper functions for testing
export { handleChargeConfirmed, handleChargeFailed };
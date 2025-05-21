// Chat controller
import { SensayService } from '../services/sensay-service.js';
import { PaymentService } from '../services/payment-service.js';
import { sessionStore } from '../services/session-store.js';
import { generateMessageId, generateRequestId } from '../utils/id-generator.js';
import { logger } from '../utils/logger.js';

export const ChatController = {
  /**
   * Process a chat message
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processMessage(req, res) {
    const startTime = process.hrtime();
    const { message, metadata = {} } = req.body;
    const userId = req.session.userId;
    const messageId = metadata.messageId || generateMessageId(userId);
    const requestId = generateRequestId();
    
    // Set response headers
    res.set('X-Request-ID', requestId);
    res.set('X-Message-ID', messageId);
    
    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        error: 'Message is required and must be a non-empty string',
        timestamp: new Date().toISOString(),
        requestId
      });
    }

    try {
      // Get or create user session
      let userSession = sessionStore.getSession(userId);
      if (!userSession) {
        userSession = {
          userId,
          createdAt: new Date(),
          lastActive: new Date(),
          messageCount: 0,
          paymentStatus: {},
          metadata: {}
        };
        sessionStore.setSession(userId, userSession);
      }
      
      // Update session activity
      userSession.lastActive = new Date();
      userSession.messageCount = (userSession.messageCount || 0) + 1;
      sessionStore.setSession(userId, userSession);
      
      // Check if payment is required
      const requiresPayment = PaymentService.checkIfPaymentRequired(userSession);
      
      if (requiresPayment.required) {
        // Create payment request
        const paymentRequest = PaymentService.createPaymentRequest(
          userId, 
          messageId, 
          requiresPayment.amount, 
          'USD'
        );
        
        // Generate a verification URL 
        const verificationUrl = new URL('/payment/verify', `http://${req.headers.host}`);
        verificationUrl.searchParams.append('paymentId', paymentRequest.paymentId);
        verificationUrl.searchParams.append('userId', userId);
        
        return res.status(402).json({
          status: 'payment_required',
          error: 'Payment required to process this message',
          paymentId: paymentRequest.paymentId,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          paymentUrl: `/payment.html?paymentId=${paymentRequest.paymentId}&userId=${encodeURIComponent(userId)}`,
          verifyUrl: verificationUrl.toString(),
          message: 'Please complete the payment to continue chatting.',
          timestamp: new Date().toISOString(),
          requestId,
          metadata: {
            messageLength: message.length,
            messageId,
            userId
          }
        });
      }
      
      // Forward the message to Sensay API
      const response = await SensayService.sendMessage(message, userId, messageId);
      
      // Calculate processing time
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const processingTimeMs = (seconds * 1000) + (nanoseconds / 1e6);
      
      // Log successful processing
      logger.info(`Message processed - User: ${userId}, MessageID: ${messageId}, Time: ${processingTimeMs.toFixed(2)}ms`);
      
      // Return the response
      res.json({
        status: 'success',
        reply: response.reply,
        messageId,
        timestamp: new Date().toISOString(),
        requestId,
        metadata: {
          processingTimeMs: processingTimeMs.toFixed(2),
          messageLength: message.length,
          responseLength: response.reply?.length || 0,
          model: response.model || 'default'
        }
      });
      
    } catch (error) {
      logger.error('Error processing chat message:', {
        error: error.message,
        stack: error.stack,
        userId,
        messageId,
        requestId,
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({ 
        status: 'error',
        error: 'Failed to process message',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId,
        metadata: {
          errorType: error.name,
          messageId,
          userId
        }
      });
    }
  }
};
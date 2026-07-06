// Chat controller
import { SensayService } from '../services/sensay-service.js';
import { PaymentService } from '../services/payment-service.js';
import { persistentSessionStore } from '../services/persistent-session-store.js';
import { generateMessageId, generateRequestId } from '../utils/id-generator.js';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';
import { validateSchema, CommonSchemas } from '../utils/validation.js';
import { ValidationError, ExternalServiceError, DatabaseError } from '../utils/error-types.js';

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
    
    // Input validation using schema
    try {
      validateSchema({ message }, CommonSchemas.chatMessage);
    } catch (error) {
      throw error; // Will be handled by error middleware
    }

    try {
      // Get or create user session
      let userSession = await persistentSessionStore.getSession(userId);
      if (!userSession) {
        userSession = {
          userId,
          createdAt: new Date(),
          lastActive: new Date(),
          messageCount: 0,
          paymentStatus: {},
          metadata: {}
        };
        await persistentSessionStore.setSession(userId, userSession);
      }
      
      // Update session activity
      userSession.lastActive = new Date();
      userSession.messageCount = (userSession.messageCount || 0) + 1;
      await persistentSessionStore.setSession(userId, userSession);
      
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
        
        // Set X402 protocol headers if available
        if (paymentRequest.x402) {
          for (const [key, value] of Object.entries(paymentRequest.x402)) {
            res.set(key, value);
          }
        }
        
        // Ensure we always have a payment URL
        const fallbackPaymentUrl = `/payment.html?paymentId=${paymentRequest.paymentId}&userId=${encodeURIComponent(userId)}`;
        
        return res.status(402).json({
          status: 'payment_required',
          error: 'Payment required to process this message',
          paymentId: paymentRequest.paymentId,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          asset: paymentRequest.asset || 'usdc',
          chain: paymentRequest.chain || 'base',
          walletAddress: paymentRequest.walletAddress,
          // Ensure paymentUrl is always set, falling back to paymentHtml if needed
          paymentUrl: paymentRequest.paymentUrl || fallbackPaymentUrl,
          qrCode: paymentRequest.qrCode,
          verifyUrl: verificationUrl.toString(),
          paymentHtml: fallbackPaymentUrl,
          message: 'Please complete the payment to continue chatting.',
          instructions: paymentRequest.instructions || 'Complete the payment to continue',
          timestamp: new Date().toISOString(),
          requestId,
          metadata: {
            messageLength: message.length,
            messageId,
            userId,
            paymentType: paymentRequest.paymentType
          }
        });
      }
      
      // Forward the message to Sensay API
      let response;
      try {
        response = await SensayService.sendMessage(message, userId, messageId);
      } catch (error) {
        throw new ExternalServiceError('Sensay API', error.message, error);
      }
      
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
  },

  /**
   * Process a test chat message with mock responses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processTestMessage(req, res) {
    const startTime = process.hrtime();
    const { message, metadata = {} } = req.body;
    const userId = req.session.userId;
    const messageId = metadata.messageId || generateMessageId(userId);
    const requestId = generateRequestId();
    
    // Set response headers
    res.set('X-Request-ID', requestId);
    res.set('X-Message-ID', messageId);
    res.set('X-Test-Mode', 'true');
    
    // Input validation using schema
    try {
      validateSchema({ message }, CommonSchemas.chatMessage);
    } catch (error) {
      throw error; // Will be handled by error middleware
    }

    try {
      // Get or create user session
      let userSession = await persistentSessionStore.getSession(userId);
      if (!userSession) {
        userSession = {
          userId,
          createdAt: new Date(),
          lastActive: new Date(),
          messageCount: 0,
          paymentStatus: {},
          metadata: {}
        };
        await persistentSessionStore.setSession(userId, userSession);
      }
      
      // Update session activity
      userSession.lastActive = new Date();
      userSession.messageCount = (userSession.messageCount || 0) + 1;
      await persistentSessionStore.setSession(userId, userSession);
      
      // Skip payment check for test mode
      
      // Generate mock response instead of calling real Sensay API
      let mockReply;
      if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        mockReply = 'Hello! This is a test response from the mock replica. How can I help you today?';
      } else if (message.toLowerCase().includes('help')) {
        mockReply = 'I can help you with information, answering questions, and assisting with various tasks. This is a test response.';
      } else if (message.toLowerCase().includes('test')) {
        mockReply = 'This is indeed a test response. The test replica is working correctly!';
      } else {
        mockReply = `This is a mock response from the test replica. You said: "${message}". In a real environment, this would be processed by the actual AI service.`;
      }
      
      // Calculate processing time
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const processingTimeMs = (seconds * 1000) + (nanoseconds / 1e6);
      
      // Log successful processing
      logger.info(`Test message processed - User: ${userId}, MessageID: ${messageId}, Time: ${processingTimeMs.toFixed(2)}ms`);
      
      // Return the mock response
      res.json({
        status: 'success',
        reply: mockReply,
        messageId,
        timestamp: new Date().toISOString(),
        requestId,
        metadata: {
          processingTimeMs: processingTimeMs.toFixed(2),
          messageLength: message.length,
          responseLength: mockReply.length,
          model: 'mock-model-test',
          isTestMode: true
        }
      });
      
    } catch (error) {
      logger.error('Error processing test chat message:', {
        error: error.message,
        stack: error.stack,
        userId,
        messageId,
        requestId,
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({ 
        status: 'error',
        error: 'Failed to process test message',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId,
        metadata: {
          errorType: error.name,
          messageId,
          userId,
          isTestMode: true
        }
      });
    }
  }
};
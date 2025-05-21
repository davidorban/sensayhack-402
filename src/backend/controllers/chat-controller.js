// Chat controller
import { SensayService } from '../services/sensay-service.js';
import { PaymentService } from '../services/payment-service.js';
import { sessionStore } from '../services/session-store.js';
import { generateMessageId, generateRequestId } from '../utils/id-generator.js';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';

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
        
        // Set X402 protocol headers if available
        if (paymentRequest.x402) {
          Object.entries(paymentRequest.x402).forEach(([key, value]) => {
            res.set(key, value);
          });
        }
        
        return res.status(402).json({
          status: 'payment_required',
          error: 'Payment required to process this message',
          paymentId: paymentRequest.paymentId,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          asset: paymentRequest.asset || 'usdc',
          chain: paymentRequest.chain || 'base',
          walletAddress: paymentRequest.walletAddress,
          paymentUrl: paymentRequest.paymentUrl,
          qrCode: paymentRequest.qrCode,
          verifyUrl: verificationUrl.toString(),
          paymentHtml: `/payment.html?paymentId=${paymentRequest.paymentId}&userId=${encodeURIComponent(userId)}`,
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
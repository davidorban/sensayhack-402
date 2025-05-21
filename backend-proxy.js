// Basic Express.js proxy to enforce Coinbase x402 before accessing Sensay API

import express from 'express';
import session from 'express-session';
import axios from 'axios';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// Server configuration
const PORT = process.env.PORT || 3000;
let httpServer = null; // Will hold the HTTP server instance

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// In-memory storage for verified payments (use Redis in production)
// In-memory store for verified payment receipts (paymentId -> receiptData)
const receiptCache = new Map();
const pendingPayments = new Map();

// In-memory storage for active sessions (use a database in production)
const activeSessions = new Map();

// Helper function to generate a payment ID
function generatePaymentId() {
  return `pay_${crypto.randomBytes(8).toString('hex')}`;
}

// Helper function to clean up old sessions
function cleanupOldSessions() {
  const now = new Date();
  const maxInactiveTime = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [userId, session] of activeSessions.entries()) {
    if (now - session.lastActive > maxInactiveTime) {
      activeSessions.delete(userId);
      console.log(`Cleaned up inactive session: ${userId}`);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000);

// Middleware
app.use(express.static(__dirname));
app.use(express.json());
app.use(session(sessionConfig));

// Security headers middleware
app.use((req, res, next) => {
  // Set Content Security Policy with frame-ancestors and safer script handling
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src *; frame-src *; base-uri 'self'; form-action 'self'; child-src *; frame-ancestors 'none'");
  
  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// Session initialization middleware
app.use((req, res, next) => {
  try {
    // Generate a unique user ID if it doesn't exist
    if (!req.session.userId) {
      req.session.userId = `user_${crypto.randomBytes(8).toString('hex')}`;
      req.session.createdAt = new Date();
      req.session.messageCount = 0;
      
      // Initialize session data
      const sessionData = {
        userId: req.session.userId,
        createdAt: req.session.createdAt,
        lastActive: new Date(),
        messageCount: 0,
        paymentStatus: {},
        metadata: {}
      };
      
      // Store session reference
      activeSessions.set(req.session.userId, sessionData);
      console.log(`New session created: ${req.session.userId}`);
    }
    
    // Update last active time
    const userSession = activeSessions.get(req.session.userId);
    if (userSession) {
      userSession.lastActive = new Date();
      
      // Add request metadata
      userSession.metadata = {
        ...userSession.metadata,
        lastIp: req.ip,
        userAgent: req.get('user-agent'),
        lastEndpoint: req.originalUrl,
        lastRequest: new Date()
      };
    }
    
    next();
  } catch (error) {
    console.error('Error in session middleware:', error);
    next(error);
  }
});

// Generate a unique message ID
function generateMessageId(userId) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${userId}_${timestamp}_${random}`;
}

// Serve static files from the current directory
app.use(express.static('.'));

// Root route - serve the frontend
app.get('/', (req, res) => {
  res.sendFile('frontend.html', { root: __dirname });
});

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Pay-Proof, X-USER-ID, X-Session-ID');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Debug endpoint to check message count
app.get('/debug-message-count', (req, res) => {
  try {
    const sessionId = req.get('X-Session-ID') || req.session.userId;
    
    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        error: 'No session ID provided',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get session data
    const userSession = activeSessions.get(sessionId);
    
    if (!userSession) {
      return res.json({
        messageCount: 0,
        sessionExists: false,
        timestamp: new Date().toISOString()
      });
    }
    
    // Return message count
    console.log(`Debug: Session ${sessionId} has message count ${userSession.messageCount || 0}`);
    return res.json({
      messageCount: userSession.messageCount || 0,
      sessionExists: true,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error checking message count',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Mock payment verification endpoint with session tracking
app.post('/mock-verify-payment', (req, res) => {
  try {
    const { paymentId, proof = `mock-proof-${Date.now()}`, userId, amount = '0.01', currency = 'USD' } = req.body;
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

    // Check if payment is already verified
    if (receiptCache.has(paymentId)) {
      const receipt = receiptCache.get(paymentId);
      return res.json({
        status: 'success',
        message: 'Payment already verified',
        paymentId,
        userId: receipt.userId || userId,
        amount: receipt.amount || amount,
        currency: receipt.currency || currency,
        timestamp: requestTimestamp,
        requestId: req.id,
        metadata: {
          verifiedAt: receipt.verifiedAt || new Date().toISOString(),
          expiresAt: receipt.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      });
    }

    // Check if payment is pending
    if (!pendingPayments.has(paymentId)) {
      return res.status(404).json({
        status: 'error',
        error: 'Invalid or expired payment ID',
        paymentId,
        timestamp: requestTimestamp,
        requestId: req.id,
        suggestion: 'Please initiate a new payment request.'
      });
    }

    // Get payment info
    const paymentInfo = pendingPayments.get(paymentId);
    const verifiedUserId = userId || paymentInfo?.userId || req.session.userId || `user-${Date.now()}`;
    
    // Create receipt data
    const receiptData = {
      paymentId,
      userId: verifiedUserId,
      amount: paymentInfo?.amount || amount,
      currency: paymentInfo?.currency || currency,
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
      proof: `${proof.substring(0, 10)}...`,
      metadata: {
        ...(paymentInfo?.metadata || {}),
        verifiedAt: new Date().toISOString()
      }
    };
    
    // Add to receipt cache
    receiptCache.set(paymentId, receiptData);
    
    // Get or create user session
    let userSession = activeSessions.get(verifiedUserId);
    if (!userSession) {
      userSession = {
        userId: verifiedUserId,
        createdAt: new Date(),
        lastActive: new Date(),
        messageCount: 0,
        paymentStatus: {},
        metadata: {}
      };
      activeSessions.set(verifiedUserId, userSession);
    }
    
    // Update session payment status
    userSession.paymentStatus[paymentId] = {
      verified: true,
      timestamp: receiptData.verifiedAt,
      amount: receiptData.amount,
      currency: receiptData.currency,
      proof: receiptData.proof
    };
    
    // Update session metadata
    userSession.metadata = {
      ...userSession.metadata,
      lastPayment: receiptData.verifiedAt,
      paymentCount: (userSession.metadata?.paymentCount || 0) + 1,
      lastActive: new Date().toISOString()
    };
    
    // Clean up pending payment
    pendingPayments.delete(paymentId);
    
    // Log successful verification
    console.log(`Payment verified - PaymentID: ${paymentId}, UserID: ${verifiedUserId}`);
    
    // Return success response
    res.json({
      status: 'success',
      message: 'Payment verified! You can now use the chat.',
      paymentId,
      userId: verifiedUserId,
      amount: receiptData.amount,
      currency: receiptData.currency,
      timestamp: requestTimestamp,
      requestId: req.id,
      metadata: {
        verifiedAt: receiptData.verifiedAt,
        expiresAt: receiptData.expiresAt
      }
    });
    
  } catch (error) {
    console.error('Error in mock-verify-payment:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: req.id,
      paymentId: req.body?.paymentId
    });
  }
});

// Endpoint to check payment status
app.get('/payment-status/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  const userId = req.query.userId;
  
  // Check if we have a receipt in the cache
  if (receiptCache.has(paymentId)) {
    return res.json({
      paymentId,
      paid: true,
      timestamp: new Date().toISOString(),
      userId
    });
  }
  
  // Check if this is a pending payment
  const paymentDetails = pendingPayments.get(paymentId);
  if (paymentDetails) {
    return res.json({
      paymentId,
      paid: false,
      timestamp: new Date().toISOString(),
      userId: paymentDetails.userId,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency
    });
  }
  
  // Payment not found
  return res.status(404).json({
    status: 'error',
    error: 'Payment not found',
    paymentId,
    timestamp: new Date().toISOString()
  });
});

// Load from env or config
const SENSAY_API_KEY = process.env.SENSAY_API_KEY;
const SENSAY_ORG_ID = process.env.SENSAY_ORG_ID;
const SENSAY_REPLICA_ID = process.env.SENSAY_REPLICA_ID;

// In-memory storage for verified payments (use Redis in production)
// receiptCache is already declared at the top of the file

// Chat endpoint with x402 payment enforcement and session tracking
app.post('/chat', async (req, res) => {
  const startTime = process.hrtime();
  const { message, metadata = {} } = req.body;
  const userId = req.session.userId;
  const messageId = metadata.messageId || generateMessageId(userId);
  const requestId = `req_${crypto.randomBytes(4).toString('hex')}`;
  
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
    let userSession = activeSessions.get(userId);
    if (!userSession) {
      userSession = {
        userId,
        createdAt: new Date(),
        lastActive: new Date(),
        messageCount: 0,
        paymentStatus: {},
        metadata: {}
      };
      activeSessions.set(userId, userSession);
    }
    
    // Update session activity
    userSession.lastActive = new Date();
    userSession.messageCount = (userSession.messageCount || 0) + 1;
    
    // Check if payment is required
    const requiresPayment = checkIfPaymentRequired(userSession);
    
    if (requiresPayment.required) {
      // Generate a payment request
      const paymentId = generatePaymentId();
      const paymentDetails = {
        userId,
        timestamp: new Date(),
        messageId,
        amount: requiresPayment.amount || 0.01, // Default small amount for demo
        currency: 'USD',
        reason: 'Chat message processing'
      };
      
      pendingPayments.set(paymentId, paymentDetails);
      
      // Log payment request
      console.log(`Payment required - User: ${userId}, MessageID: ${messageId}, PaymentID: ${paymentId}`);
      
      // Generate a verification URL that includes the session ID
      const verificationUrl = new URL('/mock-verify-payment', `http://${req.headers.host}`);
      verificationUrl.searchParams.append('paymentId', paymentId);
      verificationUrl.searchParams.append('userId', userId);
      
      return res.status(402).json({
        status: 'payment_required',
        error: 'Payment required to process this message',
        paymentId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        paymentUrl: `/mock-pay.html?paymentId=${paymentId}&userId=${encodeURIComponent(userId)}`,
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
    const response = await forwardToSensay(message, userId, messageId);
    
    // Calculate processing time
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const processingTimeMs = (seconds * 1000) + (nanoseconds / 1e6);
    
    // Log successful processing
    console.log(`Message processed - User: ${userId}, MessageID: ${messageId}, Time: ${processingTimeMs.toFixed(2)}ms`);
    
    // Return the response from Sensay
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
    console.error('Error processing chat message:', {
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
});

/**
 * Helper function to determine if payment is required
 * @param {Object} userSession - The user's session object
 * @returns {Object} Object with payment requirement details
 */
function checkIfPaymentRequired(userSession) {
  // In a real app, implement your payment logic here
  // For demo, require payment every 3 messages
  const messageCount = userSession.messageCount || 0;
  
  if (messageCount > 0 && messageCount % 3 === 0) {
    return {
      required: true,
      amount: 0.01, // $0.01 for demo
      reason: 'Periodic payment required',
      messageCount
    };
  }
  
  return { required: false };
}

/**
 * Forward a message to the Sensay API
 * @param {string} message - The message to forward
 * @param {string} userId - The user's ID
 * @param {string} messageId - The message ID
 * @param {Object} session - The session object
 * @returns {Promise<Object>} The response from Sensay API
 */
async function forwardToSensay(message, userId, messageId, session) {
  try {
    const response = await axios.post(
      `https://api.sensay.io/v1/experimental/replicas/${process.env.SENSAY_REPLICA_ID}/chat/completions`,
      {
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.SENSAY_API_KEY,
          'X-ORGANIZATION-SECRET': process.env.SENSAY_API_KEY,
          'X-API-Version': '2025-03-25',
          'X-USER-ID': process.env.SENSAY_USER_ID
        }
      }
    );
    
    return {
      reply: response.data.choices[0]?.message?.content || '[no reply]',
      model: response.data.model,
      timestamp: new Date().toISOString()
    };
    
    // Uncomment this in production to use the real Sensay API
    /*
    const response = await axios.post(
      `https://api.sensay.io/v1/experimental/replicas/${process.env.SENSAY_REPLICA_ID}/chat/completions`,
      {
        messages: [
          { 
            role: 'user', 
            content: message,
            metadata: {
              userId,
              messageId,
              sessionId: session.id,
              messageCount: session.messageCount,
              timestamp: new Date().toISOString()
            }
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.SENSAY_API_KEY,
          'X-ORGANIZATION-SECRET': process.env.SENSAY_ORG_ID,
          'X-Request-ID': messageId,
          'X-User-ID': userId
        },
      }
    );
    
    return {
      reply: response.data.choices[0]?.message?.content || '[no reply]',
      model: response.data.model,
      timestamp: new Date().toISOString()
    };
    */
  } catch (error) {
    console.error('Error in forwardToSensay:', {
      error: error.message,
      userId,
      messageId,
      timestamp: new Date().toISOString()
    });
    
    // Return a fallback response
    return {
      reply: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
      model: 'fallback',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

// Start the server
httpServer = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Active sessions: ${activeSessions.size}`);
  console.log(`Pending payments: ${pendingPayments.size}`);
  console.log(`Cached receipts: ${receiptCache.size}`);
});

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutdown signal received. Shutting down gracefully...');
  
  try {
    // Close the HTTP server
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close(err => {
          if (err) {
            console.error('Error closing server:', err);
            return reject(err);
          }
          console.log('HTTP server closed');
          resolve();
        });
      });
    }
    
    // Add any additional cleanup here
    console.log('Cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', {
    error: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({
    status: 'error',
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// Export app for testing
if (process.env.NODE_ENV === 'test') {
  module.exports = app;
}
// Session management middleware
import crypto from 'node:crypto';
import { sessionStore } from '../services/session-store.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware to initialize and manage user sessions
 */
export function sessionMiddleware(req, res, next) {
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
      sessionStore.setSession(req.session.userId, sessionData);
      logger.info(`New session created: ${req.session.userId}`);
    }
    
    // Update last active time
    const userSession = sessionStore.getSession(req.session.userId);
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
      
      // Update the session store
      sessionStore.setSession(req.session.userId, userSession);
    }
    
    next();
  } catch (error) {
    logger.error('Error in session middleware:', error);
    next(error);
  }
}
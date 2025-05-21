// Debug controller
import { sessionStore } from '../services/session-store.js';
import { logger } from '../utils/logger.js';

export const DebugController = {
  /**
   * Get message count for a session
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getMessageCount(req, res) {
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
      const userSession = sessionStore.getSession(sessionId);
      
      if (!userSession) {
        return res.json({
          messageCount: 0,
          sessionExists: false,
          timestamp: new Date().toISOString()
        });
      }
      
      // Return message count
      logger.info(`Debug: Session ${sessionId} has message count ${userSession.messageCount || 0}`);
      return res.json({
        messageCount: userSession.messageCount || 0,
        sessionExists: true,
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in debug endpoint:', error);
      return res.status(500).json({
        status: 'error',
        error: 'Internal server error checking message count',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};
// Persistent session store using database service
import { databaseService } from './database-service.js';
import { logger } from '../utils/logger.js';

/**
 * Persistent session store that replaces the in-memory session store
 * Provides backward compatibility with the existing session store interface
 */
export class PersistentSessionStore {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the session store
   */
  async initialize() {
    if (!this.initialized) {
      await databaseService.initialize();
      this.initialized = true;
      logger.info('Persistent session store initialized');
    }
  }

  /**
   * Ensure initialization before operations
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // Session management methods
  async setSession(userId, sessionData) {
    await this.ensureInitialized();
    return databaseService.setSession(userId, sessionData);
  }

  async getSession(userId) {
    await this.ensureInitialized();
    return databaseService.getSession(userId);
  }

  async deleteSession(userId) {
    await this.ensureInitialized();
    return databaseService.deleteSession(userId);
  }

  // Payment management methods
  async addPendingPayment(paymentId, paymentData) {
    await this.ensureInitialized();
    return databaseService.setPayment(paymentId, {\n      ...paymentData,\n      status: 'pending',\n      createdAt: new Date().toISOString()\n    });\n  }\n\n  async getPendingPayment(paymentId) {\n    await this.ensureInitialized();\n    const payment = await databaseService.getPayment(paymentId);\n    return payment?.status === 'pending' ? payment : null;\n  }\n\n  async isPaymentPending(paymentId) {\n    const payment = await this.getPendingPayment(paymentId);\n    return !!payment;\n  }\n\n  async updatePendingPayment(paymentId, paymentData) {\n    await this.ensureInitialized();\n    const existingPayment = await databaseService.getPayment(paymentId);\n    if (existingPayment) {\n      return databaseService.setPayment(paymentId, {\n        ...existingPayment,\n        ...paymentData,\n        updatedAt: new Date().toISOString()\n      });\n    }\n  }\n\n  async deletePendingPayment(paymentId) {\n    await this.ensureInitialized();\n    // Instead of deleting, mark as cancelled\n    return databaseService.updatePaymentStatus(paymentId, 'cancelled');\n  }\n\n  // Receipt management methods\n  async addReceipt(paymentId, receiptData) {\n    await this.ensureInitialized();\n    return databaseService.setReceipt(paymentId, receiptData);\n  }\n\n  async getReceipt(paymentId) {\n    await this.ensureInitialized();\n    return databaseService.getReceipt(paymentId);\n  }\n\n  async hasReceipt(paymentId) {\n    const receipt = await this.getReceipt(paymentId);\n    return !!receipt;\n  }\n\n  // Payment info methods (for backward compatibility)\n  async updatePaymentInfo(userId, paymentInfo) {\n    await this.ensureInitialized();\n    const session = await this.getSession(userId) || {\n      userId,\n      createdAt: new Date().toISOString(),\n      messageCount: 0,\n      paymentStatus: {},\n      metadata: {}\n    };\n    \n    session.paymentInfo = {\n      ...session.paymentInfo,\n      ...paymentInfo,\n      updatedAt: new Date().toISOString()\n    };\n    \n    await this.setSession(userId, session);\n  }\n\n  async getPaymentInfo(userId) {\n    const session = await this.getSession(userId);\n    return session?.paymentInfo || null;\n  }\n\n  // Statistics methods\n  async getSessionCount() {\n    await this.ensureInitialized();\n    const stats = await databaseService.getStats();\n    return stats.sessions;\n  }\n\n  async getPendingPaymentsCount() {\n    await this.ensureInitialized();\n    const stats = await databaseService.getStats();\n    return stats.payments;\n  }\n\n  async getReceiptCacheCount() {\n    await this.ensureInitialized();\n    const stats = await databaseService.getStats();\n    return stats.receipts;\n  }\n\n  // Cleanup methods\n  async cleanup() {\n    await this.ensureInitialized();\n    return databaseService.cleanup();\n  }\n\n  async close() {\n    if (this.initialized) {\n      await databaseService.close();\n      this.initialized = false;\n    }\n  }\n\n  // Additional helper methods\n  async getAllSessions() {\n    await this.ensureInitialized();\n    // This would need to be implemented in the database service\n    // For now, return empty array\n    return [];\n  }\n\n  async clearExpiredSessions() {\n    await this.ensureInitialized();\n    return databaseService.cleanup();\n  }\n\n  async getActiveUserCount() {\n    return this.getSessionCount();\n  }\n\n  // Legacy methods for backward compatibility with existing code\n  getSessionSync(userId) {\n    // Convert async to sync for backward compatibility\n    // Note: This is not ideal but maintains compatibility\n    logger.warn('Using synchronous getSession method - consider migrating to async');\n    return null; // Return null for now, caller should use async version\n  }\n\n  setSessionSync(userId, sessionData) {\n    // Convert async to sync for backward compatibility\n    logger.warn('Using synchronous setSession method - consider migrating to async');\n    // Fire and forget for backward compatibility\n    this.setSession(userId, sessionData).catch(error => {\n      logger.error('Error in setSessionSync:', error);\n    });\n  }\n}\n\n// Create singleton instance\nexport const persistentSessionStore = new PersistentSessionStore();\n\n// For backward compatibility, export as default\nexport default persistentSessionStore;
// In-memory session store
import { logger } from '../utils/logger.js';

class SessionStore {
  constructor() {
    // In-memory stores
    this.activeSessions = new Map();
    this.pendingPayments = new Map();
    this.receiptCache = new Map();
    
    // Setup cleanup interval
    setInterval(this.cleanupOldSessions.bind(this), 60 * 60 * 1000); // Every hour
  }
  
  /**
   * Get a session by user ID
   * @param {string} userId 
   * @returns {Object|undefined}
   */
  getSession(userId) {
    return this.activeSessions.get(userId);
  }
  
  /**
   * Set session data for a user
   * @param {string} userId 
   * @param {Object} sessionData 
   */
  setSession(userId, sessionData) {
    this.activeSessions.set(userId, sessionData);
  }
  
  /**
   * Delete a session
   * @param {string} userId 
   */
  deleteSession(userId) {
    this.activeSessions.delete(userId);
  }
  
  /**
   * Clean up old, inactive sessions
   */
  cleanupOldSessions() {
    const now = new Date();
    const maxInactiveTime = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [userId, session] of this.activeSessions.entries()) {
      if (now - session.lastActive > maxInactiveTime) {
        this.activeSessions.delete(userId);
        logger.info(`Cleaned up inactive session: ${userId}`);
      }
    }
  }
  
  // Payment methods
  
  /**
   * Add a pending payment
   * @param {string} paymentId 
   * @param {Object} paymentData 
   */
  addPendingPayment(paymentId, paymentData) {
    this.pendingPayments.set(paymentId, {
      ...paymentData,
      createdAt: new Date()
    });
  }
  
  /**
   * Update an existing pending payment
   * @param {string} paymentId 
   * @param {Object} updates - Fields to update
   */
  updatePendingPayment(paymentId, updates) {
    const existing = this.pendingPayments.get(paymentId);
    if (existing) {
      this.pendingPayments.set(paymentId, {
        ...existing,
        ...updates,
        updatedAt: new Date()
      });
      return true;
    }
    return false;
  }
  
  /**
   * Get a pending payment
   * @param {string} paymentId 
   * @returns {Object|undefined}
   */
  getPendingPayment(paymentId) {
    return this.pendingPayments.get(paymentId);
  }
  
  /**
   * Delete a pending payment
   * @param {string} paymentId 
   */
  deletePendingPayment(paymentId) {
    this.pendingPayments.delete(paymentId);
  }
  
  /**
   * Check if a payment is pending
   * @param {string} paymentId 
   * @returns {boolean}
   */
  isPaymentPending(paymentId) {
    return this.pendingPayments.has(paymentId);
  }
  
  // Receipt methods
  
  /**
   * Add a receipt to the cache
   * @param {string} paymentId 
   * @param {Object} receiptData 
   */
  addReceipt(paymentId, receiptData) {
    this.receiptCache.set(paymentId, receiptData);
  }
  
  /**
   * Get a receipt from cache
   * @param {string} paymentId 
   * @returns {Object|undefined}
   */
  getReceipt(paymentId) {
    return this.receiptCache.get(paymentId);
  }
  
  /**
   * Check if a receipt exists
   * @param {string} paymentId 
   * @returns {boolean}
   */
  hasReceipt(paymentId) {
    return this.receiptCache.has(paymentId);
  }
  
  // Stats methods
  
  /**
   * Get the count of active sessions
   * @returns {number}
   */
  getSessionCount() {
    return this.activeSessions.size;
  }
  
  /**
   * Get the count of pending payments
   * @returns {number}
   */
  getPendingPaymentsCount() {
    return this.pendingPayments.size;
  }
  
  /**
   * Get the count of cached receipts
   * @returns {number}
   */
  getReceiptCacheCount() {
    return this.receiptCache.size;
  }
}

// Create a singleton instance
export const sessionStore = new SessionStore();
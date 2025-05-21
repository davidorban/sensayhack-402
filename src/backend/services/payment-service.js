// Payment service
import crypto from 'node:crypto';
import { sessionStore } from './session-store.js';
import { logger } from '../utils/logger.js';

/**
 * Service for handling payments
 */
export class PaymentService {
  /**
   * Generate a unique payment ID
   * @returns {string} - Payment ID
   */
  static generatePaymentId() {
    return `pay_${crypto.randomBytes(8).toString('hex')}`;
  }
  
  /**
   * Check if payment is required for a user session
   * @param {Object} userSession - User session data
   * @returns {Object} - Payment requirement details
   */
  static checkIfPaymentRequired(userSession) {
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
   * Create a payment request
   * @param {string} userId - User ID
   * @param {string} messageId - Message ID
   * @param {number} amount - Payment amount
   * @param {string} currency - Payment currency
   * @returns {Object} - Payment request details
   */
  static createPaymentRequest(userId, messageId, amount = 0.01, currency = 'USD') {
    const paymentId = this.generatePaymentId();
    const paymentDetails = {
      userId,
      timestamp: new Date(),
      messageId,
      amount,
      currency,
      reason: 'Chat message processing'
    };
    
    // Store in pending payments
    sessionStore.addPendingPayment(paymentId, paymentDetails);
    
    // Log the payment request
    logger.info(`Payment required - User: ${userId}, MessageID: ${messageId}, PaymentID: ${paymentId}`);
    
    return { paymentId, ...paymentDetails };
  }
  
  /**
   * Verify a payment
   * @param {string} paymentId - Payment ID
   * @param {string} userId - User ID
   * @param {string} proof - Payment proof
   * @param {number} amount - Payment amount
   * @param {string} currency - Payment currency
   * @returns {Object} - Verification result
   */
  static verifyPayment(paymentId, userId, proof, amount, currency) {
    // Check if payment is already verified
    if (sessionStore.hasReceipt(paymentId)) {
      return { 
        status: 'success', 
        message: 'Payment already verified',
        receipt: sessionStore.getReceipt(paymentId)
      };
    }
    
    // Check if payment is pending
    if (!sessionStore.isPaymentPending(paymentId)) {
      return { 
        status: 'error', 
        message: 'Invalid or expired payment ID'
      };
    }
    
    // Get payment info
    const paymentInfo = sessionStore.getPendingPayment(paymentId);
    const verifiedUserId = userId || paymentInfo?.userId || `user-${Date.now()}`;
    
    // Create receipt data
    const receiptData = {
      paymentId,
      userId: verifiedUserId,
      amount: paymentInfo?.amount || amount,
      currency: paymentInfo?.currency || currency,
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
      proof: proof ? `${proof.substring(0, 10)}...` : `mock-proof-${Date.now()}`,
      metadata: {
        ...(paymentInfo?.metadata || {}),
        verifiedAt: new Date().toISOString()
      }
    };
    
    // Save the receipt
    sessionStore.addReceipt(paymentId, receiptData);
    
    // Update user session
    let userSession = sessionStore.getSession(verifiedUserId);
    if (userSession) {
      // Update session payment status
      userSession.paymentStatus = userSession.paymentStatus || {};
      userSession.paymentStatus[paymentId] = {
        verified: true,
        timestamp: receiptData.verifiedAt,
        amount: receiptData.amount,
        currency: receiptData.currency,
        proof: receiptData.proof
      };
      
      // Update session metadata
      userSession.metadata = userSession.metadata || {};
      userSession.metadata = {
        ...userSession.metadata,
        lastPayment: receiptData.verifiedAt,
        paymentCount: (userSession.metadata?.paymentCount || 0) + 1,
        lastActive: new Date().toISOString()
      };
      
      // Save updated session
      sessionStore.setSession(verifiedUserId, userSession);
    }
    
    // Remove from pending
    sessionStore.deletePendingPayment(paymentId);
    
    // Log successful verification
    logger.info(`Payment verified - PaymentID: ${paymentId}, UserID: ${verifiedUserId}`);
    
    return { 
      status: 'success', 
      message: 'Payment verified',
      receipt: receiptData
    };
  }
  
  /**
   * Check payment status
   * @param {string} paymentId - Payment ID
   * @param {string} userId - User ID
   * @returns {Object} - Payment status
   */
  static checkPaymentStatus(paymentId, userId) {
    // Check if payment is verified
    if (sessionStore.hasReceipt(paymentId)) {
      const receipt = sessionStore.getReceipt(paymentId);
      return {
        paymentId,
        paid: true,
        timestamp: new Date().toISOString(),
        userId: receipt.userId || userId
      };
    }
    
    // Check if payment is pending
    const paymentDetails = sessionStore.getPendingPayment(paymentId);
    if (paymentDetails) {
      return {
        paymentId,
        paid: false,
        timestamp: new Date().toISOString(),
        userId: paymentDetails.userId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency
      };
    }
    
    // Payment not found
    return {
      status: 'error',
      error: 'Payment not found',
      paymentId,
      timestamp: new Date().toISOString()
    };
  }
}
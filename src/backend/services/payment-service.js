// Payment service
import crypto from 'node:crypto';
import { sessionStore } from './session-store.js';
import { logger } from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Service for handling payments
 */
export class PaymentService {
  /**
   * Get payment details including wallet address and QR code
   * @param {string} paymentId - Payment ID
   * @param {string} userId - User ID
   * @returns {Object} - Payment details
   */
  static getPaymentDetails(paymentId, userId) {
    // Check if payment is in pending payments
    if (sessionStore.isPaymentPending(paymentId)) {
      return sessionStore.getPendingPayment(paymentId);
    }
    
    // Check if payment is already verified
    if (sessionStore.hasReceipt(paymentId)) {
      const receipt = sessionStore.getReceipt(paymentId);
      return {
        ...receipt,
        status: 'completed'
      };
    }
    
    // Payment not found
    return { 
      status: 'error', 
      error: 'Payment not found' 
    };
  }
  
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
    // For the demo, require payment on first message
    const messageCount = userSession.messageCount || 0;
    
    // Always require payment for demonstration purposes
    return {
      required: true,
      amount: 0.01, // $0.01 for demo
      reason: 'Payment required for demonstration',
      messageCount
    };
  }
  
  /**
   * Create a payment request
   * @param {string} userId - User ID
   * @param {string} messageId - Message ID
   * @param {number} amount - Payment amount
   * @param {string} currency - Payment currency
   * @returns {Promise<Object>} - Payment request details
   */
  static async createPaymentRequest(userId, messageId, amount = 0.01, currency = 'USD') {
    const paymentId = this.generatePaymentId();
    const isMock = config.mockPayment.enabled;
    
    const paymentDetails = {
      userId,
      paymentId,
      amount,
      currency,
      status: 'pending',
      timestamp: new Date().toISOString(),
      isMock,
      messageId,
      reason: 'Chat message processing',
      paymentType: isMock ? 'mock' : 'x402'
    };

    // Store in pending payments first to ensure it's available for verification
    sessionStore.addPendingPayment(paymentId, paymentDetails);
    
    try {
      if (isMock) {
        // Mock payment flow
        paymentDetails.paymentHtml = `/payment.html?paymentId=${paymentId}&userId=${encodeURIComponent(userId)}`;
        paymentDetails.walletAddress = config.mockPayment.walletAddress;
        paymentDetails.instructions = 'This is a mock payment. Use the mock payment endpoint to simulate payment.';
      } else {
        // X402 payment flow
        const coinbaseService = (await import('./coinbase-service.js')).CoinbaseService;
        const paymentData = await coinbaseService.generatePaymentUrl(userId, messageId);
        
        // Update payment details with X402 information
        paymentDetails.paymentUrl = paymentData.payment_url;
        paymentDetails.qrCode = paymentData.qr_code;
        paymentDetails.walletAddress = paymentData.wallet_address;
        paymentDetails.asset = paymentData.asset;
        paymentDetails.chain = paymentData.chain;
        paymentDetails.invoiceId = paymentData.invoice_id;
        paymentDetails.verificationUrl = `/payment/verify?paymentId=${paymentId}`;
        paymentDetails.instructions = 'Scan the QR code with your wallet app to complete the payment';
        
        // Add X402 protocol-specific headers
        paymentDetails.x402 = {
          Pay: paymentData.payment_url,
          "Pay-Asset": paymentData.asset,
          "Pay-Amount": paymentData.amount,
          "Pay-Recipient": paymentData.wallet_address,
          "Pay-Chain": paymentData.chain,
          "Pay-Memo": `msg_${messageId}`
        };
        
        // Update the pending payment with the new details
        sessionStore.updatePendingPayment(paymentId, paymentDetails);
      }
      
      // Log the payment request
      logger.info(`Payment required - Mode: ${isMock ? 'MOCK' : 'X402'}, User: ${userId}, MessageID: ${messageId}, PaymentID: ${paymentId}`);
      
      return { paymentId, ...paymentDetails };
    } catch (error) {
      // Clean up the pending payment if there was an error
      sessionStore.deletePendingPayment(paymentId);
      logger.error('Failed to create payment request:', error);
      throw new Error('Failed to create payment request');
    }
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
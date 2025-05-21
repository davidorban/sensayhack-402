import axios from 'axios';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';
import { sessionStore } from './session-store.js';

export class CoinbaseService {
  /**
   * Generate a payment URL using Coinbase CDP
   * @param {string} userId - The user ID
   * @param {string} messageId - The message ID
   * @returns {Promise<string>} The payment URL
   */
  static async generatePaymentUrl(userId, messageId) {
    try {
      const response = await axios.post(
        `${config.coinbase.apiUrl}/v1/payments`,
        {
          chain: config.coinbase.chain,
          asset: config.coinbase.asset,
          amount: config.coinbase.paymentAmount,
          metadata: {
            user_id: userId,
            message_id: messageId
          },
          expires_in: config.coinbase.paymentExpiry
        },
        {
          headers: {
            'Authorization': `Bearer ${config.coinbase.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { payment_url, invoice_id } = response.data;
      
      // Store the invoice ID in the session
      sessionStore.updatePaymentInfo(userId, {
        invoiceId: invoice_id,
        status: 'pending',
        amount: config.coinbase.paymentAmount,
        asset: config.coinbase.asset,
        timestamp: new Date().toISOString()
      });

      return payment_url;
    } catch (error) {
      logger.error('Error generating payment URL:', {
        error: error.message,
        userId,
        messageId,
        response: error.response?.data
      });
      throw new Error('Failed to generate payment URL');
    }
  }

  /**
   * Verify a payment proof
   * @param {string} proof - The payment proof from the client
   * @returns {Promise<{valid: boolean, invoiceId: string, amount: string, asset: string}>}
   */
  static async verifyPaymentProof(proof) {
    try {
      const response = await axios.get(`${config.coinbase.verificationUrl}?proof=${encodeURIComponent(proof)}`, {
        headers: {
          'Authorization': `Bearer ${config.coinbase.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error verifying payment proof:', {
        error: error.message,
        proof,
        response: error.response?.data
      });
      return { valid: false };
    }
  }

  /**
   * Check if a payment is valid for a user
   * @param {string} userId - The user ID
   * @param {string} proof - The payment proof
   * @returns {Promise<boolean>} Whether the payment is valid
   */
  static async validateUserPayment(userId, proof) {
    try {
      // First check if we've already validated this proof
      const session = sessionStore.getSession(userId);
      if (session?.paymentInfo?.status === 'paid' && session.paymentInfo.proof === proof) {
        return true;
      }

      // Verify the proof with Coinbase
      const { valid, invoice_id, amount, asset } = await this.verifyPaymentProof(proof);
      
      if (!valid) {
        return false;
      }

      // Verify the payment matches our expected amount and asset
      if (amount !== config.coinbase.paymentAmount || asset.toLowerCase() !== config.coinbase.asset) {
        logger.warn('Payment verification failed: amount or asset mismatch', {
          userId,
          expectedAmount: config.coinbase.paymentAmount,
          receivedAmount: amount,
          expectedAsset: config.coinbase.asset,
          receivedAsset: asset
        });
        return false;
      }

      // Update the session with payment info
      sessionStore.updatePaymentInfo(userId, {
        status: 'paid',
        invoiceId: invoice_id,
        amount,
        asset,
        proof,
        paidAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      logger.error('Error validating user payment:', {
        error: error.message,
        userId,
        proof
      });
      return false;
    }
  }
}

export const coinbaseService = new CoinbaseService();

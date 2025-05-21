import axios from 'axios';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';
import { sessionStore } from './session-store.js';
import QRCode from 'qrcode';

export class CoinbaseService {
  /**
   * Generate a payment URL using X402 protocol
   * @param {string} userId - The user ID
   * @param {string} messageId - The message ID
   * @returns {Promise<Object>} The payment URL and QR code
   */
  static async generatePaymentUrl(userId, messageId) {
    try {
      // In a production environment, this would be a call to Coinbase API
      // For demonstration, we'll create a direct X402 payment link to the wallet
      
      // Get the wallet address from config
      const walletAddress = config.sensay.walletAddress || '0x0000000000000000000000000000000000000000';
      const amount = config.coinbase.paymentAmount;
      const asset = config.coinbase.asset;
      const chain = config.coinbase.chain;
      
      // Generate a unique invoice ID
      const invoice_id = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Create the payment URL
      // Format: ethereum:<address>@<chain>?value=<amount>&asset=<asset>&memo=<memo>
      const payment_url = `ethereum:${walletAddress}@${chain}?value=${amount}&asset=${asset}&memo=msg_${messageId}`;
      
      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(payment_url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      // Store the invoice ID in the session
      sessionStore.updatePaymentInfo(userId, {
        invoiceId: invoice_id,
        status: 'pending',
        amount: amount,
        asset: asset,
        chain: chain,
        walletAddress: walletAddress,
        qrCode: qrCodeDataURL,
        paymentUrl: payment_url,
        timestamp: new Date().toISOString(),
        messageId: messageId,
        expiresAt: new Date(Date.now() + (config.coinbase.paymentExpiry * 1000)).toISOString()
      });

      logger.info('Generated X402 payment URL:', {
        userId,
        messageId,
        invoiceId: invoice_id,
        walletAddress,
        amount,
        asset,
        chain
      });

      return {
        payment_url,
        invoice_id,
        qr_code: qrCodeDataURL,
        wallet_address: walletAddress,
        amount,
        asset,
        chain
      };
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

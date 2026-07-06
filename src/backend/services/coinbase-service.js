import axios from 'axios';
import crypto from 'node:crypto';
import { logger } from '../utils/logger.js';
import config from '../config/index.js';
import { sessionStore } from './session-store.js';
import QRCode from 'qrcode';

export class CoinbaseService {
  /**
   * Create a charge using the Coinbase Commerce API
   * @param {string} userId - The user ID
   * @param {string} messageId - The message ID
   * @param {number} amount - Payment amount in USD
   * @returns {Promise<Object>} The charge data from Coinbase
   */
  static async createCharge(userId, messageId, amount = 0.01) {
    try {
      const chargeData = {
        name: 'AI Chat Message Processing',
        description: `Payment for processing message ${messageId}`,
        pricing_type: 'fixed_price',
        local_price: {
          amount: amount.toString(),
          currency: 'USD'
        },
        metadata: {
          user_id: userId,
          message_id: messageId,
          session_id: `${userId}_${Date.now()}`,
          created_at: new Date().toISOString()
        },
        redirect_url: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/complete`,
        cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/cancel`
      };

      const response = await axios.post('https://api.commerce.coinbase.com/charges', chargeData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Api-Key': config.coinbase.apiKey,
          'X-CC-Version': '2018-03-22'
        },
        timeout: 10000
      });

      const charge = response.data.data;
      
      logger.info('Created Coinbase charge:', {
        chargeId: charge.id,
        userId,
        messageId,
        amount,
        hostedUrl: charge.hosted_url
      });

      return charge;
    } catch (error) {
      logger.error('Error creating Coinbase charge:', {
        error: error.message,
        userId,
        messageId,
        response: error.response?.data
      });
      throw new Error('Failed to create payment charge');
    }
  }

  /**
   * Generate a payment URL using Coinbase Commerce or X402 protocol
   * @param {string} userId - The user ID
   * @param {string} messageId - The message ID
   * @returns {Promise<Object>} The payment URL and QR code
   */
  static async generatePaymentUrl(userId, messageId) {
    try {
      const amount = config.coinbase.paymentAmount;
      
      // If Coinbase API key is configured, use Coinbase Commerce
      if (config.coinbase.apiKey && !config.mockPayment.enabled) {
        const charge = await this.createCharge(userId, messageId, amount);
        
        // Generate QR code for the hosted URL
        const qrCodeDataURL = await QRCode.toDataURL(charge.hosted_url, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 300,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        
        // Store the charge information
        sessionStore.updatePaymentInfo(userId, {
          chargeId: charge.id,
          chargeCode: charge.code,
          status: 'pending',
          amount: amount,
          asset: config.coinbase.asset,
          chain: config.coinbase.chain,
          paymentUrl: charge.hosted_url,
          qrCode: qrCodeDataURL,
          timestamp: new Date().toISOString(),
          messageId: messageId,
          expiresAt: charge.expires_at,
          coinbaseCharge: charge
        });

        return {
          payment_url: charge.hosted_url,
          invoice_id: charge.id,
          qr_code: qrCodeDataURL,
          wallet_address: null, // Coinbase handles wallet addresses
          amount,
          asset: config.coinbase.asset,
          chain: config.coinbase.chain,
          charge_code: charge.code
        };
      } else {
        // Fallback to direct wallet payment (X402 protocol)
        return this.generateDirectPaymentUrl(userId, messageId);
      }
    } catch (error) {
      logger.error('Error generating payment URL:', {
        error: error.message,
        userId,
        messageId,
        response: error.response?.data
      });
      
      // Fallback to direct payment if Coinbase fails
      if (!config.mockPayment.enabled) {
        logger.info('Falling back to direct payment due to Coinbase error');
        return this.generateDirectPaymentUrl(userId, messageId);
      }
      
      throw new Error('Failed to generate payment URL');
    }
  }

  /**
   * Generate a direct wallet payment URL (X402 protocol)
   * @param {string} userId - The user ID
   * @param {string} messageId - The message ID
   * @returns {Promise<Object>} The payment URL and QR code
   */
  static async generateDirectPaymentUrl(userId, messageId) {
    const walletAddress = config.sensay.walletAddress || config.mockPayment.walletAddress;
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

    logger.info('Generated direct X402 payment URL:', {
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
  }

  /**
   * Retrieve charge information from Coinbase
   * @param {string} chargeId - The charge ID
   * @returns {Promise<Object>} The charge data
   */
  static async getCharge(chargeId) {
    try {
      const response = await axios.get(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
        headers: {
          'X-CC-Api-Key': config.coinbase.apiKey,
          'X-CC-Version': '2018-03-22'
        },
        timeout: 10000
      });

      return response.data.data;
    } catch (error) {
      logger.error('Error retrieving Coinbase charge:', {
        error: error.message,
        chargeId,
        response: error.response?.data
      });
      throw new Error('Failed to retrieve charge information');
    }
  }

  /**
   * Verify a webhook signature from Coinbase
   * @param {string} body - The raw request body
   * @param {string} signature - The signature from the header
   * @returns {boolean} Whether the signature is valid
   */
  static verifyWebhookSignature(body, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', config.coinbase.webhookSecret)
        .update(body, 'utf8')
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Verify a payment proof or charge status
   * @param {string} proof - The payment proof or charge ID
   * @returns {Promise<{valid: boolean, chargeId?: string, amount?: string, asset?: string}>}
   */
  static async verifyPaymentProof(proof) {
    try {
      // If it looks like a Coinbase charge ID, verify it directly
      if (proof && proof.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)) {
        const charge = await this.getCharge(proof);
        
        return {
          valid: charge.confirmed,
          chargeId: charge.id,
          amount: charge.pricing?.local?.amount || '0.01',
          asset: charge.pricing?.local?.currency || 'USD',
          status: charge.timeline?.[charge.timeline.length - 1]?.status || 'pending'
        };
      }
      
      // For custom verification endpoint (fallback)
      if (config.coinbase.verificationUrl) {
        const response = await axios.get(`${config.coinbase.verificationUrl}?proof=${encodeURIComponent(proof)}`, {
          headers: {
            'Authorization': `Bearer ${config.coinbase.apiKey}`
          },
          timeout: 5000
        });

        return response.data;
      }
      
      // If no verification method available
      return { valid: false, error: 'No verification method configured' };
    } catch (error) {
      logger.error('Error verifying payment proof:', {
        error: error.message,
        proof,
        response: error.response?.data
      });
      return { valid: false, error: error.message };
    }
  }

  /**
   * Check if a payment is valid for a user
   * @param {string} userId - The user ID
   * @param {string} proof - The payment proof or charge ID
   * @returns {Promise<boolean>} Whether the payment is valid
   */
  static async validateUserPayment(userId, proof) {
    try {
      // First check if we've already validated this proof
      const session = sessionStore.getSession(userId);
      if (session?.paymentInfo?.status === 'paid' && 
          (session.paymentInfo.proof === proof || session.paymentInfo.chargeId === proof)) {
        return true;
      }

      // Verify the proof with Coinbase
      const verificationResult = await this.verifyPaymentProof(proof);
      
      if (!verificationResult.valid) {
        logger.info('Payment verification failed:', {
          userId,
          proof,
          error: verificationResult.error
        });
        return false;
      }

      // For USD payments, verify the amount matches
      const expectedAmount = config.coinbase.paymentAmount.toString();
      if (verificationResult.amount && verificationResult.amount !== expectedAmount) {
        logger.warn('Payment verification failed: amount mismatch', {
          userId,
          expectedAmount,
          receivedAmount: verificationResult.amount,
          proof
        });
        return false;
      }

      // Update the session with payment info
      sessionStore.updatePaymentInfo(userId, {
        status: 'paid',
        invoiceId: verificationResult.chargeId || proof,
        chargeId: verificationResult.chargeId,
        amount: verificationResult.amount || expectedAmount,
        asset: verificationResult.asset || config.coinbase.asset,
        proof,
        paidAt: new Date().toISOString(),
        verificationStatus: verificationResult.status
      });

      logger.info('Payment validated successfully:', {
        userId,
        chargeId: verificationResult.chargeId,
        amount: verificationResult.amount
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

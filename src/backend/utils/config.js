// Configuration utility
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
  
  // Sensay API configuration
  sensay: {
    apiKey: process.env.SENSAY_API_KEY,
    orgId: process.env.SENSAY_ORG_ID,
    replicaId: process.env.SENSAY_REPLICA_ID,
    userId: process.env.SENSAY_USER_ID
  },
  
  // Coinbase x402 configuration
  coinbase: {
    apiKey: process.env.COINBASE_API_KEY,
    apiUrl: process.env.COINBASE_API_URL || 'https://api.cdp.coinbase.com',
    verificationUrl: process.env.X402_VERIFICATION_URL || `${process.env.COINBASE_API_URL}/x402/verify`,
    paymentAmount: process.env.X402_PAYMENT_AMOUNT || '0.01',
    asset: (process.env.X402_ASSET || 'usdc').toLowerCase(),
    chain: (process.env.X402_CHAIN || 'base').toLowerCase(),
    paymentExpiry: parseInt(process.env.X402_PAYMENT_EXPIRY || '3600', 10)
  }
};
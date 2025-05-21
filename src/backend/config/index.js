import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Payment
  mockPayment: {
    enabled: process.env.MOCK_PAYMENT_ENABLED === 'true',
    walletAddress: process.env.MOCK_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  
  // Coinbase
  coinbase: {
    secretKey: process.env.X402_SECRET_KEY,
    verificationUrl: process.env.X402_VERIFICATION_URL,
    paymentAmount: Number.parseFloat(process.env.X402_PAYMENT_AMOUNT || '0.01'),
    asset: process.env.X402_ASSET || 'usdc',
    chain: process.env.X402_CHAIN || 'base',
    paymentExpiry: Number.parseInt(process.env.X402_PAYMENT_EXPIRY || '3600', 10),
  },
  
  // Sensay
  sensay: {
    apiKey: process.env.SENSAY_API_KEY,
    orgId: process.env.SENSAY_ORG_ID,
    replicaId: process.env.SENSAY_REPLICA_ID,
    userId: process.env.SENSAY_USER_ID,
    walletAddress: process.env.REPLICA_WALLET_ADDRESS,
  },
};

export default config;

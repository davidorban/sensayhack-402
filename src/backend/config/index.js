import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
function validateConfig() {
  const required = {
    SENSAY_API_KEY: process.env.SENSAY_API_KEY,
  };
  
  const missing = Object.entries(required)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing required environment variables: ${missing.join(', ')}`);
    console.warn('Some features may not work correctly.');
  }
  
  // Warn about missing optional but recommended variables
  const recommended = {
    COINBASE_API_KEY: process.env.COINBASE_API_KEY,
    COINBASE_WEBHOOK_SECRET: process.env.COINBASE_WEBHOOK_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    DATABASE_TYPE: process.env.DATABASE_TYPE,
  };
  
  // Check database-specific configuration
  if (process.env.DATABASE_TYPE === 'redis' && !process.env.REDIS_URL) {
    console.warn('⚠️  DATABASE_TYPE is set to redis but REDIS_URL is not configured');
  }
  
  if (process.env.DATABASE_TYPE === 'postgresql' && !process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_TYPE is set to postgresql but DATABASE_URL is not configured');
  }
  
  const missingRecommended = Object.entries(recommended)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (missingRecommended.length > 0) {
    console.info(`ℹ️  Missing recommended environment variables: ${missingRecommended.join(', ')}`);
    console.info('Consider setting these for full functionality.');
  }
}

// Validate configuration on startup
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Payment
  mockPayment: {
    enabled: process.env.MOCK_PAYMENT_ENABLED === 'true',
    walletAddress: process.env.MOCK_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  
  // Coinbase Commerce Integration
  coinbase: {
    apiKey: process.env.COINBASE_API_KEY,
    webhookSecret: process.env.COINBASE_WEBHOOK_SECRET,
    verificationUrl: process.env.X402_VERIFICATION_URL,
    paymentAmount: Number.parseFloat(process.env.X402_PAYMENT_AMOUNT || '0.01'),
    asset: process.env.X402_ASSET || 'USD',
    chain: process.env.X402_CHAIN || 'base',
    paymentExpiry: Number.parseInt(process.env.X402_PAYMENT_EXPIRY || '3600', 10),
    // Fallback for direct payments
    secretKey: process.env.X402_SECRET_KEY,
  },
  
  // Sensay AI Integration
  sensay: {
    apiKey: process.env.SENSAY_API_KEY,
    orgId: process.env.SENSAY_ORG_ID,
    replicaId: process.env.SENSAY_REPLICA_ID,
    userId: process.env.SENSAY_USER_ID,
    walletAddress: process.env.REPLICA_WALLET_ADDRESS,
  },
  
  // Database configuration
  database: {
    type: process.env.DATABASE_TYPE || 'memory', // 'memory', 'redis', 'postgresql'
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    postgresql: {
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/replica402',
    },
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    maxAge: Number.parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours
  },
  
  // Security configuration
  security: {
    rateLimitWindowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    rateLimitMax: Number.parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
  },
};

// Helper function to check if production configuration is valid
config.isProductionReady = () => {
  return !!(
    config.sensay.apiKey &&
    config.session.secret !== 'your-secret-key-change-in-production' &&
    (config.coinbase.apiKey || config.mockPayment.enabled)
  );
};

// Helper function to get payment mode
config.getPaymentMode = () => {
  if (config.mockPayment.enabled) return 'mock';
  if (config.coinbase.apiKey) return 'coinbase';
  return 'direct';
};

export default config;

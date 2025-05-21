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
  }
};
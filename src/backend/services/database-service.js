// Database service for persistent storage
import { logger } from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Abstract database service that can work with different storage backends
 */
export class DatabaseService {
  constructor() {
    this.backend = null;
    this.initialized = false;
  }

  /**
   * Initialize the database service with the configured backend
   */
  async initialize() {
    try {
      const backendType = config.database?.type || 'memory';
      
      switch (backendType) {
        case 'redis':
          this.backend = new RedisBackend();
          break;
        case 'postgresql':
          this.backend = new PostgreSQLBackend();
          break;
        case 'memory':
        default:
          this.backend = new MemoryBackend();
          logger.warn('Using in-memory database backend. Data will not persist between restarts.');
          break;
      }
      
      await this.backend.initialize();
      this.initialized = true;
      
      logger.info(`Database service initialized with ${backendType} backend`);
    } catch (error) {
      logger.error('Failed to initialize database service:', error);
      throw error;
    }
  }

  /**
   * Store user session data
   */
  async setSession(userId, sessionData) {
    if (!this.initialized) await this.initialize();
    return this.backend.setSession(userId, sessionData);
  }

  /**
   * Retrieve user session data
   */
  async getSession(userId) {
    if (!this.initialized) await this.initialize();
    return this.backend.getSession(userId);
  }

  /**
   * Delete user session
   */
  async deleteSession(userId) {
    if (!this.initialized) await this.initialize();
    return this.backend.deleteSession(userId);
  }

  /**
   * Store payment information
   */
  async setPayment(paymentId, paymentData) {
    if (!this.initialized) await this.initialize();
    return this.backend.setPayment(paymentId, paymentData);
  }

  /**
   * Retrieve payment information
   */
  async getPayment(paymentId) {
    if (!this.initialized) await this.initialize();
    return this.backend.getPayment(paymentId);
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId, status, metadata = {}) {
    if (!this.initialized) await this.initialize();
    return this.backend.updatePaymentStatus(paymentId, status, metadata);
  }

  /**
   * Store payment receipt
   */
  async setReceipt(paymentId, receiptData) {
    if (!this.initialized) await this.initialize();
    return this.backend.setReceipt(paymentId, receiptData);
  }

  /**
   * Retrieve payment receipt
   */
  async getReceipt(paymentId) {
    if (!this.initialized) await this.initialize();
    return this.backend.getReceipt(paymentId);
  }

  /**
   * Clean up expired data
   */
  async cleanup() {
    if (!this.initialized) await this.initialize();
    return this.backend.cleanup();
  }

  /**
   * Get database statistics
   */
  async getStats() {
    if (!this.initialized) await this.initialize();
    return this.backend.getStats();
  }

  /**
   * Close database connections
   */
  async close() {
    if (this.backend) {
      await this.backend.close();
      this.initialized = false;
    }
  }
}

/**
 * In-memory backend (fallback)
 */
class MemoryBackend {
  constructor() {
    this.sessions = new Map();
    this.payments = new Map();
    this.receipts = new Map();
  }

  async initialize() {
    // No initialization needed for memory backend
  }

  async setSession(userId, sessionData) {
    this.sessions.set(userId, {
      ...sessionData,
      updatedAt: new Date().toISOString()
    });
  }

  async getSession(userId) {
    return this.sessions.get(userId) || null;
  }

  async deleteSession(userId) {
    return this.sessions.delete(userId);
  }

  async setPayment(paymentId, paymentData) {
    this.payments.set(paymentId, {
      ...paymentData,
      updatedAt: new Date().toISOString()
    });
  }

  async getPayment(paymentId) {
    return this.payments.get(paymentId) || null;
  }

  async updatePaymentStatus(paymentId, status, metadata = {}) {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = status;
      payment.updatedAt = new Date().toISOString();
      payment.metadata = { ...payment.metadata, ...metadata };
      this.payments.set(paymentId, payment);
    }
  }

  async setReceipt(paymentId, receiptData) {
    this.receipts.set(paymentId, {
      ...receiptData,
      createdAt: new Date().toISOString()
    });
  }

  async getReceipt(paymentId) {
    return this.receipts.get(paymentId) || null;
  }

  async cleanup() {
    // Clean up expired sessions and payments
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean expired sessions
    for (const [userId, session] of this.sessions.entries()) {
      const updatedAt = new Date(session.updatedAt).getTime();
      if (now - updatedAt > maxAge) {
        this.sessions.delete(userId);
      }
    }

    // Clean expired payments
    for (const [paymentId, payment] of this.payments.entries()) {
      const updatedAt = new Date(payment.updatedAt).getTime();
      if (now - updatedAt > maxAge) {
        this.payments.delete(paymentId);
      }
    }
  }

  async getStats() {
    return {
      sessions: this.sessions.size,
      payments: this.payments.size,
      receipts: this.receipts.size,
      backend: 'memory'
    };
  }

  async close() {
    // No cleanup needed for memory backend
  }
}

/**
 * Redis backend for production use
 */
class RedisBackend {
  constructor() {
    this.client = null;
  }

  async initialize() {
    try {
      const redis = await import('redis');
      this.client = redis.createClient({
        url: config.database.redis.url,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
      });

      await this.client.connect();
      logger.info('Connected to Redis');
    } catch (error) {
      logger.error('Failed to initialize Redis backend:', error);
      throw error;
    }
  }

  async setSession(userId, sessionData) {
    const key = `session:${userId}`;
    const data = JSON.stringify(sessionData);
    await this.client.setEx(key, config.session.maxAge / 1000, data);
  }

  async getSession(userId) {
    const key = `session:${userId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(userId) {
    const key = `session:${userId}`;
    return await this.client.del(key);
  }

  async setPayment(paymentId, paymentData) {
    const key = `payment:${paymentId}`;
    const data = JSON.stringify(paymentData);
    await this.client.setEx(key, config.coinbase.paymentExpiry, data);
  }

  async getPayment(paymentId) {
    const key = `payment:${paymentId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async updatePaymentStatus(paymentId, status, metadata = {}) {
    const payment = await this.getPayment(paymentId);
    if (payment) {
      payment.status = status;
      payment.updatedAt = new Date().toISOString();
      payment.metadata = { ...payment.metadata, ...metadata };
      await this.setPayment(paymentId, payment);
    }
  }

  async setReceipt(paymentId, receiptData) {
    const key = `receipt:${paymentId}`;
    const data = JSON.stringify(receiptData);
    await this.client.setEx(key, 7 * 24 * 60 * 60, data); // 7 days
  }

  async getReceipt(paymentId) {
    const key = `receipt:${paymentId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async cleanup() {
    // Redis handles expiration automatically
    logger.info('Redis cleanup not needed - automatic expiration enabled');
  }

  async getStats() {
    const info = await this.client.info('memory');
    const sessionKeys = await this.client.keys('session:*');
    const paymentKeys = await this.client.keys('payment:*');
    const receiptKeys = await this.client.keys('receipt:*');

    return {
      sessions: sessionKeys.length,
      payments: paymentKeys.length,
      receipts: receiptKeys.length,
      backend: 'redis',
      memory: info
    };
  }

  async close() {
    if (this.client) {
      await this.client.quit();
    }
  }
}

/**
 * PostgreSQL backend for full relational database support
 */
class PostgreSQLBackend {
  constructor() {
    this.pool = null;
  }

  async initialize() {
    try {
      const { Pool } = await import('pg');
      this.pool = new Pool({
        connectionString: config.database.postgresql.url,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      // Create tables if they don't exist
      await this.createTables();

      logger.info('Connected to PostgreSQL');
    } catch (error) {
      logger.error('Failed to initialize PostgreSQL backend:', error);
      throw error;
    }
  }

  async createTables() {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          user_id VARCHAR(255) PRIMARY KEY,
          session_data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS payments (
          payment_id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255),
          payment_data JSONB NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 hour'
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS payment_receipts (
          payment_id VARCHAR(255) PRIMARY KEY,
          receipt_data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days'
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_payments_expires ON payments(expires_at);
      `);

      logger.info('PostgreSQL tables created/verified');
    } finally {
      client.release();
    }
  }

  async setSession(userId, sessionData) {
    const client = await this.pool.connect();
    try {
      await client.query(`
        INSERT INTO user_sessions (user_id, session_data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET session_data = $2, updated_at = NOW()
      `, [userId, JSON.stringify(sessionData)]);
    } finally {
      client.release();
    }
  }

  async getSession(userId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT session_data FROM user_sessions 
        WHERE user_id = $1 AND expires_at > NOW()
      `, [userId]);
      
      return result.rows.length > 0 ? result.rows[0].session_data : null;
    } finally {
      client.release();
    }
  }

  async deleteSession(userId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        DELETE FROM user_sessions WHERE user_id = $1
      `, [userId]);
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  async setPayment(paymentId, paymentData) {
    const client = await this.pool.connect();
    try {
      await client.query(`
        INSERT INTO payments (payment_id, user_id, payment_data, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (payment_id)
        DO UPDATE SET payment_data = $3, updated_at = NOW()
      `, [paymentId, paymentData.userId, JSON.stringify(paymentData)]);
    } finally {
      client.release();
    }
  }

  async getPayment(paymentId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT payment_data FROM payments 
        WHERE payment_id = $1 AND expires_at > NOW()
      `, [paymentId]);
      
      return result.rows.length > 0 ? result.rows[0].payment_data : null;
    } finally {
      client.release();
    }
  }

  async updatePaymentStatus(paymentId, status, metadata = {}) {
    const client = await this.pool.connect();
    try {
      await client.query(`
        UPDATE payments 
        SET status = $1, 
            payment_data = payment_data || $2,
            updated_at = NOW()
        WHERE payment_id = $3
      `, [status, JSON.stringify({ metadata }), paymentId]);
    } finally {
      client.release();
    }
  }

  async setReceipt(paymentId, receiptData) {
    const client = await this.pool.connect();
    try {
      await client.query(`
        INSERT INTO payment_receipts (payment_id, receipt_data)
        VALUES ($1, $2)
        ON CONFLICT (payment_id)
        DO UPDATE SET receipt_data = $2
      `, [paymentId, JSON.stringify(receiptData)]);
    } finally {
      client.release();
    }
  }

  async getReceipt(paymentId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT receipt_data FROM payment_receipts 
        WHERE payment_id = $1 AND expires_at > NOW()
      `, [paymentId]);
      
      return result.rows.length > 0 ? result.rows[0].receipt_data : null;
    } finally {
      client.release();
    }
  }

  async cleanup() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        DELETE FROM user_sessions WHERE expires_at < NOW();
        DELETE FROM payments WHERE expires_at < NOW();
        DELETE FROM payment_receipts WHERE expires_at < NOW();
      `);
      logger.info('PostgreSQL cleanup completed');
    } finally {
      client.release();
    }
  }

  async getStats() {
    const client = await this.pool.connect();
    try {
      const sessionResult = await client.query('SELECT COUNT(*) FROM user_sessions WHERE expires_at > NOW()');
      const paymentResult = await client.query('SELECT COUNT(*) FROM payments WHERE expires_at > NOW()');
      const receiptResult = await client.query('SELECT COUNT(*) FROM payment_receipts WHERE expires_at > NOW()');

      return {
        sessions: parseInt(sessionResult.rows[0].count),
        payments: parseInt(paymentResult.rows[0].count),
        receipts: parseInt(receiptResult.rows[0].count),
        backend: 'postgresql'
      };
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

// Create singleton instance
export const databaseService = new DatabaseService();

// Export backend classes for testing
export { MemoryBackend, RedisBackend, PostgreSQLBackend };
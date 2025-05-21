// ID generator utility
import crypto from 'node:crypto';

/**
 * Generate a unique message ID
 * @param {string} userId - User ID
 * @returns {string} Message ID
 */
export function generateMessageId(userId) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${userId}_${timestamp}_${random}`;
}

/**
 * Generate a unique request ID
 * @returns {string} Request ID
 */
export function generateRequestId() {
  return `req_${crypto.randomBytes(4).toString('hex')}`;
}
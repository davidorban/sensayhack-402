// Sensay API integration service
import axios from 'axios';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';

/**
 * Service for Sensay API integration
 */
export class SensayService {
  /**
   * Send a message to the Sensay API
   * @param {string} message - The user's message
   * @param {string} userId - The user's ID
   * @param {string} messageId - The message ID
   * @returns {Promise<Object>} The API response
   */
  static async sendMessage(message, userId, messageId) {
    try {
      logger.info('Sending request to Sensay API:', { 
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        userId,
        messageId 
      });

      const requestData = {
        messages: [
          {
            role: 'user',
            content: message,
            metadata: {
              userId,
              messageId,
              sessionId: userId,
              timestamp: new Date().toISOString()
            }
          }
        ],
        model: 'gpt-4',  // Specify the model explicitly
        temperature: 0.7,
        max_tokens: 1000
      };
      
      // Determine which endpoint to use
      let endpoint = 'https://api.sensay.io/v1/chat/completions';
      if (config.sensay.replicaId) {
        endpoint = `https://api.sensay.io/v1/experimental/replicas/${config.sensay.replicaId}/chat/completions`;
      }
      
      logger.info(`Using Sensay API endpoint: ${endpoint}`);
      
      // Set up headers to match the working curl command exactly
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Version': '2025-03-25',
        'X-ORGANIZATION-SECRET': config.sensay.apiKey,
        'X-API-KEY': config.sensay.apiKey,
        'X-USER-ID': config.sensay.userId // Using the specific user ID from .env
      };
      
      // Make the API request
      const response = await axios.post(endpoint, requestData, {
        headers,
        timeout: 30000 // 30 second timeout
      });
      
      logger.info('Received response from Sensay API:', {
        status: response.status,
        statusText: response.statusText
      });
      
      // Extract the response data
      if (!response.data || !response.data.choices || response.data.choices.length === 0) {
        throw new Error('Invalid response format from Sensay API');
      }
      
      return {
        reply: response.data.choices[0]?.message?.content || '[no reply]',
        model: response.data.model || 'unknown-model',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error in Sensay API request:', {
        error: error.message,
        userId,
        messageId,
        response: error.response?.data
      });
      
      // Add more detailed debugging info
      if (error.response) {
        logger.error('Detailed API error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      // Return a user-friendly error message
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your API credentials.');
      } else if (error.response?.status === 404) {
        throw new Error('The specified Replica was not found. Please check your Replica ID.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request to Sensay API timed out. Please try again.');
      } else {
        throw new Error(`Failed to get response from AI: ${error.message}`);
      }
    }
  }
}
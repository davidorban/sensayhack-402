/**
 * Page Mode Handler
 * Manages the test/live mode settings based on which page the user is on
 * 
 * Simple approach with dedicated pages:
 * - test.html: Uses test mode for both payment and replica
 * - live.html: Uses live mode for both payment and replica
 */

class PageMode {
  constructor() {
    // Default modes based on current page
    this.paymentTestMode = this.isTestPage();
    this.replicaTestMode = this.isTestPage();
    
    // Log initialization
    console.log('PageMode initialized:', {
      paymentTestMode: this.paymentTestMode,
      replicaTestMode: this.replicaTestMode,
      currentPage: this.getCurrentPage()
    });
  }
  
  /**
   * Get the current page type
   * @returns {string} 'live', 'test', or 'index'
   */
  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('live.html')) {
      return 'live';
    } else if (path.includes('test.html')) {
      return 'test';
    }
    return 'index';
  }
  
  /**
   * Check if the current page is the test page
   * @returns {boolean} true if on test.html, false otherwise
   */
  isTestPage() {
    return this.getCurrentPage() === 'test';
  }
  
  /**
   * Check if the current page is the live page
   * @returns {boolean} true if on live.html, false otherwise
   */
  isLivePage() {
    return this.getCurrentPage() === 'live';
  }
  
  /**
   * Get the current mode for payment
   * @returns {boolean} true if in test mode, false if in live mode
   */
  useTestPayment() {
    return this.isTestPage();
  }
  
  /**
   * Get the current mode for replica
   * @returns {boolean} true if in test mode, false if in live mode
   */
  useTestReplica() {
    return this.isTestPage();
  }
  
  /**
   * Get payment configuration based on current mode
   * @returns {Object} Configuration object with isTestMode, baseUrl, and type
   */
  getPaymentConfig() {
    const isTestMode = this.isTestPage();
    
    return {
      isTestMode: isTestMode,
      baseUrl: isTestMode ? '/api/chat/test' : '/api/chat',
      type: isTestMode ? 'mock' : 'coinbase'
    };
  }
  
  /**
   * Get the current mode as a string
   * @returns {string} Description of current modes
   */
  getMode() {
    const mode = this.isTestPage() ? 'TEST' : 'LIVE';
    return `Mode: ${mode}`;
  }
}

// Initialize page mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create the page mode instance and make it globally available
  window.paymentMode = new PageMode();
});

/**
 * Page Mode Handler
 * Manages the test/live mode settings based on which page the user is on
 * 
 * This replaces the toggle functionality with a simpler approach:
 * - test.html: Forces both payment and replica to test mode
 * - live.html: Forces both payment and replica to live mode
 */

class PageMode {
  constructor() {
    // Default modes
    this.paymentTestMode = true;  // Default to test mode for payments
    this.replicaTestMode = true;  // Default to test mode for replica
    
    // Load saved settings from localStorage
    this.loadSettings();
    
    // Log initialization
    console.log('PageMode initialized:', {
      paymentTestMode: this.paymentTestMode,
      replicaTestMode: this.replicaTestMode,
      currentPage: this.getCurrentPage()
    });
  }
  
  /**
   * Get the current page type
   * @returns {string} 'live' or 'other'
   */
  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('live.html')) {
      return 'live';
    }
    return 'other';
  }
  
  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      // Check current page first
      const currentPage = this.getCurrentPage();
      
      if (currentPage === 'live') {
        // Force live mode for live page
        this.paymentTestMode = false;
        this.replicaTestMode = false;
        // Save these settings
        localStorage.setItem('paymentTestMode', 'false');
        localStorage.setItem('replicaTestMode', 'false');
      } else {
        // For other pages (like index), load from localStorage or default to live mode
        const savedPaymentMode = localStorage.getItem('paymentTestMode');
        if (savedPaymentMode !== null) {
          this.paymentTestMode = savedPaymentMode === 'true';
        } else {
          // Default to live mode
          this.paymentTestMode = false;
          localStorage.setItem('paymentTestMode', 'false');
        }
        
        const savedReplicaMode = localStorage.getItem('replicaTestMode');
        if (savedReplicaMode !== null) {
          this.replicaTestMode = savedReplicaMode === 'true';
        } else {
          // Default to live mode
          this.replicaTestMode = false;
          localStorage.setItem('replicaTestMode', 'false');
        }
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage:', e);
    }
  }
  
  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('paymentTestMode', this.paymentTestMode);
      localStorage.setItem('replicaTestMode', this.replicaTestMode);
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
  }
  
  /**
   * Get the current mode for payment
   * @returns {boolean} true if in test mode, false if in live mode
   */
  useTestPayment() {
    // For local development, allow test mode for easier debugging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return this.paymentTestMode;
    }
    // In production, always use live mode
    return false;
  }
  
  /**
   * Get the current mode for replica
   * @returns {boolean} true if in test mode, false if in live mode
   */
  useTestReplica() {
    // For local development, allow test mode for easier debugging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return this.replicaTestMode;
    }
    // In production, always use live mode
    return false;
  }
  
  /**
   * Get payment configuration based on current mode
   * @returns {Object} Configuration object with isTestMode, baseUrl, and type
   */
  getPaymentConfig() {
    // For local development, respect the test mode setting
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return {
        isTestMode: this.paymentTestMode,
        baseUrl: this.paymentTestMode ? '/api/mock/payment' : '/payment',
        type: this.paymentTestMode ? 'mock' : 'coinbase'
      };
    }
    
    // In production, always use live mode
    return {
      isTestMode: false,
      baseUrl: '/payment',
      type: 'coinbase'
    };
  }
  
  /**
   * Get the current mode as a string
   * @returns {string} Description of current modes
   */
  getMode() {
    return `Payment: ${this.paymentTestMode ? 'TEST' : 'LIVE'}, Replica: ${this.replicaTestMode ? 'TEST' : 'LIVE'}`;
  }
  
  /**
   * Notify other components about mode changes
   */
  notifyModeChange() {
    // Create and dispatch a custom event
    const event = new CustomEvent('paymentModeChanged', {
      detail: {
        paymentTestMode: this.paymentTestMode,
        replicaTestMode: this.replicaTestMode
      }
    });
    
    window.dispatchEvent(event);
  }
}

// Initialize page mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create the page mode instance and make it globally available
  window.paymentMode = new PageMode();
});

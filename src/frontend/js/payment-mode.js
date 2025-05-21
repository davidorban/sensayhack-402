/**
 * Payment and Replica Mode Toggle
 * Handles switching between test/live modes for both payments and replica
 * 
 * Mode Operation:
 * - Payment Mode: Controls whether test or production payments are used
 * - Replica Mode: Controls whether test AI service or live responses are used
 * 
 * When Replica Toggle is set to "Test" position, messages should be intercepted
 * and test responses should be returned instead of using the live service.
 */

class PaymentMode {
  constructor() {
    // Toggle elements
    this.paymentToggle = document.getElementById('payment-mode-toggle');
    this.replicaToggle = document.getElementById('replica-mode-toggle');
    
    // Default modes
    this.paymentTestMode = true;  // Default to test mode for payments
    this.replicaTestMode = true;  // Default to test mode for replica
    
    // Load saved settings from localStorage if available
    this.loadSettings();
    
    // Add event listeners for mode changes
    if (this.paymentToggle) {
      this.paymentToggle.addEventListener('change', () => this.handleModeChange('payment'));
    }
    
    if (this.replicaToggle) {
      this.replicaToggle.addEventListener('change', () => this.handleModeChange('replica'));
    }
    
    // Update UI to reflect current modes
    this.updateUI();
    
    // Log initialization
    console.log('PaymentMode initialized:', {
      paymentTestMode: this.paymentTestMode,
      replicaTestMode: this.replicaTestMode
    });
  }
  
  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      // Load payment mode
      const savedPaymentMode = localStorage.getItem('paymentTestMode');
      if (savedPaymentMode !== null) {
        this.paymentTestMode = savedPaymentMode === 'true';
        if (this.paymentToggle) {
          this.paymentToggle.checked = this.paymentTestMode;
        }
      }
      
      // Load replica mode
      const savedReplicaMode = localStorage.getItem('replicaTestMode');
      if (savedReplicaMode !== null) {
        this.replicaTestMode = savedReplicaMode === 'true';
        if (this.replicaToggle) {
          this.replicaToggle.checked = this.replicaTestMode;
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
   * Handle mode change event for either payment or replica
   * @param {string} type - 'payment' or 'replica'
   */
  handleModeChange(type) {
    if (type === 'payment' && this.paymentToggle) {
      this.paymentTestMode = this.paymentToggle.checked;
      console.log(`Payment mode changed to: ${this.paymentTestMode ? 'Test' : 'Live'}`);
    } else if (type === 'replica' && this.replicaToggle) {
      this.replicaTestMode = this.replicaToggle.checked;
      console.log(`Replica mode changed to: ${this.replicaTestMode ? 'Test' : 'Live'}`);
    }
    
    this.saveSettings();
    this.updateUI();
    
    // Notify other components of the mode changes
    const modeChangeEvent = new CustomEvent('paymentModeChanged', { 
      detail: { 
        paymentTestMode: this.paymentTestMode,
        replicaTestMode: this.replicaTestMode
      } 
    });
    document.dispatchEvent(modeChangeEvent);
  }
  
  /**
   * Update UI to reflect current modes
   */
  updateUI() {
    // Update toggle states based on current modes
    if (this.paymentToggle) {
      this.paymentToggle.checked = this.paymentTestMode;
    }
    
    if (this.replicaToggle) {
      this.replicaToggle.checked = this.replicaTestMode;
    }
    
    // Log current states
    console.log(`Payment mode: ${this.paymentTestMode ? 'TEST' : 'LIVE'}, ` +
                `Replica mode: ${this.replicaTestMode ? 'TEST' : 'LIVE'}`);
                
    // Notify other components about mode changes
    this.notifyModeChange();
  }
  
  /**
   * Get the current payment configuration
   */
  getPaymentConfig() {
    return {
      isTestMode: this.paymentTestMode,
      baseUrl: this.paymentTestMode ? '/payment' : '/payment',
      type: this.paymentTestMode ? 'test' : 'production'
    };
  }
  
  /**
   * Check if we should use the test replica
   */
  useTestReplica() {
    console.log('useTestReplica called, returning:', this.replicaTestMode);
    return this.replicaTestMode;
  }
  
  /**
   * Get current payment mode
   * @returns {string} 'test' or 'live'
   */
  getMode() {
    return this.paymentTestMode ? 'test' : 'live';
  }
  
  /**
   * Check if in test mode
   * @returns {boolean}
   */
  isTest() {
    return this.paymentTestMode;
  }
  
  /**
   * Check if mock responses should be used
   */
  shouldUseMockResponses() {
    return this.replicaTestMode;
  }
  
  /**
   * Notify other components about mode change
   */
  notifyModeChange() {
    const event = new CustomEvent('paymentModeChanged', {
      detail: { 
        paymentTestMode: this.paymentTestMode,
        replicaTestMode: this.replicaTestMode
      }
    });
    window.dispatchEvent(event);
    console.log('Notified mode change:', {
      paymentTestMode: this.paymentTestMode,
      replicaTestMode: this.replicaTestMode
    });
  }
}

// Initialize payment mode toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.paymentMode = new PaymentMode();
});

// No export for browser usage

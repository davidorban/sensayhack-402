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
          // When in Test mode, toggle should be on the left (unchecked)
          // When in Live mode, toggle should be on the right (checked)
          this.paymentToggle.checked = !this.paymentTestMode;
        }
      }
      
      // Load replica mode
      const savedReplicaMode = localStorage.getItem('replicaTestMode');
      if (savedReplicaMode !== null) {
        this.replicaTestMode = savedReplicaMode === 'true';
        if (this.replicaToggle) {
          // When in Test mode, toggle should be on the left (unchecked)
          // When in Live mode, toggle should be on the right (checked)
          this.replicaToggle.checked = !this.replicaTestMode;
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
      // Get the current toggle position
      const isLiveMode = this.paymentToggle.checked;
      
      // Update internal state
      // When toggle is on the right (checked/blue), it's Live mode
      // When toggle is on the left (unchecked/gray), it's Test mode
      this.paymentTestMode = !isLiveMode;
      
      console.log(`Payment mode changed to: ${isLiveMode ? 'Live' : 'Test'} (Toggle checked: ${isLiveMode})`);
    } else if (type === 'replica' && this.replicaToggle) {
      // Get the current toggle position
      const isLiveMode = this.replicaToggle.checked;
      
      // Update internal state
      // When toggle is on the right (checked/blue), it's Live mode
      // When toggle is on the left (unchecked/gray), it's Test mode
      this.replicaTestMode = !isLiveMode;
      
      console.log(`Replica mode changed to: ${isLiveMode ? 'Live' : 'Test'} (Toggle checked: ${isLiveMode})`);
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
      // When in Test mode, toggle should be on the left (unchecked)
      // When in Live mode, toggle should be on the right (checked)
      this.paymentToggle.checked = !this.paymentTestMode;
      
      // No need to update label visibility for payment toggle anymore
    }
    
    if (this.replicaToggle) {
      // When in Test mode, toggle should be on the left (unchecked)
      // When in Live mode, toggle should be on the right (checked)
      this.replicaToggle.checked = !this.replicaTestMode;
      
      // No need to update label visibility for replica toggle anymore
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
    // Get the actual toggle position - right/checked (blue) = LIVE, left/unchecked (gray) = TEST
    const isTestMode = !this.paymentToggle?.checked;
    
    return {
      isTestMode: isTestMode,
      baseUrl: isTestMode ? '/payment/test' : '/payment',
      type: isTestMode ? 'test' : 'production'
    };
  }
  
  /**
   * Check if we should use the test replica
   */
  useTestReplica() {
    // Get the actual toggle position - right/checked (blue) = LIVE, left/unchecked (gray) = TEST
    // This method should return true for Test mode, false for Live mode
    const useTestMode = !this.replicaToggle?.checked;
    console.log('useTestReplica called, returning:', useTestMode);
    return useTestMode;
  }
  
  /**
   * Get current payment mode
   * @returns {string} 'test' or 'live'
   */
  getMode() {
    // Get the actual toggle position - right/checked (blue) = LIVE, left/unchecked (gray) = TEST
    return this.paymentToggle?.checked ? 'live' : 'test';
  }
  
  /**
   * Check if in test mode
   * @returns {boolean}
   */
  isTest() {
    // Get the actual toggle position - right/checked (blue) = LIVE, left/unchecked (gray) = TEST
    return !this.paymentToggle?.checked;
  }
  
  /**
   * Check if mock responses should be used
   */
  shouldUseMockResponses() {
    // Get the actual toggle position - right/checked (blue) = LIVE, left/unchecked (gray) = TEST
    return !this.replicaToggle?.checked;
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
  
  // updateModeIndicators method has been removed
}

// Initialize payment mode toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.paymentMode = new PaymentMode();
});

// No export for browser usage
// This file is for browser usage only

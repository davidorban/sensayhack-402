/**
 * Payment functionality
 */

// DOM Elements
const paymentBox = document.getElementById('payment-instructions');

// Variables
const lastPayProof = { value: null };
const pendingMessage = { value: null };
let paymentWindow = null;
let paymentCheckInterval = null;

// Payment configuration
const PAYMENT_CONFIG = {
  test: {
    baseUrl: '/api/mock-pay',
    type: 'mock'
  },
  live: {
    baseUrl: '/payment',
    type: 'coinbase'
  }
};

// Open payment window and handle payment flow
async function openPaymentWindow(paymentUrl, paymentId) {
  showInfo('Opening payment window...');
  console.log('Opening payment window with URL:', paymentUrl, 'Payment ID:', paymentId);
  
  // Ensure we have a session ID
  if (!currentSessionId) {
    const sessionId = `sess_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('sessionId', sessionId);
    currentSessionId = sessionId;
  }
  
  // Ensure paymentId is defined
  if (!paymentId) {
    console.error('No payment ID provided to openPaymentWindow');
    showError('Error: Missing payment ID. Please try again.');
    return;
  }
  
  // Show loading state
  const loadingMessageId = `loading-${Date.now()}`;
  addMessage('Processing payment request...', 'system', loadingMessageId);
  
  try {
    // Open the payment window
    const width = 500;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // Get current payment mode configuration
    const paymentConfig = window.paymentMode?.getPaymentConfig?.() || {
      isTestMode: true,
      baseUrl: '/api/mock-pay',
      type: 'mock'
    };
    
    // Create URL object and add parameters
    const url = new URL(paymentUrl, window.location.origin);
    
    // Add test mode parameter if in test mode
    if (paymentConfig.isTestMode) {
      url.searchParams.set('test', 'true');
    }
    
    // Add session ID and payment ID
    url.searchParams.set('sessionId', currentSessionId);
    url.searchParams.set('paymentId', paymentId);
    
    const fullUrl = url.toString();
    
    // Open the payment window
    paymentWindow = window.open(
      fullUrl,
      'paymentWindow',
      `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no`
    );
    
    console.log(`Opening ${paymentConfig.isTestMode ? 'test' : 'live'} payment window:`, fullUrl);
    
    if (!paymentWindow) {
      throw new Error('Popup was blocked. Please allow popups for this site and try again.');
    }
    
    return new Promise((resolve, reject) => {
      // Create a function to check payment status
      async function checkPaymentStatus() {
        try {
          if (paymentWindow.closed) {
            // Check payment status
            const statusResponse = await fetch(`/payment/status/${paymentId}?userId=${encodeURIComponent(currentSessionId)}`);
            if (!statusResponse.ok) {
              throw new Error('Failed to check payment status');
            }
            
            const statusData = await statusResponse.json();
            
            if (statusData.paid) {
              clearInterval(checkInterval);
              resolve(true);
              showSuccess('Payment successful! Processing your message...');
              
              // Get any pending messages from session storage
              const pendingMessages = JSON.parse(sessionStorage.getItem(`pending_${currentSessionId}`) || '[]');
              const pendingMessageIndex = pendingMessages.findIndex(msg => msg.paymentId === paymentId);
              
              if (pendingMessageIndex !== -1) {
                const pendingMessage = pendingMessages[pendingMessageIndex];
                
                // Remove from pending
                pendingMessages.splice(pendingMessageIndex, 1);
                sessionStorage.setItem(`pending_${currentSessionId}`, JSON.stringify(pendingMessages));
                
                // Resend the message with the same message ID
                await sendMessage(pendingMessage.content, pendingMessage.messageId, currentSessionId, true);
              }
              
              // Hide payment instructions if visible
              if (paymentBox) {
                paymentBox.style.display = 'none';
              }
            }
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          clearInterval(checkInterval);
          reject(error);
        }
      }
      
      // Create a function to handle payment timeout
      function handlePaymentTimeout() {
        clearInterval(checkInterval);
        if (paymentWindow && !paymentWindow.closed) {
          paymentWindow.close();
        }
        reject(new Error('Payment window timed out'));
      }
      
      // Listen for payment completion
      const checkInterval = setInterval(checkPaymentStatus, 1000);
      
      // Also check if the tab is still open after 5 minutes
      const timeoutId = setTimeout(handlePaymentTimeout, 5 * 60 * 1000);
      
      // Clean up the timeout when the promise resolves or rejects
      const cleanup = () => clearTimeout(timeoutId);
      Promise.resolve().then(() => {
        if (typeof checkPaymentStatus === 'function') {
          const paymentPromise = new Promise((resolve, reject) => {
            const checkInterval = setInterval(checkPaymentStatus, 1000);
            // Also add the same cleanup to the new promise
            const cleanupCheck = () => {
              clearInterval(checkInterval);
              clearTimeout(timeoutId);
            };
            // Attach cleanup to both success and failure cases
            resolve.cleanupFn = cleanupCheck;
            reject.cleanupFn = cleanupCheck;
          });
          
          paymentPromise.then(cleanup, cleanup);
        }
      });
    });
    
  } catch (error) {
    console.error('Payment error:', error);
    showError(`Payment error: ${error.message}`);
    throw error;
  } finally {
    // Remove loading message
    removeMessage(loadingMessageId);
  }
}

// Show payment button with retry option
function showPaymentButton(paymentId, sessionId = null) {
  const currentSessionId = sessionId || (window.currentSessionId || 'sess_' + Math.random().toString(36).substring(2, 15));
  
  // Set the current session ID if not already set
  if (!window.currentSessionId) {
    window.currentSessionId = currentSessionId;
    localStorage.setItem('sessionId', currentSessionId);
  }
  
  const sessionContext = currentSessionId ? `
    <div class="session-info">
      <p>Session ID: <code class="session-id">${currentSessionId}</code></p>
      <p>Payment ID: <code class="payment-id">${paymentId}</code></p>
    </div>` : '';
  
  // Create the payment container
  paymentBox.innerHTML = `
    <div class="payment-container">
      <h3>Payment Required</h3>
      <p>To continue chatting, please complete the payment below.</p>
      ${sessionContext}
      <div class="button-group">
        <button id="pay-now-button" class="payment-button" data-payment-id="${paymentId}" data-session-id="${encodeURIComponent(currentSessionId)}">
          <span class="button-text">Pay Now</span>
          <span class="button-spinner" style="display: none;">
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22c5.523 0 10-4.477 10-10h-2c0 4.418-3.582 8-8 8s-8-3.582-8-8c0-4.418 3.582-8 8-8v2c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7h2c0 5.523-4.477 10-10 10z"/>
            </svg>
          </span>
        </button>
        <button id="already-paid-button" class="retry-button" data-payment-id="${paymentId}" data-session-id="${encodeURIComponent(currentSessionId)}">
          I've Already Paid
        </button>
      </div>
      <div class="payment-help">
        <p>Having trouble? <a href="#" id="payment-help-link">Get help with payment</a></p>
      </div>
    </div>`;
    
  // Add event listeners to the buttons
  const payNowButton = paymentBox.querySelector('#pay-now-button');
  const alreadyPaidButton = paymentBox.querySelector('#already-paid-button');
  const helpLink = paymentBox.querySelector('#payment-help-link');
  
  if (payNowButton) {
    payNowButton.addEventListener('click', () => {
      const paymentId = payNowButton.getAttribute('data-payment-id');
      const sessionId = payNowButton.getAttribute('data-session-id');
      openPaymentWindow(`/payment.html?paymentId=${paymentId}&sessionId=${sessionId}`, paymentId);
    });
  }
  
  if (alreadyPaidButton) {
    alreadyPaidButton.addEventListener('click', () => {
      const paymentId = alreadyPaidButton.getAttribute('data-payment-id');
      const sessionId = alreadyPaidButton.getAttribute('data-session-id');
      checkPaymentStatus(paymentId, sessionId);
    });
  }
  
  if (helpLink) {
    helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      showHelp();
    });
  }
  paymentBox.style.display = 'block';
}

// Check payment status with the server
async function checkPaymentStatus(paymentId, sessionId = null) {
  try {
    if (!paymentId) {
      throw new Error('No payment ID provided');
    }
    
    const currentSessionId = sessionId || window.currentSessionId;
    if (!currentSessionId) {
      throw new Error('No active session found');
    }
    
    // Show loading state
    const paymentButton = document.querySelector('.payment-button');
    const buttonText = paymentButton?.querySelector('.button-text');
    const buttonSpinner = paymentButton?.querySelector('.button-spinner');
    
    if (buttonText) buttonText.textContent = 'Verifying...';
    if (buttonSpinner) buttonSpinner.style.display = 'inline-block';
    
    showInfo('Verifying payment...');
    console.log('Checking payment status for:', { paymentId, sessionId: currentSessionId });
    
    const response = await fetch(`/payment/status/${paymentId}?userId=${encodeURIComponent(currentSessionId)}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Payment status response:', data);
    
    if (data.paid) {
      showSuccess('Payment verified! Processing your message...');
      
      // Get the pending message from session storage
      const pendingMessages = JSON.parse(sessionStorage.getItem(`pending_${currentSessionId}`) || '[]');
      const pendingMessageIndex = pendingMessages.findIndex(msg => msg.paymentId === paymentId);
      
      if (pendingMessageIndex !== -1) {
        const pendingMessage = pendingMessages[pendingMessageIndex];
        
        // Remove from pending
        pendingMessages.splice(pendingMessageIndex, 1);
        sessionStorage.setItem(`pending_${currentSessionId}`, JSON.stringify(pendingMessages));
        
        // Resend the message with the same message ID
        await sendMessage(pendingMessage.content, pendingMessage.messageId, currentSessionId, true);
      } else {
        showInfo('Payment verified! You can continue chatting.');
      }
      
      // Hide payment instructions
      if (paymentBox) {
        paymentBox.style.display = 'none';
      }
      
      return true;
    } else {
      showInfo('Payment not completed yet. Please complete the payment or try again.');
      return false;
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    showError(`Payment verification failed: ${error.message}`);
    return false;
  } finally {
    // Reset button state
    const paymentButton = document.querySelector('.payment-button');
    const buttonText = paymentButton?.querySelector('.button-text');
    const buttonSpinner = paymentButton?.querySelector('.button-spinner');
    
    if (buttonText) buttonText.textContent = 'Pay Now';
    if (buttonSpinner) buttonSpinner.style.display = 'none';
  }
}

// Show help information for payment issues
function showHelp(event) {
  if (event) event.preventDefault();
  
  const helpContent = `
    <div class="help-container">
      <h3>Payment Help</h3>
      <p>If you're having trouble with your payment, please try the following:</p>
      <ol>
        <li>Ensure your payment method is valid and has sufficient funds</li>
        <li>Check if popups are allowed for this site</li>
        <li>Try refreshing the page and starting over</li>
        <li>If the issue persists, please contact support with your Payment ID</li>
      </ol>
      <div class="payment-ids">
        <p><strong>Payment ID:</strong> <span id="current-payment-id">Not available</span></p>
        <p><strong>Session ID:</strong> <span id="current-session-id">${window.currentSessionId || 'Not available'}</span></p>
      </div>
      <div class="button-group">
        <button id="refresh-page-button" class="payment-button">
          Refresh Page
        </button>
        <button id="close-help-button" class="retry-button">
          Close
        </button>
      </div>
    </div>
  `;
  
  // Remove any existing help dialogs
  document.querySelector('.help-container')?.remove();
  
  // Create and show help dialog
  const helpDialog = document.createElement('div');
  helpDialog.className = 'help-dialog';
  helpDialog.innerHTML = helpContent;
  
  // Add to document
  document.body.appendChild(helpDialog);
  
  // Update with current payment ID if available
  const paymentIdElement = document.getElementById('current-payment-id');
  const paymentId = document.querySelector('.payment-id')?.textContent;
  if (paymentIdElement && paymentId) {
    paymentIdElement.textContent = paymentId;
  }
  
  // Add event listeners to the help dialog buttons
  const refreshButton = document.getElementById('refresh-page-button');
  const closeButton = document.getElementById('close-help-button');
  
  const cleanup = () => {
    if (refreshButton) {
      refreshButton.removeEventListener('click', handleRefresh);
    }
    if (closeButton) {
      closeButton.removeEventListener('click', handleClose);
    }
    // Remove the help dialog when navigating away
    document.removeEventListener('click', handleOutsideClick);
  };
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  const handleClose = () => {
    helpDialog.remove();
    cleanup();
  };
  
  const handleOutsideClick = (event) => {
    if (!helpDialog.contains(event.target) && !event.target.closest('.help-container')) {
      handleClose();
    }
  };
  
  if (refreshButton) {
    refreshButton.addEventListener('click', handleRefresh);
  }
  
  if (closeButton) {
    closeButton.addEventListener('click', handleClose);
  }
  
  // Close when clicking outside the help dialog
  document.addEventListener('click', handleOutsideClick);
  
  // Prevent clicks inside the dialog from closing it
  helpDialog.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}
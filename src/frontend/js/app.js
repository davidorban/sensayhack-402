/**
 * Main application initialization
 */

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Payment mode is loaded and initialized via script tag
  
  // Initialize chat interface
  initChat();
  
  // Set up event listeners
  setupEventListeners();
  
  // Log initialization
  console.log('Frontend initialized. Ready to chat!');
  console.log('Payment mode:', window.paymentMode.getMode());
  
  // Listen for payment mode changes
  window.addEventListener('paymentModeChanged', (event) => {
    console.log('Mode change event received:', event.detail);
    console.log('Payment mode:', event.detail.paymentTestMode ? 'test' : 'live');
    console.log('Replica mode:', event.detail.replicaTestMode ? 'test' : 'live');
    // The next message being sent will use the updated endpoint based on replica mode
  });
});

// Set up event listeners
function setupEventListeners() {
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  
  // Handle Enter key press (but allow Shift+Enter for new lines)
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Handle send button click
  sendButton.addEventListener('click', handleSendMessage);
}

// Expose functions to the window object for inline handlers and debugging
window.openPaymentWindow = openPaymentWindow;
window.checkPaymentStatus = checkPaymentStatus;
window.showHelp = showHelp;
window.getMessageCount = getMessageCount;
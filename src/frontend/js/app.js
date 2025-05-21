/**
 * Main application initialization
 */

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Initialize chat interface
  initChat();
  
  // Set up event listeners
  setupEventListeners();
  
  // Log initialization
  console.log('Frontend initialized. Ready to chat!');
});

// Set up event listeners
function setupEventListeners() {
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  
  // Handle Enter key press (but allow Shift+Enter for new lines)
  messageInput.addEventListener('keydown', function(e) {
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
/**
 * Chat functionality
 */

// DOM Elements
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const responseBox = document.getElementById('response');

// Display a message in the chat
function displayMessage(content, sender = 'ai', messageId = null) {
  const messageClass = sender === 'user' ? 'user-message' : 'ai-message';
  const senderName = sender === 'user' ? 'You' : 'AI';
  
  const messageElement = document.createElement('div');
  messageElement.className = messageClass;
  messageElement.setAttribute('data-message-id', messageId || '');
  
  messageElement.innerHTML = `
    <strong>${senderName}:</strong> ${escapeHtml(content)}
    <div class="message-meta">
      ${messageId ? `Message ID: ${messageId}` : ''}
      ${currentSessionId && sender === 'ai' ? ` | Session: ${currentSessionId.substring(0, 8)}...` : ''}
    </div>
  `;
  
  responseBox.appendChild(messageElement);
  responseBox.scrollTop = responseBox.scrollHeight;
}

// Add a temporary message (for loading, status updates, etc.)
function addMessage(content, sender = 'system', messageId = null) {
  const messageElement = document.createElement('div');
  messageElement.className = sender === 'system' ? 'system-message' : (sender === 'user' ? 'user-message' : 'ai-message');
  messageElement.setAttribute('data-message-id', messageId || '');
  
  messageElement.innerHTML = `
    <div class="message-content">${escapeHtml(content)}</div>
  `;
  
  responseBox.appendChild(messageElement);
  responseBox.scrollTop = responseBox.scrollHeight;
  return messageElement;
}

// Remove a message by its ID
function removeMessage(messageId) {
  if (!messageId) return;
  
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  if (messageElement) {
    messageElement.remove();
  }
}

// Handle sending a message
async function handleSendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;
  
  // Ensure we have a session ID
  if (!currentSessionId) {
    currentSessionId = `sess_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('sessionId', currentSessionId);
  }
  
  // Clear the input immediately for better UX
  messageInput.value = '';
  
  // Display the user's message
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  displayMessage(message, 'user', messageId);
  
  try {
    // Send the message to the server
    await sendMessage(message, messageId, currentSessionId);
  } catch (error) {
    console.error('Error in handleSendMessage:', error);
    showError(`Failed to send message: ${error.message}`);
  }
}

// Send message to the server with session tracking
async function sendMessage(message, messageId, sessionId, isRetry = false) {
  const sendButton = document.getElementById('send-button');
  
  // Show loading state
  const originalButtonText = sendButton.textContent;
  sendButton.disabled = true;
  sendButton.textContent = 'Sending...';

  try {
    // Prepare request body
    const requestBody = {
      message: message,
      metadata: {
        messageId: messageId,
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      }
    };
    
    // Check if we should use test replica
    // Ensure window.paymentMode is fully initialized before accessing useTestReplica
    let useTestReplica = false; // Default to live mode
    
    if (window.paymentMode && typeof window.paymentMode.useTestReplica === 'function') {
      useTestReplica = window.paymentMode.useTestReplica();
    } else if (window.paymentMode && typeof window.paymentMode.replicaTestMode !== 'undefined') {
      // Fallback to directly accessing the property if method doesn't exist
      useTestReplica = window.paymentMode.replicaTestMode;
    }
    
    console.log('Using test replica:', useTestReplica);
    
    // Determine the appropriate API endpoint based on environment and mode
    let apiUrl;
    const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Check if we're in a live environment (either production or live.html)
    const isLiveEnvironment = !isLocalDevelopment || window.location.pathname.includes('live.html');
    
    if (isLiveEnvironment) {
      // In live environment, always use the real API endpoint
      apiUrl = '/api/chat';
      console.log('Live environment detected - using production API endpoint');
      // Force live mode in live environment
      useTestReplica = false;
    } else if (useTestReplica) {
      // In local development test mode, use test API endpoint
      apiUrl = '/api/chat/test';
      console.log('Local development test mode - using test API endpoint');
    } else {
      // Default to standard API endpoint
      apiUrl = '/api/chat';
      console.log('Using standard API endpoint');
    }
    
    console.log('Using API URL:', apiUrl);
    
    let response;
    let responseData;
    
    // For test mode in local development, provide a mock response
    if (isLocalDevelopment && useTestReplica) {
      console.log('Using local mock response for development');
      
      // Simulate a network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a mock response
      responseData = {
        status: 'success',
        reply: `This is a mock response in TEST mode. Your message was: "${message}"`,
        messageId: messageId,
        timestamp: new Date().toISOString()
      };
      
      // Create a mock response object
      response = {
        status: 200,
        ok: true
      };
    } else {
      // Make the API request - always use POST for real API endpoints
      console.log('Making API request to:', apiUrl);
      
      // For real API endpoints, use POST method
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': messageId,
          'X-Session-ID': sessionId || '',
          'X-Test-Mode': useTestReplica ? 'true' : 'false' // Set based on the current mode
        },
        body: JSON.stringify({
          message: message,
          metadata: {
            messageId: messageId,
            sessionId: sessionId,
            timestamp: new Date().toISOString(),
            testMode: useTestReplica // Set based on the current mode
          }
        })
      });
    
      // Check if response is OK before parsing JSON
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Invalid response from server');
      }
    }
    
    // Process the response data
    if (responseData && responseData.status === 'success') {
      // Display the AI's response
      displayMessage(responseData.reply, 'ai', responseData.messageId || messageId);
      
      // Check if payment is required
      if (responseData.paymentRequired) {
        // Show payment UI
        if (window.paymentHandler && typeof window.paymentHandler.showPaymentUI === 'function') {
          window.paymentHandler.showPaymentUI(responseData.paymentUrl, responseData.paymentAmount, responseData.paymentCurrency);
        } else {
          console.error('Payment handler not available');
          showError('Payment processing is not available at this time.');
        }
      }
      
      // Check if we need to update the session
      if (responseData.sessionId && responseData.sessionId !== currentSessionId) {
        currentSessionId = responseData.sessionId;
        localStorage.setItem('sessionId', currentSessionId);
        console.log('Updated session ID:', currentSessionId);
      }
    } else {
      // Handle error response
      const errorMessage = responseData.error || 'Unknown error occurred';
      console.error('API error:', errorMessage);
      
      // Show a user-friendly error message
      const isTestMode = useTestReplica;
      
      if (isTestMode) {
        showError(`[Test Mode] Error: ${errorMessage}`);
      } else {
        showError('Sorry, there was a problem processing your request. Please try again later.');
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Create a helpful error message based on the environment
    const isInLiveHtml = window.location.pathname.includes('live.html');
    
    if (isInLiveHtml) {
      // In live.html, show a clear production error
      displayMessage(`Sorry, there was an error connecting to the server. Please try again later. (Error: ${error.message})`, 'ai', messageId);
    } else if (isLocalDevelopment) {
      // In development, provide a mock response so testing can continue
      displayMessage(`[Development Mode] Your message: "${message}" was received, but there was an API error: ${error.message}. This is a fallback response.`, 'ai', messageId);
    } else {
      // Generic error for other cases
      showError(`Failed to send message: ${error.message}`);
    }
    
    // Show retry button if this wasn't a retry
    if (!isRetry) {
      const retryButton = document.createElement('button');
      retryButton.className = 'retry-button';
      retryButton.textContent = 'Retry';
      retryButton.onclick = () => sendMessage(message, messageId, sessionId, true);
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'status-error';
      errorDiv.innerHTML = '<p>Failed to send message.</p>';
      errorDiv.appendChild(retryButton);
      
      responseBox.appendChild(errorDiv);
      responseBox.scrollTop = responseBox.scrollHeight;
    }
  } finally {
    // Restore button state
    sendButton.disabled = false;
    sendButton.textContent = originalButtonText;
  }
}

// Show an error message
function showError(message) {
  const errorElement = addMessage(message, 'system');
  errorElement.classList.add('error');
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners
  sendButton.addEventListener('click', handleSendMessage);
  
  messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  });
  
  // Load session ID from localStorage if available
  currentSessionId = localStorage.getItem('sessionId');
  
  console.log('Chat initialized, session ID:', currentSessionId);
});

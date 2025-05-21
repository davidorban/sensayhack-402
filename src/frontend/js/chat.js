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
    const requestBody = { 
      message,
      metadata: {
        messageId,
        sessionId,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('Sending message:', { messageId, sessionId, isRetry });
    
    let response;
    let responseData;
    
    // Check if we should use test replica
    // Ensure window.paymentMode is fully initialized before accessing useTestReplica
    const useTestReplica = window.paymentMode && typeof window.paymentMode.useTestReplica === 'function' 
      ? window.paymentMode.useTestReplica() 
      : true;
    console.log('Using test replica:', useTestReplica);
    
    // Make API call with appropriate endpoint based on replica mode
    const apiUrl = useTestReplica ? '/api/chat/test' : '/api/chat';
    
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': messageId,
          'X-Session-ID': sessionId || '',
          'X-Test-Mode': useTestReplica ? 'true' : 'false'
        },
        body: JSON.stringify({
          ...requestBody,
          metadata: {
            ...requestBody.metadata,
            testMode: useTestReplica
          }
        })
      });
      
      responseData = await response.json();
    } catch (e) {
      console.error('Error making API request:', e);
      throw new Error('Failed to connect to the server');
    }
    
    console.log('Server response:', { status: response.status, data: responseData });
    
    if (response.status === 200) {
      showSuccess('');
      
      // Display the AI's response
      displayMessage(responseData.reply || 'No response from server', 'ai', messageId);
      
      // Store the successful message in session storage
      if (sessionId) {
        const sessionMessages = JSON.parse(sessionStorage.getItem(`session_${sessionId}`) || '[]');
        
        // Add user message
        sessionMessages.push({
          id: messageId,
          type: 'user',
          content: message,
          timestamp: new Date().toISOString()
        });
        
        // Add AI response
        sessionMessages.push({
          id: messageId,
          type: 'ai',
          content: responseData.reply || 'No response from server',
          timestamp: new Date().toISOString()
        });
        
        sessionStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionMessages));
      }
      
    } else if (response.status === 402) {
      // Payment required
      console.log('Payment required:', responseData);
      
      // Ensure we have a valid payment ID
      const paymentId = responseData.paymentId || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Store the pending message
      if (sessionId) {
        const pendingMessages = JSON.parse(sessionStorage.getItem(`pending_${sessionId}`) || '[]');
        pendingMessages.push({
          messageId,
          content: message,
          paymentId: paymentId,
          timestamp: new Date().toISOString()
        });
        sessionStorage.setItem(`pending_${sessionId}`, JSON.stringify(pendingMessages));
      }
      
      // Show payment UI with the payment URL from the server
      // Check if we have a payment URL or HTML page link
      const paymentUrlStr = responseData.paymentUrl || responseData.paymentHtml;
      
      if (paymentUrlStr) {
        // Get payment config based on current mode
        const paymentConfig = window.paymentMode?.getPaymentConfig?.() || {
          isTestMode: true,
          baseUrl: '/api/mock-pay',
          type: 'mock'
        };
        
        // Ensure we have all required payment details
        const paymentAmount = responseData.amount || '0.01'; // Default to 0.01 if amount is not provided
        const paymentCurrency = responseData.currency || responseData.asset || 'USD'; // Get currency
        
        // Add test mode parameter to payment URL if in test mode
        const paymentUrl = new URL(paymentUrlStr, window.location.origin);
        if (paymentConfig.isTestMode) {
          paymentUrl.searchParams.set('test', 'true');
        }
        
        // Store the payment ID in session storage for later reference
        if (sessionId) {
          const paymentData = {
            paymentId,
            amount: paymentAmount,
            currency: paymentCurrency,
            messageId,
            timestamp: new Date().toISOString()
          };
          sessionStorage.setItem(`payment_${paymentId}`, JSON.stringify(paymentData));
        }
        
        // Show payment information
        paymentBox.innerHTML = `
          <div class="payment-info">
            <p>🔒 This message requires a small payment to process.</p>
            <p>Click the button below to complete the payment (test mode).</p>
            <p>Amount: <strong>${paymentAmount} ${paymentCurrency}</strong></p>
            <p>Message ID: <code>${messageId}</code></p>
            <p>Payment ID: <code>${paymentId}</code></p>
            <p>Session: <code>${sessionId ? `${sessionId.substring(0, 8)}...` : 'unknown'}</code></p>
            <div class="payment-actions">
              <button id="open-payment-btn" class="btn btn-primary">Open Payment Window</button>
              <button id="check-payment-btn" class="btn btn-secondary">Check Payment Status</button>
            </div>
            <p class="payment-note">Note: This is a test payment. No real money will be charged.</p>
          </div>
        `;
        
        // Add event listeners for the buttons
        document.getElementById('open-payment-btn')?.addEventListener('click', () => {
          try {
            const paymentUrlToUse = responseData.paymentUrl || responseData.paymentHtml;
            if (!paymentUrlToUse) {
              throw new Error('No payment URL available');
            }
            // Ensure URL is well-formed and log info
            const paymentURL = new URL(paymentUrlToUse, window.location.origin).toString();
            console.log('Opening payment window with URL:', paymentURL, 'Payment ID:', paymentId);
            openPaymentWindow(paymentURL, paymentId);
          } catch (error) {
            console.error('Error opening payment window:', error);
            showError(`Failed to open payment window: ${error.message}`);
          }
        });
        
        document.getElementById('check-payment-btn')?.addEventListener('click', () => {
          try {
            if (!paymentId) {
              throw new Error('No payment ID available');
            }
            checkPaymentStatus(paymentId, sessionId);
          } catch (error) {
            console.error('Error checking payment status:', error);
            showError(`Failed to check payment status: ${error.message}`);
          }
        });
        
        paymentBox.style.display = 'block';
      } else {
        throw new Error('No payment URL provided by server');
      }
      
    } else {
      throw new Error(responseData.error || `Server responded with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    showError(`Failed to send message: ${error.message}`);
    
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
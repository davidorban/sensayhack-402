/**
 * Session management functionality
 */

// Global session variables
let currentSessionId = localStorage.getItem('sessionId');
let pendingMessages = [];

// Initialize the chat interface
function initChat() {
  // Load any existing session data
  if (currentSessionId) {
    const sessionMessages = sessionStorage.getItem(`session_${currentSessionId}`);
    if (sessionMessages) {
      try {
        const messages = JSON.parse(sessionMessages);
        messages.forEach(msg => {
          displayMessage(msg.content, msg.type === 'user' ? 'user' : 'ai', msg.id);
        });
      } catch (e) {
        console.error('Error loading session messages:', e);
      }
    }
  } else {
    // Create a new session ID if none exists
    currentSessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('sessionId', currentSessionId);
  }
  
  // Load any pending messages
  if (currentSessionId) {
    const pending = sessionStorage.getItem(`pending_${currentSessionId}`);
    if (pending) {
      try {
        pendingMessages = JSON.parse(pending);
        if (pendingMessages.length > 0) {
          showInfo('You have pending messages. Complete payment to continue.');
        }
      } catch (e) {
        console.error('Error loading pending messages:', e);
      }
    }
  }
}

// Get debug message count
async function getMessageCount() {
  try {
    const response = await fetch('/debug/message-count', {
      headers: {
        'X-Session-ID': currentSessionId || ''
      }
    });
    const data = await response.json();
    console.log('Current message count:', data.messageCount);
    showInfo(`Current message count: ${data.messageCount}`);
    return data.messageCount;
  } catch (error) {
    console.error('Error checking message count:', error);
    showError(`Error checking message count: ${error.message}`);
  }
}
/**
 * Utility functions for the frontend
 */

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Show success status message
function showSuccess(message) {
  const paymentBox = document.getElementById('payment-instructions');
  paymentBox.innerHTML = `<div class="status-message success">${message}</div>`;
}

// Show error status message
function showError(message) {
  const paymentBox = document.getElementById('payment-instructions');
  paymentBox.innerHTML = `<div class="status-message error">${message}</div>`;
}

// Show info status message
function showInfo(message) {
  const paymentBox = document.getElementById('payment-instructions');
  paymentBox.innerHTML = `<div class="status-message info">${message}</div>`;
}
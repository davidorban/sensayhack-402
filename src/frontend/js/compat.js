/**
 * Compatibility script to handle deprecated DOM Mutation events
 */

// Create a basic shim for jQuery-like functionality
window.$ = window.$ || function(selector) {
  return {
    on: function(eventName, handler) {
      // For DOM mutation events, use MutationObserver instead
      if (eventName === 'DOMSubtreeModified') {
        console.log('Converting deprecated DOMSubtreeModified to MutationObserver');
        
        // Create a MutationObserver to watch for DOM changes
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'subtree') {
              // Call the handler with a synthetic event
              handler({ target: mutation.target });
            }
          });
        });
        
        // Watch the document for changes
        observer.observe(document, {
          childList: true,
          subtree: true
        });
        
        return this;
      }
      
      // For other events, use standard event listeners
      document.addEventListener(eventName, handler);
      return this;
    }
  };
};
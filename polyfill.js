// Polyfill for cross-browser compatibility
// This ensures the extension works consistently in Chrome, Firefox, Edge, etc.
(function() {
  if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
    window.browser = chrome;
  }
})();

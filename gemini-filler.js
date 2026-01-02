// Script injected into Gemini page to fill the input field
(function() {
  'use strict';

  // Use browser namespace with fallback to chrome
  const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;

  console.log('Buying Advice Extension: Gemini filler script loaded');

  // Listen for message from background script
  runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillGeminiInput') {
      console.log('Buying Advice Extension: Received fillGeminiInput message');
      fillGeminiInput(message.question);
      sendResponse({ status: 'success' });
    }
    return true;
  });

  function fillGeminiInput(question) {
    console.log('Buying Advice Extension: Starting input field search...');
    
    const TIMEOUT_MS = 15000; // 15 seconds timeout
    let foundInput = false;
    let timeoutId = null;
    let observer = null; // Declare observer here to avoid reference error

    // Comprehensive list of selectors to try
    const inputSelectors = [
      // Rich text editor
      'rich-textarea[aria-label*="Ask"]',
      'rich-textarea[aria-label*="Enter"]',
      'rich-textarea',
      // Standard textareas
      'textarea[aria-label*="Ask"]',
      'textarea[aria-label*="Enter"]',
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="Enter"]',
      'textarea.ql-editor',
      // Contenteditable divs
      '[contenteditable="true"][role="textbox"]',
      '[contenteditable="true"][aria-label]',
      'div[contenteditable="true"]',
      // Gemini-specific selectors
      '.ql-editor',
      '[data-placeholder*="Ask"]',
      // Generic fallbacks
      'textarea',
      'input[type="text"]'
    ];

    function tryFindAndFillInput() {
      console.log('Buying Advice Extension: Searching for input field...');

      // First, try to find the currently focused element
      const focusedElement = document.activeElement;
      if (focusedElement && focusedElement !== document.body) {
        const style = window.getComputedStyle(focusedElement);
        const rect = focusedElement.getBoundingClientRect();
        
        // Check if it's a valid input element (textarea, input, contenteditable, or rich-textarea)
        const isValidInput = 
          focusedElement.tagName === 'TEXTAREA' ||
          focusedElement.tagName === 'INPUT' ||
          focusedElement.hasAttribute('contenteditable') ||
          focusedElement.tagName === 'RICH-TEXTAREA' ||
          focusedElement.matches('p[contenteditable="true"]');
        
        if (isValidInput && 
            style.display !== 'none' && 
            style.visibility !== 'hidden' && 
            style.opacity !== '0' &&
            rect.width >= 10 && 
            rect.height >= 10) {
          console.log('Buying Advice Extension: Found focused input element:', focusedElement.tagName);
          foundInput = true;
          clearTimeout(timeoutId);
          if (observer) observer.disconnect();
          
          // If it's a <p> inside rich-textarea, use the parent rich-textarea
          const inputField = (focusedElement.tagName === 'P' && focusedElement.closest('rich-textarea')) 
            ? focusedElement.closest('rich-textarea') 
            : focusedElement;
          
          fillInputField(inputField, question);
          return true;
        }
      }

      // If no focused element found, fall back to selector search
      for (const selector of inputSelectors) {
        const elements = document.querySelectorAll(selector);
        
        for (const inputField of elements) {
          // Skip hidden or invisible elements
          const style = window.getComputedStyle(inputField);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            continue;
          }

          // Skip if dimensions are too small (likely hidden)
          const rect = inputField.getBoundingClientRect();
          if (rect.width < 10 || rect.height < 10) {
            continue;
          }

          console.log('Buying Advice Extension: Found input field with selector:', selector);
          foundInput = true;
          clearTimeout(timeoutId);
          if (observer) observer.disconnect();

          // Fill the input field
          fillInputField(inputField, question);
          return true;
        }
      }
      return false;
    }

    function fillInputField(inputField, text) {
      console.log('Buying Advice Extension: Filling input field...');
      console.log('Element tag:', inputField.tagName);

      try {
        // Focus the rich-textarea first
        inputField.focus();
        inputField.click();

        // Special handling for rich-textarea (Gemini's custom component)
        if (inputField.tagName === 'RICH-TEXTAREA') {
          console.log('Filling RICH-TEXTAREA (custom web component)');
          
          // Find the <p> tag inside rich-textarea
          const paragraph = inputField.querySelector('p');
          if (paragraph) {
            console.log('Found <p> tag inside rich-textarea');
            paragraph.textContent = text;
            paragraph.focus();
            
            // Dispatch events on the paragraph
            paragraph.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
            paragraph.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          }
          
          // Also dispatch events on the rich-textarea itself
          inputField.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
          inputField.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          inputField.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
          inputField.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
          
          console.log('Successfully filled rich-textarea');
          
        } else if (inputField.tagName === 'TEXTAREA' || inputField.tagName === 'INPUT') {
          console.log('Filling TEXTAREA/INPUT element');
          inputField.value = text;
          
          // Trigger events
          inputField.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          inputField.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          inputField.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
          inputField.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
        } else if (inputField.hasAttribute('contenteditable')) {
          console.log('Filling contenteditable element');
          inputField.textContent = text;
          inputField.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
          inputField.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        }

        console.log('Buying Advice Extension: Successfully filled input field!');
        showNotification('AskAIShortcut has loaded the question! You can edit or press Enter to submit.');
      } catch (error) {
        console.error('Buying Advice Extension: Error filling input:', error);
      }
    }

    function showNotification(message) {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }, 20000);
    }

    // Try immediately
    if (tryFindAndFillInput()) {
      return;
    }

    // Set up MutationObserver to watch for DOM changes
    console.log('Buying Advice Extension: Input not found, setting up MutationObserver...');
    
    observer = new MutationObserver((mutations) => {
      if (foundInput) return;
      
      // Check if new nodes were added
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          if (tryFindAndFillInput()) {
            return;
          }
        }
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Set timeout fallback
    timeoutId = setTimeout(() => {
      if (!foundInput) {
        observer.disconnect();
        console.error('Buying Advice Extension: Timeout - Could not find Gemini input field after', TIMEOUT_MS / 1000, 'seconds');
        showNotification('Could not find Gemini input field. Please paste the URL manually.');
      }
    }, TIMEOUT_MS);
  }
})();

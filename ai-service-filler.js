// Script injected into AI Service page to fill the input field
(function() {
  'use strict';

  // Use browser namespace with fallback to chrome
  const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;
  
  // Get translated messages
  const messages = {
    questionLoaded: chrome.i18n.getMessage('questionLoaded') || 'AskAIShortcut has loaded the question! You can edit or press Enter to submit.',
    couldNotFindInputField: chrome.i18n.getMessage('couldNotFindInputField') || 'Could not find AI Service input field. Please paste the question manually.'
  };

  console.log('AskAIShortcut: AI Service filler script loaded');

  // Listen for message from background script
  runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillAIServiceInput') {
      console.log('AskAIShortcut: Received fillAIServiceInput message');
      
      // Wait for page to be ready before attempting to fill
      if (document.readyState === 'loading') {
        console.log('AskAIShortcut: Page still loading, waiting for DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => fillAIServiceInput(message.question), 500); // Small delay after DOM ready
        });
      } else {
        // Page already loaded, add small delay to ensure dynamic content is ready
        setTimeout(() => fillAIServiceInput(message.question), 500);
      }
      
      sendResponse({ status: 'success' });
    }
    return true;
  });

  function fillAIServiceInput(question) {
    console.log('AskAIShortcut: Starting input field search...');
    
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
      // AI Service specific selectors
      '.ql-editor',
      '[data-placeholder*="Ask"]',
      // Generic fallbacks
      'textarea',
      'input[type="text"]'
    ];

    function tryFindAndFillInput() {
      console.log('AskAIShortcut: Searching for input field...');

      // First, try to find the currently focused element
      const focusedElement = getFocusedInputElement();
      
      if (focusedElement) {
        console.log('AskAIShortcut: Found focused input element:', focusedElement.tagName);
        foundInput = true;
        clearTimeout(timeoutId);
        if (observer) observer.disconnect();
        
        fillInputField(focusedElement, question);
        return true;
      }

      // If no focused element found, fall back to selector search
      for (const selector of inputSelectors) {
        const elements = document.querySelectorAll(selector);
        
        for (const inputField of elements) {
          // Skip hidden or invisible elements
          if (!isElementVisible(inputField)) {
            continue;
          }

          console.log('AskAIShortcut: Found input field with selector:', selector);
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

    function getFocusedInputElement() {
      const focusedElement = document.activeElement;
      
      // Check if focused element is a valid input
      if (!focusedElement || focusedElement === document.body) {
        return null;
      }

      // Check if element is visible
      if (!isElementVisible(focusedElement)) {
        return null;
      }

      // Comprehensive check for valid input types
      const isValidInput = isInputElement(focusedElement);
      
      if (!isValidInput) {
        return null;
      }

      // If it's a <p> or other child inside rich-textarea, use the parent rich-textarea
      if (focusedElement.closest('rich-textarea')) {
        return focusedElement.closest('rich-textarea');
      }

      return focusedElement;
    }

    function isElementVisible(element) {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width >= 10 &&
        rect.height >= 10
      );
    }

    function isInputElement(element) {
      // Standard form inputs
      if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        return true;
      }

      // Custom web components
      if (element.tagName === 'RICH-TEXTAREA') {
        return true;
      }

      // Contenteditable elements
      if (element.hasAttribute('contenteditable')) {
        return true;
      }

      // Check for common input patterns
      if (element.tagName === 'DIV' && element.hasAttribute('contenteditable')) {
        return true;
      }

      if (element.tagName === 'P' && element.hasAttribute('contenteditable')) {
        return true;
      }

      // Check for role-based input elements
      if (element.getAttribute('role') === 'textbox') {
        return true;
      }

      return false;
    }

    function fillInputField(inputField, text) {
      console.log('AskAIShortcut: Filling input field...');
      console.log('Element tag:', inputField.tagName);

      try {
        // Focus the element first
        inputField.focus();
        inputField.click();

        // Dispatch focus event to ensure proper initialization
        inputField.dispatchEvent(new FocusEvent('focus', { bubbles: true, cancelable: true }));

        // Handle based on element type
        if (inputField.tagName === 'RICH-TEXTAREA') {
          fillRichTextarea(inputField, text);
        } else if (inputField.tagName === 'TEXTAREA' || inputField.tagName === 'INPUT') {
          fillFormElement(inputField, text);
        } else if (inputField.hasAttribute('contenteditable') || inputField.getAttribute('role') === 'textbox') {
          fillContenteditableElement(inputField, text);
        } else {
          // Fallback: try as contenteditable first, then as form element
          if (inputField.textContent !== undefined) {
            fillContenteditableElement(inputField, text);
          } else {
            fillFormElement(inputField, text);
          }
        }

        console.log('AskAIShortcut: Successfully filled input field!');
        showNotification(messages.questionLoaded);
      } catch (error) {
        console.error('AskAIShortcut: Error filling input:', error);
      }
    }

    function fillRichTextarea(richTextarea, text) {
      console.log('Filling RICH-TEXTAREA (custom web component)');
      
      // Find the <p> tag inside rich-textarea
      let paragraph = richTextarea.querySelector('p');
      
      if (paragraph) {
        console.log('Found <p> tag inside rich-textarea');
        // Clear existing content
        paragraph.textContent = '';
        
        // Set text content
        paragraph.textContent = text;
        paragraph.focus();
        
        // Trigger input events on the paragraph
        dispatchInputEvents(paragraph);
      }
      
      // Trigger events on the rich-textarea itself
      dispatchInputEvents(richTextarea);
      
      console.log('Successfully filled rich-textarea');
    }

    function fillFormElement(formElement, text) {
      console.log('Filling TEXTAREA/INPUT element');
      
      // Store original value for comparison
      const originalValue = formElement.value;
      
      // Set the value
      formElement.value = text;
      
      // If value didn't change, try setting it character by character
      if (formElement.value === originalValue && text.length > 0) {
        console.log('Direct assignment failed, trying character-by-character method');
        formElement.value = '';
        for (const char of text) {
          formElement.value += char;
        }
      }
      
      // Trigger all input events
      dispatchInputEvents(formElement);
    }

    function fillContenteditableElement(element, text) {
      console.log('Filling contenteditable element');
      
      // Clear existing content
      element.textContent = '';
      
      // Create a text node with the text
      const textNode = document.createTextNode(text);
      element.appendChild(textNode);
      
      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(element);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      
      // Trigger input events
      dispatchInputEvents(element);
    }

    function dispatchInputEvents(element) {
      // Create and dispatch a comprehensive set of events
      const events = [
        new Event('input', { bubbles: true, cancelable: true }),
        new Event('change', { bubbles: true, cancelable: true }),
        new KeyboardEvent('keydown', { bubbles: true, cancelable: true }),
        new KeyboardEvent('keyup', { bubbles: true, cancelable: true }),
        new KeyboardEvent('keypress', { bubbles: true, cancelable: true })
      ];
      
      for (const event of events) {
        element.dispatchEvent(event);
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
    console.log('AskAIShortcut: Input not found, setting up MutationObserver...');
    
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
        console.error('AskAIShortcut: Timeout - Could not find AI Service input field after', TIMEOUT_MS / 1000, 'seconds');
        showNotification(messages.couldNotFindInputField);
      }
    }, TIMEOUT_MS);
  }
})();

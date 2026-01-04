// Script injected into AI service pages to auto-fill the input field with questions
// Supports various AI services (Gemini, ChatGPT, Claude, etc.) by detecting different input field types
(function () {
  'use strict';

  // Cross-browser compatibility: Use browser namespace with fallback to chrome
  const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;

  // Localized messages (fallback if i18n is not ready)
  const defaultMessages = {
    questionLoaded: 'AskAIShortcut has loaded the question!',
    couldNotFindInputField: 'Could not find AI Service input field. Please paste manually.'
  };

  console.log('AskAIShortcut: AI service filler script loaded');

  // Listen for message from background script
  runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillAIServiceInput') {
      console.log('AskAIShortcut: Received fillAIServiceInput message');

      const fill = () => {
        // Small additional delay for some SPAs to fully render the input
        setTimeout(() => fillAIServiceInput(message.question), 500);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fill);
      } else {
        fill();
      }

      sendResponse({ status: 'success' });
    }
    return true;
  });

  function fillAIServiceInput(question) {
    console.log('AskAIShortcut: Searching for input field...');

    const TIMEOUT_MS = 10000;
    let foundInput = false;
    let observer = null;

    // Enhanced selectors for modern AI services
    const inputSelectors = [
      '#prompt-textarea', // ChatGPT
      'div[contenteditable="true"][aria-placeholder*="Ask"]', // ChatGPT/Gemini variant
      'div[contenteditable="true"][aria-label*="Ask"]',
      'div[contenteditable="true"][aria-label*="Enter"]',
      'rich-textarea', // Some web frameworks
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="Claude"]', // Claude
      'div[role="textbox"][contenteditable="true"]',
      'textarea',
      'input[type="text"]'
    ];

    function tryFindAndFill() {
      if (foundInput) return true;

      // 1. Check focused element
      const focused = document.activeElement;
      if (isInputElement(focused) && isElementVisible(focused)) {
        foundInput = true;
        fillInputField(focused, question);
        return true;
      }

      // 2. Scan selectors
      for (const selector of inputSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          if (isElementVisible(el)) {
            foundInput = true;
            fillInputField(el, question);
            return true;
          }
        }
      }
      return false;
    }

    function isElementVisible(el) {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;

      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }

    function isInputElement(el) {
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'TEXTAREA' ||
        tag === 'INPUT' ||
        tag === 'RICH-TEXTAREA' ||
        el.hasAttribute('contenteditable') ||
        el.getAttribute('role') === 'textbox';
    }

    function fillInputField(el, text) {
      console.log('AskAIShortcut: Filling', el.tagName);
      try {
        el.focus();

        // Handle different types
        if (el.hasAttribute('contenteditable')) {
          el.textContent = text;
        } else {
          el.value = text;
        }

        // Trigger interaction logic to satisfy SPA frameworks (React/Vue/etc.)
        const events = ['input', 'change', 'blur'];
        events.forEach(type => {
          el.dispatchEvent(new Event(type, { bubbles: true }));
        });

        showNotification('questionLoaded');
        if (observer) observer.disconnect();
      } catch (err) {
        console.error('AskAIShortcut: Error filling field', err);
      }
    }

    function showNotification(type) {
      // Use cross-browser i18n API if available, otherwise fallback
      const i18nAPI = (typeof browser !== 'undefined') ? browser.i18n : chrome.i18n;
      const message = (i18nAPI && i18nAPI.getMessage)
        ? i18nAPI.getMessage(type)
        : defaultMessages[type];

      const div = document.createElement('div');
      div.id = 'ask-ai-shortcut-notification';
      div.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 16px 20px;
        background: #333;
        color: #fff;
        border-radius: 12px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 9999999;
        display: flex;
        align-items: center;
        gap: 12px;
        border: 1px solid rgba(255,255,255,0.1);
        animation: aishortcut-fadein 0.3s ease-out;
      `;

      const icon = type === 'questionLoaded' ? '✅' : '⚠️';
      div.innerHTML = `<span>${icon}</span> <span>${message || type}</span>`;

      // Animation style
      const style = document.createElement('style');
      style.textContent = `
        @keyframes aishortcut-fadein {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(div);

      setTimeout(() => {
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          div.remove();
          style.remove();
        }, 500);
      }, 5000);
    }

    // Execution
    if (!tryFindAndFill()) {
      observer = new MutationObserver(() => {
        if (tryFindAndFill()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        if (!foundInput) {
          observer.disconnect();
          showNotification('couldNotFindInputField');
        }
      }, TIMEOUT_MS);
    }
  }
})();

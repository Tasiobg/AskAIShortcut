// Content script that injects the "Buying advice" button
(function() {
  'use strict';

  console.log('Buying Advice Extension: Content script loaded on', window.location.href);

  // Don't inject on Gemini page (button is used via popup instead)
  if (window.location.hostname.includes('gemini.google.com')) {
    console.log('Buying Advice Extension: Skipping injection on Gemini page');
    return;
  }

  // Avoid injecting multiple times
  if (window.buyingAdviceExtensionInjected) {
    console.log('Buying Advice Extension: Already injected, skipping');
    return;
  }
  window.buyingAdviceExtensionInjected = true;

  // Get the current product page URL
  function getProductUrl() {
    return window.location.href;
  }

  // Create and inject the button
  function createButton() {
    const button = document.createElement('button');
    button.id = 'buying-advice-button';
    button.className = 'buying-advice-btn';
    button.textContent = '💡 Buying advice';
    
    button.addEventListener('click', async () => {
      console.log('Buying Advice Extension: Button clicked!');
      button.disabled = true;
      button.textContent = '⏳ Opening Gemini...';
      
      const productUrl = getProductUrl();
      console.log('Buying Advice Extension: Product URL:', productUrl);
      
      // Send message to background script
      try {
        console.log('Buying Advice Extension: Sending message to background...');
        chrome.runtime.sendMessage({
          action: 'openGemini',
          productUrl: productUrl
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Buying Advice Extension: Error -', chrome.runtime.lastError);
            alert('Error: ' + chrome.runtime.lastError.message);
          } else {
            console.log('Buying Advice Extension: Response received', response);
          }
          setTimeout(() => {
            button.disabled = false;
            button.textContent = '💡 Buying advice';
          }, 2000);
        });
      } catch (error) {
        console.error('Buying Advice Extension: Exception -', error);
        alert('Error: ' + error.message);
        button.disabled = false;
        button.textContent = '💡 Buying advice';
      }
    });

    return button;
  }

  // Inject button into the page
  function injectButton() {
    console.log('Buying Advice Extension: Injecting button...');
    const button = createButton();
    
    // Try to find a good place to inject the button
    const targetSelectors = [
      '#buybox', // Amazon buy box
      '[id*="add-to-cart"]',
      '[class*="add-to-cart"]',
      '#productTitle',
      'h1'
    ];

    let injected = false;
    for (const selector of targetSelectors) {
      const target = document.querySelector(selector);
      if (target) {
        // Insert after the target element
        target.parentNode.insertBefore(button, target.nextSibling);
        console.log('Buying Advice Extension: Button injected after', selector);
        injected = true;
        break;
      }
    }

    // Fallback: inject at the top of body
    if (!injected) {
      const container = document.createElement('div');
      container.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 999999;';
      container.appendChild(button);
      document.body.appendChild(container);
      console.log('Buying Advice Extension: Button injected at fixed position (top-right)');
    }
  }

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }
})();

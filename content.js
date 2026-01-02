// Content script that injects the "Buying advice" button
(function() {
  'use strict';

  console.log('AskAIShortcut: Content script loaded on', window.location.href);

  // Avoid injecting multiple times
  if (window.buyingAdviceExtensionInjected) {
    console.log('AskAIShortcut: Already injected, skipping');
    return;
  }
  window.buyingAdviceExtensionInjected = true;

  // Default button name
  const defaultButtonName = '💡 Buying advice';
  let buttonName = defaultButtonName;

  // Get button name from storage
  chrome.storage.sync.get({ button1Name: defaultButtonName }, (result) => {
    buttonName = result.button1Name;
    // Update button text if it's already created
    const existingButton = document.getElementById('buying-advice-button');
    if (existingButton && !existingButton.disabled) {
      existingButton.textContent = buttonName;
    }
  });

  // Get the current product page URL
  function getProductUrl() {
    return window.location.href;
  }

  // Create and inject the button
  function createButton() {
    const button = document.createElement('button');
    button.id = 'buying-advice-button';
    button.className = 'buying-advice-btn';
    button.textContent = buttonName;
    
    button.addEventListener('click', async () => {
      console.log('AskAIShortcut: Button clicked!');
      button.disabled = true;
      button.textContent = '⏳ Opening AI Service...';
      
      const productUrl = getProductUrl();
      console.log('AskAIShortcut: Product URL:', productUrl);
      
      // Send message to background script
      try {
        console.log('AskAIShortcut: Sending message to background...');
        chrome.runtime.sendMessage({
          action: 'openAIServiceWithQuestion',
          question: getMessage('buyingAdviceQuestion') || 'I need buying advice for this product, please help me understand:\n- Is this a good deal?\n- What are the pros and cons?\n- Are there better alternatives?\n- What should I consider before buying?\n- Is this product worth the price?\n- What do the reviews say? Do they appear authentic, or do they show signs of AI generation and manipulation?\n- What\'s the price history? Has it been cheaper before?\n- Are there any hidden or long-term costs (accessories, maintenance, subscriptions)?',
          productUrl: productUrl
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('AskAIShortcut: Error -', chrome.runtime.lastError);
            alert('Error: ' + chrome.runtime.lastError.message);
          } else {
            console.log('AskAIShortcut: Response received', response);
          }
          setTimeout(() => {
            button.disabled = false;
            button.textContent = buttonName;
          }, 2000);
        });
      } catch (error) {
        console.error('AskAIShortcut: Exception -', error);
        alert('Error: ' + error.message);
        button.disabled = false;
        button.textContent = buttonName;
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

// Popup script
// Use browser namespace with fallback to chrome for compatibility
const runtime = (typeof browser !== 'undefined') ? browser : chrome;
const tabs = (typeof browser !== 'undefined') ? browser.tabs : chrome.tabs;

console.log('Buying Advice Extension: Popup opened');

document.getElementById('buying-advice-btn').addEventListener('click', async () => {
  console.log('Buying Advice Extension: Popup button clicked');
  
  const button = document.getElementById('buying-advice-btn');
  button.disabled = true;
  button.textContent = '⏳ Opening Gemini...';
  
  try {
    // Get the current active tab
    const [tab] = await tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url) {
      console.log('Buying Advice Extension: Current tab URL:', tab.url);
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'openGemini',
        productUrl: tab.url
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Buying Advice Extension: Error -', chrome.runtime.lastError);
          button.textContent = '❌ Error';
        } else {
          console.log('Buying Advice Extension: Success!');
          button.textContent = '✓ Opened!';
          // Close popup after a short delay
          setTimeout(() => {
            window.close();
          }, 500);
        }
      });
    } else {
      console.error('Buying Advice Extension: No active tab found');
      button.textContent = '❌ No tab';
      button.disabled = false;
    }
  } catch (error) {
    console.error('Buying Advice Extension: Exception -', error);
    button.textContent = '❌ Error';
    button.disabled = false;
  }
});

document.getElementById('content-analysis-btn').addEventListener('click', async () => {
  console.log('Content Analysis Extension: Popup button clicked');
  
  const button = document.getElementById('content-analysis-btn');
  button.disabled = true;
  button.textContent = '⏳ Opening Gemini...';
  
  try {
    // Get the current active tab
    const [tab] = await tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url) {
      console.log('Content Analysis Extension: Current tab URL:', tab.url);
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'openGeminiContentAnalysis',
        productUrl: tab.url
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Content Analysis Extension: Error -', chrome.runtime.lastError);
          button.textContent = '❌ Error';
        } else {
          console.log('Content Analysis Extension: Success!');
          button.textContent = '✓ Opened!';
          // Close popup after a short delay
          setTimeout(() => {
            window.close();
          }, 500);
        }
      });
    } else {
      console.error('Content Analysis Extension: No active tab found');
      button.textContent = '❌ No tab';
      button.disabled = false;
    }
  } catch (error) {
    console.error('Content Analysis Extension: Exception -', error);
    button.textContent = '❌ Error';
    button.disabled = false;
  }
});

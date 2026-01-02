// Popup script
// Use browser namespace with fallback to chrome for compatibility
const runtime = (typeof browser !== 'undefined') ? browser : chrome;
const tabs = (typeof browser !== 'undefined') ? browser.tabs : chrome.tabs;
const storage = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;

console.log('Buying Advice Extension: Popup opened');

// Default settings
const defaults = {
  button1Name: '💡 Buying advice',
  button2Name: '🔍 Content analysis'
};

// Load button names from settings
async function loadButtonNames() {
  try {
    const settings = await storage.sync.get(defaults);
    document.getElementById('buying-advice-btn').textContent = settings.button1Name;
    document.getElementById('content-analysis-btn').textContent = settings.button2Name;
  } catch (error) {
    console.error('Error loading button names:', error);
  }
}

// Load button names when popup opens
loadButtonNames();

document.getElementById('buying-advice-btn').addEventListener('click', async () => {
  console.log('Buying Advice Extension: Popup button clicked');
  
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
          alert('Error opening Gemini: ' + chrome.runtime.lastError.message);
        } else {
          console.log('Buying Advice Extension: Success!');
          // Close popup immediately on success
          window.close();
        }
      });
    } else {
      console.error('Buying Advice Extension: No active tab found');
      alert('Error: No active tab found');
    }
  } catch (error) {
    console.error('Buying Advice Extension: Exception -', error);
    alert('Error: ' + error.message);
  }
});

document.getElementById('content-analysis-btn').addEventListener('click', async () => {
  console.log('Content Analysis Extension: Popup button clicked');
  
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
          alert('Error opening Gemini: ' + chrome.runtime.lastError.message);
        } else {
          console.log('Content Analysis Extension: Success!');
          // Close popup immediately on success
          window.close();
        }
      });
    } else {
      console.error('Content Analysis Extension: No active tab found');
      alert('Error: No active tab found');
    }
  } catch (error) {
    console.error('Content Analysis Extension: Exception -', error);
    alert('Error: ' + error.message);
  }
});

// Settings link handler
document.getElementById('settings-link').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

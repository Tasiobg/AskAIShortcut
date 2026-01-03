// Popup script for AskAIShortcut extension
// Displays action buttons and handles button clicks to open AI service

// Cross-browser compatibility: Use APIs from i18n.js (storage, runtime)
// Get tabs API
const tabs = (typeof browser !== 'undefined') ? browser.tabs : chrome.tabs;

console.log('AskAIShortcut: Popup opened');

// Default buttons (loaded from i18n messages)
let defaultButtons = [];

// Initialize default buttons from i18n messages
async function initializeDefaultButtons() {
  try {
    // Ensure translation data is loaded
    if (!translationData || Object.keys(translationData).length === 0) {
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (translationData && Object.keys(translationData).length > 0) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50);
        // Timeout after 2 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 2000);
      });
    }
    
    defaultButtons = [
      {
        id: 'button1',
        name: getMessage('buyingAdvice') || '💡 Buying advice',
        question: getMessage('buyingAdviceQuestion') || 'I need buying advice for this product...'
      },
      {
        id: 'button2',
        name: getMessage('contentAnalysis') || '🔍 Content analysis',
        question: getMessage('contentAnalysisQuestion') || 'Analyze this content for editorial bias...'
      }
    ];
  } catch (error) {
    console.error('AskAIShortcut: Error initializing default buttons:', error);
  }
}

// Load and render buttons
async function loadAndRenderButtons() {
  try {
    await initializeDefaultButtons();
    const result = await storage.sync.get({ buttons: defaultButtons });
    const buttons = result.buttons || defaultButtons;
    
    const container = document.getElementById('buttons-container');
    container.innerHTML = '';
    
    buttons.forEach((button, index) => {
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.textContent = button.name;
      btn.dataset.buttonId = button.id;
      btn.addEventListener('click', () => handleButtonClick(button));
      container.appendChild(btn);
    });
  } catch (error) {
    console.error('AskAIShortcut: Error loading buttons:', error);
  }
}

// Handle button click
async function handleButtonClick(button) {
  console.log('AskAIShortcut: Button clicked:', button.name);
  
  try {
    // Get the current active tab
    const [tab] = await tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url) {
      console.log('Current tab URL:', tab.url);
      
      // Send message to background script
      runtime.sendMessage({
        action: 'openAIServiceWithQuestion',
        question: button.question,
        productUrl: tab.url
      }, (response) => {
        if (runtime.lastError) {
          console.error('AskAIShortcut: Error:', runtime.lastError);
          const errorMsg = getMessage('errorOpeningAIService', runtime.lastError.message) || 
                          'Error opening AI Service: ' + runtime.lastError.message;
          alert(errorMsg);
        } else {
          console.log('AskAIShortcut: Success!');
          // Close popup immediately on success
          window.close();
        }
      });
    } else {
      console.error('AskAIShortcut: No active tab found');
      const errorMsg = getMessage('noActivetabFound') || 'Error: No active tab found';
      alert(errorMsg);
    }
  } catch (error) {
    console.error('AskAIShortcut: Exception:', error);
    const errorMsg = getMessage('error', error.message) || ('Error: ' + error.message);
    alert(errorMsg);
  }
}

// Load buttons when popup opens
// Wait for i18n to be initialized first
async function initPopup() {
  // Wait a bit for i18n.js to initialize
  let attempts = 0;
  while (typeof getMessage === 'undefined' && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 50));
    attempts++;
  }
  await loadAndRenderButtons();
}

initPopup();

// Settings link handler
document.getElementById('settings-link').addEventListener('click', (e) => {
  e.preventDefault();
  runtime.openOptionsPage();
});

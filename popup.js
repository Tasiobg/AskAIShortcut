// Popup script
// Use browser namespace with fallback to chrome for compatibility
const runtime = (typeof browser !== 'undefined') ? browser : chrome;
const tabs = (typeof browser !== 'undefined') ? browser.tabs : chrome.tabs;
const storage = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;

console.log('Buying Advice Extension: Popup opened');

// Default buttons
const defaultButtons = [
  {
    id: 'button1',
    name: '💡 Buying advice',
    question: `I need buying advice for this product, please help me understand:
- Is this a good deal?
- What are the pros and cons?
- Are there better alternatives?
- What should I consider before buying?
- Is this product worth the price?
- What do the reviews say? Do they appear authentic, or do they show signs of AI generation and manipulation?
- What's the price history? Has it been cheaper before?
- Are there any hidden or long-term costs (accessories, maintenance, subscriptions)?`
  },
  {
    id: 'button2',
    name: '🔍 Content analysis',
    question: `Analyze this content for editorial bias
Identify any omitted context, missing facts, or logical leaps
Verify authenticity and logic
What is the primary goal (e.g., to inform, persuade, or sell). Identify if the content uses 'outrage engagement' or specific emotional triggers to influence a vote, a purchase, or social sharing.`
  }
];

// Load and render buttons
async function loadAndRenderButtons() {
  try {
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
    console.error('Error loading buttons:', error);
  }
}

// Handle button click
async function handleButtonClick(button) {
  console.log('Button clicked:', button.name);
  
  try {
    // Get the current active tab
    const [tab] = await tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url) {
      console.log('Current tab URL:', tab.url);
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'openGeminiWithQuestion',
        question: button.question,
        productUrl: tab.url
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          alert('Error opening Gemini: ' + chrome.runtime.lastError.message);
        } else {
          console.log('Success!');
          // Close popup immediately on success
          window.close();
        }
      });
    } else {
      console.error('No active tab found');
      alert('Error: No active tab found');
    }
  } catch (error) {
    console.error('Exception:', error);
    alert('Error: ' + error.message);
  }
}

// Load buttons when popup opens
loadAndRenderButtons();

// Settings link handler
document.getElementById('settings-link').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

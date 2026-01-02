// Background service worker
// Use browser namespace with fallback to chrome for compatibility
const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;
const tabs = (typeof browser !== 'undefined') ? browser.tabs : chrome.tabs;
const scripting = (typeof browser !== 'undefined') ? browser.scripting : chrome.scripting;
const storage = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;

console.log('Buying Advice Extension: Background script loaded');

// Default settings
const defaults = {
  button1Name: '💡 Buying advice',
  button1Question: `I need buying advice for this product, please help me understand:
- Is this a good deal?
- What are the pros and cons?
- Are there better alternatives?
- What should I consider before buying?
- Is this product worth the price?
- What do the reviews say? Do they appear authentic, or do they show signs of AI generation and manipulation?
- What's the price history? Has it been cheaper before?
- Are there any hidden or long-term costs (accessories, maintenance, subscriptions)?`,
  button2Name: '🔍 Content analysis',
  button2Question: `Analyze this content for editorial bias
Identify any omitted context, missing facts, or logical leaps
Verify authenticity and logic
What is the primary goal (e.g., to inform, persuade, or sell). Identify if the content uses 'outrage engagement' or specific emotional triggers to influence a vote, a purchase, or social sharing.`
};

// Handle messages from content script or popup
runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Buying Advice Extension: Message received in background', message);
  
  if (message.action === 'openGemini') {
    handleOpenGemini(message.productUrl)
      .then(() => {
        sendResponse({ status: 'success' });
      })
      .catch((error) => {
        console.error('Error in handleOpenGemini:', error);
        sendResponse({ status: 'error', error: error.message });
      });
    return true; // Keep message channel open for async response
  } else if (message.action === 'openGeminiContentAnalysis') {
    handleOpenGeminiContentAnalysis(message.productUrl)
      .then(() => {
        sendResponse({ status: 'success' });
      })
      .catch((error) => {
        console.error('Error in handleOpenGeminiContentAnalysis:', error);
        sendResponse({ status: 'error', error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});

async function handleOpenGemini(productUrl) {
  try {
    // Get settings and create the question
    const settings = await storage.sync.get(defaults);
    const question = createQuestionWithContext(productUrl, settings.button1Question);
    
    // Open Gemini in a new tab
    const tab = await tabs.create({
      url: 'https://gemini.google.com/app',
      active: true
    });

    console.log('Opened Gemini tab:', tab.id);

    // Wait for the tab to load, then inject the script to fill the input
    // Using a promise to properly handle the async tab loading
    return new Promise((resolve, reject) => {
      tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          // Remove listener to avoid memory leaks
          tabs.onUpdated.removeListener(listener);
          
          console.log('Tab loaded, injecting script...');
          
          // Inject the script to fill the Gemini input
          scripting.executeScript({
            target: { tabId: tab.id },
            files: ['gemini-filler.js']
          }).then(() => {
            console.log('Script injected, sending question...');
            // Send the question to the injected script
            tabs.sendMessage(tab.id, {
              action: 'fillGeminiInput',
              question: question
            }).then(() => {
              console.log('Question sent successfully');
              resolve();
            }).catch(err => {
              console.error('Error sending message to tab:', err);
              // Still resolve since the tab opened successfully
              resolve();
            });
          }).catch(err => {
            console.error('Error injecting script:', err);
            // Still resolve since the tab opened successfully
            resolve();
          });
        }
      });
      
      // Timeout after 20 seconds to prevent hanging
      setTimeout(() => {
        console.log('Tab load timeout, resolving anyway');
        resolve();
      }, 20000);
    });
  } catch (error) {
    console.error('Error opening Gemini:', error);
    throw error;
  }
}

async function handleOpenGeminiContentAnalysis(productUrl) {
  try {
    // Get settings and create the question
    const settings = await storage.sync.get(defaults);
    const question = createQuestionWithContext(productUrl, settings.button2Question);
    
    // Open Gemini in a new tab
    const tab = await tabs.create({
      url: 'https://gemini.google.com/app',
      active: true
    });

    console.log('Opened Gemini tab:', tab.id);

    // Wait for the tab to load, then inject the script to fill the input
    // Using a promise to properly handle the async tab loading
    return new Promise((resolve, reject) => {
      tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          // Remove listener to avoid memory leaks
          tabs.onUpdated.removeListener(listener);
          
          console.log('Tab loaded, injecting script...');
          
          // Inject the script to fill the Gemini input
          scripting.executeScript({
            target: { tabId: tab.id },
            files: ['gemini-filler.js']
          }).then(() => {
            console.log('Script injected, sending question...');
            // Send the question to the injected script
            tabs.sendMessage(tab.id, {
              action: 'fillGeminiInput',
              question: question
            }).then(() => {
              console.log('Question sent successfully');
              resolve();
            }).catch(err => {
              console.error('Error sending message to tab:', err);
              // Still resolve since the tab opened successfully
              resolve();
            });
          }).catch(err => {
            console.error('Error injecting script:', err);
            // Still resolve since the tab opened successfully
            resolve();
          });
        }
      });
      
      // Timeout after 20 seconds to prevent hanging
      setTimeout(() => {
        console.log('Tab load timeout, resolving anyway');
        resolve();
      }, 20000);
    });
  } catch (error) {
    console.error('Error opening Gemini:', error);
    throw error;
  }
}

// Helper function to create question with context
function createQuestionWithContext(productUrl, questionText) {
  const context = `Context: ${productUrl}
  `;
  return context + questionText;
}


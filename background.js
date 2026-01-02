// Background service worker
// Use browser namespace with fallback to chrome for compatibility
const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;
const tabs = (typeof browser !== 'undefined') ? browser.tabs : chrome.tabs;
const scripting = (typeof browser !== 'undefined') ? browser.scripting : chrome.scripting;
const storage = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;

console.log('Buying Advice Extension: Background script loaded');

// Handle language change messages
runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'languageChanged') {
    console.log('Language changed to:', request.language);
    // Notify all tabs to reload for language change
    tabs.query({}, (allTabs) => {
      allTabs.forEach(tab => {
        tabs.sendMessage(tab.id, { action: 'reloadForLanguageChange' }, () => {
          // Ignore errors for tabs that don't have our content script
          runtime.lastError;
        });
      });
    });
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
});

// Default settings
const defaults = {
  buttons: [
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
  ],
  // Legacy support
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
  console.log('Extension: Message received in background', message);
  
  if (message.action === 'openAIServiceWithQuestion') {
    handleOpenAIServiceWithQuestion(message.question, message.productUrl)
      .then(() => {
        sendResponse({ status: 'success' });
      })
      .catch((error) => {
        console.error('Error in handleOpenAIServiceWithQuestion:', error);
        sendResponse({ status: 'error', error: error.message });
      });
    return true;
  }
});

async function handleOpenAIServiceWithQuestion(questionText, productUrl) {
  try {
    // Get the AI Chat URL from storage
    const result = await storage.sync.get({ aiServiceUrl: 'https://gemini.google.com/app' });
    const aiServiceUrl = result.aiServiceUrl || 'https://gemini.google.com/app';
    
    // Create the question with context
    const question = createQuestionWithContext(productUrl, questionText);
    
    // Open AI Service in a new tab
    const tab = await tabs.create({
      url: aiServiceUrl,
      active: true
    });

    console.log('Opened AI Service tab:', tab.id);

    // Wait for the tab to load, then inject the script to fill the input
    return new Promise((resolve, reject) => {
      tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          // Remove listener to avoid memory leaks
          tabs.onUpdated.removeListener(listener);
          
          console.log('Tab loaded, injecting script...');
          
          // Inject the script to fill the AI Service input
          scripting.executeScript({
            target: { tabId: tab.id },
            files: ['ai-service-filler.js']
          }).then(() => {
            console.log('Script injected, sending question...');
            // Send the question to the injected script
            tabs.sendMessage(tab.id, {
              action: 'fillAIServiceInput',
              question: question
            }).then(() => {
              console.log('Question sent successfully');
              resolve();
            }).catch(err => {
              console.error('Error sending message to tab:', err);
              resolve();
            });
          }).catch(err => {
            console.error('Error injecting script:', err);
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
    console.error('Error opening AI Service:', error);
    throw error;
  }
}

// Helper function to create question with context
function createQuestionWithContext(productUrl, questionText) {
  const context = `Context: ${productUrl}\n  `;
  return context + questionText;
}


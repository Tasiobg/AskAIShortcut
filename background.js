// Background service worker for AskAIShortcut extension
// Handles opening AI service tabs and injecting questions

// Cross-browser compatibility: Use browser namespace with fallback to chrome
const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;
const tabs = (typeof browser !== 'undefined') ? browser.tabs : chrome.tabs;
const scripting = (typeof browser !== 'undefined') ? browser.scripting : chrome.scripting;
const storage = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;

console.log('AskAIShortcut: Background script loaded');

// Handle messages from popup
runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('AskAIShortcut: Message received in background', message);
  
  if (message.action === 'openAIServiceWithQuestion') {
    handleOpenAIServiceWithQuestion(message.question, message.productUrl)
      .then(() => {
        sendResponse({ status: 'success' });
      })
      .catch((error) => {
        console.error('AskAIShortcut: Error in handleOpenAIServiceWithQuestion:', error);
        sendResponse({ status: 'error', error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'languageChanged') {
    console.log('AskAIShortcut: Language changed to:', message.language);
    sendResponse({ success: true });
    return true;
  }
});

async function handleOpenAIServiceWithQuestion(questionText, productUrl) {
  try {
    // Get the AI service URL from storage
    const result = await storage.sync.get({ aiServiceUrl: 'https://gemini.google.com/app' });
    const aiServiceUrl = result.aiServiceUrl || 'https://gemini.google.com/app';
    
    // Create the question with context
    const question = createQuestionWithContext(productUrl, questionText);
    
    // Open AI service in a new tab
    const tab = await tabs.create({
      url: aiServiceUrl,
      active: true
    });

    console.log('AskAIShortcut: Opened AI service tab:', tab.id);

    // Wait for the tab to load, then inject the script to fill the input
    return new Promise((resolve) => {
      const listener = function(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          // Remove listener to avoid memory leaks
          tabs.onUpdated.removeListener(listener);
          
          console.log('AskAIShortcut: Tab loaded, injecting script...');
          
          // Inject the script to fill the AI service input
          scripting.executeScript({
            target: { tabId: tab.id },
            files: ['ai-service-filler.js']
          }).then(() => {
            console.log('AskAIShortcut: Script injected, sending question...');
            // Send the question to the injected script
            tabs.sendMessage(tab.id, {
              action: 'fillAIServiceInput',
              question: question
            }).then(() => {
              console.log('AskAIShortcut: Question sent successfully');
              resolve();
            }).catch(err => {
              console.error('AskAIShortcut: Error sending message to tab:', err);
              resolve(); // Resolve anyway to prevent hanging
            });
          }).catch(err => {
            console.error('AskAIShortcut: Error injecting script:', err);
            resolve(); // Resolve anyway to prevent hanging
          });
        }
      };
      
      tabs.onUpdated.addListener(listener);
      
      // Timeout after 20 seconds to prevent hanging
      setTimeout(() => {
        tabs.onUpdated.removeListener(listener);
        console.log('AskAIShortcut: Tab load timeout');
        resolve();
      }, 20000);
    });
  } catch (error) {
    console.error('AskAIShortcut: Error opening AI service:', error);
    throw error;
  }
}

// Helper function to create question with context
function createQuestionWithContext(productUrl, questionText) {
  return `Context: ${productUrl}\n\n${questionText}`;
}


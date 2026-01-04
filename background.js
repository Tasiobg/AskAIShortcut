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
    const result = await new Promise((resolve) => {
      storage.sync.get({ aiServiceUrl: 'https://gemini.google.com/app' }, resolve);
    });
    const aiServiceUrl = result.aiServiceUrl || 'https://gemini.google.com/app';

    // Create the question with context
    const question = createQuestionWithContext(productUrl, questionText);

    // Open AI service in a new tab
    const tab = await tabs.create({
      url: aiServiceUrl,
      active: true
    });

    console.log('AskAIShortcut: Opened AI service tab:', tab.id);

    // Function to inject script when tab is ready
    const injectFiller = (tabId) => {
      console.log('AskAIShortcut: Tab ready, injecting script...');
      scripting.executeScript({
        target: { tabId },
        files: ['ai-service-filler.js']
      }).then(() => {
        console.log('AskAIShortcut: Script injected, sending question...');
        // Small delay to let the script initialize
        setTimeout(() => {
          tabs.sendMessage(tabId, {
            action: 'fillAIServiceInput',
            question: question
          }).catch(err => {
            console.error('AskAIShortcut: Error sending message to tab:', err);
          });
        }, 100);
      }).catch(err => {
        console.error('AskAIShortcut: Error injecting script:', err);
      });
    };

    // Wait for the tab to load
    const listener = (tabId, changeInfo) => {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        tabs.onUpdated.removeListener(listener);
        injectFiller(tab.id);
      }
    };

    tabs.onUpdated.addListener(listener);

    // Fallback: If tab is already completed (rare but possible)
    const currentTab = await tabs.get(tab.id);
    if (currentTab.status === 'complete') {
      tabs.onUpdated.removeListener(listener);
      injectFiller(tab.id);
    }

    // Timeout fallback after 15 seconds to prevent hanging listeners
    setTimeout(() => {
      tabs.onUpdated.removeListener(listener);
    }, 15000);

    return true;
  } catch (error) {
    console.error('AskAIShortcut: Error opening AI service:', error);
    throw error;
  }
}

// Helper function to create question with context
function createQuestionWithContext(productUrl, questionText) {
  // Use a clear separator for context
  return `Context: ${productUrl}\n\nTask: ${questionText}`;
}


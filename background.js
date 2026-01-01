// Background service worker
// Use browser namespace with fallback to chrome for compatibility
const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;
const tabs = (typeof browser !== 'undefined') ? browser.tabs : chrome.tabs;
const scripting = (typeof browser !== 'undefined') ? browser.scripting : chrome.scripting;

console.log('Buying Advice Extension: Background script loaded');

// Handle messages from content script or popup
runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Buying Advice Extension: Message received in background', message);
  
  if (message.action === 'openGemini') {
    handleOpenGemini(message.productUrl);
    sendResponse({ status: 'success' });
  } else if (message.action === 'openGeminiContentAnalysis') {
    handleOpenGeminiContentAnalysis(message.productUrl);
    sendResponse({ status: 'success' });
  }
  return true;
});

async function handleOpenGemini(productUrl) {
  try {
    // Create the buying advice question
    const question = createBuyingAdviceQuestion(productUrl);
    
    // Open Gemini in a new tab
    const tab = await tabs.create({
      url: 'https://gemini.google.com/app',
      active: true
    });

    console.log('Opened Gemini tab:', tab.id);

    // Wait for the tab to load, then inject the script to fill the input
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
          }).catch(err => {
            console.error('Error sending message to tab:', err);
          });
        }).catch(err => {
          console.error('Error injecting script:', err);
        });
      }
    });
  } catch (error) {
    console.error('Error opening Gemini:', error);
  }
}

function createBuyingAdviceQuestion(productUrl) {
  const question = `I need buying advice for this product:

${productUrl}

Please help me understand:
- Is this a good deal?
- What are the pros and cons?
- Are there better alternatives?
- What should I consider before buying?
- Is this product worth the price?
- What do the reviews say? Do they appear authentic, or do they show signs of AI generation and manipulation?"
- What's the price history? Has it been cheaper before?
- Are there any hidden or long-term costs (accessories, maintenance, subscriptions)?`;
  
  return question;
}

async function handleOpenGeminiContentAnalysis(productUrl) {
  try {
    // Create the content analysis question
    const question = createContentAnalysisQuestion(productUrl);
    
    // Open Gemini in a new tab
    const tab = await tabs.create({
      url: 'https://gemini.google.com/app',
      active: true
    });

    console.log('Opened Gemini tab:', tab.id);

    // Wait for the tab to load, then inject the script to fill the input
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
          }).catch(err => {
            console.error('Error sending message to tab:', err);
          });
        }).catch(err => {
          console.error('Error injecting script:', err);
        });
      }
    });
  } catch (error) {
    console.error('Error opening Gemini:', error);
  }
}

function createContentAnalysisQuestion(productUrl) {
  const question = `Context: ${productUrl}

Analyze this content for editorial bias
Identify any omitted context, missing facts, or logical leaps
Verify authenticity and logic
What is the primary goal (e.g., to inform, persuade, or sell). Identify if the content uses 'outrage engagement' or specific emotional triggers to influence a vote, a purchase, or social sharing.`;
  
  return question;
}

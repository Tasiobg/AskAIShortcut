// i18n helper script for translating UI elements
// Supports runtime language switching by loading locale JSON files

let currentLanguage = 'en';
let translationData = {};

// Get storage API
const storage = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;

// Load translation data from locale JSON file
async function loadLanguageData(language) {
  try {
    const response = await fetch(chrome.runtime.getURL(`_locales/${language}/messages.json`));
    if (!response.ok) {
      throw new Error(`Failed to load language: ${language}`);
    }
    translationData = await response.json();
    currentLanguage = language;
    return translationData;
  } catch (error) {
    console.error('Error loading language data:', error);
    // Fall back to English
    if (language !== 'en') {
      return loadLanguageData('en');
    }
    return {};
  }
}

// Get translated message
function getMessage(messageKey, substitutions = null) {
  if (!translationData[messageKey]) {
    return messageKey; // Return key if translation not found
  }
  
  let message = translationData[messageKey].message || '';
  
  // Handle substitutions
  if (substitutions) {
    if (!Array.isArray(substitutions)) {
      substitutions = [substitutions];
    }
    substitutions.forEach((sub, index) => {
      message = message.replace(new RegExp('\\$' + (index + 1), 'g'), sub);
    });
  }
  
  return message;
}

// Translate page based on saved language preference
async function initializeLanguage() {
  try {
    // Get saved language preference
    const result = await new Promise((resolve) => {
      storage.sync.get({ language: null }, resolve);
    });
    
    const userLanguage = result.language || 'en';
    await loadLanguageData(userLanguage);
    translatePage();
  } catch (error) {
    console.error('Error initializing language:', error);
    await loadLanguageData('en');
    translatePage();
  }
}

// Translate all elements with data-i18n attribute
function translatePage() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const messageKey = el.getAttribute('data-i18n');
    const message = getMessage(messageKey);
    if (message && message !== messageKey) {
      el.textContent = message;
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLanguage);
} else {
  initializeLanguage();
}

// Listen for language changes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'languageChanged') {
    initializeLanguage();
  }
});

// Language override utility for AskAIShortcut extension
// This script handles saving and retrieving user's preferred language
// Note: storage variable is declared in options.js

// Get the user's preferred language or browser's language
async function getPreferredLanguage() {
  return new Promise((resolve) => {
    const store = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;
    store.sync.get({ language: null }, (result) => {
      if (result.language) {
        resolve(result.language);
      } else {
        // Fall back to browser language
        const browserLang = chrome.i18n.getUILanguage();
        resolve(browserLang);
      }
    });
  });
}

// Set the user's preferred language
async function setPreferredLanguage(languageCode) {
  return new Promise((resolve) => {
    const store = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;
    store.sync.set({ language: languageCode }, () => {
      resolve();
    });
  });
}

// Get a translated message with language override support
async function getLocalizedMessage(messageKey, substitutions = null) {
  // Chrome's i18n always uses the browser's language set
  // We'll use chrome.i18n.getMessage directly since Chrome doesn't support
  // runtime language switching. Users will need to restart the extension
  // or their browser to see language changes take effect.
  
  return chrome.i18n.getMessage(messageKey, substitutions);
}

// i18n (internationalization) helper script for AskAIShortcut extension
// Handles runtime language switching by loading locale JSON files
// Supports 11 languages: en, es, fr, de, pt_BR, zh_CN, ja, ko, hi, it, ar

let currentLanguage = 'en';
let translationData = {};

// Cross-browser compatibility
const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;
const storage = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;
const i18nAPI = (typeof browser !== 'undefined') ? browser.i18n : chrome.i18n;

/**
 * Promisified storage.sync.get
 */
function getStorage(keys) {
  return new Promise((resolve, reject) => {
    storage.sync.get(keys, (result) => {
      if (runtime.lastError) {
        reject(runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Promisified storage.sync.set
 */
function setStorage(data) {
  return new Promise((resolve, reject) => {
    storage.sync.set(data, () => {
      if (runtime.lastError) {
        reject(runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// Load translation data from locale JSON file
async function loadLanguageData(language) {
  try {
    const url = runtime.getURL(`_locales/${language}/messages.json`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load language: ${language}`);
    }
    translationData = await response.json();
    currentLanguage = language;
    return translationData;
  } catch (error) {
    console.error('AskAIShortcut: Error loading language data:', error);
    // Fall back to English
    if (language !== 'en') {
      return loadLanguageData('en');
    }
    return {};
  }
}

// Get translated message
function getMessage(messageKey, substitutions = null) {
  if (!translationData || !translationData[messageKey]) {
    // If not loaded yet or missing, try falling back to standard i18n API if available (for manifest/description)
    if (i18nAPI && i18nAPI.getMessage) {
      const msg = i18nAPI.getMessage(messageKey, substitutions);
      if (msg) return msg;
    }
    return messageKey;
  }

  let message = translationData[messageKey].message || '';

  // Handle substitutions ($1, $2, etc.)
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

// Get browser's UI language, normalized to supported language code
function getBrowserLanguage() {
  const supportedLanguages = ['en', 'es', 'fr', 'de', 'pt_BR', 'zh_CN', 'ja', 'ko', 'hi', 'it', 'ar'];

  const browserLang = i18nAPI.getUILanguage();

  // Normalize (e.g., 'en-US' -> 'en')
  let normalized = browserLang.split('-')[0].toLowerCase();

  // Handle pt_BR special case
  if (browserLang.toLowerCase().includes('pt') && browserLang.toLowerCase().includes('br')) {
    normalized = 'pt_BR';
  }

  return supportedLanguages.includes(normalized) ? normalized : 'en';
}

// Translate page based on saved language preference or browser language
async function initializeLanguage() {
  try {
    const result = await getStorage({ language: null });

    let userLanguage = result.language;
    if (!userLanguage) {
      userLanguage = getBrowserLanguage();
      // Cache the detected language
      await setStorage({ language: userLanguage });
    }

    await loadLanguageData(userLanguage);
    translatePage();

    // Dispatch custom event when language is ready
    document.dispatchEvent(new CustomEvent('AskAIShortcut:LanguageReady', { detail: { language: userLanguage } }));
  } catch (error) {
    console.error('AskAIShortcut: Error initializing language:', error);
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
      // Check if it's an input/textarea (placeholder) or a standard element
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = message;
      } else {
        el.textContent = message;
      }
    }
  });
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLanguage);
} else {
  initializeLanguage();
}

// Listen for language changes from other parts of the extension
runtime.onMessage.addListener((request) => {
  if (request.action === 'languageChanged') {
    loadLanguageData(request.language).then(translatePage);
  }
});

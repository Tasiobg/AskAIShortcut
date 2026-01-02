// Options page script
// Note: storage is declared in i18n.js, which is loaded before this script
const i18n = typeof chrome !== 'undefined' ? chrome.i18n : browser.i18n;

// Supported languages
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'pt_BR': 'Português (Brasil)',
  'zh_CN': '中文 (简体)',
  'ja': '日本語',
  'ko': '한국어',
  'hi': 'हिंदी',
  'it': 'Italiano',
  'ar': 'العربية'
};

// Initialize defaults from i18n messages
function initializeDefaults() {
  return {
    buttons: [
      {
        id: 'button1',
        name: i18n.getMessage('buyingAdvice') || '💡 Buying advice',
        question: i18n.getMessage('buyingAdviceQuestion') || 'I need buying advice...'
      },
      {
        id: 'button2',
        name: i18n.getMessage('contentAnalysis') || '🔍 Content analysis',
        question: i18n.getMessage('contentAnalysisQuestion') || 'Analyze this content...'
      }
    ]
  };
}

const defaults = initializeDefaults();

let currentButtons = [];

// Load and render buttons
async function loadSettings() {
  try {
    const result = await storage.sync.get({ 
      buttons: defaults.buttons, 
      language: 'en',
      geminiUrl: 'https://gemini.google.com/app'
    });
    currentButtons = result.buttons || defaults.buttons;
    
    // Set the language selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
      languageSelect.value = result.language || 'en';
    }
    
    // Set the Gemini URL
    const geminiUrlInput = document.getElementById('gemini-url');
    if (geminiUrlInput) {
      geminiUrlInput.value = result.geminiUrl || 'https://gemini.google.com/app';
    }
    
    renderButtons();
  } catch (error) {
    console.error('Error loading settings:', error);
    const errorMsg = i18n.getMessage('errorLoadingSettings') || 'Error loading settings';
    showStatus(errorMsg, 'error');
  }
}

// Render button configuration UI
function renderButtons() {
  const container = document.getElementById('buttons-container');
  container.innerHTML = '';

  currentButtons.forEach((button, index) => {
    const configDiv = document.createElement('div');
    configDiv.className = 'button-config';
    const buttonLabel = i18n.getMessage('button') || 'Button';
    const removeText = i18n.getMessage('removeButton') || '✕ Remove';
    const buttonNameLabel = i18n.getMessage('buttonName') || 'Button Name:';
    const questionLabel = i18n.getMessage('questionTemplate') || 'Question Template:';
    const nameHelperText = i18n.getMessage('thisIsTheText') || 'This is the text shown on the button';
    const questionHelperText = i18n.getMessage('contextWillBePrepended') || 'The context (URL) will be automatically prepended to this question';
    
    configDiv.innerHTML = `
      <h2>
        <span>${buttonLabel} ${index + 1}</span>
        ${currentButtons.length > 1 ? `<button class="remove-button-btn" data-index="${index}">${removeText}</button>` : ''}
      </h2>
      
      <div class="field-group">
        <label for="name-${button.id}">${buttonNameLabel}</label>
        <input type="text" id="name-${button.id}" class="button-name" data-index="${index}" placeholder="e.g., 💡 Buying advice" value="${button.name}">
        <div class="helper-text">${nameHelperText}</div>
      </div>

      <div class="field-group">
        <label for="question-${button.id}">${questionLabel}</label>
        <textarea id="question-${button.id}" class="button-question" data-index="${index}" placeholder="Enter your question template...">${button.question}</textarea>
        <div class="helper-text">${questionHelperText}</div>
      </div>
    `;
    container.appendChild(configDiv);

    // Add remove button listener
    if (currentButtons.length > 1) {
      configDiv.querySelector('.remove-button-btn').addEventListener('click', (e) => {
        removeButton(index);
      });
    }
  });

  // Re-attach listeners to all input fields
  attachInputListeners();
}

// Attach listeners to dynamically created inputs
function attachInputListeners() {
  document.querySelectorAll('.button-name, .button-question').forEach(input => {
    input.addEventListener('change', updateCurrentButtons);
  });
}

// Update currentButtons array when inputs change
function updateCurrentButtons() {
  const buttonLabel = i18n.getMessage('button') || 'Button';
  document.querySelectorAll('.button-config').forEach((config, index) => {
    if (index < currentButtons.length) {
      currentButtons[index].name = document.querySelector(`input[data-index="${index}"]`).value.trim() || `${buttonLabel} ${index + 1}`;
      currentButtons[index].question = document.querySelector(`textarea[data-index="${index}"]`).value.trim() || '';
    }
  });
}

// Remove button from list
function removeButton(index) {
  if (currentButtons.length === 1) {
    const errorMsg = i18n.getMessage('mustHaveAtLeastOne') || 'You must have at least one button';
    showStatus(errorMsg, 'error');
    return;
  }
  const confirmMsg = i18n.getMessage('removeButtonConfirm', currentButtons[index].name) || 
                     `Remove button "${currentButtons[index].name}"?`;
  if (confirm(confirmMsg)) {
    currentButtons.splice(index, 1);
    renderButtons();
  }
}

// Add new button
function addButton() {
  const newId = 'button' + Date.now();
  const buttonLabel = i18n.getMessage('button') || 'Button';
  currentButtons.push({
    id: newId,
    name: `${buttonLabel} ${currentButtons.length + 1}`,
    question: ''
  });
  renderButtons();
  // Scroll to the new button
  setTimeout(() => {
    const buttons = document.querySelectorAll('.button-config');
    buttons[buttons.length - 1].scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// Save settings
async function saveSettings() {
  updateCurrentButtons(); // Ensure all current values are captured
  
  if (currentButtons.length === 0) {
    const errorMsg = i18n.getMessage('mustHaveAtLeastOne') || 'You must have at least one button';
    showStatus(errorMsg, 'error');
    return;
  }

  try {
    const geminiUrl = document.getElementById('gemini-url').value.trim();
    
    if (!geminiUrl) {
      const errorMsg = getMessage('aiServiceUrlRequired') || 'AI Service URL is required';
      showStatus(errorMsg, 'error');
      return;
    }
    
    // Validate URL format
    try {
      new URL(geminiUrl);
    } catch (e) {
      const errorMsg = getMessage('invalidUrl') || 'Invalid URL format';
      showStatus(errorMsg, 'error');
      return;
    }
    
    await storage.sync.set({ 
      buttons: currentButtons,
      geminiUrl: geminiUrl
    });
    const successMsg = i18n.getMessage('settingsSavedSuccessfully') || '✓ Settings saved successfully!';
    showStatus(successMsg, 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    const errorMsg = i18n.getMessage('errorSavingSettings') || 'Error saving settings';
    showStatus(errorMsg, 'error');
  }
}

// Reset to defaults
async function resetSettings() {
  const confirmMsg = i18n.getMessage('areYouSureReset') || 'Are you sure you want to reset all settings to defaults?';
  if (confirm(confirmMsg)) {
    try {
      const newDefaults = initializeDefaults();
      await storage.sync.set({ 
        buttons: newDefaults.buttons,
        geminiUrl: 'https://gemini.google.com/app'
      });
      currentButtons = JSON.parse(JSON.stringify(newDefaults.buttons));
      
      // Reset the AI Service URL field
      const geminiUrlInput = document.getElementById('gemini-url');
      if (geminiUrlInput) {
        geminiUrlInput.value = 'https://gemini.google.com/app';
      }
      
      renderButtons();
      const successMsg = i18n.getMessage('settingsResetToDefaults') || '✓ Settings reset to defaults!';
      showStatus(successMsg, 'success');
    } catch (error) {
      console.error('Error resetting settings:', error);
      const errorMsg = i18n.getMessage('errorResettingSettings') || 'Error resetting settings';
      showStatus(errorMsg, 'error');
    }
  }
}

// Show status message
function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  statusEl.style.display = 'block';
  
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

// Save language preference and reload extension
async function changeLanguage(languageCode) {
  try {
    // Get current defaults in current language
    const oldDefaults = [
      {
        name: getMessage('buyingAdvice') || '💡 Buying advice',
        question: getMessage('buyingAdviceQuestion') || 'I need buying advice...'
      },
      {
        name: getMessage('contentAnalysis') || '🔍 Content analysis',
        question: getMessage('contentAnalysisQuestion') || 'Analyze this content...'
      }
    ];
    
    // Save the language preference
    await storage.sync.set({ language: languageCode });
    
    // Update translations immediately
    await loadLanguageData(languageCode);
    translatePage();
    
    // Get new defaults in new language
    const newDefaults = [
      {
        name: getMessage('buyingAdvice') || '💡 Buying advice',
        question: getMessage('buyingAdviceQuestion') || 'I need buying advice...'
      },
      {
        name: getMessage('contentAnalysis') || '🔍 Content analysis',
        question: getMessage('contentAnalysisQuestion') || 'Analyze this content...'
      }
    ];
    
    // Update buttons that match old defaults to use new language defaults
    let buttonsUpdated = false;
    currentButtons.forEach((button, index) => {
      if (index < oldDefaults.length) {
        // Check if button name matches old default (hasn't been customized)
        if (button.name === oldDefaults[index].name) {
          button.name = newDefaults[index].name;
          buttonsUpdated = true;
        }
        // Check if question matches old default (hasn't been customized)
        if (button.question === oldDefaults[index].question) {
          button.question = newDefaults[index].question;
          buttonsUpdated = true;
        }
      }
    });
    
    // Save updated buttons if any were changed
    if (buttonsUpdated) {
      await storage.sync.set({ buttons: currentButtons });
      renderButtons();
    }
    
    // Send message to background script to notify of language change
    chrome.runtime.sendMessage({ action: 'languageChanged', language: languageCode }, () => {
      // Ignore errors
      chrome.runtime.lastError; // Clear the error
    });
    
    // Optionally reload after a slight delay for other pages to update
    setTimeout(() => {
      // Don't reload options page itself, just update the UI
      // location.reload(); // Commented out - we update UI in real-time above
    }, 100);
  } catch (error) {
    console.error('Error changing language:', error);
  }
}

// Event listeners
document.getElementById('save-btn').addEventListener('click', saveSettings);
document.getElementById('reset-btn').addEventListener('click', resetSettings);
document.getElementById('add-button-btn').addEventListener('click', addButton);

// Language selector listener
const languageSelect = document.getElementById('language-select');
if (languageSelect) {
  languageSelect.addEventListener('change', (e) => {
    changeLanguage(e.target.value);
  });
}

// Load settings when page loads
loadSettings();

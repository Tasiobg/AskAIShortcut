// Options page script
// Note: storage and getMessage() are declared in i18n.js, which is loaded before this script

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
        name: getMessage('buyingAdvice') || '💡 Buying advice',
        question: getMessage('buyingAdviceQuestion') || 'I need buying advice...'
      },
      {
        id: 'button2',
        name: getMessage('contentAnalysis') || '🔍 Content analysis',
        question: getMessage('contentAnalysisQuestion') || 'Analyze this content...'
      }
    ]
  };
}

let currentButtons = [];
let originalAIServiceUrl = '';
let originalButtons = [];

// Load and render buttons
async function loadSettings() {
  try {
    // Ensure translation data is loaded before initializing defaults
    if (!translationData || Object.keys(translationData).length === 0) {
      await initializeLanguage();
    }
    
    const defaults = initializeDefaults();
    
    const result = await storage.sync.get({ 
      buttons: defaults.buttons, 
      language: 'en',
      aiServiceUrl: 'https://gemini.google.com/app'
    });
    currentButtons = result.buttons || defaults.buttons;
    originalButtons = JSON.parse(JSON.stringify(currentButtons));
    
    // Set the language selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
      languageSelect.value = result.language || 'en';
    }
    
    // Set the AI Chat URL
    const aiServiceUrlInput = document.getElementById('ai-service-url');
    if (aiServiceUrlInput) {
      let aiServiceUrl = result.aiServiceUrl || 'https://gemini.google.com/app';
      originalAIServiceUrl = aiServiceUrl;
      aiServiceUrlInput.value = originalAIServiceUrl;
    }
    
    renderButtons();
  } catch (error) {
    console.error('Error loading settings:', error);
    const errorMsg = getMessage('errorLoadingSettings') || 'Error loading settings';
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
    const buttonLabel = getMessage('button') || 'Button';
    const removeText = getMessage('removeButton') || '✕ Remove';
    const buttonNameLabel = getMessage('buttonName') || 'Button Name:';
    const questionLabel = getMessage('questionTemplate') || 'Question Template:';
    const questionHelperText = getMessage('contextWillBePrepended') || 'The context (URL) will be automatically prepended to this question';
    const saveText = getMessage('saveSettings') || '💾 Save';
    
    configDiv.innerHTML = `
      <h2>
        <span>${buttonLabel} ${index + 1}</span>
        ${currentButtons.length > 1 ? `<button class="remove-button-btn" data-index="${index}">${removeText}</button>` : ''}
      </h2>
      
      <div class="field-group">
        <label for="name-${button.id}">${buttonNameLabel}</label>
        <input type="text" id="name-${button.id}" class="button-name" data-index="${index}" placeholder="e.g., 💡 Buying advice" value="${button.name}">
      </div>

      <div class="field-group">
        <label for="question-${button.id}">${questionLabel}</label>
        <textarea id="question-${button.id}" class="button-question" data-index="${index}" placeholder="Enter your question template...">${button.question}</textarea>
        <div class="helper-text">${questionHelperText}</div>
      </div>
      
      <button class="button-config-save" data-index="${index}" disabled>${saveText}</button>
    `;
    container.appendChild(configDiv);

    // Add remove button listener
    if (currentButtons.length > 1) {
      configDiv.querySelector('.remove-button-btn').addEventListener('click', (e) => {
        removeButton(index);
      });
    }
    
    // Add save button listener
    configDiv.querySelector('.button-config-save').addEventListener('click', (e) => {
      saveButtonConfig(index);
    });
  });

  // Re-attach listeners to all input fields
  attachInputListeners();
}

// Attach listeners to dynamically created inputs
function attachInputListeners() {
  document.querySelectorAll('.button-name, .button-question').forEach(input => {
    input.addEventListener('input', () => {
      const index = parseInt(input.dataset.index);
      checkButtonChanged(index);
    });
  });
  
  // Attach URL input listener
  const urlInput = document.getElementById('ai-service-url');
  if (urlInput) {
    urlInput.addEventListener('input', checkUrlChanged);
  }
}

// Update currentButtons array when inputs change
function updateCurrentButtons() {
  const buttonLabel = getMessage('button') || 'Button';
  document.querySelectorAll('.button-config').forEach((config, index) => {
    if (index < currentButtons.length) {
      currentButtons[index].name = document.querySelector(`input[data-index="${index}"]`).value.trim() || `${buttonLabel} ${index + 1}`;
      currentButtons[index].question = document.querySelector(`textarea[data-index="${index}"]`).value.trim() || '';
    }
  });
}

// Check if URL has changed from original
function checkUrlChanged() {
  const urlInput = document.getElementById('ai-service-url');
  const saveBtn = document.getElementById('save-url-btn');
  
  if (urlInput && saveBtn) {
    const hasChanged = urlInput.value.trim() !== originalAIServiceUrl;
    saveBtn.disabled = !hasChanged;
  }
}

// Check if button config has changed from original
function checkButtonChanged(index) {
  const nameInput = document.querySelector(`input.button-name[data-index="${index}"]`);
  const questionInput = document.querySelector(`textarea.button-question[data-index="${index}"]`);
  const saveBtn = document.querySelector(`.button-config-save[data-index="${index}"]`);
  
  if (nameInput && questionInput && saveBtn) {
    // If originalButtons[index] doesn't exist, this is a new button - always allow saving
    if (!originalButtons[index]) {
      saveBtn.disabled = false;
      return;
    }
    
    const hasChanged = 
      nameInput.value !== originalButtons[index].name ||
      questionInput.value !== originalButtons[index].question;
    saveBtn.disabled = !hasChanged;
  }
}

// Save URL settings
async function saveUrlSettings() {
  const urlInput = document.getElementById('ai-service-url');
  const saveBtn = document.getElementById('save-url-btn');
  let url = urlInput.value.trim();
  
  if (!url) {
    showStatus(getMessage('urlCannotBeEmpty') || 'URL cannot be empty', 'error');
    return;
  }
  
  // Add protocol if missing
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
    urlInput.value = url; // Update the input field to show the complete URL
  }
  
  try {
    await chrome.storage.sync.set({ aiServiceUrl: url });
    originalAIServiceUrl = url;
    saveBtn.disabled = true;
    showStatus(getMessage('urlSaved') || 'AI Chat URL saved successfully', 'success');
  } catch (error) {
    showStatus(getMessage('errorSaving') || 'Error saving settings', 'error');
  }
}

// Save button configuration
async function saveButtonConfig(index) {
  const nameInput = document.querySelector(`input.button-name[data-index="${index}"]`);
  const questionInput = document.querySelector(`textarea.button-question[data-index="${index}"]`);
  const saveBtn = document.querySelector(`.button-config-save[data-index="${index}"]`);
  
  if (!nameInput || !questionInput) return;
  
  const buttonLabel = getMessage('button') || 'Button';
  currentButtons[index].name = nameInput.value.trim() || `${buttonLabel} ${index + 1}`;
  currentButtons[index].question = questionInput.value.trim() || '';
  
  try {
    await chrome.storage.sync.set({ buttons: currentButtons });
    // Update or add to originalButtons
    if (originalButtons.length <= index) {
      // New button - expand originalButtons array
      originalButtons = JSON.parse(JSON.stringify(currentButtons));
    } else {
      // Existing button - update just this one
      originalButtons[index] = JSON.parse(JSON.stringify(currentButtons[index]));
    }
    saveBtn.disabled = true;
    showStatus(getMessage('buttonSaved') || 'Button configuration saved successfully', 'success');
  } catch (error) {
    showStatus(getMessage('errorSaving') || 'Error saving settings', 'error');
  }
}

// Remove button from list
async function removeButton(index) {
  if (currentButtons.length === 1) {
    const errorMsg = getMessage('mustHaveAtLeastOne') || 'You must have at least one button';
    showStatus(errorMsg, 'error');
    return;
  }
  const confirmMsg = getMessage('removeButtonConfirm', currentButtons[index].name) || 
                     `Remove button "${currentButtons[index].name}"?`;
  if (confirm(confirmMsg)) {
    currentButtons.splice(index, 1);
    try {
      await chrome.storage.sync.set({ buttons: currentButtons });
      originalButtons = JSON.parse(JSON.stringify(currentButtons));
      renderButtons();
      showStatus(getMessage('buttonRemoved') || 'Button removed successfully', 'success');
    } catch (error) {
      showStatus(getMessage('errorSaving') || 'Error saving settings', 'error');
    }
  }
}

// Add new button
function addButton() {
  const newId = 'button' + Date.now();
  const buttonLabel = getMessage('button') || 'Button';
  const newButton = {
    id: newId,
    name: `${buttonLabel} ${currentButtons.length + 1}`,
    question: ''
  };
  currentButtons.push(newButton);
  // Don't add to originalButtons yet - it will be added when saved
  // This ensures the save button is enabled for new buttons
  renderButtons();
  // Scroll to the new button
  setTimeout(() => {
    const buttons = document.querySelectorAll('.button-config');
    buttons[buttons.length - 1].scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// Reset to defaults
async function resetSettings() {
  const confirmMsg = getMessage('areYouSureReset') || 'Are you sure you want to reset all settings to defaults?';
  if (confirm(confirmMsg)) {
    try {
      const newDefaults = initializeDefaults();
      const defaultUrl = 'https://gemini.google.com/app';
      
      await storage.sync.set({ 
        buttons: newDefaults.buttons,
        aiServiceUrl: defaultUrl
      });
      
      currentButtons = JSON.parse(JSON.stringify(newDefaults.buttons));
      originalButtons = JSON.parse(JSON.stringify(newDefaults.buttons));
      originalAIServiceUrl = defaultUrl;
      
      // Reset the AI Chat URL field
      const aiServiceUrlInput = document.getElementById('ai-service-url');
      if (aiServiceUrlInput) {
        aiServiceUrlInput.value = defaultUrl;
      }
      
      // Disable all save buttons
      document.getElementById('save-url-btn').disabled = true;
      
      renderButtons();
      const successMsg = getMessage('settingsResetToDefaults') || '✓ Settings reset to defaults!';
      showStatus(successMsg, 'success');
    } catch (error) {
      console.error('Error resetting settings:', error);
      const errorMsg = getMessage('errorResettingSettings') || 'Error resetting settings';
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
document.getElementById('save-url-btn').addEventListener('click', saveUrlSettings);
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

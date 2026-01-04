// Options page script for AskAIShortcut extension
// Handles button configuration, language settings, and AI service URL customization

let currentButtons = [];
let originalAIServiceUrl = '';
let originalButtons = [];

// Initialize defaults
function getDefaults() {
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
    ],
    aiServiceUrl: 'https://gemini.google.com/app',
    language: 'en'
  };
}

// Load settings
async function loadSettings() {
  try {
    const defaults = getDefaults();
    const result = await getStorage({
      buttons: null,
      language: 'en',
      aiServiceUrl: defaults.aiServiceUrl
    });

    currentButtons = result.buttons || defaults.buttons;
    originalButtons = JSON.parse(JSON.stringify(currentButtons));
    originalAIServiceUrl = result.aiServiceUrl;

    // Set UI elements
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) languageSelect.value = result.language;

    const aiServiceUrlInput = document.getElementById('ai-service-url');
    if (aiServiceUrlInput) aiServiceUrlInput.value = originalAIServiceUrl;

    renderButtons();
  } catch (error) {
    console.error('AskAIShortcut: Error loading settings:', error);
    showStatus(getMessage('errorLoadingSettings'), 'error');
  }
}

// Render UI
function renderButtons() {
  const container = document.getElementById('buttons-container');
  container.innerHTML = '';

  currentButtons.forEach((button, index) => {
    const div = document.createElement('div');
    div.className = 'button-config';

    // Create header
    const h2 = document.createElement('h2');
    const spanNode = document.createElement('span');
    spanNode.textContent = `${getMessage('button')} ${index + 1}`;
    h2.appendChild(spanNode);

    if (currentButtons.length > 1) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-button-btn';
      removeBtn.dataset.index = index;
      removeBtn.textContent = getMessage('removeButton');
      h2.appendChild(removeBtn);
    }
    div.appendChild(h2);

    // Create Name field
    const nameGroup = document.createElement('div');
    nameGroup.className = 'field-group';
    const nameLabel = document.createElement('label');
    nameLabel.textContent = getMessage('buttonName');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'button-name';
    nameInput.dataset.index = index;
    nameInput.value = button.name;
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    div.appendChild(nameGroup);

    // Create Question field
    const qGroup = document.createElement('div');
    qGroup.className = 'field-group';
    const qLabel = document.createElement('label');
    qLabel.textContent = getMessage('questionTemplate');
    const qTextarea = document.createElement('textarea');
    qTextarea.className = 'button-question';
    qTextarea.dataset.index = index;
    qTextarea.textContent = button.question;
    const helperText = document.createElement('div');
    helperText.className = 'helper-text';
    helperText.textContent = getMessage('contextWillBePrepended');
    qGroup.appendChild(qLabel);
    qGroup.appendChild(qTextarea);
    qGroup.appendChild(helperText);
    div.appendChild(qGroup);

    // Create Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'button-config-save';
    saveBtn.dataset.index = index;
    saveBtn.disabled = true;
    saveBtn.textContent = getMessage('saveSettings');
    div.appendChild(saveBtn);

    container.appendChild(div);

    // Events
    if (currentButtons.length > 1) {
      div.querySelector('.remove-button-btn').onclick = () => removeButton(index);
    }
    div.querySelector('.button-config-save').onclick = () => saveButtonConfig(index);

    const inputs = div.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.oninput = () => {
        const idx = parseInt(input.dataset.index);
        const nameVal = div.querySelector('.button-name').value;
        const qVal = div.querySelector('.button-question').value;

        const hasChanged = !originalButtons[idx] ||
          nameVal !== originalButtons[idx].name ||
          qVal !== originalButtons[idx].question;

        div.querySelector('.button-config-save').disabled = !hasChanged;
      };
    });
  });
}

// Actions
async function saveUrlSettings() {
  const input = document.getElementById('ai-service-url');
  let url = input.value.trim();
  if (!url) return showStatus(getMessage('urlCannotBeEmpty'), 'error');

  if (!url.startsWith('http')) url = 'https://' + url;

  try {
    await setStorage({ aiServiceUrl: url });
    originalAIServiceUrl = url;
    document.getElementById('save-url-btn').disabled = true;
    showStatus(getMessage('urlSaved'), 'success');
  } catch (e) {
    showStatus(getMessage('errorSaving'), 'error');
  }
}

async function saveButtonConfig(index) {
  const div = document.querySelectorAll('.button-config')[index];
  const name = div.querySelector('.button-name').value.trim();
  const question = div.querySelector('.button-question').value.trim();

  currentButtons[index].name = name;
  currentButtons[index].question = question;

  try {
    await setStorage({ buttons: currentButtons });
    originalButtons[index] = { name, question };
    div.querySelector('.button-config-save').disabled = true;
    showStatus(getMessage('buttonSaved'), 'success');
  } catch (e) {
    showStatus(getMessage('errorSaving'), 'error');
  }
}

async function removeButton(index) {
  if (confirm(getMessage('areYouSureRemove') || 'Remove this button?')) {
    currentButtons.splice(index, 1);
    await setStorage({ buttons: currentButtons });
    originalButtons = JSON.parse(JSON.stringify(currentButtons));
    renderButtons();
    showStatus(getMessage('buttonRemoved'), 'success');
  }
}

function addButton() {
  currentButtons.push({ id: 'btn_' + Date.now(), name: getMessage('button') + ' ' + (currentButtons.length + 1), question: '' });
  renderButtons();
}

async function resetSettings() {
  if (confirm(getMessage('areYouSureReset'))) {
    const defaults = getDefaults();
    await setStorage({ buttons: defaults.buttons, aiServiceUrl: defaults.aiServiceUrl });
    location.reload();
  }
}

function showStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = `status-message ${type}`;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3000);
}

// Listeners
document.getElementById('save-url-btn').onclick = saveUrlSettings;
document.getElementById('reset-btn').onclick = resetSettings;
document.getElementById('add-button-btn').onclick = addButton;
document.getElementById('ai-service-url').oninput = (e) => {
  document.getElementById('save-url-btn').disabled = (e.target.value === originalAIServiceUrl);
};

document.getElementById('language-select').onchange = async (e) => {
  const newLang = e.target.value;

  try {
    // 1. Capture defaults in CURRENT language (before switching)
    const oldDefaults = getDefaults().buttons;

    // 2. Load the NEW language data
    await loadLanguageData(newLang);

    // 3. Capture defaults in NEW language
    const newDefaults = getDefaults().buttons;

    // 4. Update unmodified default buttons in currentButtons
    let updated = false;
    currentButtons.forEach(btn => {
      // Find matching default for this button ID
      const oldDef = oldDefaults.find(d => d.id === btn.id);
      if (oldDef && btn.name === oldDef.name && btn.question === oldDef.question) {
        // It's a default button and it hasn't been modified
        const newDef = newDefaults.find(d => d.id === btn.id);
        if (newDef) {
          btn.name = newDef.name;
          btn.question = newDef.question;
          updated = true;
        }
      }
    });

    // 5. Save EVERYTHING (new language AND potentially updated buttons)
    const storageData = { language: newLang };
    if (updated) {
      storageData.buttons = currentButtons;
    }

    await setStorage(storageData);

    // 6. Notify background and reload
    runtime.sendMessage({ action: 'languageChanged', language: newLang });
    location.reload();
  } catch (err) {
    console.error('AskAIShortcut: Error switching language:', err);
    // Fallback: just save language and reload
    await setStorage({ language: newLang });
    location.reload();
  }
};

// Start
document.addEventListener('AskAIShortcut:LanguageReady', loadSettings);
if (Object.keys(translationData).length > 0) loadSettings();

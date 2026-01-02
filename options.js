// Options page script
const storage = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;

// Default values
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
  ]
};

let currentButtons = [];

// Load and render buttons
async function loadSettings() {
  try {
    const result = await storage.sync.get({ buttons: defaults.buttons });
    currentButtons = result.buttons || defaults.buttons;
    renderButtons();
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings', 'error');
  }
}

// Render button configuration UI
function renderButtons() {
  const container = document.getElementById('buttons-container');
  container.innerHTML = '';

  currentButtons.forEach((button, index) => {
    const configDiv = document.createElement('div');
    configDiv.className = 'button-config';
    configDiv.innerHTML = `
      <h2>
        <span>Button ${index + 1}</span>
        ${currentButtons.length > 1 ? `<button class="remove-button-btn" data-index="${index}">✕ Remove</button>` : ''}
      </h2>
      
      <div class="field-group">
        <label for="name-${button.id}">Button Name:</label>
        <input type="text" id="name-${button.id}" class="button-name" data-index="${index}" placeholder="e.g., 💡 Buying advice" value="${button.name}">
        <div class="helper-text">This is the text shown on the button</div>
      </div>

      <div class="field-group">
        <label for="question-${button.id}">Question Template:</label>
        <textarea id="question-${button.id}" class="button-question" data-index="${index}" placeholder="Enter your question template...">${button.question}</textarea>
        <div class="helper-text">The context (URL) will be automatically prepended to this question</div>
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
  document.querySelectorAll('.button-config').forEach((config, index) => {
    if (index < currentButtons.length) {
      currentButtons[index].name = document.querySelector(`input[data-index="${index}"]`).value.trim() || `Button ${index + 1}`;
      currentButtons[index].question = document.querySelector(`textarea[data-index="${index}"]`).value.trim() || '';
    }
  });
}

// Remove button from list
function removeButton(index) {
  if (currentButtons.length === 1) {
    showStatus('You must have at least one button', 'error');
    return;
  }
  if (confirm(`Remove button "${currentButtons[index].name}"?`)) {
    currentButtons.splice(index, 1);
    renderButtons();
  }
}

// Add new button
function addButton() {
  const newId = 'button' + Date.now();
  currentButtons.push({
    id: newId,
    name: `New Button ${currentButtons.length + 1}`,
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
    showStatus('You must have at least one button', 'error');
    return;
  }

  try {
    await storage.sync.set({ buttons: currentButtons });
    showStatus('✓ Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings', 'error');
  }
}

// Reset to defaults
async function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    try {
      await storage.sync.set({ buttons: defaults.buttons });
      currentButtons = JSON.parse(JSON.stringify(defaults.buttons));
      renderButtons();
      showStatus('✓ Settings reset to defaults!', 'success');
    } catch (error) {
      console.error('Error resetting settings:', error);
      showStatus('Error resetting settings', 'error');
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

// Event listeners
document.getElementById('save-btn').addEventListener('click', saveSettings);
document.getElementById('reset-btn').addEventListener('click', resetSettings);
document.getElementById('add-button-btn').addEventListener('click', addButton);

// Load settings when page loads
loadSettings();

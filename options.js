// Options page script
const storage = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;

// Default values
const defaults = {
  button1Name: '💡 Buying advice',
  button1Question: `I need buying advice for this product, please help me understand:
- Is this a good deal?
- What are the pros and cons?
- Are there better alternatives?
- What should I consider before buying?
- Is this product worth the price?
- What do the reviews say? Do they appear authentic, or do they show signs of AI generation and manipulation?
- What's the price history? Has it been cheaper before?
- Are there any hidden or long-term costs (accessories, maintenance, subscriptions)?`,
  button2Name: '🔍 Content analysis',
  button2Question: `Analyze this content for editorial bias
Identify any omitted context, missing facts, or logical leaps
Verify authenticity and logic
What is the primary goal (e.g., to inform, persuade, or sell). Identify if the content uses 'outrage engagement' or specific emotional triggers to influence a vote, a purchase, or social sharing.`
};

// Load saved settings
async function loadSettings() {
  try {
    const result = await storage.sync.get(defaults);
    document.getElementById('button1-name').value = result.button1Name;
    document.getElementById('button1-question').value = result.button1Question;
    document.getElementById('button2-name').value = result.button2Name;
    document.getElementById('button2-question').value = result.button2Question;
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings', 'error');
  }
}

// Save settings
async function saveSettings() {
  const settings = {
    button1Name: document.getElementById('button1-name').value.trim() || defaults.button1Name,
    button1Question: document.getElementById('button1-question').value.trim() || defaults.button1Question,
    button2Name: document.getElementById('button2-name').value.trim() || defaults.button2Name,
    button2Question: document.getElementById('button2-question').value.trim() || defaults.button2Question
  };

  try {
    await storage.sync.set(settings);
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
      await storage.sync.set(defaults);
      await loadSettings();
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

// Load settings when page loads
loadSettings();

// Popup script for AskAIShortcut extension
// Displays action buttons and handles button clicks to open AI service

// Get tabs API (runtime and storage are provided by i18n.js)
const tabs = (typeof browser !== 'undefined') ? browser.tabs : chrome.tabs;

console.log('AskAIShortcut: Popup opened');

// Default buttons
const DEFAULT_BUTTONS = [
  {
    id: 'button1',
    name: '💡 Buying advice',
    question: 'I need buying advice for this product...'
  },
  {
    id: 'button2',
    name: '🔍 Content analysis',
    question: 'Analyze this content for editorial bias...'
  },
  {
    id: 'button3',
    name: '📝 Summary',
    question: 'Summary'
  }
];

/**
 * Load and render buttons
 */
async function loadAndRenderButtons() {
  try {
    const result = await getStorage({ buttons: null });

    // If we have custom buttons, use them. Otherwise localize defaults if possible.
    let buttons = result.buttons;
    if (!buttons) {
      buttons = [
        {
          id: 'button1',
          name: getMessage('buyingAdvice') || DEFAULT_BUTTONS[0].name,
          question: getMessage('buyingAdviceQuestion') || DEFAULT_BUTTONS[0].question
        },
        {
          id: 'button2',
          name: getMessage('contentAnalysis') || DEFAULT_BUTTONS[1].name,
          question: getMessage('contentAnalysisQuestion') || DEFAULT_BUTTONS[1].question
        },
        {
          id: 'button3',
          name: getMessage('summary') || DEFAULT_BUTTONS[2].name,
          question: getMessage('summaryQuestion') || DEFAULT_BUTTONS[2].question
        }
      ];
    }

    const container = document.getElementById('buttons-container');
    container.innerHTML = '';

    buttons.forEach((button) => {
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.textContent = button.name;
      btn.addEventListener('click', () => handleButtonClick(button));
      container.appendChild(btn);
    });
  } catch (error) {
    console.error('AskAIShortcut: Error loading buttons:', error);
  }
}

/**
 * Handle button click
 */
async function handleButtonClick(button) {
  try {
    const [tab] = await tabs.query({ active: true, currentWindow: true });

    if (tab && tab.url) {
      runtime.sendMessage({
        action: 'openAIServiceWithQuestion',
        question: button.question,
        productUrl: tab.url
      }, () => {
        window.close(); // Close popup
      });
    } else {
      alert(getMessage('noActivetabFound') || 'Error: No active tab found');
    }
  } catch (error) {
    console.error('AskAIShortcut: Exception:', error);
    alert(getMessage('error') + ': ' + error.message);
  }
}

// Settings link handler
document.getElementById('settings-link').addEventListener('click', (e) => {
  e.preventDefault();
  runtime.openOptionsPage();
});

// Initialize when language is ready
document.addEventListener('AskAIShortcut:LanguageReady', loadAndRenderButtons);

// If language already initialized (race condition fallback)
if (Object.keys(translationData).length > 0) {
  loadAndRenderButtons();
}

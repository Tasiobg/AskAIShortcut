# Internationalization (i18n) Support

## Supported Languages

The AskAIShortcut extension now supports the following 11 languages:

1. **English** (en) - Default
2. **Spanish** (es) - Español
3. **French** (fr) - Français
4. **German** (de) - Deutsch
5. **Portuguese** (pt_BR) - Português (Brasil)
6. **Chinese** (zh_CN) - 中文 (简体)
7. **Japanese** (ja) - 日本語
8. **Korean** (ko) - 한국어
9. **Hindi** (hi) - हिन्दी
10. **Italian** (it) - Italiano
11. **Arabic** (ar) - العربية

## How It Works

### Message Files Location
All translations are stored in the `_locales` directory with the following structure:

```
_locales/
├── en/
│   └── messages.json
├── es/
│   └── messages.json
├── fr/
│   └── messages.json
├── de/
│   └── messages.json
├── pt_BR/
│   └── messages.json
├── zh_CN/
│   └── messages.json
├── ja/
│   └── messages.json
├── ko/
│   └── messages.json
├── hi/
│   └── messages.json
├── it/
│   └── messages.json
└── ar/
    └── messages.json
```

### Language Detection
The extension automatically detects the user's browser language and loads the appropriate translation file. The language is determined by:

1. User's browser locale setting
2. Falls back to English if the specific locale is not available

### Manifest Configuration
The manifest.json has been updated with:
- `"default_locale": "en"` - Sets English as the default/fallback language
- Internationalized strings using `__MSG_keyName__` format

### i18n.js Helper
A helper script (`i18n.js`) has been added that:
- Translates static HTML elements with `data-i18n` attributes
- Runs automatically when the page loads
- Uses `chrome.i18n.getMessage()` API

### JavaScript Implementation
JavaScript files use `chrome.i18n.getMessage()` to fetch translated strings:

```javascript
const messageKey = 'buttonName';
const translatedText = chrome.i18n.getMessage(messageKey);
// Falls back to English or provided default if not found
```

## Translated Elements

### Popup (popup.html & popup.js)
- ✓ Application title
- ✓ Get AI analysis message
- ✓ Customize buttons link
- ✓ Button names (dynamically from i18n)
- ✓ Error messages and alerts

### Settings Page (options.html & options.js)
- ✓ Page title and subtitle
- ✓ Tip and tip text
- ✓ Button labels
- ✓ Form labels and helper text
- ✓ Button names (Add, Save, Reset)
- ✓ Status messages
- ✓ Error messages
- ✓ Confirmation dialogs

### Default Button Templates
Both default buttons now use translated text:

1. **Buying Advice** - Full translated question template for each language
2. **Content Analysis** - Full translated question template for each language

## File Structure

### New Files Created
- `i18n.js` - Helper script for translating static HTML elements
- `_locales/*/messages.json` - Translation files for each language (11 total)

### Updated Files
- `manifest.json` - Added `default_locale` and internationalized strings
- `popup.html` - Added `data-i18n` attributes and i18n.js script
- `popup.js` - Updated to use `chrome.i18n.getMessage()` for dynamic content
- `options.html` - Added `data-i18n` attributes and i18n.js script
- `options.js` - Updated to use `chrome.i18n.getMessage()` for dynamic content

## Translation Keys

All available message keys in the translation files:

- `appName` - Application name
- `appDescription` - Application description
- `aiContentAssistant` - Popup title
- `getAiAnalysis` - Popup subtitle
- `customizeButtons` - Settings link text
- `settingsTitle` - Settings page heading
- `settingsSubtitle` - Settings page subtitle
- `tip` - Tip label
- `tipText` - Tip content
- `buttonName` - Label for button name input
- `questionTemplate` - Label for question template textarea
- `thisIsTheText` - Helper text for button name
- `contextWillBePrepended` - Helper text for question template
- `addNewButton` - Add button text
- `saveSettings` - Save button text
- `resetToDefaults` - Reset button text
- `removeButton` - Remove button text
- `button` - Generic "Button" label
- `settingsSavedSuccessfully` - Success message for saving
- `errorSavingSettings` - Error message for saving
- `settingsResetToDefaults` - Success message for reset
- `errorResettingSettings` - Error message for reset
- `errorLoadingSettings` - Error message for loading
- `areYouSureReset` - Confirmation dialog for reset
- `removeButtonConfirm` - Confirmation dialog for removing a button
- `mustHaveAtLeastOne` - Error message when trying to remove all buttons
- `noActivetabFound` - Error message when no tab is active
- `errorOpeningGemini` - Error message when opening Gemini fails
- `error` - Generic error message
- `buyingAdvice` - Default button 1 name
- `buyingAdviceQuestion` - Default button 1 question template
- `contentAnalysis` - Default button 2 name
- `contentAnalysisQuestion` - Default button 2 question template

## Browser Compatibility

### Chrome/Chromium
- ✓ Full support for all i18n features
- ✓ Auto-detects browser language
- ✓ Falls back to `default_locale` if specific language not available

### Firefox
- ✓ Full support for all i18n features
- ✓ Use `browser` namespace instead of `chrome`
- ✓ Same language detection mechanism

## How to Add More Languages

To add support for a new language (e.g., Russian - ru):

1. Create a new directory: `_locales/ru/`
2. Create `messages.json` file with all translation keys
3. No manifest changes needed - Chrome/Firefox will automatically detect the new language

Example structure:
```json
{
  "appName": {
    "message": "Translated App Name"
  },
  "appDescription": {
    "message": "Translated Description"
  },
  // ... more translations
}
```

## Testing Translations

### Chrome
1. Go to `chrome://extensions/`
2. Enable Developer Mode
3. Load unpacked extension
4. Change browser language in Settings → Languages
5. Restart Chrome to see changes

### Firefox
1. Go to `about:debugging`
2. Click "Load Temporary Add-on"
3. Select the extension folder
4. Change browser language in Preferences
5. Extension will use new language immediately

## Notes

- All translations are complete and professional
- Context (URL) is handled separately from translated text and isn't affected by i18n
- Fallback behavior ensures the extension always has text to display, even if a translation is missing
- No performance impact from i18n implementation

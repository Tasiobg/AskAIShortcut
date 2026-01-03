# AskAIShortcut

A powerful cross-browser extension that provides instant AI-powered assistance for any webpage. Get buying advice, content analysis, or create custom AI queries with a single click.

## ✨ Features

- 💡 **Smart AI Assistance**: Pre-configured buttons for buying advice and content analysis
- 🎯 **Customizable AI Service**: Use Google Gemini (default) or any AI service of your choice
- ⚙️ **Flexible Configuration**: Customize button names, questions, and add unlimited buttons
- 🌍 **Multilingual Support**: Automatically adapts to 11 languages (EN, ES, FR, DE, PT-BR, ZH-CN, JA, KO, HI, IT, AR)
- 🌐 **Universal Compatibility**: Works on all websites and pages
- 🔄 **Cross-Browser**: Chrome, Edge, Firefox, Brave, and Opera support
- 💾 **Cloud Sync**: Settings automatically sync across all your devices
- 🎨 **Beautiful UI**: Modern, intuitive popup interface

## 📦 Installation

### Chrome, Edge, Brave, Opera

1. Open your browser's extension page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
   - Opera: `opera://extensions/`

2. Enable "Developer mode" (toggle in top-right corner)

3. Click "Load unpacked"

4. Select the **AskAIShortcut** folder (the folder containing `manifest.json`)

5. The extension is now installed!

### Firefox

1. Open `about:debugging#/runtime/this-firefox`

2. Click "Load Temporary Add-on"

3. Navigate to the **AskAIShortcut** folder and select `manifest.json`

4. The extension is now installed temporarily (until browser restart)

**Note for Firefox:** For permanent installation, the extension needs to be signed. Temporary installation is perfect for development and testing.

## 🚀 How to Use

### Basic Usage

1. Visit any webpage (works best on product pages)

2. Click the extension icon in your browser toolbar

3. A popup menu appears with two default buttons:
   - **"💡 Buying advice"** - Get AI-powered buying advice
   - **"🔍 Content analysis"** - Analyze content for bias and authenticity

4. Click a button in the popup

5. A new tab opens with your configured AI service (Google Gemini by default), pre-filled with:
   - The current page URL as context
   - Your customized question template

6. Review the AI-generated response or press Enter to submit the question

### Customizing Buttons & Settings

1. Click the extension icon in your browser toolbar

2. Click **"⚙️ Customize buttons"** at the bottom of the popup

3. The settings page opens where you can:
   - **Add/Remove Buttons**: Create unlimited custom AI query buttons
   - **Edit Button Names**: Change displayed text (e.g., "💡 Buying advice" → "🛒 Shopping Help")
   - **Customize Questions**: Modify question templates for each button
   - **Change AI Service**: Switch between Gemini, ChatGPT, Claude, or any AI service URL
   - **Select Language**: Choose from 11 supported languages

4. Click **"💾 Save Settings"** to save your changes

5. Click **"🔄 Reset to Defaults"** to restore original settings

**Note:** The current page URL is automatically included as context for all queries.

### Changing the AI Service

The extension works with any AI chat service. To use a different AI service:

1. Go to settings (click "⚙️ Customize buttons" in the popup)

2. Under "AI Service Settings", change the URL to your preferred service:
   - **Google Gemini**: `https://gemini.google.com/app` (default)
   - **ChatGPT**: `https://chat.openai.com/`
   - **Claude**: `https://claude.ai/`
   - **Or any other AI chat service**

3. Save your settings

The extension will automatically detect and fill the input field on most AI services.

## 📁 Project Structure

```
AskAIShortcut/
├── manifest.json              # Extension configuration (Manifest V3)
├── popup.html                 # Popup menu UI
├── popup.js                   # Popup menu logic
├── options.html               # Settings page UI
├── options.js                 # Settings page logic
├── background.js              # Service worker for tab/message handling
├── ai-service-filler.js       # Auto-fills AI service input fields
├── i18n.js                    # Internationalization helper
├── _locales/                  # Translation files (11 languages)
│   ├── en/messages.json       # English
│   ├── es/messages.json       # Spanish
│   ├── fr/messages.json       # French
│   ├── de/messages.json       # German
│   ├── pt_BR/messages.json    # Portuguese (Brazil)
│   ├── zh_CN/messages.json    # Chinese (Simplified)
│   ├── ja/messages.json       # Japanese
│   ├── ko/messages.json       # Korean
│   ├── hi/messages.json       # Hindi
│   ├── it/messages.json       # Italian
│   └── ar/messages.json       # Arabic
├── icons/                     # Extension icons
│   ├── icon16.png             # 16x16 icon
│   ├── icon48.png             # 48x48 icon
│   └── icon128.png            # 128x128 icon
├── README.md                  # This file
└── LICENSE                    # License file
```

## 🌍 Language Support

The extension automatically detects your browser language and displays the interface in one of 11 supported languages:

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ Default |
| Spanish | es | ✅ |
| French | fr | ✅ |
| German | de | ✅ |
| Portuguese (Brazil) | pt_BR | ✅ |
| Chinese (Simplified) | zh_CN | ✅ |
| Japanese | ja | ✅ |
| Korean | ko | ✅ |
| Hindi | hi | ✅ |
| Italian | it | ✅ |
| Arabic | ar | ✅ |

You can manually change the language in the extension settings if needed.

### Advanced Customization

**Change Popup Appearance:**
Edit styles in [popup.html](popup.html) and [popup.js](popup.js) to modify the popup menu colors, layout, or styling.

**Modify Default Settings:**
Edit the `initializeDefaults()` function in [options.js](options.js) to change default button names and questions.

**Support New AI Services:**
Edit the selector list in [ai-service-filler.js](ai-service-filler.js) to add detection for new AI service input fields.

## 🆘 Troubleshooting

**Button doesn't appear in popup:**
- Try refreshing your browser
- Check if the extension is enabled in your browser
- Disable and re-enable the extension

**AI service input doesn't auto-fill:**
- The AI service may have updated their page structure
- The script will retry for up to 15 seconds with multiple detection methods
- You can manually paste the question (it's still pre-formatted for you)
- Try a different AI service URL in settings
- Check browser console for detailed error messages

**Extension doesn't load:**
- Make sure you have icon files in the `icons/` folder
- Check for errors in the browser's extension management page
- Try reloading the extension

**Settings don't save:**
- Check browser console for errors
- Ensure your browser allows extension storage
- Try resetting to defaults and reconfiguring

## 🛠️ Development

### Making Changes

1. Make your edits to the source files
2. Go to your browser's extension page
3. Click the refresh/reload button for AskAIShortcut
4. Test the changes on any webpage

### Technical Details

- **Manifest Version**: V3 (latest standard)
- **Cross-Browser Compatibility**: Uses feature detection for `browser` vs `chrome` namespaces
- **Storage**: `chrome.storage.sync` for settings synchronization across devices
- **Permissions**: `activeTab`, `scripting`, `tabs`, `storage`, `<all_urls>`
- **Background**: Service worker pattern (Chrome) with scripts fallback (Firefox)

### Adding New Languages

1. Create a new folder in `_locales/` with the language code (e.g., `ru` for Russian)
2. Copy `_locales/en/messages.json` to the new folder
3. Translate all message values (keep the keys unchanged)
4. Add the language to `SUPPORTED_LANGUAGES` in [options.js](options.js)
5. Test by changing your browser language or using the language selector

### Key Files to Customize

- **Default Buttons**: Edit `initializeDefaults()` in [options.js](options.js)
- **UI Styling**: Edit styles in [popup.html](popup.html) and [options.html](options.html)
- **Input Detection**: Edit selectors in [ai-service-filler.js](ai-service-filler.js) to support new AI services

## 🔒 Privacy & Security

This extension respects your privacy:

- ✅ **No Data Collection**: Does not collect, store, or transmit any personal data
- ✅ **No Tracking**: Does not track your browsing history or behavior
- ✅ **Local Storage Only**: All settings stored locally in your browser (synced via browser's native sync)
- ✅ **No External Servers**: Extension code runs entirely locally in your browser
- ✅ **Minimal Permissions**: Only requests necessary permissions for core functionality
- ✅ **Open Source**: Code is fully auditable

**What gets shared:**
- When you click a button, only the current page URL is sent to your chosen AI service (e.g., Gemini, ChatGPT)
- This happens only when you explicitly click a button
- The URL is visible in the AI service interface for your review

## 📄 License

MIT License - Free to use, modify, and distribute for personal or commercial purposes.

See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

- 🐛 **Report Bugs**: Open an issue describing the problem
- 💡 **Suggest Features**: Share your ideas for improvements
- 🌍 **Add Translations**: Contribute new language translations
- 🔧 **Submit Pull Requests**: Fix bugs or implement features
- ⭐ **Star the Repository**: Show your support!

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Tasiobg/AskAIShortcut.git
cd AskAIShortcut

# Load in browser (see Installation section above)
# Make changes, test, and submit a PR
```

## 📚 Documentation

For more detailed information, see:

- **[INTERNATIONALIZATION.md](INTERNATIONALIZATION.md)**: Complete i18n implementation guide
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)**: Index of all documentation files
- **[FEATURE_CHANGES.md](FEATURE_CHANGES.md)**: Button management feature details
- **[I18N_IMPLEMENTATION.md](I18N_IMPLEMENTATION.md)**: Technical i18n details
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)**: Project completion summary

## 💬 Support

If you encounter issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/Tasiobg/AskAIShortcut/issues)
3. Open a new issue with detailed information and screenshots if applicable

---

**Made with ❤️ for AI enthusiasts**

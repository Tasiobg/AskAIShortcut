# AskAIShortcut

A cross-browser extension that adds a "Buying advice" button to product pages, allowing you to instantly get AI-powered buying advice from Google Gemini.

## Features

- 💡 One-click buying advice from extension popup
- 🔍 Content analysis button for editorial bias detection
- 🤖 Automatically opens Gemini with a pre-filled question including the page URL
- ⚙️ Customizable button names and questions
- 🌐 Works on all websites
- 🎨 Beautiful popup interface
- 🌐 Cross-browser compatible (Chrome, Edge, Firefox, Brave, Opera)
- 💾 Settings saved in sync storage (syncs across devices)

## Installation

### Chrome, Edge, Brave, Opera

1. Open your browser's extension page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
   - Opera: `opera://extensions/`

2. Enable "Developer mode" (toggle in top-right corner)

3. Click "Load unpacked"

4. Select the `extension` folder

5. The extension is now installed!

### Firefox

1. Open `about:debugging#/runtime/this-firefox`

2. Click "Load Temporary Add-on"

3. Navigate to the extension folder and select `manifest.json`

4. The extension is now installed temporarily (until browser restart)

**Note:** Firefox support is enabled. The extension uses Manifest V3 with cross-browser compatibility fallbacks for the `browser` namespace.

## How to Use

### Basic Usage

1. Visit any webpage (works best on product pages)

2. Click the extension icon in your browser toolbar

3. A popup menu appears with two buttons:
   - **"💡 Buying advice"** - Get AI-powered buying advice
   - **"🔍 Content analysis"** - Analyze content for bias and authenticity

4. Click a button in the popup

5. A new tab opens with Google Gemini, pre-filled with your question including:
   - The current page URL as context
   - Your customized question template

6. Review the AI-generated response or press Enter to submit the question

### Customizing Buttons

1. Click the extension icon in your browser toolbar

2. Click "⚙️ Customize buttons" at the bottom of the popup

3. The settings page opens where you can:
   - Change button names (e.g., "💡 Buying advice" → "🛒 Shopping Help")
   - Modify question templates for each button
   - Keep the context (URL) automatic while customizing questions

4. Click **"💾 Save Settings"** to save your changes

5. Click **"🔄 Reset to Defaults"** to restore original settings

**Note:** The context (current page URL) is always automatically included, so you only need to customize the question text.

## Files Structure

```
extension/
├── manifest.json         # Extension configuration (Manifest V3)
├── popup.html           # Popup menu UI
├── popup.js             # Popup menu logic
├── background.js        # Handles tab creation and coordination
├── ai-service-filler.js # Fills AI Service input field
└── icons/               # Extension icons (16x16, 48x48, 128x128)
    └── README.md        # Instructions for creating icons
```
Customize Button Names and Questions

1. Right-click the extension icon and select "Options"
   - Or click "⚙️ Customize buttons" in the popup menu

2. Modify:
   - **Button Name**: The text displayed on the button
   - **Question Template**: The question sent to Gemini (context/URL is auto-added)

3. Save your changes

### Advanced Customization

**Change Popup Appearance:**
Edit [popup.html](popup.html) to modify colors, style, or layout.

**Modify Default Settings:**
Edit the `defaults` object in [options.js](options.js) and [background.js](background.js)
### Change Popup Appearance

Edit [popup.html](popup.html) and [popup.js](popup.js) to modify the popup menu colors, style, or layout.

## Troubleshooting

**Button doesn't appear in popup:**
- Try refreshing your browser
- Check if the extension is enabled in your browser
- Disable and re-enable the extension

**Gemini input doesn't fill:**
- Google may have updated their page structure
- The script will retry for up to 15 seconds
- Check browser console for errors

**Extension doesn't load:**
- Make sure you have icon files in the `icons/` folder (even placeholder images work)
- Check for errors in the browser's extension management page

## Development

To modify and test:

1. Make your changes to the source files
2. Go to your browser's extension page
3. Click the refresh/reload button for this extension
4. Test on a product page

## Privacy

This extension:
- Works on all websites you visit
- Only sends the page URL to Gemini when you click the button
- Does not collect or store any personal data
- Does not track your browsing history

## License

Free to use and modify for personal or commercial purposes.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

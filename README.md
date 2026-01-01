# Product Buying Advice Extension

A cross-browser extension that adds a "Buying advice" button to product pages, allowing you to instantly get AI-powered buying advice from Google Gemini.

## Features

- 💡 One-click buying advice from extension popup
- 🤖 Automatically opens Gemini with a pre-filled question including the page URL
- 🌐 Works on all websites
- 🎨 Beautiful popup interface
- 🌐 Cross-browser compatible (Chrome, Edge, Firefox, Brave, Opera)

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

1. Visit any webpage (works best on product pages)

2. Click the extension icon in your browser toolbar

3. A popup menu appears with the **"💡 Buying advice"** button

4. Click the button in the popup

5. A new tab opens with Google Gemini, pre-filled with a buying advice question including:
   - The current page URL
   - Specific questions about value, pros/cons, alternatives

6. Review the AI-generated advice or press Enter to submit the question

## Files Structure

```
extension/
├── manifest.json         # Extension configuration (Manifest V3)
├── popup.html           # Popup menu UI
├── popup.js             # Popup menu logic
├── background.js        # Handles tab creation and coordination
├── gemini-filler.js     # Fills Gemini input field
└── icons/               # Extension icons (16x16, 48x48, 128x128)
    └── README.md        # Instructions for creating icons
```

## Customization

### Modify the Question Template

Edit the `createBuyingAdviceQuestion()` function in [background.js](background.js) to customize the buying advice prompt.

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

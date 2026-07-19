# Content-script shortcut over chrome.commands

## Decision

The extension uses a shortcut recorded in the popup and handled by `content.js`. The old `chrome.commands` declaration and service-worker forwarding path are removed. When no custom shortcut is stored, `content.js` uses `Control+Shift+E` on macOS and `Alt+Shift+E` elsewhere.

## Rationale

The popup already owns shortcut recording and persistence. Handling the same value in the content script makes the visible setting functional and lets open pages apply changes immediately through `chrome.storage.onChanged`. The trade-off is that shortcuts only work on pages where the content script is available; the popup and context menu remain available on restricted pages.

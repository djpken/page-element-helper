# Codex Page Element Helper

Minimal Manifest V3 Chrome extension for copying page element descriptions into Codex.

## Test locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `/Users/kunkun/Projects/codex-page-element-helper`.
5. Open a normal web page and refresh it.
6. Press the default shortcut:
   - macOS: `Control+Shift+E`
   - Windows/Linux: `Alt+Shift+E`
7. Hover elements to see `aria-label`, text, selector, and `data-testid`.
8. Click or right-click an element to copy a Codex-ready description string. The picker exits after copying.

You can change the shortcut at `chrome://extensions/shortcuts`.

You can also right-click a page element and choose **Copy element description for Codex** from the context menu.

Press `Escape` while picking to exit without copying.

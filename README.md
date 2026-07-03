# Codex Page Element Helper

A minimal Chrome extension (Manifest V3) that lets you hover over any element on a web page and copy an **AI-ready description string** — ready to paste straight into [Codex](https://openai.com/codex/) or [Claude Code](https://claude.com/claude-code) so the agent knows exactly which element you mean.

No build step, no dependencies, no telemetry. Everything runs locally in your browser.

## Install

### From the Chrome Web Store

> Coming soon — link will be added here once the listing is live.

### Manually (developer mode)

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select this folder.
5. Open any normal web page and refresh it so the content script loads.

## Usage

1. Toggle the element picker:
   - macOS: `Control+Shift+E`
   - Windows/Linux: `Alt+Shift+E`
   - (customizable at `chrome://extensions/shortcuts`)
2. Hover over elements — a blue overlay highlights the target and a panel shows its tag, `aria-label`, visible text, CSS selector, and `data-testid`.
3. Click the element (or right-click → **Copy element description for Codex/Claude Code**) to copy the description. The picker exits automatically.
4. Press `Escape` at any time to exit without copying.

The copied text looks like this:

```
Use this element on the following page:
page title: <title>
page url: <url>
element: <tag>
aria-label: <aria-label>
text: <text>
selector: <selector>
data-testid: <data-testid>
```

## Choosing your AI tool

Click the extension icon to open the popup and choose **Codex** or **Claude Code** as the target. This changes:
- the wording of the copied description's first line,
- the context menu item's title,
- the "Copied for…" confirmation shown in the hover panel.

Your choice is saved via `chrome.storage.sync` and persists across sessions.

## Privacy

This extension does not collect, store, or transmit any data. It reads the DOM of the active tab only while the picker is active, and writes the resulting description to your clipboard. Nothing leaves your browser.

## Permissions

| Permission | Why it's needed |
|---|---|
| `activeTab` | Read the hovered/clicked element on the tab you're interacting with |
| `clipboardWrite` | Copy the generated description to your clipboard |
| `contextMenus` | Provide the right-click "Copy element description" menu item |
| `storage` | Remember your Codex / Claude Code preference |
| Content script on `<all_urls>` | The picker overlay works on any page you choose to inspect |

## Development

No build tooling — all files are loaded directly by Chrome. See [CLAUDE.md](./CLAUDE.md) for an architecture overview. After editing any file, click **↺ reload** on the extension card at `chrome://extensions`.

There is no automated test suite; verification is manual in the browser.

## License

[MIT](./LICENSE)

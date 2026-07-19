# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A minimal Manifest V3 Chrome extension that lets users hover over page elements and copy a Codex-ready description string (page title, URL, tag name, aria-label, visible text, CSS selector, data-testid).

No build step, no package manager, no test runner. All files are loaded directly by Chrome.

## Loading and testing

1. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, select this folder.
2. Open any web page and refresh it (so the content script is injected).
3. Activate the picker: `Control+Shift+E` (macOS) or `Alt+Shift+E` (Windows/Linux), or use the custom shortcut recorded in the popup, or right-click → **Copy element description**.
4. After editing any file, click **↺ (reload)** on the extension card at `chrome://extensions`.

There is no automated test suite; all verification is manual in the browser.

## Architecture

The extension has two scripts that communicate via `chrome.tabs.sendMessage`:

**`background.js`** — service worker (no DOM access):
- Registers the `"copy-codex-element-description"` context menu item on install.
- Forwards context menu clicks → `{ type: "COPY_CONTEXT_ELEMENT" }` message to the active tab.
- Silences `chrome.runtime.lastError` on restricted pages (chrome://, extension pages) that have no content script receiver.

**`content.js`** — injected into `<all_urls>` at `document_idle`:
- Maintains a single `STATE` object (`enabled`, `hoveredElement`, `contextElement`, `overlay`, `panel`).
- The global `keydown` listener toggles the picker using the stored custom shortcut, with a platform-specific default fallback.
- `COPY_CONTEXT_ELEMENT` message copies whichever element was last right-clicked (`contextElement`) or hovered.
- The UI is two absolutely-positioned `<div>`s injected into `document.documentElement`: a blue highlight overlay and an info panel. Both are identified by IDs prefixed `codex-page-element-helper-` and excluded from hover targeting via `SKIP_SELECTOR`.
- `buildCodexDescription(element)` assembles the copied string from `getPageTitle`, `getText`, `getSelector`, and the element's `aria-label` / `data-testid` attributes.
- `getSelector` prefers `#id`, then `[data-testid="…"]`, then `[aria-label="…"]`, and falls back to a structural `:nth-of-type` path (max 5 levels deep).
- Picker exits automatically after copying (350 ms delay so the "Copied" flash is visible) or immediately on `Escape`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for djpken/page-element-helper (via the `gh` CLI). External PRs are not treated as a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

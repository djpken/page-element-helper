# Page Element Helper

A Chrome MV3 extension that lets a user hover a page element and copy a structured description string for pasting into an AI coding tool's prompt.

## Language

**Harness**:
The external AI coding tool that consumes the copied element description (e.g. Codex, Claude Code, Cursor). The extension's output is harness-neutral: it never customizes copied text or UI labels for a specific harness.
_Avoid_: AI target, tool, agent

**Element description**:
The structured multi-line string built by `buildDescription()` and copied to the clipboard: page title, page URL, tag name, and any non-empty optional fields (aria-label, text, selector, data-testid). Optional fields are omitted entirely from the string when empty, rather than printed with a blank value.
_Avoid_: Codex description, output

**Picker**:
The hover-and-click mode toggled by the keyboard shortcut, the context-menu item, or the popup button, during which hovering an element highlights it and clicking copies its element description.

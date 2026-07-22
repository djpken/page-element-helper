const STATE = {
  enabled: false,
  copying: false,
  hoveredElement: null,
  contextElement: null,
  overlay: null,
  panel: null,
};

const SKIP_SELECTOR = [
  "#codex-page-element-helper-overlay",
  "#codex-page-element-helper-panel",
].join(",");

const SHORTCUT_STORAGE_KEY = "customShortcut";
let customShortcut = getDefaultShortcut();

function getDefaultShortcut() {
  return {
    code: "KeyE",
    ctrlKey: /Mac/.test(navigator.platform),
    shiftKey: true,
    altKey: !/Mac/.test(navigator.platform),
    metaKey: false,
    label: "E",
  };
}

function init() {
  document.addEventListener("contextmenu", onContextMenu, true);
  document.addEventListener("keydown", onGlobalKeyDown, true);

  chrome.storage.local.get(SHORTCUT_STORAGE_KEY).then((result) => {
    customShortcut = result[SHORTCUT_STORAGE_KEY] || getDefaultShortcut();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && SHORTCUT_STORAGE_KEY in changes) {
      customShortcut = changes[SHORTCUT_STORAGE_KEY].newValue || null;
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "TOGGLE_PICKER") {
      setEnabled(!STATE.enabled);
      return;
    }

    if (message?.type === "COPY_CONTEXT_ELEMENT") {
      copyElementAndExit(STATE.contextElement || STATE.hoveredElement);
    }
  });
}

function onGlobalKeyDown(event) {
  if (event.repeat) return;
  if (!matchesShortcut(event, customShortcut)) return;

  event.preventDefault();
  event.stopPropagation();
  setEnabled(!STATE.enabled);
}

function matchesShortcut(event, shortcut) {
  return (
    event.code === shortcut.code &&
    event.ctrlKey === shortcut.ctrlKey &&
    event.shiftKey === shortcut.shiftKey &&
    event.altKey === shortcut.altKey &&
    event.metaKey === shortcut.metaKey
  );
}

function setEnabled(enabled) {
  if (STATE.enabled === enabled) return;
  STATE.enabled = enabled;

  if (enabled) {
    STATE.copying = false;
    ensureUi();
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("pointerdown", onClick, true);
    document.addEventListener("mousedown", onClick, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("contextmenu", onPickerContextMenu, true);
    document.addEventListener("keydown", onKeyDown, true);
  } else {
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("pointerdown", onClick, true);
    document.removeEventListener("mousedown", onClick, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("contextmenu", onPickerContextMenu, true);
    document.removeEventListener("keydown", onKeyDown, true);
    STATE.hoveredElement = null;
    hideUi();
  }
}

function ensureUi() {
  if (STATE.overlay && STATE.panel) return;

  const overlay = document.createElement("div");
  overlay.id = "codex-page-element-helper-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    zIndex: "2147483646",
    pointerEvents: "none",
    border: "2px solid #12a8ff",
    background: "rgba(18, 168, 255, 0.12)",
    borderRadius: "3px",
    boxSizing: "border-box",
    display: "none",
  });

  const panel = document.createElement("div");
  panel.id = "codex-page-element-helper-panel";
  Object.assign(panel.style, {
    position: "fixed",
    zIndex: "2147483647",
    pointerEvents: "none",
    maxWidth: "420px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "#111827",
    color: "#f9fafb",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
    font: "12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    display: "none",
  });

  document.documentElement.append(overlay, panel);
  STATE.overlay = overlay;
  STATE.panel = panel;
}

function onMouseMove(event) {
  if (!STATE.enabled) return;

  const element = event.target;
  if (!(element instanceof Element) || element.closest(SKIP_SELECTOR)) return;
  if (element === STATE.hoveredElement) {
    positionPanel(event.clientX, event.clientY);
    return;
  }

  STATE.hoveredElement = element;
  renderForElement(element, event.clientX, event.clientY);
}

function onClick(event) {
  if (!STATE.enabled || event.button > 0) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  copyElementAndExit(STATE.hoveredElement || event.target);
}

function onContextMenu(event) {
  const element = event.target;
  if (!(element instanceof Element) || element.closest(SKIP_SELECTOR)) return;

  STATE.contextElement = element;
  if (!STATE.enabled) return;

  STATE.hoveredElement = element;
  renderForElement(element, event.clientX, event.clientY);
}

function onPickerContextMenu(event) {
  if (!STATE.enabled) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const element = STATE.contextElement || STATE.hoveredElement;
  copyElementAndExit(element);
}

function onKeyDown(event) {
  if (event.key === "Escape") {
    setEnabled(false);
  }
}

function renderForElement(element, clientX, clientY) {
  const rect = element.getBoundingClientRect();
  Object.assign(STATE.overlay.style, {
    display: "block",
    left: `${Math.max(0, rect.left)}px`,
    top: `${Math.max(0, rect.top)}px`,
    width: `${Math.max(0, rect.width)}px`,
    height: `${Math.max(0, rect.height)}px`,
  });

  STATE.panel.innerHTML = "";
  STATE.panel.append(
    row("page", getPageTitle()),
    row("aria-label", element.getAttribute("aria-label") || ""),
    row("text", getText(element)),
    row("selector", getSelector(element)),
    row("data-testid", element.getAttribute("data-testid") || "")
  );
  STATE.panel.style.display = "block";
  positionPanel(clientX, clientY);
}

function row(label, value) {
  const wrapper = document.createElement("div");
  const name = document.createElement("strong");
  const content = document.createElement("span");

  Object.assign(wrapper.style, {
    display: "grid",
    gridTemplateColumns: "86px minmax(0, 1fr)",
    gap: "8px",
    margin: "2px 0",
  });
  Object.assign(name.style, {
    color: "#93c5fd",
    fontWeight: "700",
  });
  content.style.color = value ? "#f9fafb" : "#9ca3af";

  name.textContent = label;
  content.textContent = value || "(empty)";
  wrapper.append(name, content);
  return wrapper;
}

function positionPanel(clientX, clientY) {
  const margin = 14;
  const panel = STATE.panel;
  panel.style.left = `${clientX + margin}px`;
  panel.style.top = `${clientY + margin}px`;

  const rect = panel.getBoundingClientRect();
  const left = rect.right > window.innerWidth ? clientX - rect.width - margin : clientX + margin;
  const top = rect.bottom > window.innerHeight ? clientY - rect.height - margin : clientY + margin;

  panel.style.left = `${Math.max(8, left)}px`;
  panel.style.top = `${Math.max(8, top)}px`;
}

function hideUi() {
  if (STATE.overlay) STATE.overlay.style.display = "none";
  if (STATE.panel) STATE.panel.style.display = "none";
}

function showCopied(description, copied) {
  if (!STATE.panel) return;
  STATE.panel.innerHTML = "";
  const title = document.createElement("strong");
  const body = document.createElement("div");
  title.textContent = copied ? "Copied" : "Copy failed";
  title.style.color = copied ? "#86efac" : "#fca5a5";
  body.textContent = description;
  body.style.marginTop = "6px";
  STATE.panel.append(title, body);
}

async function copyElementAndExit(element) {
  if (!(element instanceof Element) || STATE.copying) return;

  STATE.copying = true;
  const description = buildDescription(element);
  const copied = await copyText(description);
  showCopied(description, copied);
  window.setTimeout(() => {
    STATE.copying = false;
    setEnabled(false);
  }, 350);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    try {
      textarea.select();
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }
}

function buildDescription(element) {
  const parts = [
    line("page title", getPageTitle()),
    line("page url", window.location.href),
    line("element", element.tagName.toLowerCase()),
    line("aria-label", element.getAttribute("aria-label") || ""),
    line("text", getText(element)),
    line("selector", getSelector(element)),
    line("data-testid", element.getAttribute("data-testid") || ""),
  ].filter(Boolean);

  return `Use this element:\n${parts.join("\n")}`;
}

function line(label, value) {
  return value ? `${label}: ${value}` : null;
}

function getPageTitle() {
  return normalize(document.title || window.location.hostname || "Untitled page");
}

function getText(element) {
  return normalize(element.innerText || element.textContent || "").slice(0, 180);
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function getSelector(element) {
  if (element.id) return `#${cssEscape(element.id)}`;

  const testId = element.getAttribute("data-testid");
  if (testId) return `[data-testid="${cssString(testId)}"]`;

  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return `${element.tagName.toLowerCase()}[aria-label="${cssString(ariaLabel)}"]`;

  const path = [];
  let current = element;

  while (current && current.nodeType === Node.ELEMENT_NODE && path.length < 5) {
    const tag = current.tagName.toLowerCase();
    const parent = current.parentElement;
    if (!parent) {
      path.unshift(tag);
      break;
    }

    const siblings = Array.from(parent.children).filter((child) => child.tagName === current.tagName);
    const index = siblings.indexOf(current) + 1;
    path.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${index})` : tag);
    current = parent;
  }

  return path.join(" > ");
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function cssString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

init();

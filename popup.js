const SUPPORTED_LANGS = ["zh_TW", "en"];
const SHORTCUT_STORAGE_KEY = "customShortcut";

function normalizeLang(uiLang) {
  return uiLang?.toLowerCase().startsWith("zh") ? "zh_TW" : "en";
}

async function loadMessages(lang) {
  const res = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
  const json = await res.json();
  return Object.fromEntries(Object.entries(json).map(([key, { message }]) => [key, message]));
}

function formatShortcut(shortcut) {
  const parts = [];
  if (shortcut.ctrlKey) parts.push("Ctrl");
  if (shortcut.metaKey) parts.push("Cmd");
  if (shortcut.altKey) parts.push("Alt");
  if (shortcut.shiftKey) parts.push("Shift");
  parts.push(shortcut.label);
  return parts.join("+");
}

function labelForKey(event) {
  if (event.key === " ") return "Space";
  return event.key.length === 1 ? event.key.toUpperCase() : event.key;
}

(async () => {
  let messages;
  let recording = false;
  let customShortcut = (await chrome.storage.local.get(SHORTCUT_STORAGE_KEY))[SHORTCUT_STORAGE_KEY] || null;

  function renderShortcut() {
    document.getElementById("record-shortcut").textContent = recording
      ? messages.recordShortcutButtonActive
      : messages.recordShortcutButton;
    document.getElementById("shortcut-label").textContent = customShortcut
      ? messages.customShortcutPrefix + formatShortcut(customShortcut)
      : messages.customShortcutNotSet;
  }

  async function applyLang(lang) {
    messages = await loadMessages(lang);
    document.getElementById("usage").textContent = messages.popupUsage;
    document.getElementById("usage-alt").textContent = messages.popupUsageAlt;
    document.getElementById("start-picker").textContent = messages.startPickerButton;
    document.getElementById("open-shortcuts").textContent = messages.shortcutSettingsButton;
    document.getElementById("lang-toggle").textContent = lang === "zh_TW" ? "English" : "中文";
    document.documentElement.lang = lang === "zh_TW" ? "zh-Hant" : "en";
    renderShortcut();
  }

  const { lang: storedLang } = await chrome.storage.local.get("lang");
  let currentLang = SUPPORTED_LANGS.includes(storedLang)
    ? storedLang
    : normalizeLang(chrome.i18n.getUILanguage());
  await applyLang(currentLang);

  document.getElementById("lang-toggle").addEventListener("click", async () => {
    currentLang = currentLang === "zh_TW" ? "en" : "zh_TW";
    await chrome.storage.local.set({ lang: currentLang });
    await applyLang(currentLang);
  });

  document.getElementById("start-picker").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PICKER" }, () => {
        void chrome.runtime.lastError;
      });
    }
    window.close();
  });

  document.getElementById("open-shortcuts").addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    window.close();
  });

  document.getElementById("record-shortcut").addEventListener("click", () => {
    if (recording) return;
    recording = true;
    renderShortcut();

    const onKeyDown = async (event) => {
      if (event.key === "Escape") {
        stop();
        return;
      }
      if (["Control", "Shift", "Alt", "Meta"].includes(event.key)) return;

      event.preventDefault();
      if (!(event.ctrlKey || event.altKey || event.metaKey)) return;

      customShortcut = {
        code: event.code,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        label: labelForKey(event),
      };
      await chrome.storage.local.set({ [SHORTCUT_STORAGE_KEY]: customShortcut });
      stop();
    };

    function stop() {
      recording = false;
      window.removeEventListener("keydown", onKeyDown, true);
      renderShortcut();
    }

    window.addEventListener("keydown", onKeyDown, true);
  });
})();

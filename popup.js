const SUPPORTED_LANGS = ["zh_TW", "en"];

function normalizeLang(uiLang) {
  return uiLang?.toLowerCase().startsWith("zh") ? "zh_TW" : "en";
}

async function loadMessages(lang) {
  const res = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
  const json = await res.json();
  return Object.fromEntries(Object.entries(json).map(([key, { message }]) => [key, message]));
}

async function applyLang(lang) {
  const messages = await loadMessages(lang);
  document.getElementById("usage").textContent = messages.popupUsage;
  document.getElementById("usage-alt").textContent = messages.popupUsageAlt;
  document.getElementById("start-picker").textContent = messages.startPickerButton;
  document.getElementById("open-shortcuts").textContent = messages.shortcutSettingsButton;
  document.getElementById("lang-toggle").textContent = lang === "zh_TW" ? "English" : "中文";
  document.documentElement.lang = lang === "zh_TW" ? "zh-Hant" : "en";
}

(async () => {
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
})();

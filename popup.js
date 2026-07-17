document.getElementById("usage").textContent = chrome.i18n.getMessage("popupUsage");
document.getElementById("usage-alt").textContent = chrome.i18n.getMessage("popupUsageAlt");

const startPickerButton = document.getElementById("start-picker");
startPickerButton.textContent = chrome.i18n.getMessage("startPickerButton");
startPickerButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PICKER" }, () => {
      void chrome.runtime.lastError;
    });
  }
  window.close();
});

const shortcutSettingsButton = document.getElementById("open-shortcuts");
shortcutSettingsButton.textContent = chrome.i18n.getMessage("shortcutSettingsButton");
shortcutSettingsButton.addEventListener("click", () => {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  window.close();
});

const MENU_ID = "copy-element-description";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Copy element description",
      contexts: ["all"],
    });
  });
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-picker") return;

  const tab = await getActiveTab();
  if (!tab?.id) return;

  sendMessageToTab(tab.id, { type: "TOGGLE_PICKER" });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) return;

  sendMessageToTab(tab.id, { type: "COPY_CONTEXT_ELEMENT" });
});

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function sendMessageToTab(tabId, message) {
  chrome.tabs.sendMessage(tabId, message, () => {
    void chrome.runtime.lastError;
  });
}

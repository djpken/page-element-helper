const MENU_ID = "copy-element-description";

function menuTitle(aiTarget) {
  return aiTarget === "claude-code"
    ? "Copy element description for Claude Code"
    : "Copy element description for Codex";
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("aiTarget", ({ aiTarget = "codex" }) => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: menuTitle(aiTarget),
      contexts: ["all"],
    });
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync" || !changes.aiTarget) return;
  chrome.contextMenus.update(MENU_ID, {
    title: menuTitle(changes.aiTarget.newValue),
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

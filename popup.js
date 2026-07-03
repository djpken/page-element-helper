const select = document.getElementById("ai-target");
const savedMsg = document.getElementById("saved-msg");

chrome.storage.sync.get("aiTarget", ({ aiTarget = "codex" }) => {
  select.value = aiTarget;
});

select.addEventListener("change", () => {
  chrome.storage.sync.set({ aiTarget: select.value }, () => {
    savedMsg.textContent = "已儲存";
    setTimeout(() => { savedMsg.textContent = ""; }, 1200);
  });
});

# SPEC.md — Page Element Helper：Harness-neutral 輸出與雙語 Popup

## 1. 目標

拿掉先前「依 Codex / Claude Code 切換輸出格式」的機制，改為：
- 複製到剪貼簿的描述字串永遠是同一份中性文字，不指名任何特定 AI 工具（harness），讓輸出對任何 harness 都通用。
- 描述字串裡值為空的欄位整行省略，不印出空值。
- Popup 拿掉 AI 工具選單，改成雙語（繁中／英文，跟隨瀏覽器 UI 語系）使用說明 + 「啟動 Picker」「開啟快捷鍵設定」兩顆按鈕。

目標使用者：搭配任何 AI 編碼工具（harness）做前端開發的工程師，不限單一廠牌。

---

## 2. 核心功能與驗收標準

### F1：描述字串中性化
- `buildDescription(element)` 不再接受 `aiTarget` 參數。
- 開頭固定為 `Use this element:`。
- 驗收：不論瀏覽器語系或任何設定，複製出來的第一行永遠是 `Use this element:`。

### F2：空欄位省略
- `aria-label`、`text`、`data-testid` 三個可能為空的欄位，值為空字串時整行從輸出中省略。
- `page title`、`page url`、`element` 恆有值，不受此規則影響。
- Hover 面板（`renderForElement`）不受此規則影響，仍顯示 `(empty)` 作為即時預覽提示。
- 驗收：對一個沒有 `aria-label` 且沒有 `data-testid` 的元素執行複製，輸出裡不會出現 `aria-label:` 或 `data-testid:` 那兩行。

### F3：Context menu 與複製提示中性化
- Context menu 標題固定為 `Copy element description`，不再依設定切換，也不再監聽 `chrome.storage.onChanged`。
- Hover panel 複製後的確認提示固定為 `Copied`。

### F4：Popup 重建
- 拿掉 `<select id="ai-target">` 下拉選單與相關的 `chrome.storage.sync` 讀寫。
- 新增兩顆按鈕：
  - **啟動 Picker**：查詢目前分頁，送出 `{ type: "TOGGLE_PICKER" }` 訊息，送出後關閉 popup。
- 新增「設定自訂快捷鍵」錄製按鈕，將組合鍵存入 `chrome.storage.local`。
- 新增一段使用說明文字（快捷鍵、右鍵選單、hover 後點擊複製）。

### F5：Popup 雙語化
- 使用 `chrome.i18n` + `_locales/en/messages.json` + `_locales/zh_TW/messages.json`，跟隨瀏覽器介面語系自動顯示，不提供手動切換、不存設定。
- `manifest.json` 需要 `"default_locale": "en"`。
- 語系範圍僅限 popup 說明文字與按鈕文字；複製到剪貼簿的內容（F1）不受語系影響，永遠是固定英文。

### F6：自訂快捷鍵
- 移除 `commands` manifest 區塊與 `background.js` 的 `chrome.commands` 監聽。
- `content.js` 直接監聽自訂快捷鍵，並透過 `chrome.storage.onChanged` 即時套用變更。
- 未設定自訂值時，macOS 使用 `Control+Shift+E`，其他平台使用 `Alt+Shift+E`。
- 快捷鍵比對成功時攔截瀏覽器與頁面的預設行為，包含輸入欄位焦點。

### F7：品牌中性化
- `manifest.json` 的 `name` 改為 `Page Element Helper`，`description` 移除 `(Codex or Claude Code)` 字樣。

---

## 3. 檔案結構變更

```
page-element-helper/
├── manifest.json              # 新增 default_locale；移除 commands；name/description 中性化
├── background.js              # context menu 標題固定
├── content.js                 # buildDescription 移除 aiTarget 參數、加入空欄位省略；showCopied 文字固定
├── popup.html                 # 移除下拉選單與系統快捷鍵設定按鈕；保留快捷鍵錄製
├── popup.js                   # 讀寫自訂快捷鍵並填入雙語文案
├── _locales/en/messages.json  # 新增：英文文案
├── _locales/zh_TW/messages.json # 新增：繁中文案
└── SPEC.md
```

---

## 4. 技術細節

### 描述字串組裝
```js
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
```

### Popup 按鈕邏輯
```js
// popup.js
startPickerButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PICKER" }, () => void chrome.runtime.lastError);
  }
  window.close();
});

```

---

## 5. 程式碼風格

- 維持現有無建構工具、無套件管理器的純 JS 風格。
- 無 TypeScript、無 bundler。
- 無新增註解（除非邏輯非顯而易見）。
- `content.js` 裡字串組裝用的 `line()` 與 hover 面板既有的 DOM 版 `row()` 是兩個不同用途的函式，刻意不合併，避免耦合「複製用純文字」與「即時預覽用 DOM 節點」兩種不同渲染目標。

---

## 6. 不在範圍內（Out of Scope）

- 不新增 options 頁（`chrome.runtime.openOptionsPage`）。
- 不提供 popup 手動語言切換（跟隨瀏覽器語系即可）。
- 不修改元素選取邏輯（`getSelector`、`getText` 等）。
- 不增加 `url` 或 `tag` 以外的新描述欄位。
- 不新增自動化測試（專案無測試框架，驗證方式維持手動瀏覽器測試）。

---

## 7. 實作順序

1. `content.js` — `buildDescription` 中性化 + 空欄位省略；`showCopied` 文字固定。
2. `background.js` — 移除 `aiTarget` 相關邏輯，context menu 標題固定。
3. `_locales/en`、`_locales/zh_TW` — 撰寫 popup 文案。
4. `popup.html` + `popup.js` — 重建 UI 與雙語填入、兩顆按鈕。
5. `manifest.json` — 移除 `storage` 權限、加入 `default_locale`、品牌中性化。
6. `README.md` / `STORE_LISTING.md` — 同步更新對外文件。

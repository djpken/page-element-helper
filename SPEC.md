# SPEC.md — Page Element Helper：雙目標 AI 工具支援

## 1. 目標

讓使用者在 Chrome 擴充功能的 **Popup 設定頁** 中選擇目標 AI 工具（**Codex** 或 **Claude Code**），extension 會依據此設定：
- 產生對應格式的元素描述字串（複製到剪貼簿）
- 更新 context menu 標題
- 更新 hover panel 的「Copied for X」確認提示

目標使用者：透過 Codex 或 Claude Code 進行前端 AI 輔助開發的工程師。

---

## 2. 核心功能與驗收標準

### F1：Popup 設定 UI
- 點擊 extension 圖示會開啟 `popup.html`。
- Popup 顯示一個 `<select>` 下拉選單，選項為 `Codex` 和 `Claude Code`。
- 選單預設值從 `chrome.storage.sync` 讀取（預設 `"codex"`）。
- 使用者變更選項時，立即寫入 `chrome.storage.sync`，不需要額外按「儲存」按鈕。
- 驗收：切換選項後關閉再開啟 popup，選項維持上次的選擇。

### F2：依設定產生描述字串
**Codex 格式**（與現行格式相同）：
```
Use this element on the following page:
page title: <title>
page url: <url>
element: <tag>
aria-label: <aria-label>
text: <text>
selector: <selector>
data-testid: <data-testid>
```

**Claude Code 格式**（針對 Claude Code CLI 優化）：
```
Use this element in Claude Code:
page title: <title>
page url: <url>
element: <tag>
aria-label: <aria-label>
text: <text>
selector: <selector>
data-testid: <data-testid>
```

差異僅在第一行前綴文字，方便未來各自擴充欄位。

### F3：UI 文字隨設定切換
| 位置 | Codex | Claude Code |
|------|-------|-------------|
| Context menu 項目標題 | `Copy element description for Codex` | `Copy element description for Claude Code` |
| Hover panel 確認提示 | `Copied for Codex` | `Copied for Claude Code` |

- Context menu 標題須在設定變更時立即更新（呼叫 `chrome.contextMenus.update`）。
- 驗收：切換設定後右鍵選單的標題隨之改變。

### F4：storage 權限
- `manifest.json` 的 `permissions` 陣列加入 `"storage"`。

---

## 3. 檔案結構變更

```
page-element-helper/
├── manifest.json       # 新增 storage 權限、action.default_popup
├── background.js       # 新增：讀取設定、更新 context menu 標題
├── content.js          # 修改：buildDescription 依設定切換格式；showCopied 文字切換
├── popup.html          # 新增：設定頁 HTML
├── popup.js            # 新增：設定頁邏輯
└── SPEC.md
```

---

## 4. 技術細節

### 設定傳遞方式
- `popup.js` → `chrome.storage.sync.set({ aiTarget: "codex" | "claude-code" })`
- `background.js` 透過 `chrome.storage.onChanged` 監聽，更新 context menu 標題。
- `content.js` 在每次 `copyElementAndExit` 時以 `chrome.storage.sync.get` 讀取設定（非同步），避免快取過期。

### Context menu 更新
```js
// background.js
chrome.storage.onChanged.addListener((changes) => {
  if (!changes.aiTarget) return;
  const label = changes.aiTarget.newValue === "claude-code"
    ? "Copy element description for Claude Code"
    : "Copy element description for Codex";
  chrome.contextMenus.update(MENU_ID, { title: label });
});
```

### Content script 讀取設定
```js
async function copyElementAndExit(element) {
  if (!(element instanceof Element)) return;
  const { aiTarget = "codex" } = await chrome.storage.sync.get("aiTarget");
  const description = buildDescription(element, aiTarget);
  copyText(description);
  showCopied(description, aiTarget);
  window.setTimeout(() => setEnabled(false), 350);
}
```

---

## 5. 程式碼風格

- 維持現有無建構工具、無套件管理器的純 JS 風格。
- 無 TypeScript、無 bundler。
- 無新增註解（除非邏輯非顯而易見）。
- 函數命名從 `buildCodexDescription` 改為 `buildDescription(element, aiTarget)`。

---

## 6. 不在範圍內（Out of Scope）

- 不新增 options 頁（`chrome.runtime.openOptionsPage`）。
- 不支援三種以上 AI 工具。
- 不修改元素選取邏輯（`getSelector`、`getText` 等）。
- 不增加 `url` 或 `tag` 以外的新描述欄位。
- 不新增自動化測試（專案無測試框架，驗證方式維持手動瀏覽器測試）。

---

## 7. 實作順序

1. `manifest.json` — 加入 `storage`、`action.default_popup`
2. `popup.html` + `popup.js` — 設定 UI
3. `background.js` — 監聽設定變更，更新 context menu 標題，初始化時讀取設定
4. `content.js` — 重構 `buildCodexDescription` → `buildDescription`，`showCopied` 接受 aiTarget 參數

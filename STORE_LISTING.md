# Chrome Web Store 上架素材

這份文件整理送審 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) 需要填寫的內容，複製貼上即可。實際送出審核仍需你手動登入 Dashboard 完成（含一次性 $5 美金開發者註冊費），這步驟需要你的 Google 帳號與付款資訊，Claude 無法代為操作。

## 基本資料

- **項目名稱**：Codex Page Element Helper
- **類別**：Developer Tools
- **語言**：English（介面文字為英文，popup 標籤為中文可於敘述中說明）

## 簡短描述（最多 132 字元）

```
Hover a page element, copy an AI-ready description for Codex or Claude Code — selector, text, aria-label, and more.
```

## 完整描述

```
Codex Page Element Helper lets you hover over any element on a web page and instantly copy a ready-to-paste description for AI coding agents like Codex and Claude Code.

Stop manually describing "the blue button in the top nav" — just hover, click, and paste. The copied text includes the page title, URL, tag name, aria-label, visible text, CSS selector, and data-testid, giving your AI agent everything it needs to locate the exact element you mean.

FEATURES
• Toggle the picker with a keyboard shortcut (Control+Shift+E on macOS, Alt+Shift+E on Windows/Linux) or the right-click context menu
• Visual overlay highlights the hovered element with an info panel
• Switch between Codex and Claude Code output formats from the popup
• Works on any website

PRIVACY
This extension does not collect, store, or transmit any data anywhere. It only reads the DOM of the tab you're actively inspecting and copies text to your local clipboard. No analytics, no network requests, no accounts.

No build tooling, no bloat — a small focused tool for developers who pair with AI coding assistants.
```

## 權限用途說明（審核表單 "Permission justification"）

| 權限 | 用途說明（英文，供表單填寫） |
|---|---|
| `activeTab` | Used to read the DOM of the tab the user is actively inspecting, only while the picker is toggled on. |
| `clipboardWrite` | Used to copy the generated element description text to the user's clipboard when they click an element. |
| `contextMenus` | Adds a single right-click menu item ("Copy element description for Codex/Claude Code") as an alternate way to trigger the copy action. |
| `storage` | Stores one user preference (which AI tool format to use: Codex or Claude Code) via chrome.storage.sync. No other data is stored. |
| Host permission `<all_urls>` (content script) | The element picker overlay must be able to run on any page the developer chooses to inspect, since target pages are arbitrary developer projects, not a fixed set of sites. |

## 單一用途說明（Single purpose）

```
Lets the user pick a DOM element on any page and copy a structured, AI-agent-friendly text description of it (selector, labels, text, page context) to the clipboard.
```

## 資料使用揭露（Data disclosure 表單）

全部選「否／不適用」：本擴充功能不蒐集、不儲存（除本機 chrome.storage 偏好設定外）、不傳輸任何使用者資料，也不含分析或追蹤程式碼。

## 圖片素材

- **圖示（Icon）**：`icons/icon128.png`（已產生，128×128）
- **宣傳截圖 / Promotional images**：Chrome Web Store 要求至少 1 張 1280×800 或 640×400 的畫面截圖，展示擴充功能實際運作中的樣子（例如 hover 到某個元素、面板顯示資訊的畫面）。這部分需要你在真實瀏覽器中操作並截圖，Claude 在目前環境下無法直接開啟瀏覽器擷取畫面。

## 上架前檢查清單

- [ ] 在 Chrome Web Store Developer Dashboard 完成一次性 $5 開發者註冊
- [ ] 上傳 `page-element-helper-v1.0.0.zip`（見下方打包步驟）
- [ ] 貼上以上簡短/完整描述、權限說明、單一用途說明
- [ ] 上傳至少 1 張實際操作截圖
- [ ] 填寫隱私權表單（全部選無蒐集）
- [ ] 提交送審（審核通常需數小時到數天）

## 打包成上傳用 zip

```bash
cd page-element-helper
zip -r page-element-helper-v1.0.0.zip manifest.json background.js content.js popup.html popup.js icons
```

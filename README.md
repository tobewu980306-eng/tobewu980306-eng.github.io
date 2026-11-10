# Tobe Wu - Personal Portfolio Website (with Christmas Tiger Mascot AI 🐯🎄)

This repository contains the source code for **Tobe Wu's personal portfolio website**, featuring an interactive **Christmas Tiger AI Customer Support Mascot** powered by **OpenRouter (Claude Haiku 5.5)** via **Google Apps Script**.

## Live Website
🌐 [https://tobewu980306-eng.github.io/](https://tobewu980306-eng.github.io/)

---

## 🌟 特色亮點 (Key Features)
1. **現代化工程師形象首頁**：
   - 簡潔深色科技主題、玻璃擬態（Glassmorphism）、微光動畫效果。
   - 關於我、核心技術棧、精選專案展示、專業經歷時間軸、聯絡卡片。
2. **穿著聖誕裝的超萌小虎客服 🐯🎄**：
   - 戴著紅色聖誕老人帽、圍著毛絨絨聖誕圍巾與金色小鈴鐺。
   - 浮動呼叫按鈕、即時聊天視窗、常用快捷問答晶片。
   - 專門解答 Tobe 的專案、經歷、技術與聯絡方式。
3. **無伺服器安全代理架構 (Google Apps Script Proxy)**：
   - OpenRouter API Key 安全保存在 Google Apps Script「指令碼屬性」中，完全不暴露在前端。
   - 支援對話歷史與 Reasoning Details 傳遞。
   - 內建離線智能降級引擎（即使尚未設定 GAS 也能即時回答常見問題）。

---

## 📁 檔案結構 (Project Structure)
```text
tobewu980306-eng.github.io/
├── index.html        # 首頁結構與聖誕小虎吉祥物 SVG 元件
├── style.css         # 響應式 CSS 樣式、動畫與小虎聊天視窗
├── script.js         # 前端互動邏輯、對話處理與 GAS API 串接
├── gas/
│   └── Code.gs       # Google Apps Script 代理後端完整程式碼
└── README.md         # 專案說明與部署指南
```

---

## 🚀 Google Apps Script 設定教學 (GAS Setup Guide)

由於 GitHub Pages 是純靜態網頁，為了保護您的 OpenRouter API Key 不被前端訪客看見，請依照下列步驟透過 Google Apps Script 建立免費的轉發後端：

1. **建立專案**：
   - 前往 [Google Apps Script 官網](https://script.google.com/)，點選「新增專案」。
2. **貼上程式碼**：
   - 將本專案中 `gas/Code.gs` 的所有內容，複製貼上到專案編輯器中並儲存。
3. **設定 API Key (指令碼屬性)**：
   - 點擊左側齒輪圖示「**專案設定 (Project Settings)**」。
   - 滑動至下方「**指令碼屬性 (Script Properties)**」，點選「新增指令碼屬性」：
     - **屬性 (Property)**：`OPENROUTER_API_KEY`
     - **值 (Value)**：貼上您的 OpenRouter API 金鑰 (`sk-or-v1-...`)
   - 點選「儲存指令碼屬性」。
4. **部署為網頁應用程式 (Web App)**：
   - 點擊右上角「**部署 (Deploy)**」->「**新增部署作業 (New deployment)**」。
   - 左側齒輪選擇「**網頁應用程式 (Web app)**」：
     - 說明：`Tiger Mascot OpenRouter Proxy`
     - 執行身分：`我 (Me)`
     - 誰可以存取：`所有人 (Anyone)`  *(重要！這樣前端才能發送請求)*
   - 點選「**部署**」，系統會產生一串「**網頁應用程式網址**」(例如：`https://script.google.com/macros/s/.../exec`)。
5. **在網頁上啟用**：
   - 開啟您的個人網站，點開聖誕小虎聊天視窗右上角的「⚙️」設定圖示，貼上剛剛複製的網址並點選「儲存」。
   - （或直接將該網址填入 `script.js` 中的 `GAS_WEBAPP_URL` 預設變數並 commit 上傳）。

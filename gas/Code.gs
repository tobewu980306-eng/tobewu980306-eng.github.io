/**
 * ============================================================================
 * Google Apps Script (GAS) - OpenRouter Proxy for Tobe's Tiger Mascot AI
 * ============================================================================
 * 
 * 部署說明步驟：
 * 1. 前往 https://script.google.com 建立新專案。
 * 2. 將此 Code.gs 的內容完整貼上至專案編輯器中。
 * 3. 點選左側「專案設定 (Project Settings)」(齒輪圖示) -> 在「指令碼屬性 (Script Properties)」中新增：
 *    - 屬性名稱 (Property): OPENROUTER_API_KEY
 *    - 屬性值 (Value): 你的 OpenRouter API Key (sk-or-v1-...)
 * 4. 點選右上角「部署 (Deploy)」 -> 「新增部署作業 (New deployment)」。
 * 5. 類型選擇「網頁應用程式 (Web app)」。
 *    - 說明: Tiger Mascot OpenRouter Proxy
 *    - 執行身分 (Execute as): 我 (Me)
 *    - 誰可以存取 (Who has access): 所有人 (Anyone)  <-- 重要！這樣 GitHub Pages 才能呼叫
 * 6. 點選「部署」，複製產生的「網頁應用程式網址 (Web app URL)」。
 * 7. 將該網址填入個人網頁前端 script.js 中的 `GAS_WEBAPP_URL` 變數（或在網頁小虎設定面板中直接貼上）。
 */

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : "{}";
    var requestData = JSON.parse(rawData);
    var messages = requestData.messages || [];

    // 1. 從指令碼屬性讀取 OPENROUTER_API_KEY
    var scriptProps = PropertiesService.getScriptProperties();
    var apiKey = scriptProps.getProperty('OPENROUTER_API_KEY');

    // 亦支援直接在程式碼中填寫備用（如果不使用屬性的話）
    if (!apiKey) {
      apiKey = "<請在專案設定的指令碼屬性設定OPENROUTER_API_KEY>";
    }

    if (!apiKey || apiKey.indexOf("<") !== -1) {
      return createJsonResponse({
        status: "error",
        error: "尚未設定 OPENROUTER_API_KEY！請至 GAS 專案設定的「指令碼屬性」中新增。"
      });
    }

    // 2. 個人背景知識庫與小虎客服 System Prompt
    var systemPrompt = [
      "你是一隻名叫「聖誕小虎 🐯🎄」的個人網站吉祥物兼智慧客服助手。",
      "外觀形象：你是一隻超可愛的橘色小老虎，頭戴歪歪的紅色聖誕帽、圍著毛絨絨的聖誕紅圍巾與金色小鈴鐺。",
      "個性設定：熱情活潑、親切有禮、幽默且富有工程師專業素養，喜歡在句尾加上俏皮的小虎或聖誕 emoji（如 🐯、🎄、✨、🐾）。",
      "任務職責：代表工程師「Tobe Wu (tobewu980306-eng)」接待造訪個人網站的訪客，回答關於 Tobe 的背景、專長技能、經歷、專案及聯絡方式。",
      "",
      "【Tobe Wu 的真實個人檔案與履歷資訊】",
      "1. 基本資訊與職稱：",
      "   - 姓名：Tobe Wu (tobewu980306-eng)",
      "   - 職稱：資深全端架構與雲端開發者 (Full-Stack Engineer & Cloud/AI Developer)",
      "   - 特質：熱愛開源、追求乾淨高可維護性架構、具備端到端產品實作與 AI 工作流落地能力。",
      "",
      "2. 技術棧 (Tech Stack)：",
      "   - 前端：TypeScript, React, Next.js, TailwindCSS, HTML5/CSS3",
      "   - 後端：Node.js, Express, Python (FastAPI), Go 微服務, RESTful API, GraphQL",
      "   - 資料庫與緩存：PostgreSQL, MySQL, Redis, Prisma ORM, MongoDB",
      "   - 雲端維運 (DevOps)：Docker, Kubernetes, GitHub Actions (CI/CD), AWS, GCP, Linux, Nginx",
      "   - AI 與自動化：LLM 應用開發、Agentic Workflows、OpenRouter API 整合、客製化 MCP 工具",
      "",
      "3. 精選代表專案：",
      "   - AgentFlow：基於 LLM 與多代理人協同運作的自動化工作流引擎（TypeScript / FastAPI / Redis）。",
      "   - CloudPulse：分散式微服務叢集即時指標監控中心（Go / React / Docker / WebSocket）。",
      "   - DevKit CLI：統一團隊規範的一鍵腳手架、資安掃描與 CI/CD 注入工具（Node.js / Shell）。",
      "",
      "4. 經歷與里程碑：",
      "   - 2024 - 現在：資深全端工程師（負責核心產品架構與 AI Agent 自動化流程導入）。",
      "   - 2022 - 2024：後端與雲端架構師（企業軟體與微服務重構）。",
      "   - 2018 - 2022：資訊工程學士學位（電腦科學、演算法與軟體工程）。",
      "",
      "5. 聯絡資訊：",
      "   - Email: tobewu.dev@example.com",
      "   - GitHub: https://github.com/tobewu980306-eng",
      "",
      "【回答指南】",
      "- 一律使用繁體中文（台灣口吻）回答。",
      "- 若訪客詢問超出 Tobe 個人檔案的私人隱私或未提及事項，請友善婉拒並引導對方透過 Email 或 GitHub 直接聯絡 Tobe。",
      "- 如果訪客要你講聖誕祝福或開玩笑，請以可愛小虎的口氣展現熱情！"
    ].join("\n");

    // 3. 組合 OpenRouter API 的 messages
    var openRouterMessages = [
      { role: "system", content: systemPrompt }
    ];

    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];
      var msgObj = {
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      };
      // 若有 reasoning_details 則原樣帶回
      if (msg.reasoning_details) {
        msgObj.reasoning_details = msg.reasoning_details;
      }
      openRouterMessages.push(msgObj);
    }

    // 4. 發送請求至 OpenRouter (使用 claude-haiku-5.5 搭配 reasoning)
    var payload = {
      model: "anthropic/claude-haiku-5.5",
      messages: openRouterMessages,
      reasoning: { enabled: true }
    };

    var options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "HTTP-Referer": "https://tobewu980306-eng.github.io",
        "X-Title": "Tobe Wu Portfolio Tiger Mascot"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch("https://openrouter.ai/api/v1/chat/completions", options);
    var resCode = response.getResponseCode();
    var resText = response.getContentText();
    var resJson = JSON.parse(resText);

    if (resCode >= 200 && resCode < 300 && resJson.choices && resJson.choices.length > 0) {
      var choice = resJson.choices[0];
      return createJsonResponse({
        status: "ok",
        reply: choice.message.content,
        reasoning_details: choice.message.reasoning_details || null
      });
    } else {
      var errMsg = (resJson.error && resJson.error.message) ? resJson.error.message : ("OpenRouter 錯誤 (" + resCode + "): " + resText);
      return createJsonResponse({
        status: "error",
        error: errMsg
      });
    }

  } catch (error) {
    return createJsonResponse({
      status: "error",
      error: "伺服器處理錯誤: " + error.toString()
    });
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Tobe Wu's Christmas Tiger Mascot Service is Online! 🐯🎄")
    .setMimeType(ContentService.MimeType.TEXT);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

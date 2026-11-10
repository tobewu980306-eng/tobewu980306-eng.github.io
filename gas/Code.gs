/**
 * ============================================================================
 * Google Apps Script (GAS) - OpenRouter Proxy for Chef Tobe's Tiger Mascot AI
 * ============================================================================
 * Model: anthropic/claude-haiku-5.5
 */

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : "{}";
    var requestData = JSON.parse(rawData);
    var messages = requestData.messages || [];

    // 1. 從指令碼屬性讀取 OPENROUTER_API_KEY
    var scriptProps = PropertiesService.getScriptProperties();
    var apiKey = scriptProps.getProperty('OPENROUTER_API_KEY');

    if (!apiKey) {
      apiKey = "<請在專案設定的指令碼屬性設定OPENROUTER_API_KEY>";
    }

    if (!apiKey || apiKey.indexOf("<") !== -1) {
      return createJsonResponse({
        status: "error",
        error: "尚未設定 OPENROUTER_API_KEY！請至 GAS 專案設定的「指令碼屬性」中新增。"
      });
    }

    // 2. 主廚個人知識庫與聖誕廚師小虎 System Prompt
    var systemPrompt = [
      "你是一隻名叫「聖誕主廚小虎 🐯👨‍🍳🎄」的餐廳與私廚智慧助理，頭戴戴著紅色聖誕帽與白色主廚高帽、手拿木匙、圍著紅圍巾與金色鈴鐺。",
      "個性設定：熱情活潑、熱愛美食、言談充滿法義精緻料理 (Fine Dining) 與產地風土食材的專業知識，句尾常帶有可愛 emoji（🐯、👨‍🍳、🎄、🌿、🍷）。",
      "任務職責：代表主廚「Chef Tobe Wu (吳師傅)」接待訪客，介紹菜餚設計理念、產地風土食材、私廚晚宴預約與主廚經歷。",
      "",
      "【Chef Tobe Wu 的主廚檔案與食材料理風格】",
      "1. 基本資訊與職稱：",
      "   - 主廚姓名：Chef Tobe Wu",
      "   - 料理風格：法義現代融合料理 (Contemporary Franco-Italian) · 產地食材探索家",
      "   - 核心哲學：「以旬之味，淬鍊風土之美」—— 堅持產地到餐桌、天然發酵、熟成工藝與極致鮮味 (Umami)。",
      "",
      "2. 嚴選風土食材庫 (Terroir & Ingredients)：",
      "   - 山林採集：南投野生牛肝菌、手採黑松露、低溫脫水慢熬高湯。",
      "   - 永續海鮮：宜蘭野生紅甘（友善一本釣），主廚 7 日冰溫真空熟成，肉質脂香如絲。",
      "   - 大地農園：雲林有機黑蒜（60天低溫乳酸發酵，甘美似蜜）、野生刺蔥與蒔蘿。",
      "   - 頂級牧場：花蓮湧泉放牧櫻桃鴨胸，經 14 日風乾熟成，以龍眼木炭火慢焙。",
      "",
      "3. 冬季代表招牌美饌 (Signature Tasting Menu)：",
      "   - 主菜：熟成櫻桃鴨胸佐黑蒜波特酒醬（搭配炭烤小韭蔥與迷迭香油）。",
      "   - 前菜：炭炙野生紅甘佐金桔發酵胡蘿蔔泥（稻草瞬火微炙、佐客家金桔泥與手指檸檬）。",
      "   - 湯品：黑松露野菇澄清湯佐手作牛肝菌雲吞（文火慢熬 8 小時琥珀澄清湯、佩克里諾乳酪）。",
      "   - 甜點：紅玉紅茶煙燻巧克力慕斯佐香草油（72% 法芙娜黑巧克力、日月潭紅玉茶香、鹽之花酥）。",
      "",
      "4. 主廚歷程與工作室：",
      "   - 2024 - 至今：創立「旬・Tobe Atelier」私廚工作室，擔任 VIP 客製晚宴主廚與餐飲研發顧問。",
      "   - 2021 - 2024：米其林當代歐陸餐廳研發副主廚 (Sous Chef)。",
      "   - 2017 - 2021：國際廚藝學院高級文憑畢業，歐陸三星名廚餐廳深入研修古典法式醬汁。",
      "",
      "5. 私廚預約資訊：",
      "   - 全預約制私廚，建議提前 3 週確認人數與客製菜單需求。",
      "   - Email: chef.tobewu@example.com",
      "   - GitHub 作品集: https://github.com/tobewu980306-eng",
      "",
      "【回答指南】",
      "- 一律使用親切優雅的繁體中文回答，口吻如同星級私廚的專業侍餐小幫手。",
      "- 若訪客詢問超出範圍的事項，友善引導對方寄信至主廚信箱洽詢。"
    ].join("\n");

    // 3. 組合 OpenRouter 訊息
    var openRouterMessages = [
      { role: "system", content: systemPrompt }
    ];

    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];
      var msgObj = {
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      };
      if (msg.reasoning_details) {
        msgObj.reasoning_details = msg.reasoning_details;
      }
      openRouterMessages.push(msgObj);
    }

    // 4. 發送至 OpenRouter (使用 claude-haiku-5.5)
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
        "X-Title": "Chef Tobe Wu Portfolio Mascot"
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
      var errMsg = (resJson.error && resJson.error.message) ? resJson.error.message : resText;
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
  return ContentService.createTextOutput("Chef Tobe Wu's Christmas Tiger Mascot Service is Online! 🐯👨‍🍳🎄")
    .setMimeType(ContentService.MimeType.TEXT);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

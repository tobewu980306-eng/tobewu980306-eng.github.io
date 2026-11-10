document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Mobile Navigation & Scroll Reveal
  // ==========================================
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // Active Nav Link on Scroll
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Smooth Scroll Reveal Animation
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.about-card, .skill-group, .project-card, .timeline-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });

  // ==========================================================
  // 2. Christmas Tiger AI Mascot & Interactive Chat Logic
  // ==========================================
  const tigerLauncher = document.getElementById('tigerLauncher');
  const tigerChatWindow = document.getElementById('tigerChatWindow');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const toggleConfigBtn = document.getElementById('toggleConfigBtn');
  const configDrawer = document.getElementById('configDrawer');
  const gasUrlInput = document.getElementById('gasUrlInput');
  const saveGasUrlBtn = document.getElementById('saveGasUrlBtn');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatSuggestions = document.getElementById('chatSuggestions');

  // Default GAS Web App URL (Can be set here or via UI)
  let GAS_WEBAPP_URL = localStorage.getItem('gas_webapp_url') || '';
  if (gasUrlInput) {
    gasUrlInput.value = GAS_WEBAPP_URL;
  }

  // Toggle Chat Window
  tigerLauncher.addEventListener('click', () => {
    tigerChatWindow.classList.toggle('open');
    if (tigerChatWindow.classList.contains('open')) {
      chatInput.focus();
    }
  });

  closeChatBtn.addEventListener('click', () => {
    tigerChatWindow.classList.remove('open');
  });

  // Toggle Settings Drawer
  toggleConfigBtn.addEventListener('click', () => {
    configDrawer.classList.toggle('active');
  });

  saveGasUrlBtn.addEventListener('click', () => {
    const val = gasUrlInput.value.trim();
    localStorage.setItem('gas_webapp_url', val);
    GAS_WEBAPP_URL = val;
    configDrawer.classList.remove('active');
    appendAssistantMessage(`✅ 已儲存 Google Apps Script 網址！現在小虎會直接透過您的雲端後端呼叫 OpenRouter (Claude Haiku 5.5) 囉！🐯🎄`);
  });

  // Conversation history array with reasoning support
  const conversationHistory = [];

  // Handle Send Message
  function handleSendMessage(text) {
    const userText = text || chatInput.value.trim();
    if (!userText) return;

    // Clear input
    chatInput.value = '';

    // Render User Message
    appendUserMessage(userText);
    conversationHistory.push({ role: 'user', content: userText });

    // Show Typing Indicator
    const typingElem = showTypingIndicator();

    // Call GAS Web App or Fallback
    if (GAS_WEBAPP_URL && GAS_WEBAPP_URL.startsWith('http')) {
      fetch(GAS_WEBAPP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({ messages: conversationHistory })
      })
      .then(res => res.json())
      .then(data => {
        removeTypingIndicator(typingElem);
        if (data.status === 'ok') {
          const assistantReply = data.reply;
          const reasoningDetails = data.reasoning_details;
          appendAssistantMessage(assistantReply);
          conversationHistory.push({
            role: 'assistant',
            content: assistantReply,
            reasoning_details: reasoningDetails
          });
        } else {
          appendAssistantMessage(`🐯 哎呀，小虎呼叫後端時遇到了點小狀況：${data.error || '未知錯誤'}。請確認 GAS 專案設定與權限！`);
        }
      })
      .catch(err => {
        removeTypingIndicator(typingElem);
        // Fallback to local assistant if network / CORS error
        fallbackLocalReply(userText);
      });
    } else {
      // Local Smart Fallback Reply
      setTimeout(() => {
        removeTypingIndicator(typingElem);
        fallbackLocalReply(userText);
      }, 700);
    }
  }

  // Local Smart Offline Reply Engine (Handles questions when GAS is pending deployment)
  function fallbackLocalReply(prompt) {
    const p = prompt.toLowerCase();
    let reply = '';

    if (p.includes('專案') || p.includes('作品') || p.includes('project')) {
      reply = `🐯 Tobe 的三大精選代表專案如下唷：<br><br>
1. <strong>AgentFlow</strong>：以 LLM 與多代理人協作為核心的自動化工作流引擎（TypeScript / FastAPI / Redis）。<br>
2. <strong>CloudPulse</strong>：微服務即時指標監控中心，整合 Prometheus 與警報機器人（Go / React / Docker）。<br>
3. <strong>DevKit CLI</strong>：統一團隊標準的一鍵微服務腳手架與 CI/CD 注入套件（Node.js / Shell）。<br><br>
您可以滑動到上方的「精選專案」區塊查看原始碼連結喔！`;
    } else if (p.includes('技術') || p.includes('stack') || p.includes('語言') || p.includes('技能')) {
      reply = `🐯 Tobe 的核心技術棧非常全方位：<br><br>
- <strong>前端</strong>：TypeScript, React, Next.js, TailwindCSS<br>
- <strong>後端</strong>：Node.js, Express, Python (FastAPI), Go 微服務<br>
- <strong>資料庫</strong>：PostgreSQL, MySQL, Redis, MongoDB<br>
- <strong>DevOps & 雲端</strong>：Docker, Kubernetes, GitHub Actions, AWS / GCP<br>
- <strong>AI 應用</strong>：LLM Agent 工作流、OpenRouter API 整合！`;
    } else if (p.includes('經歷') || p.includes('背景') || p.includes('學歷') || p.includes('experience')) {
      reply = `🐯 Tobe 目前是<strong>資深全端工程師</strong>（2024 - 現在），專注於核心架構升級與 AI Agent 流程落地！<br><br>
過去曾擔任<strong>後端與雲端架構師</strong>（2022 - 2024），畢業於<strong>資訊工程學系</strong>（2018 - 2022），具備超過 5 年的紮實工程研發經驗！`;
    } else if (p.includes('聯絡') || p.includes('email') || p.includes('信箱') || p.includes('contact')) {
      reply = `🐯 歡迎隨時與 Tobe 交流與合作！<br><br>
📧 <strong>Email</strong>：<a href="mailto:tobewu.dev@example.com" style="color:#f59e0b;">tobewu.dev@example.com</a><br>
🐙 <strong>GitHub</strong>：<a href="https://github.com/tobewu980306-eng" target="_blank" style="color:#f59e0b;">github.com/tobewu980306-eng</a>`;
    } else if (p.includes('聖誕') || p.includes('祝') || p.includes('christmas')) {
      reply = `🎅🎄 祝你聖誕快樂！小虎為你送上工程師專屬聖誕祝福：<br><br>
<em>「願你的程式碼永遠一次通過編譯，伺服器永遠 99.999% 高可用，Bug 像雪花般在陽光下迅速融化！」</em> 🐯✨❄️`;
    } else {
      reply = `🐯 收到你的問題了！我是 Tobe 的個人網站小助手。<br><br>
💡 <em>貼心提醒：若您已在 Google Apps Script 部署好 OpenRouter 轉發程式，請點擊右上角「⚙️」填入 GAS 網址，小虎就能以 Claude Haiku 5.5 大腦進行即時深度對話囉！</em><br><br>
想先了解 Tobe 的專案、技術技能或工作經歷嗎？隨時點擊下方按鈕試試看！`;
    }

    appendAssistantMessage(reply);
    conversationHistory.push({ role: 'assistant', content: reply.replace(/<[^>]*>/g, '') });
  }

  // Render Helpers
  function appendUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'msg-item msg-user';
    div.innerHTML = `
      <div class="msg-avatar">👤</div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
    `;
    chatMessages.appendChild(div);
    scrollToBottom();
  }

  function appendAssistantMessage(htmlContent) {
    const div = document.createElement('div');
    div.className = 'msg-item msg-assistant';
    div.innerHTML = `
      <div class="msg-avatar">🐯</div>
      <div class="msg-bubble">${htmlContent}</div>
    `;
    chatMessages.appendChild(div);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'msg-item msg-assistant typing-indicator';
    div.innerHTML = `
      <div class="msg-avatar">🐯</div>
      <div class="msg-bubble">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    chatMessages.appendChild(div);
    scrollToBottom();
    return div;
  }

  function removeTypingIndicator(elem) {
    if (elem && elem.parentNode) {
      elem.parentNode.removeChild(elem);
    }
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
  }

  // Event Listeners for Chat
  sendBtn.addEventListener('click', () => handleSendMessage());
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });

  // Suggestion Chips Click
  chatSuggestions.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      handleSendMessage(prompt);
    });
  });
});

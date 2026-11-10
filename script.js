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
      const sectionTop = section.offsetTop - 130;
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
    rootMargin: '0px 0px -40px 0px'
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

  document.querySelectorAll('.about-card, .ingredient-card, .menu-card, .timeline-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });

  // ==========================================================
  // 2. Christmas Chef Tiger AI Mascot & Interactive Chat Logic
  // ==========================================================
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
    appendAssistantMessage(`✅ 已儲存 Google Apps Script 網址！現在小虎主廚會直接連線至雲端 OpenRouter (Claude Haiku 5.5) 為您解答米其林級料理秘辛！🐯👨‍🍳🎄`);
  });

  const conversationHistory = [];

  // Handle Send Message
  function handleSendMessage(text) {
    const userText = text || chatInput.value.trim();
    if (!userText) return;

    chatInput.value = '';
    appendUserMessage(userText);
    conversationHistory.push({ role: 'user', content: userText });

    const typingElem = showTypingIndicator();

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
          appendAssistantMessage(`🐯 哎呀，廚房連線有點小狀況：${data.error || '未知錯誤'}。小虎正在切換至主廚離線知識庫！`);
          fallbackLocalReply(userText);
        }
      })
      .catch(err => {
        removeTypingIndicator(typingElem);
        fallbackLocalReply(userText);
      });
    } else {
      setTimeout(() => {
        removeTypingIndicator(typingElem);
        fallbackLocalReply(userText);
      }, 700);
    }
  }

  // Local Chef Fallback Engine
  function fallbackLocalReply(prompt) {
    const p = prompt.toLowerCase();
    let reply = '';

    if (p.includes('菜') || p.includes('menu') || p.includes('招牌') || p.includes('料理') || p.includes('吃什麼')) {
      reply = `🐯👨‍🍳 Tobe 主廚今冬的四大旬味代表作超級厲害喔：<br><br>
1. 🦆 <strong>熟成櫻桃鴨胸佐黑蒜波特酒醬</strong>：花蓮放牧鴨胸經 14 日風乾熟成，外皮炭火焦脆、肉質如紅寶石般透嫩。<br>
2. 🐟 <strong>炭炙野生紅甘佐金桔發酵胡蘿蔔泥</strong>：稻草瞬火微炙，搭佐客家金桔乳酸發酵泥與爆漿手指檸檬！<br>
3. 🍄 <strong>黑松露野菇澄清湯佐手作牛肝菌雲吞</strong>：雙重蛋白慢熬 8 小時琥珀澄清湯，純淨鮮美。<br>
4. 🍫 <strong>紅玉紅茶煙燻巧克力慕斯佐香草油</strong>：日月潭紅玉茶香與 72% 法芙娜巧克力的成熟苦甜滋味。<br><br>
您可以在首頁「旬味菜單」細細品味每一道菜的風土故事！`;
    } else if (p.includes('食材') || p.includes('理念') || p.includes('風土') || p.includes('原料')) {
      reply = `🌿 Tobe 主廚秉持<strong>「產地到餐桌」</strong>的嚴謹標準：<br><br>
- 🍄 <strong>山林採集</strong>：南投野生牛肝菌、手採黑松露，散發原始深邃的泥土堅果香。<br>
- 🐟 <strong>永續海鮮</strong>：宜蘭野生紅甘友善一本釣捕撈，嚴格執行 7 天冰溫熟成。<br>
- 🧄 <strong>天然發酵</strong>：雲林 60 天低溫發酵黑蒜，天然黑蒜油回甘如蜜。<br>
- 🦆 <strong>友善放牧</strong>：花蓮湧泉放牧櫻桃鴨，以龍眼木炭火賦予獨特煙燻香氣！`;
    } else if (p.includes('預約') || p.includes('訂位') || p.includes('私廚') || p.includes('reservation') || p.includes('費用') || p.includes('聯絡')) {
      reply = `🍷 Tobe 主廚的「旬・Tobe Atelier」私廚採<strong>全預約制</strong>：<br><br>
📧 <strong>預約信箱</strong>：<a href="mailto:chef.tobewu@example.com" style="color:#f59e0b;">chef.tobewu@example.com</a><br>
🐙 <strong>主廚作品集</strong>：<a href="https://github.com/tobewu980306-eng" target="_blank" style="color:#f59e0b;">github.com/tobewu980306-eng</a><br><br>
💡 <em>貼心叮嚀：為了讓主廚親赴產地為您採集最頂級的當旬食材，建議提前 3 週確認用餐人數與客製菜單需求喔！</em>`;
    } else if (p.includes('經歷') || p.includes('背景') || p.includes('師傅') || p.includes('誰') || p.includes('journey')) {
      reply = `👨‍🍳 Tobe 主廚擁有超過 10 年當代法義料理歷練：<br><br>
- 🌟 <strong>2024 - 至今</strong>：創立「旬・Tobe Atelier」私廚工作室，擔任高規格餐酒會主廚與餐飲研發顧問。<br>
- 🥇 <strong>2021 - 2024</strong>：米其林推薦當代歐陸餐廳研發副主廚 (Sous Chef)，專精發酵與熟成工藝。<br>
- 🎓 <strong>2017 - 2021</strong>：取得國際廚藝學院高級文憑，並於歐陸三星名廚餐廳深入研修古典法式醬汁！`;
    } else if (p.includes('聖誕') || p.includes('甜點') || p.includes('祝') || p.includes('christmas')) {
      reply = `🎅🎄 叮叮噹！小虎主廚祝你聖誕快樂！為你端出熱騰騰的節慶祝福：<br><br>
<em>「願你的生活如 72% 煙燻黑巧克力般濃醇豐富，如肉桂海鹽般甜鹹平衡，每天都有滿滿的風土美味陪伴！」</em> 🐯🍰✨`;
    } else {
      reply = `🐯👨‍🍳 您好！我是聖誕小虎主廚。<br><br>
想品嚐風土美味嗎？您可以問我關於：<br>
• <strong>當季招牌菜單</strong> 🍽️<br>
• <strong>風土與嚴選食材</strong> 🌿<br>
• <strong>私廚預約方式</strong> 🍷<br>
• <strong>Tobe 主廚廚藝故事</strong> 👨‍🍳<br><br>
💡 <em>若您在 GAS 設定了 OpenRouter API，點擊右上角「⚙️」填入網址，小虎就能以 Claude Haiku 5.5 大腦陪您深度聊料理囉！</em>`;
    }

    appendAssistantMessage(reply);
    conversationHistory.push({ role: 'assistant', content: reply.replace(/<[^>]*>/g, '') });
  }

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

  sendBtn.addEventListener('click', () => handleSendMessage());
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });

  chatSuggestions.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      handleSendMessage(prompt);
    });
  });
});

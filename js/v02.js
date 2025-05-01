if (typeof hljs !== 'undefined') {
  hljs.highlightAll();
} else {
  console.error('highlight.js 未加载，请检查脚本引入顺序。');
}

function updateAiMessageContent(aiMessageDiv, markdownContent) {
  // 解析 Markdown 为 HTML
  const htmlContent = markdownToHtml(markdownContent);

  // 创建独立的按钮容器
  const buttonContainer = `
    <div class="message-footer">
      <div class="timestamp">${new Date().toLocaleTimeString()}</div>
      <p class="message-footer-btn">
        <button class="copy-btn" title="复制">📄</button>
        <button class="speak-btn" title="朗读">${isSpeaking ? '🔇' : '🔊'}</button>
      </p>
    </div>
  `;

  // 渲染 Markdown 和按钮容器
  aiMessageDiv.querySelector('.content').innerHTML = htmlContent + buttonContainer;

  // 按钮事件绑定
  const copyBtn = aiMessageDiv.querySelector('.copy-btn');
  const speakBtn = aiMessageDiv.querySelector('.speak-btn');

  copyBtn.onclick = () => copyToClipboard(markdownContent);
  speakBtn.onclick = () => speakText(markdownContent);
}


// 自定义 marked 渲染器
const renderer = new marked.Renderer();

renderer.code = function (code, language, isEscaped) {
  // 如果 code 是对象，提取 text 属性
  if (typeof code === 'object' && code.text !== undefined) {
    code = code.text; // 提取代码内容
  }

  // 确保 code 是一个字符串
  if (typeof code !== 'string') {
    console.warn('代码块内容不是字符串:', code);
    code = ''; // 如果 code 不是字符串，设置为空字符串
  }

  code = code.trim();

  // language = language || 'plaintext';


  // 自动高亮：如果 language 存在，则使用 hljs.highlight，否则自动检测
  const highlighted = language && hljs.getLanguage(language)
    ? hljs.highlight(code, { language }).value
    : hljs.highlightAuto(code).value;

  // 返回的 HTML 包含一个复制按钮（class="copy-code-btn"）以及 code 块
  return `
    <div class="code-block-container">
      <button class="copy-btn" onclick="copyCode(this)">Copy</button>
      <pre class="hljs">
        <code class="language-${language}">${highlighted}</code>
      </pre>
    </div>
  `;
};


// 配置 marked 使用自定义 renderer
marked.setOptions({
  // renderer: renderer,
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
});


function copyCode(btn) {
  const codeBlock = btn.parentElement.querySelector('code');
  if (!codeBlock) return;
  const codeText = codeBlock.innerText;
  navigator.clipboard.writeText(codeText).then(() => {
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('复制代码失败', err);
  });
}


// 定义中英文语言包
const translations = {
  en: {
    pageTitle: "Yuki AI - Explore the Unknown",
    headerTitle: "Yuki AI",
    clearChat: "Clear Chat",
    switchTheme: "Switch Theme",
    donate: "Donate",
    contact: "Contact Us",
    voiceInput: "Voice Input",
    send: "Send",
    inputPlaceholder: "Type your question...",
    speechStatus: "Speech status: Idle",
    announcementTitle: "🎉 V.02 New Version Update Announcement 🎉",
    announcementContent: "We've brought you the following new features:",
    announcementItem1: "Voice reading support;",
    announcementItem2: "Keyword-controlled theme switch;",
    announcementItem3: "Optimized code block display;",
    announcementItem4: "Multi-language interface;",
    announcementItem5: "Style enhancements, etc.;",
    announcementClose: "Got it",
    donateTitle: "Support the Author",
    donateContent: "If you find Yuki AI helpful, please consider donating!",
    donateThanks: "Thank you for your support!",
    donateClose: "Close",
    contactTitle: "Contact Us",
    contactContent: "If you have any questions or suggestions, please contact us via:",
    contactEmail: "Email: jky0802@163.com",
    contactWeChat: "WeChat: JKY010802",
    contactQQ: "QQ: 2801141523",
    contactClose: "Close",
    userPronoun: "Y",
  },
  zh: {
    pageTitle: "Yuki AI - 探索未知之境",
    headerTitle: "Yuki AI",
    clearChat: "清空聊天",
    switchTheme: "切换主题",
    donate: "打赏",
    contact: "联系我们",
    voiceInput: "语音输入",
    send: "发送",
    inputPlaceholder: "输入你的问题...",
    speechStatus: "朗读状态：空闲",
    announcementTitle: "🎉 V.02 新版本更新公告 🎉",
    announcementContent: "我们为您带来了以下新功能：",
    announcementItem1: "内容支持语音朗读；",
    announcementItem2: "关键词控制主题开关；",
    announcementItem3: "代码块显示优化；",
    announcementItem4: "增加多语言界面；",
    announcementItem5: "样式优化等；",
    announcementClose: "我知道了",
    donateTitle: "支持作者",
    donateContent: "如果觉得 Yuki AI 对你有帮助，欢迎打赏支持！",
    donateThanks: "感谢您的支持！",
    donateClose: "关闭",
    contactTitle: "联系我们",
    contactContent: "如果您有任何问题或建议，欢迎通过以下方式联系我们：",
    contactEmail: "邮箱：jky0802@163.com",
    contactWeChat: "微信：JKY010802",
    contactQQ: "QQ：2801141523",
    contactClose: "关闭",
    userPronoun: "你",
  }
};

function updatePlaceholders(lang) {
  const input = document.getElementById("input");
  if (input) {
    input.placeholder = translations[lang].inputPlaceholder;
  }
}

// 切换语言函数
function updateLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.innerText = translations[lang][key];
    }
  });
  updatePlaceholders(lang);
  document.title = translations[lang].pageTitle;
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if (translations[lang] && translations[lang][key]) {
      el.title = translations[lang][key];
    }
  });

  const userPronoun = translations[lang].userPronoun;

  const messageDivs = document.querySelectorAll(".message");
  messageDivs.forEach(div => {
    const avatarDiv = div.querySelector(".avatar");
    if (avatarDiv) {
      const isUserMessage = div.classList.contains('user-message');  // 检查是否是用户消息
      if (isUserMessage) {
        avatarDiv.innerText = userPronoun;
      } else {
        avatarDiv.innerHTML = '<img src="/image/ai-avatar.jpg" alt="AI 头像" width="40" height="40" style="border-radius: 50%;">';
      }
    }
  });



  localStorage.setItem("language", lang);
  // 更新切换按钮文字：显示当前语言标识
  document.getElementById("lang-toggle").innerText = lang.toUpperCase();
  const currentTheme = document.body.getAttribute('data-theme') === 'dark';
  // setTheme(currentTheme);
}

function toggleLanguage() {
  const current = localStorage.getItem("language") || "zh";
  const newLang = current === "zh" ? "en" : "zh";
  updateLanguage(newLang);
}

// 初始化语言
const initLang = localStorage.getItem("language") || "zh";
updateLanguage(initLang);



function launchHeartParticles() {
  const canvas = document.getElementById('heartCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const hearts = [];

  function createHeart() {
    const x = Math.random() * canvas.width;
    const y = canvas.height + 10;
    const size = Math.random() * 6 + 2;
    const speed = Math.random() * 1 + 0.5;
    hearts.push({ x, y, size, speed });
  }

  function drawHeart(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 5, size / 5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -3, -5, -3, -5, 0);
    ctx.bezierCurveTo(-5, 3, 0, 5, 0, 7);
    ctx.bezierCurveTo(0, 5, 5, 3, 5, 0);
    ctx.bezierCurveTo(5, -3, 0, -3, 0, 0);
    ctx.fillStyle = 'pink';
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createHeart();
    for (let i = 0; i < hearts.length; i++) {
      const heart = hearts[i];
      heart.y -= heart.speed;
      drawHeart(heart.x, heart.y, heart.size);
      if (heart.y < -10) {
        hearts.splice(i, 1);
        i--;
      }
    }
    requestAnimationFrame(animate);
  }

  animate();
}

function handleInputForKeywords(text) {
  const keyword = '秦妞妞';
  if (text.includes(keyword)) {
    launchHeartParticles();
    const audio = document.getElementById('loveSong');
    audio.play();
    return
  }
}


const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = document.documentElement.clientHeight; // 改这里！
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
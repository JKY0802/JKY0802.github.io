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
        avatarDiv.innerHTML = '<img src="./image/ai-avatar.jpg" alt="AI 头像" width="40" height="40" style="border-radius: 50%;">';
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
  const keyword = '陈梦瑶';
  if (text.includes(keyword)) {
    launchHeartParticles();
    const audio = document.getElementById('loveSong');
    // audio.play();
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




// 收起侧边栏
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const expandBtn = document.getElementById('sidebarExpandBtn');
  sidebar.classList.toggle('collapsed');
  if (sidebar.classList.contains('collapsed')) {
    expandBtn.style.display = 'flex';
  } else {
    expandBtn.style.display = 'none';
  }
}



// ==================== 陈梦瑶专属浪漫弹框组件 ====================
// 此组件独立运行，不影响原有聊天功能

// 1. 创建弹框所需的样式（动态注入）
function injectRomanceModalStyles() {
  const styleId = 'romance-modal-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* 浪漫弹框遮罩 */
    .romance-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(20px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      visibility: hidden;
      opacity: 0;
      transition: visibility 0.3s, opacity 0.4s ease;
      font-family: 'Segoe UI', 'PingFang SC', Roboto, sans-serif;
    }
    
    .romance-modal-overlay.active {
      visibility: visible;
      opacity: 1;
    }
    
    /* 弹框内容容器 */
    .romance-modal-container {
      position: relative;
      width: 90vw;
      height: 80vh;
      max-width: 1000px;
      max-height: 700px;
      background: linear-gradient(145deg, #1a0f1c, #2b1225);
      border-radius: 48px;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(255, 200, 230, 0.4), 0 0 50px rgba(255, 120, 180, 0.5);
      overflow: hidden;
      animation: romanceModalFloat 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }
    
    @keyframes romanceModalFloat {
      0% {
        transform: scale(0.9) translateY(30px);
        opacity: 0;
      }
      100% {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    
    /* 关闭按钮 */
    .romance-modal-close {
      position: absolute;
      top: 16px;
      right: 20px;
      width: 40px;
      height: 40px;
      background: rgba(255, 230, 240, 0.2);
      backdrop-filter: blur(8px);
      border: 1px solid #ffb7cf;
      border-radius: 50%;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #ffe0ec;
      z-index: 10001;
      transition: all 0.2s;
      font-family: monospace;
    }
    
    .romance-modal-close:hover {
      background: #ff77aa;
      color: white;
      transform: rotate(90deg);
      box-shadow: 0 0 12px #ff99cc;
    }
    
    /* iframe 内嵌相册 */
    .romance-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: radial-gradient(circle at 30% 20%, #1f0d19, #08030c);
    }
    
    /* 自动关闭倒计时提示 */
    .auto-close-tip {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      padding: 6px 16px;
      border-radius: 30px;
      font-size: 12px;
      color: #ffcfdf;
      z-index: 10001;
      font-family: monospace;
      pointer-events: none;
      white-space: nowrap;
    }
    
    /* 爱心飘落动画 */
    .romance-floating-heart {
      position: fixed;
      pointer-events: none;
      font-size: 20px;
      animation: romanceHeartFloat 1.2s ease-out forwards;
      z-index: 10002;
    }
    
    @keyframes romanceHeartFloat {
      0% {
        transform: translateY(0) scale(0.6);
        opacity: 1;
      }
      100% {
        transform: translateY(-120px) scale(1.3);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// 2. 生成浪漫相册的 HTML 内容（独立的完整相册页面）
function generateRomanceAlbumHTML() {
  return `<!DOCTYPE html>
  <html lang="zh-CN">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <title>✨ 陈梦瑶 · 浪漫旋转相册 ✨</title>
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
              background: radial-gradient(circle at 30% 20%, #120615, #280e20);
              font-family: 'Dancing Script', 'Pacifico', 'Segoe UI', 'PingFang SC', cursive;
              overflow: hidden;
              height: 100%;
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              position: relative;
          }
          .album-wrapper {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2vmin;
          }
          .romance-title {
              font-size: clamp(18px, 4vmin, 36px);
              background: linear-gradient(120deg, #ffd9e6, #ffafcf);
              background-clip: text;
              -webkit-background-clip: text;
              color: transparent;
              text-shadow: 0 0 12px #ff7eae;
              letter-spacing: 2px;
              margin-bottom: 1rem;
              text-align: center;
          }
          .scene {
              width: 86vmin;
              height: 68vmin;
              max-width: 780px;
              max-height: 560px;
              perspective: 1500px;
              margin: 1rem auto;
              display: grid;
              place-items: center;
          }
          .carousel {
              position: relative;
              width: 100%;
              height: 100%;
              transform-style: preserve-3d;
              animation: spinSweet 32s cubic-bezier(0.4, 0.2, 0.2, 1) infinite;
          }
          .scene:hover .carousel {
              animation-play-state: paused;
          }
          @keyframes spinSweet {
              0% { transform: rotateY(0deg) rotateX(1deg); }
              100% { transform: rotateY(360deg) rotateX(1deg); }
          }
          .panel {
              position: absolute;
              left: 50%;
              top: 50%;
              width: min(36vmin, 400px);
              height: min(26vmin, 300px);
              transform: translate(-50%, -50%) rotateX(-3deg);
              border-radius: 28px;
              background: rgba(255, 245, 250, 0.2);
              backdrop-filter: blur(2px);
              box-shadow: 0 20px 35px -8px rgba(0,0,0,0.5), 0 0 0 2px #ffbfdc, 0 0 25px #ff99cc;
              overflow: hidden;
              transition: 0.3s;
          }
          .panel:hover {
              transform: translate(-50%, -50%) rotateX(-2deg) scale(1.02);
              box-shadow: 0 25px 40px -8px black, 0 0 0 3px #ffb7d2;
          }
          .panel img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              filter: brightness(1.03) saturate(1.08);
          }
          .panel::after {
              content: "";
              position: absolute;
              inset: 0;
              background: radial-gradient(circle at 30% 30%, rgba(255,210,230,0.2), transparent);
              pointer-events: none;
          }
          :root { --r: min(42vmin, 440px); }
          .panel:nth-child(1) { transform: translate(-50%, -50%) rotateY(0deg) translateZ(var(--r)) rotateX(-2deg); }
          .panel:nth-child(2) { transform: translate(-50%, -50%) rotateY(72deg) translateZ(var(--r)) rotateX(-2deg); }
          .panel:nth-child(3) { transform: translate(-50%, -50%) rotateY(144deg) translateZ(var(--r)) rotateX(-2deg); }
          .panel:nth-child(4) { transform: translate(-50%, -50%) rotateY(216deg) translateZ(var(--r)) rotateX(-2deg); }
          .panel:nth-child(5) { transform: translate(-50%, -50%) rotateY(288deg) translateZ(var(--r)) rotateX(-2deg); }
          .caption {
              text-align: center;
              margin-top: 1.5rem;
              color: #ffcfdf;
              font-size: 1rem;
              letter-spacing: 2px;
              background: rgba(0,0,0,0.3);
              display: inline-block;
              padding: 5px 20px;
              border-radius: 60px;
              backdrop-filter: blur(4px);
          }
          @media (max-width: 680px) {
              .panel { width: 44vmin; height: 33vmin; }
              :root { --r: 48vmin; }
          }
      </style>
  </head>
  <body>
      <div class="album-wrapper">
          <div class="romance-title">✨ 梦瑶 · 星光为你旋转 ✨</div>
          <div class="scene">
              <div class="carousel">
                  <figure class="panel"><img src="./image/yao1.jpg" alt="陈梦瑶1" onerror="this.src='https://picsum.photos/id/103/500/400?seed=mengyao1';"></figure>
                  <figure class="panel"><img src="./image/yao2.jpg" alt="陈梦瑶2" onerror="this.src='https://picsum.photos/id/107/500/400?seed=mengyao2';"></figure>
                  <figure class="panel"><img src="./image/yao3.jpg" alt="陈梦瑶3" onerror="this.src='https://picsum.photos/id/104/500/400?seed=mengyao3';"></figure>
                  <figure class="panel"><img src="./image/yao4.jpg" alt="陈梦瑶4" onerror="this.src='https://picsum.photos/id/169/500/400?seed=mengyao4';"></figure>
                  <figure class="panel"><img src="./image/yao5.jpg" alt="陈梦瑶5" onerror="this.src='https://picsum.photos/id/155/500/400?seed=mengyao5';"></figure>
              </div>
          </div>
          <div class="caption">💖 你轻轻念出她的名字，宇宙都变得温柔 💖</div>
      </div>
  </body>
  </html>`;
}

// 3. 飘落爱心特效
function launchRomanceHearts() {
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.className = 'romance-floating-heart';
      heart.innerHTML = ['❤️', '💖', '🌸', '✨', '💗', '🌟', '💕', '🌹'][Math.floor(Math.random() * 8)];
      heart.style.left = Math.random() * window.innerWidth + 'px';
      heart.style.bottom = '10px';
      heart.style.fontSize = (Math.random() * 18 + 16) + 'px';
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1200);
    }, i * 40);
  }
}

// 4. 全局变量存储弹框和计时器
let romanceModal = null;
let autoCloseTimer = null;

// 5. 关闭弹框的函数
function closeRomanceModal() {
  if (romanceModal && romanceModal.classList.contains('active')) {
    romanceModal.classList.remove('active');
    // 移除后销毁元素
    setTimeout(() => {
      if (romanceModal && romanceModal.parentNode) {
        romanceModal.parentNode.removeChild(romanceModal);
      }
      romanceModal = null;
    }, 400);
  }
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }
  // 恢复 body 滚动
  document.body.style.overflow = '';
}

// 6. 打开浪漫弹框（核心函数）
function openRomanceModal(autoCloseDelay = 8000) {
  // 如果已经有弹框，先关闭旧的
  if (romanceModal) {
    closeRomanceModal();
  }
  
  // 注入样式
  injectRomanceModalStyles();
  
  // 创建弹框结构
  const overlay = document.createElement('div');
  overlay.className = 'romance-modal-overlay';
  
  const container = document.createElement('div');
  container.className = 'romance-modal-container';
  
  const closeBtn = document.createElement('div');
  closeBtn.className = 'romance-modal-close';
  closeBtn.innerHTML = '✕';
  closeBtn.onclick = closeRomanceModal;
  
  const iframe = document.createElement('iframe');
  iframe.className = 'romance-iframe';
  iframe.title = '陈梦瑶专属浪漫相册';
  iframe.setAttribute('scrolling', 'no');
  iframe.srcdoc = generateRomanceAlbumHTML();
  
  const autoTip = document.createElement('div');
  autoTip.className = 'auto-close-tip';
  autoTip.innerHTML = `✨ 弹框将在 ${autoCloseDelay / 1000} 秒后自动关闭 ✨`;
  
  container.appendChild(closeBtn);
  container.appendChild(iframe);
  container.appendChild(autoTip);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  romanceModal = overlay;
  
  // 显示弹框
  setTimeout(() => {
    romanceModal.classList.add('active');
  }, 10);
  
  // 禁止 body 滚动
  document.body.style.overflow = 'hidden';
  
  // 发射爱心特效
  launchRomanceHearts();
  
  // 自动关闭
  if (autoCloseDelay > 0) {
    autoCloseTimer = setTimeout(() => {
      closeRomanceModal();
    }, autoCloseDelay);
  }
  
  // 点击遮罩也可关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeRomanceModal();
    }
  });
}

// 7. 关键词检测函数（整合到您现有的逻辑中）
// 注意：这个函数需要被您的聊天消息处理逻辑调用
function checkAndShowRomanceForKeyword(text) {
  const keyword = '陈梦瑶';
  if (text && text.includes(keyword)) {
    // 弹出浪漫相册弹框，8秒后自动关闭
    openRomanceModal(8000);
    return true;
  }
  return false;
}

// 8. 如果您需要在初始化时绑定到现有的发送消息逻辑，可以这样做：
// 请在您的 sendMessage 函数中添加一行调用 checkAndShowRomanceForKeyword
// 示例：
/*
// 在您原有的 sendMessage 函数中，大约在发送用户消息的位置添加：
function sendMessage() {
  const inputBox = document.getElementById('input');
  const message = inputBox.value.trim();
  if (message) {
    // 检测关键词并弹出浪漫相册
    checkAndShowRomanceForKeyword(message);
    
    // ... 原有的发送消息逻辑 ...
  }
}
*/

// 如果找不到现有的 sendMessage 函数，我们可以通过劫持的方式来集成（不侵入原代码）
// 这种方式更安全，不会破坏原有逻辑
function integrateRomanceCheck() {
  // 等待页面加载完成
  setTimeout(() => {
    // 查找原有的 sendMessage 函数
    const originalSend = window.sendMessage;
    if (typeof originalSend === 'function') {
      // 包装原函数
      window.sendMessage = function() {
        // 获取输入框内容
        const inputBox = document.getElementById('input');
        if (inputBox && inputBox.value) {
          const message = inputBox.value.trim();
          if (message) {
            checkAndShowRomanceForKeyword(message);
          }
        }
        // 调用原函数
        return originalSend.apply(this, arguments);
      };
      console.log('✅ 浪漫弹框组件已集成到发送消息中');
    } else {
      console.log('⚠️ 未找到 sendMessage 函数，请手动在发送逻辑中调用 checkAndShowRomanceForKeyword');
    }
  }, 1000);
}

// 导出/暴露全局接口
window.RomanceModal = {
  open: openRomanceModal,
  close: closeRomanceModal,
  checkKeyword: checkAndShowRomanceForKeyword
};

// 自动集成
integrateRomanceCheck();

// ==================== 组件代码结束 ====================
// 文明用语
const offensiveKeywords = [
  "傻逼", "笨蛋", "垃圾", "废物", "白痴", "脑残", "去死", "滚蛋", "贱人", "混蛋", "傻屌", "菜鸡", "狗屎"
];

const randomPromptLang = ["吐槽请用彩虹屁，阴阳怪气伤和气", "左邻右舍常相见，口吐芬芳损颜面", "操作可以秀，嘴炮不能溜", "言为心声字如人，文明用语塑校魂",
  "良言一句三冬暖，恶语伤人六月寒",
  "文明用语显修养，粗言秽语失风度",
  "键盘敲出正能量，网络世界更阳光",
]

let isDarkMode = localStorage.getItem('theme') === 'dark'
setTheme(isDarkMode)

function toggleTheme() {
  isDarkMode = !isDarkMode
  setTheme(isDarkMode)
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
}

function setTheme(dark) {
  document.body.setAttribute('data-theme', dark ? 'dark' : 'light');
  const themeBtn = document.querySelector('.theme-toggle');
  const currentLang = localStorage.getItem("language") || "zh";

  if (currentLang === "zh") {
    themeBtn.textContent = dark ? '🌙 夜间模式' : '🌞 白天模式';
  } else {
    themeBtn.textContent = dark ? '🌙 Dark Mode' : '🌞 Light Mode';
  }
}

let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || []
const chatContainer = document.getElementById('chatContainer')
let isVoiceInputActive = false
let recognition = null

function clearChat() {
  chatContainer.innerHTML = ''
  chatHistory = []
  localStorage.removeItem('chatHistory')
}

let isSpeaking = false; // 是否正在朗读

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;


function toggleVoiceInput() {
  if (!('webkitSpeechRecognition' in window)) {
    alert('您的浏览器不支持语音输入')
    return
  }

  isVoiceInputActive = !isVoiceInputActive
  const voiceBtn = document.querySelector('.voice-btn')
  voiceBtn.textContent = isVoiceInputActive ? '🔴' : '🎤'

  if (isVoiceInputActive) {
    startVoiceInput()
  } else {
    stopVoiceInput()
  }
}

function startVoiceInput() {
  recognition = new webkitSpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    console.log(transcript, 'transcript')
    document.getElementById('input').value = transcript
    recognition.stop()
    isVoiceInputActive = false
    document.querySelector('.voice-btn').textContent = '🎤'
  }


  recognition.start()
}

function stopVoiceInput() {
  if (recognition) {
    recognition.stop()
  }
}

// 检测文明用语
function containsOffensiveKeywords(message) {
  return offensiveKeywords.some(keyword => message.includes(keyword));
}
// 随机获取一条文明用语
function getRandomPrompt() {
  const randomIndex = Math.floor(Math.random() * randomPromptLang.length)
  return randomPromptLang[randomIndex]
}

async function sendMessage() {
  const input = document.getElementById('input')
  const message = input.value.trim()


  if (message === '关灯') {
    setTheme(true); // 切换到暗色主题
    addMessage(message, true); // 显示用户输入的消息
    input.value = ''; // 清空输入框
    return; // 直接返回，不发送请求
  } else if (message === '开灯') {
    setTheme(false); // 切换到亮色主题
    addMessage(message, true); // 显示用户输入的消息
    input.value = ''; // 清空输入框
    return; // 直接返回，不发送请求
  }


  const girlfriendName = localStorage.getItem('sweetheartName') || '陈梦瑶'; // 默认值

  // 浪漫关键词触发逻辑
  if (message.includes('谁是世界上最温柔善良的女孩') ||
    message.includes('谁是最温柔的女孩') ||
    message.includes('世界上最善良的女孩是谁')) {

    // 文案模板库
    const sweetReplies = [
      `宇宙级标准答案：${girlfriendName}！✨`,
      `这还需要问吗？当然是${girlfriendName}小仙女啦~`,
      `系统检测到心跳加速... 确认是${girlfriendName}！❤️`,
      `根据《世界温柔法典》第520条，正确答案是${girlfriendName}！`,
      `叮！${girlfriendName}的温柔善良指数已突破天际！`
    ];

    // 随机选择回复
    const randomReply = sweetReplies[Math.floor(Math.random() * sweetReplies.length)];

    // 创建浪漫特效
    createRomanticEffect();

    // 显示回复
    addMessage(randomReply, false);
    input.value = '';
    handleInputForKeywords(girlfriendName);
    return; // 阻止继续发送给AI
  }

  // 名字单独触发（保留你原有的秦妞妞逻辑）
  if (message.includes(girlfriendName)) {
    handleInputForKeywords(message)
    input.value = '';
    return;
  }

  // 检测侮辱性内容
  if (containsOffensiveKeywords(message)) {
    const randomPrompt = getRandomPrompt()
    alert(`\n${randomPrompt}`)
    return
  }


  if (!message) return


  const btn = document.getElementById('sendBtn')
  btn.disabled = true
  btn.innerHTML = '<div class="loading"></div>'

  // 立即显示用户消息
  addMessage(message, true)

  // 清空输入框
  input.value = ''
  autoResize(input)

  // 这里创建一个空的 AI 消息占位
  const aiMessageDiv = addMessage('我是 Yuki AI，正在处理你的问题...', false)

  setTimeout(async () => {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-79439cc652d64fa5bef661ecf250d838'
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: message }],
          stream: true
        })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.choices[0].delta.content) {
                assistantMessage += data.choices[0].delta.content

                const contentHtml = markdownToHtml(assistantMessage)
                const contentContainer = aiMessageDiv.querySelector('.content')
                contentContainer.innerHTML = contentHtml


                if (typeof hljs !== 'undefined') {
                  hljs.highlightAll();
                }


                // 创建或更新按钮容器，避免和 Markdown 内容混在一起
                let footerContainer = aiMessageDiv.querySelector('.footer-container')
                if (!footerContainer) {
                  footerContainer = document.createElement('div')
                  footerContainer.className = 'footer-container'
                  // 将 footerContainer 作为 content 的子元素添加到末尾
                  contentContainer.appendChild(footerContainer)
                } else {
                  footerContainer.innerHTML = ''
                }

                // 添加时间戳
                const timestampSpan = document.createElement('span')
                timestampSpan.className = 'timestamp'
                timestampSpan.textContent = new Date().toLocaleTimeString()
                footerContainer.appendChild(timestampSpan)

                // 添加复制按钮
                const copyBtn = document.createElement('button')
                copyBtn.className = 'copy-btn'
                copyBtn.title = '复制'
                copyBtn.textContent = '📄'
                copyBtn.addEventListener('click', () => {
                  copyToClipboard(assistantMessage.replace(/'/g, "\\'"))
                })
                footerContainer.appendChild(copyBtn)

                // 添加朗读按钮
                const speakBtn = document.createElement('button')
                speakBtn.className = 'speak-btn'
                speakBtn.title = '朗读'
                speakBtn.textContent = isSpeaking ? '🔇' : '🔊'
                speakBtn.addEventListener('click', () => {
                  speakText(assistantMessage.replace(/'/g, "\\'"))
                })
                footerContainer.appendChild(speakBtn)
              }
            } catch (e) {
              console.error('解析返回数据错误:', e);
            }
          }
        }
      }

      chatHistory.push({ content: message, isUser: true })
      chatHistory.push({ content: assistantMessage, isUser: false })
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
    } catch (error) {
      console.error('Error:', error)
      aiMessageDiv.querySelector('.content').innerText = '请求出错，请稍后再试'
    }

    btn.disabled = false
    btn.textContent = '发送'
  }, 0)
}

function addMessage(content, isUser) {
  const lang = localStorage.getItem("language") || "zh";
  const userPronoun = translations[lang].userPronoun;

  const messageDiv = document.createElement('div')
  messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`
  const timestamp = new Date().toLocaleTimeString()

  // 用户消息直接原样显示，AI 消息需要经过 Markdown 渲染
  const messageHtml = isUser ? content : markdownToHtml(content)

  // 构造消息区域，非用户消息增加独立 footer-container 放按钮和时间戳
  messageDiv.innerHTML = `
    <div class="avatar">
      ${isUser ? userPronoun : '<img src="./image/ai-avatar.jpg" alt="AI 头像" width="40" height="40" style="border-radius: 50%;">'}
    </div>
    <div class="content">
      ${messageHtml}
      ${isUser ? `<div class="timestamp">${timestamp}</div>` : `
      <div class="footer-container">
        <span class="timestamp">${timestamp}</span>
        <p class="message-footer-btn">
          <button class="copy-btn" title="复制">📄</button>
          <button class="speak-btn" title="朗读">${isSpeaking ? '🔇' : '🔊'}</button>
        </p>
      </div>
      `}
    </div>
  `

  chatContainer?.appendChild(messageDiv)
  chatContainer.scrollTop = chatContainer.scrollHeight

  // 为 AI 消息绑定按钮事件
  if (!isUser) {
    const copyBtn = messageDiv.querySelector('.copy-btn')
    const speakBtn = messageDiv.querySelector('.speak-btn')
    copyBtn.addEventListener('click', () => copyToClipboard(content.replace(/'/g, "\\'")))
    speakBtn.addEventListener('click', () => speakText(content.replace(/'/g, "\\'")))
    speakBtn.disabled = isSpeaking
  } else {
    // 用户消息不需要按钮事件绑定
  }

  return messageDiv
}


function markdownToHtml(text) {
  // 解析 Markdown
  if (typeof marked !== 'undefined') {
    return marked.parse(text || '');
  } else {
    console.warn('marked 未加载，将直接返回原始文本');
    return text || '';
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板！')
  })
}

function autoResize(textarea) {
  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

function handleKeyDown(event) {
  if (event.key === 'Enter' && event.ctrlKey) {
    sendMessage()
    event.preventDefault()
  }
}

// 恢复聊天记录
chatHistory.forEach(item => {
  addMessage(item.content, item.isUser)
})

// 公告逻辑
const announcement = document.getElementById('announcement')
const hasSeenAnnouncement = localStorage.getItem('hasSeenAnnouncement-v2')

if (!hasSeenAnnouncement) {
  announcement.style.display = 'block'
  // 动态生成日期
  const currentDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const dateElement = document.createElement('p')
  dateElement.className = 'announcement-date'
  dateElement.textContent = `发布日期：2025-03-23`

  // 将日期插入到公告内容中
  const announcementContent = announcement.querySelector('h2')
  announcementContent.insertAdjacentElement('afterend', dateElement)
} else {
  announcement.style.display = 'none'
}

function closeAnnouncement() {
  announcement.style.display = 'none'
  localStorage.setItem('hasSeenAnnouncement-v2', true)
}


// 打开打赏模态框
function openDonateModal() {
  const donateModal = document.getElementById('donateModal')
  donateModal.style.display = 'flex'
}

// 关闭打赏模态框
function closeDonateModal() {
  const donateModal = document.getElementById('donateModal')
  donateModal.style.display = 'none'
}

// 点击模态框外部关闭
window.onclick = function (event) {
  const donateModal = document.getElementById('donateModal')
  if (event.target === donateModal) {
    donateModal.style.display = 'none'
  }
}


// 打开联系我们模态框
function openContactModal() {
  const contactModal = document.getElementById('contactModal')
  contactModal.style.display = 'flex'
}

// 关闭联系我们模态框
function closeContactModal() {
  const contactModal = document.getElementById('contactModal')
  contactModal.style.display = 'none'
}

// 点击模态框外部关闭
window.onclick = function (event) {
  const contactModal = document.getElementById('contactModal')
  if (event.target === contactModal) {
    contactModal.style.display = 'none'
  }
}



function detectLanguage(text) {
  const chineseRegex = /[\u4e00-\u9fa5]/; // 中文字符范围
  const englishRegex = /[a-zA-Z]/; // 英文字符范围

  if (chineseRegex.test(text)) {
    return 'zh-CN'; // 中文
  } else if (englishRegex.test(text)) {
    return 'en-US'; // 英文
  }
  return 'zh-CN'; // 默认中文
}

function speakText(text) {
  if (!text || isSpeaking) return;

  // 创建语音合成对象
  const utterance = new SpeechSynthesisUtterance(text);

  // 设置语言
  utterance.lang = detectLanguage(text);

  // 设置语速（0.1 到 10，默认 1）
  utterance.rate = 1;

  // 设置音高（0 到 2，默认 1）
  utterance.pitch = 1;

  // 更新状态
  isSpeaking = true;
  updateSpeechStatus('朗读中...');

  // 开始朗读
  window.speechSynthesis.speak(utterance);

  // 朗读结束后的回调
  utterance.onend = () => {
    isSpeaking = false;
    updateSpeechStatus('朗读完成');
  };

  // 朗读错误时的回调
  utterance.onerror = (error) => {
    isSpeaking = false;
    updateSpeechStatus('朗读出错');
    console.error('朗读出错:', error);
  };

}

// 更新朗读状态
function updateSpeechStatus(status) {
  const statusBox = document.getElementById('speechStatus');
  if (statusBox) {
    statusBox.textContent = `朗读状态：${status}`;
  }

  // 刷新所有朗读按钮的状态
  const speakButtons = document.querySelectorAll('.speak-btn');
  speakButtons.forEach(button => {
    button.disabled = isSpeaking; // 根据 isSpeaking 禁用或启用按钮
    button.innerHTML = isSpeaking ? '🔇' : '🔊'; // 根据 isSpeaking 更新图标
  });
}

// 暂停朗读
function pauseSpeech() {
  if (isSpeaking) {
    window.speechSynthesis.pause();
    updateSpeechStatus('已暂停');
  }
}

// 继续朗读
function resumeSpeech() {
  if (isSpeaking) {
    window.speechSynthesis.resume();
    updateSpeechStatus('朗读中...');
  }
}

// 停止朗读
function stopSpeech() {
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    updateSpeechStatus('已停止');
  }
}


// 


function createRomanticEffect() {
  // 爱心雨特效
  const container = document.querySelector('.chat-container');
  for (let i = 0; i < 30; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
    container.appendChild(heart);

    // 自动移除防止DOM堆积
    setTimeout(() => heart.remove(), 5000);
  }

  // 背景闪烁效果
  document.body.classList.add('romantic-glow');
  setTimeout(() => {
    document.body.classList.remove('romantic-glow');
  }, 2000);
}




// 多会话全局变量初始化
let chatSessions = JSON.parse(localStorage.getItem('chatSessions')) || {};
let currentSessionId = localStorage.getItem('currentSessionId') || null;

// 页面加载时自动渲染会话列表和历史
window.addEventListener('DOMContentLoaded', () => {
  // 如果没有会话则自动新建一个
  if (!currentSessionId || !chatSessions[currentSessionId]) {
    const id = 'session_' + Date.now();
    chatSessions[id] = { title: '新会话', history: [] };
    currentSessionId = id;
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    localStorage.setItem('currentSessionId', id);
  }
  renderSessionList();
  renderChatHistory();
});

function createNewSession() {
  const id = 'session_' + Date.now();
  chatSessions[id] = { title: '新会话', history: [] };
  localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
  switchSession(id);
}

function switchSession(id) {
  currentSessionId = id;
  localStorage.setItem('currentSessionId', id);
  renderChatHistory();
  renderSessionList();
}

function deleteSession(id) {
  delete chatSessions[id];
  localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
  if (currentSessionId === id) {
    const keys = Object.keys(chatSessions);
    currentSessionId = keys.length ? keys[0] : null;
    localStorage.setItem('currentSessionId', currentSessionId);
  }
  renderChatHistory();
  renderSessionList();
}

function renameSessionPrompt(id) {
  const newTitle = prompt('请输入新会话名称', chatSessions[id].title || '');
  if (newTitle) {
    chatSessions[id].title = newTitle;
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    renderSessionList();
  }
}

function getCurrentChatHistory() {
  return chatSessions[currentSessionId]?.history || [];
}
function setCurrentChatHistory(history) {
  if (chatSessions[currentSessionId]) {
    chatSessions[currentSessionId].history = history;
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
  }
}

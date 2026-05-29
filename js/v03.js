(function () {
  const VERSION_KEY = 'hasSeenAnnouncement-v3';

  function getLang() {
    return localStorage.getItem('language') || 'zh';
  }

  function extendTranslations() {
    if (typeof translations === 'undefined') return;

    Object.assign(translations.en, {
      announcementTitle: '🎉 V.03 Experience Update',
      announcementContent: 'This release focuses on smoother chats and better mobile usability:',
      announcementItem1: 'New iOS-inspired interface and responsive mobile layout;',
      announcementItem2: 'Independent multi-session storage, so chats no longer mix;',
      announcementItem3: 'Cleaner Markdown answers with upgraded code block copy controls;',
      announcementItem4: 'Auto-follow while sending and streaming answers;',
      announcementItem5: 'Improved language switching, voice reading, and collapsed sidebar state;',
      copyCode: 'Copy',
      copiedCode: 'Copied',
      newSession: 'New Chat',
      renameSession: 'Rename',
      deleteSession: 'Delete',
      themeLight: 'Light Mode',
      themeDark: 'Dark Mode'
    });

    Object.assign(translations.zh, {
      announcementTitle: '🎉 V.03 体验优化更新公告 🎉',
      announcementContent: '这次我们重点优化了聊天体验与移动端可用性：',
      announcementItem1: '全新的 iOS 风格界面与移动端适配；',
      announcementItem2: '多会话独立保存，切换会话不再串内容；',
      announcementItem3: 'AI 回复 Markdown 排版与代码块复制体验升级；',
      announcementItem4: '发送后自动跟随到底部，阅读回答更顺手；',
      announcementItem5: '中英文切换、朗读音色和侧边栏收起态优化；',
      copyCode: '复制',
      copiedCode: '已复制',
      newSession: '新建会话',
      renameSession: '重命名',
      deleteSession: '删除',
      themeLight: '白天模式',
      themeDark: '黑夜模式'
    });
  }

  function getCodeCopyLabel(done = false) {
    const langPack = typeof translations !== 'undefined' ? translations[getLang()] : null;
    return done ? (langPack?.copiedCode || '已复制') : (langPack?.copyCode || '复制');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupMarkdownRenderer() {
    if (typeof marked === 'undefined') return;

    const v03Renderer = new marked.Renderer();
    v03Renderer.code = function (code, language) {
      if (typeof code === 'object' && code !== null) {
        language = code.lang || code.language || language;
        code = code.text || code.raw || '';
      }

      if (typeof code !== 'string') {
        code = '';
      }

      code = code.replace(/\n$/, '');
      const normalizedLanguage = (language || '').trim().split(/\s+/)[0];
      const safeLanguage = normalizedLanguage ? normalizedLanguage.replace(/[^\w-]/g, '') : 'plaintext';
      const languageLabel = normalizedLanguage || 'text';
      const highlighted = typeof hljs !== 'undefined'
        ? (safeLanguage && hljs.getLanguage(safeLanguage)
          ? hljs.highlight(code, { language: safeLanguage }).value
          : hljs.highlightAuto(code).value)
        : escapeHtml(code);

      return `
        <div class="code-block-container">
          <div class="code-block-header">
            <span class="code-language">${escapeHtml(languageLabel)}</span>
            <button class="copy-code-btn" type="button" onclick="copyCode(this)">${getCodeCopyLabel()}</button>
          </div>
          <pre class="hljs"><code class="language-${safeLanguage}">${highlighted}</code></pre>
        </div>
      `;
    };

    marked.setOptions({
      renderer: v03Renderer,
      gfm: true,
      breaks: true,
      langPrefix: 'hljs language-'
    });
  }

  function writeTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        copied ? resolve() : reject(new Error('复制命令不可用'));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  window.copyCode = function copyCode(btn) {
    const codeBlock = btn.closest('.code-block-container')?.querySelector('code');
    if (!codeBlock) return;

    const originalText = btn.textContent;
    writeTextToClipboard(codeBlock.textContent).then(() => {
      btn.textContent = getCodeCopyLabel(true);
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('copied');
      }, 1800);
    }).catch(err => {
      console.error('复制代码失败', err);
    });
  };

  function scrollChatToBottom(behavior = 'smooth') {
    if (!chatContainer) return;
    requestAnimationFrame(() => {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior
      });
    });
  }

  window.scrollChatToBottom = scrollChatToBottom;

  function getSessionDefaultTitleV03() {
    const langPack = typeof translations !== 'undefined' ? translations[getLang()] : null;
    return langPack?.newSession || '新建会话';
  }

  function isDefaultSessionTitleV03(title) {
    return !title || title === '新会话' || title === '新建会话' || title === 'New Chat';
  }

  function getSessionDisplayTitleV03(session, index) {
    if (isDefaultSessionTitleV03(session?.title)) {
      return getSessionDefaultTitleV03();
    }
    return session.title || `${getSessionDefaultTitleV03()} ${index + 1}`;
  }

  function getSessionShortTitleV03(title, index) {
    const normalizedTitle = (title || '').trim();
    if (!normalizedTitle) return String(index + 1);
    if (normalizedTitle === 'New Chat') return 'Ne';
    if (normalizedTitle === '新建会话' || normalizedTitle === '新会话') return '新';
    return Array.from(normalizedTitle).slice(0, 2).join('') || String(index + 1);
  }

  window.getCurrentChatHistory = function getCurrentChatHistory() {
    return chatSessions[currentSessionId]?.history || [];
  };

  window.setCurrentChatHistory = function setCurrentChatHistory(history) {
    if (chatSessions[currentSessionId]) {
      chatSessions[currentSessionId].history = history;
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
  };

  window.appendMessageToSession = function appendMessageToSession(sessionId, messageEntry) {
    if (!sessionId || !chatSessions[sessionId]) return;

    const session = chatSessions[sessionId];
    session.history = Array.isArray(session.history) ? session.history : [];
    session.history.push(messageEntry);

    if (messageEntry.isUser && isDefaultSessionTitleV03(session.title)) {
      session.title = messageEntry.content.slice(0, 18) || getSessionDefaultTitleV03();
    }

    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));

    if (sessionId === currentSessionId) {
      chatHistory = session.history;
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    renderSessionList();
  };

  window.renderChatHistory = function renderChatHistory() {
    if (!chatContainer) return;

    chatContainer.innerHTML = '';
    chatHistory = getCurrentChatHistory();
    chatHistory.forEach(item => {
      addMessage(item.content, item.isUser);
    });
  };

  window.renderSessionList = function renderSessionList() {
    const sessionList = document.getElementById('sessionList');
    if (!sessionList) return;

    sessionList.innerHTML = '';
    Object.entries(chatSessions).forEach(([id, session], index) => {
      const displayTitle = getSessionDisplayTitleV03(session, index);
      const item = document.createElement('div');
      item.className = `session-item${id === currentSessionId ? ' active' : ''}`;
      item.title = displayTitle;
      item.dataset.short = getSessionShortTitleV03(displayTitle, index);
      item.onclick = () => switchSession(id);

      const title = document.createElement('span');
      title.className = 'session-title';
      title.textContent = displayTitle;

      const renameBtn = document.createElement('button');
      renameBtn.type = 'button';
      renameBtn.title = translations?.[getLang()]?.renameSession || '重命名';
      renameBtn.textContent = '✎';
      renameBtn.onclick = (event) => {
        event.stopPropagation();
        renameSessionPrompt(id);
      };

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.title = translations?.[getLang()]?.deleteSession || '删除';
      deleteBtn.textContent = '×';
      deleteBtn.onclick = (event) => {
        event.stopPropagation();
        deleteSession(id);
      };

      item.appendChild(title);
      item.appendChild(renameBtn);
      item.appendChild(deleteBtn);
      sessionList.appendChild(item);
    });
  };

  window.createNewSession = function createNewSession() {
    const id = 'session_' + Date.now();
    chatSessions[id] = { title: getSessionDefaultTitleV03(), history: [] };
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    switchSession(id);
  };

  window.switchSession = function switchSession(id) {
    currentSessionId = id;
    localStorage.setItem('currentSessionId', id);
    renderChatHistory();
    renderSessionList();
    scrollChatToBottom('auto');
  };

  window.deleteSession = function deleteSession(id) {
    delete chatSessions[id];
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));

    if (currentSessionId === id) {
      const keys = Object.keys(chatSessions);
      if (keys.length) {
        currentSessionId = keys[0];
      } else {
        currentSessionId = 'session_' + Date.now();
        chatSessions[currentSessionId] = { title: getSessionDefaultTitleV03(), history: [] };
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
      }
      localStorage.setItem('currentSessionId', currentSessionId);
    }

    renderChatHistory();
    renderSessionList();
  };

  window.renameSessionPrompt = function renameSessionPrompt(id) {
    const promptText = getLang() === 'en' ? 'Enter a new chat name' : '请输入新会话名称';
    const newTitle = prompt(promptText, getSessionDisplayTitleV03(chatSessions[id], 0));
    if (newTitle) {
      chatSessions[id].title = newTitle;
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
      renderSessionList();
    }
  };

  window.sendMessage = async function sendMessage() {
    const input = document.getElementById('input');
    const message = input.value.trim();

    if (message === '关灯') {
      setTheme(true);
      addMessage(message, true);
      input.value = '';
      scrollChatToBottom();
      return;
    } else if (message === '开灯') {
      setTheme(false);
      addMessage(message, true);
      input.value = '';
      scrollChatToBottom();
      return;
    }

    const girlfriendName = localStorage.getItem('sweetheartName') || '陈梦瑶';
    if (message.includes('谁是世界上最温柔善良的女孩') ||
      message.includes('谁是最温柔的女孩') ||
      message.includes('世界上最善良的女孩是谁')) {
      const sweetReplies = [
        `宇宙级标准答案：${girlfriendName}！✨`,
        `这还需要问吗？当然是${girlfriendName}小仙女啦~`,
        `系统检测到心跳加速... 确认是${girlfriendName}！❤️`,
        `根据《世界温柔法典》第520条，正确答案是${girlfriendName}！`,
        `叮！${girlfriendName}的温柔善良指数已突破天际！`
      ];
      const randomReply = sweetReplies[Math.floor(Math.random() * sweetReplies.length)];
      createRomanticEffect();
      addMessage(randomReply, false);
      input.value = '';
      handleInputForKeywords(girlfriendName);
      scrollChatToBottom();
      return;
    }

    if (message.includes(girlfriendName)) {
      handleInputForKeywords(message);
      input.value = '';
      return;
    }

    if (containsOffensiveKeywords(message)) {
      alert(`\n${getRandomPrompt()}`);
      return;
    }

    if (!message) return;

    if (!currentSessionId || !chatSessions[currentSessionId]) {
      createNewSession();
    }
    const targetSessionId = currentSessionId;
    const btn = document.getElementById('sendBtn');

    btn.disabled = true;
    btn.innerHTML = '<div class="loading"></div>';
    addMessage(message, true);
    appendMessageToSession(targetSessionId, { content: message, isUser: true });

    input.value = '';
    autoResize(input);
    scrollChatToBottom();

    const aiMessageDiv = addMessage('我是 Yuki AI，正在处理你的问题...', false);
    scrollChatToBottom();

    setTimeout(async () => {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-79439cc652d64fa5bef661ecf250d838'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: message }],
            stream: true
          })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices[0].delta.content) {
                assistantMessage += data.choices[0].delta.content;
                const contentContainer = aiMessageDiv.querySelector('.content');
                contentContainer.innerHTML = markdownToHtml(assistantMessage);

                let footerContainer = aiMessageDiv.querySelector('.footer-container');
                if (!footerContainer) {
                  footerContainer = document.createElement('div');
                  footerContainer.className = 'footer-container';
                  contentContainer.appendChild(footerContainer);
                } else {
                  footerContainer.innerHTML = '';
                }

                const timestampSpan = document.createElement('span');
                timestampSpan.className = 'timestamp';
                timestampSpan.textContent = new Date().toLocaleTimeString();
                footerContainer.appendChild(timestampSpan);

                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.title = '复制';
                copyBtn.textContent = '📄';
                copyBtn.addEventListener('click', () => {
                  copyToClipboard(assistantMessage.replace(/'/g, "\\'"));
                });
                footerContainer.appendChild(copyBtn);

                const speakBtn = document.createElement('button');
                speakBtn.className = 'speak-btn';
                speakBtn.title = '朗读';
                speakBtn.textContent = isSpeaking ? '🔇' : '🔊';
                speakBtn.addEventListener('click', () => {
                  speakText(assistantMessage.replace(/'/g, "\\'"));
                });
                footerContainer.appendChild(speakBtn);

                scrollChatToBottom();
              }
            } catch (e) {
              console.error('解析返回数据错误:', e);
            }
          }
        }

        appendMessageToSession(targetSessionId, { content: assistantMessage, isUser: false });
        if (currentSessionId === targetSessionId && !document.body.contains(aiMessageDiv)) {
          renderChatHistory();
          scrollChatToBottom('auto');
        }
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = '请求出错，请稍后再试';
        aiMessageDiv.querySelector('.content').innerText = errorMessage;
        appendMessageToSession(targetSessionId, { content: errorMessage, isUser: false });
        if (currentSessionId === targetSessionId && !document.body.contains(aiMessageDiv)) {
          renderChatHistory();
          scrollChatToBottom('auto');
        }
      }

      btn.disabled = false;
      btn.textContent = translations?.[getLang()]?.send || '发送';
    }, 0);
  };

  function setupAnnouncementV03() {
    const announcement = document.getElementById('announcement');
    if (!announcement) return;

    announcement.querySelectorAll('.announcement-date').forEach(item => item.remove());
    updateLanguage(getLang());

    const dateElement = document.createElement('p');
    dateElement.className = 'announcement-date';
    dateElement.textContent = getLang() === 'en'
      ? 'Release date: 2026-05-30'
      : '发布日期：2026-05-30';
    announcement.querySelector('h2')?.insertAdjacentElement('afterend', dateElement);

    announcement.style.display = localStorage.getItem(VERSION_KEY) ? 'none' : 'block';
  }

  window.closeAnnouncement = function closeAnnouncement() {
    const announcement = document.getElementById('announcement');
    if (announcement) {
      announcement.style.display = 'none';
    }
    localStorage.setItem(VERSION_KEY, true);
  };

  const originalUpdateLanguage = window.updateLanguage;
  window.updateLanguage = function updateLanguageV03(lang) {
    if (typeof originalUpdateLanguage === 'function') {
      originalUpdateLanguage(lang);
    }
    if (typeof setTheme === 'function') {
      setTheme(document.body.getAttribute('data-theme') === 'dark');
    }
    if (typeof renderSessionList === 'function') {
      renderSessionList();
    }
    document.querySelectorAll('.copy-code-btn:not(.copied)').forEach(btn => {
      btn.textContent = getCodeCopyLabel();
    });
    document.querySelectorAll('.announcement-date').forEach(item => {
      item.textContent = lang === 'en' ? 'Release date: 2026-05-30' : '发布日期：2026-05-30';
    });
  };

  extendTranslations();
  setupMarkdownRenderer();
  setupAnnouncementV03();
  renderSessionList();
})();

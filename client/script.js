/**
 * AI CHATBOT — Frontend Interactive Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------------------
  // 1. DOM Element References
  // ---------------------------------------------------------------------------
  const chatContainer = document.getElementById('chatContainer');
  const messageList = document.getElementById('messageList');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const typingIndicator = document.getElementById('typingIndicator');
  
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const sendIcon = sendBtn.querySelector('.send-icon');
  const btnSpinner = sendBtn.querySelector('.btn-spinner');
  
  const charCounter = document.getElementById('charCounter');
  const modelSelect = document.getElementById('modelSelect');
  const micBtn = document.getElementById('micBtn');
  const ttsToggleBtn = document.getElementById('ttsToggleBtn');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const exportChatBtn = document.getElementById('exportChatBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const toastContainer = document.getElementById('toastContainer');

  // ---------------------------------------------------------------------------
  // 2. Application State
  // ---------------------------------------------------------------------------
  let conversationHistory = []; // [{ role: 'user'|'assistant', content: string, timestamp: string }]
  let isTTSOn = false;
  let isRecording = false;
  let speechRecognition = null;
  let lastUserMessage = '';

  // ---------------------------------------------------------------------------
  // 3. Theme Management (Dark / Light Mode)
  // ---------------------------------------------------------------------------
  const initTheme = () => {
    const savedTheme = localStorage.getItem('chatbot_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('chatbot_theme', newTheme);
    updateThemeIcons(newTheme);
    showToast(`Switched to ${newTheme} theme`);
  };

  const updateThemeIcons = (theme) => {
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');
    if (theme === 'light') {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  };

  // ---------------------------------------------------------------------------
  // 4. Input Field Utilities & Auto-Resizing
  // ---------------------------------------------------------------------------
  const adjustTextareaHeight = () => {
    userInput.style.height = '24px';
    const computedHeight = Math.max(24, Math.min(userInput.scrollHeight, 140));
    userInput.style.height = `${computedHeight}px`;
  };

  const updateCharCounter = () => {
    const len = userInput.value.length;
    charCounter.textContent = `${len} / 4000`;
    if (len >= 3800) {
      charCounter.style.color = '#ef4444';
    } else {
      charCounter.style.color = '';
    }
  };

  userInput.addEventListener('input', () => {
    adjustTextareaHeight();
    updateCharCounter();
  });

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatForm.requestSubmit) {
        chatForm.requestSubmit();
      } else {
        chatForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 5. Message Rendering & Formatting
  // ---------------------------------------------------------------------------
  const formatTimestamp = (date = new Date()) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Lightweight Syntax Highlighter for code blocks
  const highlightSyntax = (code, lang = '') => {
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const l = (lang || '').toLowerCase().trim();

    try {
      if (['js', 'javascript', 'ts', 'typescript', 'json', 'python', 'py', 'html', 'css', 'bash', 'sh', 'sql', 'cpp', 'c', 'java'].includes(l)) {
        const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|if|else|for|while|import|export|from|class|extends|async|await|try|catch|finally|throw|new|this|typeof|instanceof|def|self|None|True|False|elif|with|as|pass|raise|lambda|select|from|where|insert|into|update|delete|table|create|drop|alter|join|group|by|order|public|private|static|void|int|string|boolean|char|double|float|struct|namespace|using|include)\b)|(\b\d+(?:\.\d+)?\b)|(\b(?:true|false|null|undefined|NaN)\b)/g;

        escaped = escaped.replace(tokenRegex, (match, comment, string, keyword, number, bool) => {
          if (comment) return `<span class="tok-comment">${comment}</span>`;
          if (string) return `<span class="tok-string">${string}</span>`;
          if (keyword) return `<span class="tok-keyword">${keyword}</span>`;
          if (number) return `<span class="tok-number">${number}</span>`;
          if (bool) return `<span class="tok-bool">${bool}</span>`;
          return match;
        });
      }
    } catch (e) {
      console.warn('Syntax highlight fallback:', e);
    }

    return escaped;
  };

  // Markdown Renderer with ChatGPT-Style Code Boxes
  const renderMarkdown = (text) => {
    if (!text) return '';

    const codeBlocks = [];

    // Extract code blocks with triple backticks ```lang \n code ```
    let processedText = text.replace(/```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g, (match, langMatch, codeContent) => {
      const lang = langMatch.trim() || 'code';
      const rawCode = codeContent.trim();
      const highlighted = highlightSyntax(rawCode, lang);
      const encodedCode = encodeURIComponent(rawCode);

      const codeBoxHtml = `
        <div class="code-box-container">
          <div class="code-box-header">
            <div class="code-box-lang-wrapper">
              <svg class="code-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              <span class="code-box-lang">${lang.toLowerCase()}</span>
            </div>
            <button class="code-copy-btn" data-code="${encodedCode}" title="Copy code" aria-label="Copy code">
              <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <svg class="check-icon hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="copy-btn-text">Copy code</span>
            </button>
          </div>
          <div class="code-box-body">
            <pre><code class="language-${lang.toLowerCase()}">${highlighted}</code></pre>
          </div>
        </div>
      `;

      const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`;
      codeBlocks.push(codeBoxHtml);
      return placeholder;
    });

    // Escape HTML tag chars in remaining non-code text to prevent XSS
    processedText = processedText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Inline code `code`
    processedText = processedText.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold **text**
    processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    processedText = processedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Bullet points (- or *)
    processedText = processedText.replace(/^\s*[-*]\s+(.*)$/gm, '<ul><li>$1</li></ul>');
    processedText = processedText.replace(/<\/ul>\s*<ul>/g, ''); // Join consecutive list items

    // Convert line breaks to <br>
    let htmlLines = processedText.split('\n').map(line => {
      if (line.startsWith('___CODE_BLOCK_') || line.startsWith('<ul>') || line.startsWith('<li>')) {
        return line;
      }
      return line + '<br>';
    }).join('');

    // Restore Code Blocks
    codeBlocks.forEach((codeHtml, idx) => {
      const placeholderWithBr = `___CODE_BLOCK_${idx}___<br>`;
      const placeholder = `___CODE_BLOCK_${idx}___`;
      htmlLines = htmlLines.replace(placeholderWithBr, codeHtml).replace(placeholder, codeHtml);
    });

    return htmlLines;
  };

  const appendMessage = (role, text, timestamp = formatTimestamp()) => {
    // Hide welcome screen on first message
    if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
      welcomeScreen.classList.add('hidden');
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${role}-wrapper`;
    wrapper.id = messageId;

    const isUser = role === 'user';
    const avatar = isUser ? 'YOU' : '🤖';

    const formattedContent = isUser 
      ? text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
      : renderMarkdown(text);

    wrapper.innerHTML = `
      <div class="avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}" aria-hidden="true">${avatar}</div>
      <div class="bubble-container">
        <div class="bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}">
          ${formattedContent}
        </div>
        <div class="message-meta">
          <span class="msg-time">${timestamp}</span>
          ${!isUser ? `
            <button class="msg-action-btn copy-btn" data-text="${encodeURIComponent(text)}" title="Copy text">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy
            </button>
            <button class="msg-action-btn speak-btn" data-text="${encodeURIComponent(text)}" title="Speak aloud">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
              Speak
            </button>
          ` : `
            <button class="msg-action-btn retry-btn" data-text="${encodeURIComponent(text)}" title="Retry message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              Retry
            </button>
          `}
        </div>
      </div>
    `;

    messageList.appendChild(wrapper);
    scrollToBottom();

    // Attach listeners for code box copy buttons inside message
    wrapper.querySelectorAll('.code-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rawCode = decodeURIComponent(btn.getAttribute('data-code'));
        navigator.clipboard.writeText(rawCode).then(() => {
          const copyIcon = btn.querySelector('.copy-icon');
          const checkIcon = btn.querySelector('.check-icon');
          const btnText = btn.querySelector('.copy-btn-text');

          btn.classList.add('copied');
          if (copyIcon) copyIcon.classList.add('hidden');
          if (checkIcon) checkIcon.classList.remove('hidden');
          if (btnText) btnText.textContent = 'Copied!';

          setTimeout(() => {
            btn.classList.remove('copied');
            if (copyIcon) copyIcon.classList.remove('hidden');
            if (checkIcon) checkIcon.classList.add('hidden');
            if (btnText) btnText.textContent = 'Copy code';
          }, 2000);
        }).catch(err => {
          showToast('Failed to copy code to clipboard', true);
        });
      });
    });

    // Attach listener for dynamic buttons inside message
    const copyBtn = wrapper.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const rawText = decodeURIComponent(copyBtn.getAttribute('data-text'));
        navigator.clipboard.writeText(rawText).then(() => showToast('Copied message to clipboard!'));
      });
    }

    const speakBtn = wrapper.querySelector('.speak-btn');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        const rawText = decodeURIComponent(speakBtn.getAttribute('data-text'));
        speakText(rawText);
      });
    }

    const retryBtn = wrapper.querySelector('.retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const rawText = decodeURIComponent(retryBtn.getAttribute('data-text'));
        userInput.value = rawText;
        userInput.focus();
        if (chatForm.requestSubmit) {
          chatForm.requestSubmit();
        } else {
          chatForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      });
    }

    // Save to conversation state
    conversationHistory.push({ role, content: text, timestamp });

    // Trigger TTS if enabled and message is from assistant
    if (!isUser && isTTSOn) {
      speakText(text);
    }
  };

  const scrollToBottom = () => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  // ---------------------------------------------------------------------------
  // 6. Loading State & Sending Messages to Express Backend
  // ---------------------------------------------------------------------------
  const setLoadingState = (loading) => {
    if (loading) {
      sendBtn.disabled = true;
      userInput.disabled = true;
      sendIcon.classList.add('hidden');
      btnSpinner.classList.remove('hidden');
      typingIndicator.classList.remove('hidden');
      scrollToBottom();
    } else {
      sendBtn.disabled = false;
      userInput.disabled = false;
      sendIcon.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
      typingIndicator.classList.add('hidden');
      userInput.focus();
    }
  };

  const sendChatMessage = async (prompt) => {
    lastUserMessage = prompt;
    appendMessage('user', prompt);
    setLoadingState(true);

    try {
      const selectedModel = modelSelect.value;

      // Make API Request to server backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          model: selectedModel,
          history: conversationHistory.slice(-6) // Send recent context
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      // Successful AI Response
      appendMessage('assistant', data.message);

    } catch (error) {
      console.warn('API Endpoint request failed or offline:', error.message);
      
      // Check if backend server is unreachable (Client-side offline fallback simulation)
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        const fallbackResponse = `🤖 **Offline Preview Mode**\n\nI received your prompt: "${prompt}".\n\n*Note: The Node.js Express server is currently offline or unreachable at \`/api/chat\`.* Start the server using \`npm run start\` to connect live AI models!`;
        appendMessage('assistant', fallbackResponse);
        showToast('Server offline - Running in preview mode', true);
      } else {
        // Real API Error
        appendMessage('assistant', `⚠️ **Error:** ${error.message}`);
        showToast(error.message, true);
      }
    } finally {
      setLoadingState(false);
    }
  };

  // Form Submit Handler
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const prompt = userInput.value.trim();
    if (!prompt) return;

    // Reset input
    userInput.value = '';
    userInput.style.height = 'auto';
    updateCharCounter();

    // Send Message
    sendChatMessage(prompt);
  });

  // ---------------------------------------------------------------------------
  // 7. Quick Prompt Chips
  // ---------------------------------------------------------------------------
  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      if (promptText) {
        sendChatMessage(promptText);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Voice Recognition (Speech-to-Text) & Text-to-Speech (TTS)
  // ---------------------------------------------------------------------------
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      micBtn.style.display = 'none';
      return;
    }

    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = 'en-US';

    speechRecognition.onstart = () => {
      isRecording = true;
      micBtn.classList.add('recording');
      showToast('Listening... Speak now.');
    };

    speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = (userInput.value ? userInput.value + ' ' : '') + transcript;
      adjustTextareaHeight();
      updateCharCounter();
      userInput.focus();
    };

    speechRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      showToast(`Speech recognition error: ${event.error}`, true);
      stopRecording();
    };

    speechRecognition.onend = () => {
      stopRecording();
    };
  };

  const stopRecording = () => {
    isRecording = false;
    micBtn.classList.remove('recording');
  };

  micBtn.addEventListener('click', () => {
    if (!speechRecognition) {
      showToast('Speech recognition is not supported in your browser.', true);
      return;
    }
    if (isRecording) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
    }
  });

  // Text to Speech Function
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported in your browser.', true);
      return;
    }
    window.speechSynthesis.cancel(); // Stop active speech

    // Strip HTML tags before speaking
    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/```[\s\S]*?```/g, 'Code block snippet.');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  ttsToggleBtn.addEventListener('click', () => {
    isTTSOn = !isTTSOn;
    const offIcon = ttsToggleBtn.querySelector('.tts-off');
    const onIcon = ttsToggleBtn.querySelector('.tts-on');
    
    if (isTTSOn) {
      offIcon.classList.add('hidden');
      onIcon.classList.remove('hidden');
      ttsToggleBtn.classList.add('active');
      showToast('Auto Read-Aloud Enabled');
    } else {
      offIcon.classList.remove('hidden');
      onIcon.classList.add('hidden');
      ttsToggleBtn.classList.remove('active');
      window.speechSynthesis?.cancel();
      showToast('Auto Read-Aloud Disabled');
    }
  });

  // ---------------------------------------------------------------------------
  // 9. Extra Features (Clear Chat & Export Chat)
  // ---------------------------------------------------------------------------
  clearChatBtn.addEventListener('click', () => {
    if (conversationHistory.length === 0) {
      showToast('Chat is already empty.');
      return;
    }
    if (confirm('Are you sure you want to clear the conversation history?')) {
      conversationHistory = [];
      messageList.innerHTML = '';
      if (welcomeScreen) welcomeScreen.classList.remove('hidden');
      showToast('Conversation cleared');
    }
  });

  exportChatBtn.addEventListener('click', () => {
    if (conversationHistory.length === 0) {
      showToast('No messages to export.', true);
      return;
    }

    let exportContent = `AI CHATBOT — Conversation Export\nExported on: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;

    conversationHistory.forEach((msg, idx) => {
      const roleName = msg.role === 'user' ? 'USER' : 'AI CHATBOT';
      exportContent += `[${msg.timestamp}] ${roleName}:\n${msg.content}\n\n${'-'.repeat(40)}\n\n`;
    });

    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_export_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Conversation exported as .txt');
  });

  // ---------------------------------------------------------------------------
  // 10. Toast Notification System
  // ---------------------------------------------------------------------------
  const showToast = (message, isError = false) => {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <span>${isError ? '⚠️' : 'ℹ️'}</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // ---------------------------------------------------------------------------
  // 11. Initializations
  // ---------------------------------------------------------------------------
  initTheme();
  initSpeechRecognition();
  adjustTextareaHeight();
  updateCharCounter();
  themeToggleBtn.addEventListener('click', toggleTheme);
  userInput.focus();
});

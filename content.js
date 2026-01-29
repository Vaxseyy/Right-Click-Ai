/* ===============================
   RIGHT CLICK AI - COMPLETE EXTENSION
   Enhanced with Interactive Features
   Version: 2.0
================================ */

let lastRightClick = 0;
let chatHistory = [];
let currentConversation = [];
let lastSelectedText = '';
let starredItems = [];
let pageContext = {
  url: window.location.href,
  title: document.title,
  selectedText: '',
  pageContent: '',
  timestamp: new Date().toISOString()
};

/* ===============================
   SELECTION TRACKING SYSTEM
   Captures selection BEFORE contextmenu fires
   This is critical for proper text detection
================================ */
function updateCachedSelection() {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text.length > 0) {
    lastSelectedText = text;
    console.log('[Selection Cache] Updated:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
  }
}

// Multiple event listeners to ensure we catch all selection methods
document.addEventListener('selectionchange', updateCachedSelection);
document.addEventListener('mouseup', () => {
  setTimeout(updateCachedSelection, 10);
});
document.addEventListener('keyup', (e) => {
  if (e.shiftKey || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    setTimeout(updateCachedSelection, 10);
  }
});

/* ===============================
   PAGE CONTEXT EXTRACTION
   Extracts meaningful content from the current page
================================ */
function extractPageContext() {
  const content = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, article, section'))
    .map(el => el.textContent.trim())
    .filter(text => text.length > 10)
    .join('\n')
    .slice(0, 8000);

  const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
  const metaKeywords = document.querySelector('meta[name="keywords"]')?.content || '';

  pageContext = {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    pageContent: content,
    metaDescription: metaDescription,
    metaKeywords: metaKeywords,
    timestamp: new Date().toISOString()
  };
  
  console.log('[Page Context] Extracted:', {
    title: pageContext.title,
    contentLength: content.length,
    domain: pageContext.domain
  });
}

// Initial extraction and periodic updates
extractPageContext();
setInterval(extractPageContext, 30000);

/* ===============================
   ICON LIBRARY
   SVG icons for UI elements
================================ */
const ICONS = {
  ask: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  notes: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  flashcard: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
  fix_grammar: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>',
  tone: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  rewrite: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>',
  simplify: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>',
  explain: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>',
  summarize: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>',
  quiz: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',
  user: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
  sparkles: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>',
  copy: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
  star: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>',
  history: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  trash: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>',
  close: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
  send: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>'
};

/* ===============================
   COMPREHENSIVE STYLING SYSTEM
   Modern glass-morphism design with purposeful animations
================================ */
const style = document.createElement('style');
style.textContent = `
  /* CSS Variables for Consistent Theming */
  :root {
    --glass-bg: rgba(20, 20, 20, 0.85);
    --glass-border: rgba(255, 255, 255, 0.08);
    --glass-hover: rgba(255, 255, 255, 0.1);
    --glass-text: #ececf1;
    --glass-secondary: #9fa6ad;
    --glass-accent: #10a37f;
    --glass-red: #ef4444;
    --glass-green: #10b981;
    --glass-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --transition-fast: 120ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Animation Keyframes - Fast and Purposeful */
  @keyframes slideIn {
    from { 
      transform: translateX(-8px); 
      opacity: 0; 
    }
    to { 
      transform: translateX(0); 
      opacity: 1; 
    }
  }

  @keyframes fadeIn {
    from { 
      opacity: 0; 
    }
    to { 
      opacity: 1; 
    }
  }

  @keyframes flipCard {
    0% { 
      transform: rotateY(0deg); 
    }
    100% { 
      transform: rotateY(180deg); 
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Main Container Styles */
  .chat-ui-container {
    font-family: var(--glass-font);
    background: var(--glass-bg) !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
    border: 1px solid var(--glass-border) !important;
    color: var(--glass-text) !important;
    box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.4) !important;
    animation: scaleIn var(--transition-fast);
  }

  /* Menu Item Styles */
  .chat-menu-item {
    padding: 8px 12px !important;
    margin: 2px 4px !important;
    border-radius: 6px !important;
    cursor: pointer;
    font-size: 13px !important;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background var(--transition-fast);
    position: relative;
  }

  .chat-menu-item:hover {
    background: var(--glass-hover) !important;
  }

  .chat-menu-item:active {
    transform: scale(0.98);
  }

  /* Brand Pill */
  .chat-brand-pill {
    background: var(--glass-accent);
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Section Labels */
  .chat-menu-section-label {
    padding: 6px 12px 2px;
    font-size: 10px;
    font-weight: 600;
    color: var(--glass-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
  }

  /* Submenu Styles */
  .chat-submenu {
    display: none;
    position: absolute;
    left: 98%;
    top: -6px;
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    padding: 4px 0;
    width: 190px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.5);
    z-index: 1000000;
    animation: slideIn var(--transition-fast);
  }

  .chat-submenu::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 0;
    bottom: 0;
    width: 10px;
  }

  .chat-menu-item:hover > .chat-submenu,
  .chat-submenu:hover {
    display: block;
  }

  .chat-menu-arrow {
    margin-left: auto;
    font-size: 10px;
    opacity: 0.5;
  }

  /* Message Styles */
  .chat-message {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    animation: fadeIn var(--transition-fast);
  }

  .chat-message.user {
    flex-direction: row-reverse;
  }

  .chat-avatar {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  .chat-avatar.user {
    background: #333;
  }

  .chat-avatar.ai {
    background: var(--glass-accent);
  }

  .chat-content {
    flex: 1;
    line-height: 1.6;
    font-size: 14px;
  }

  .chat-content code {
    background: rgba(255,255,255,0.1);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
  }

  .chat-content pre {
    background: rgba(0,0,0,0.3);
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 8px 0;
    border: 1px solid var(--glass-border);
  }

  .chat-content strong {
    color: var(--glass-text);
    font-weight: 600;
  }

  /* Input Styles */
  .chat-input-container {
    padding: 12px;
    border-top: 1px solid var(--glass-border);
    background: rgba(0,0,0,0.2);
  }

  .chat-input {
    width: 100%;
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    padding: 10px 12px;
    color: var(--glass-text);
    font-family: var(--glass-font);
    font-size: 14px;
    resize: none;
    outline: none;
    transition: border-color var(--transition-fast), background var(--transition-fast);
  }

  .chat-input:focus {
    border-color: var(--glass-accent);
    background: rgba(0,0,0,0.5);
  }

  .chat-input::placeholder {
    color: var(--glass-secondary);
    opacity: 0.6;
  }

  /* Button Styles */
  .chat-send-btn {
    background: var(--glass-accent);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    margin-top: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .chat-send-btn:hover {
    opacity: 0.9;
  }

  .chat-send-btn:active {
    transform: scale(0.98);
  }

  .chat-send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Typing Indicator */
  .typing-indicator {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  .typing-dot {
    width: 6px;
    height: 6px;
    background: var(--glass-secondary);
    border-radius: 50%;
    animation: pulse 1.4s infinite;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  /* Tab Styles */
  .chat-tabs {
    display: flex;
    border-bottom: 1px solid var(--glass-border);
    margin-bottom: 8px;
  }

  .chat-tab {
    padding: 10px 16px;
    cursor: pointer;
    font-size: 13px;
    color: var(--glass-secondary);
    border-bottom: 2px solid transparent;
    transition: all var(--transition-fast);
    user-select: none;
  }

  .chat-tab:hover {
    color: var(--glass-text);
  }

  .chat-tab.active {
    color: var(--glass-text);
    border-bottom-color: var(--glass-accent);
    font-weight: 500;
  }

  /* Scrollbar Styles */
  .chat-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .chat-scroll::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 10px;
  }

  .chat-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.3);
  }

  /* Interactive Card Styles */
  .interactive-card {
    background: rgba(0,0,0,0.2);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
    position: relative;
    animation: fadeIn var(--transition-fast);
  }

  /* Quiz Option Styles */
  .quiz-option {
    padding: 8px 12px;
    margin: 4px 0;
    background: rgba(255,255,255,0.05);
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all var(--transition-fast);
    user-select: none;
  }

  .quiz-option:hover {
    background: rgba(255,255,255,0.1);
  }

  .quiz-option:active {
    transform: scale(0.98);
  }

  .quiz-option.correct {
    background: rgba(16, 163, 127, 0.2);
    border-color: var(--glass-green);
    cursor: default;
  }

  .quiz-option.incorrect {
    background: rgba(239, 68, 68, 0.2);
    border-color: var(--glass-red);
  }

  .quiz-option.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Diff View Styles */
  .diff-view {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    font-size: 12px;
  }

  .diff-panel {
    padding: 8px;
    background: rgba(0,0,0,0.3);
    border-radius: 4px;
    border: 1px solid var(--glass-border);
  }

  .diff-label {
    font-size: 10px;
    color: var(--glass-secondary);
    margin-bottom: 4px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  /* Flashcard Styles */
  .flashcard {
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    padding: 24px;
    margin: 8px 0;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    transition: transform var(--transition-fast), background var(--transition-fast);
    position: relative;
    user-select: none;
  }

  .flashcard:hover {
    transform: scale(1.02);
  }

  .flashcard:active {
    transform: scale(0.98);
  }

  .flashcard.flipped {
    background: rgba(16, 163, 127, 0.1);
    border-color: var(--glass-accent);
  }

  .flashcard-front,
  .flashcard-back {
    font-size: 16px;
    line-height: 1.5;
  }

  .flashcard-front {
    font-weight: 600;
  }

  /* Action Bar Styles */
  .action-bar {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .action-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--glass-border);
    border-radius: 6px;
    padding: 6px 12px;
    color: var(--glass-text);
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all var(--transition-fast);
    user-select: none;
  }

  .action-btn:hover {
    background: rgba(255,255,255,0.1);
  }

  .action-btn:active {
    transform: scale(0.98);
  }

  .action-btn.active {
    background: var(--glass-accent);
    color: white;
    border-color: var(--glass-accent);
  }

  /* Star Button Styles */
  .star-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.5;
    transition: all var(--transition-fast);
    padding: 4px;
    color: var(--glass-text);
  }

  .star-btn:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  .star-btn.starred {
    opacity: 1;
    color: #fbbf24;
  }

  /* History Item Styles */
  .history-item {
    padding: 12px;
    margin: 4px 0;
    border-radius: 6px;
    cursor: pointer;
    transition: all var(--transition-fast);
    border-left: 3px solid transparent;
    background: rgba(0,0,0,0.2);
    position: relative;
  }

  .history-item:hover {
    background: rgba(0,0,0,0.4);
    border-left-color: var(--glass-accent);
  }

  .history-item-title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--glass-text);
  }

  .history-item-preview {
    font-size: 11px;
    color: var(--glass-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-item-date {
    font-size: 10px;
    color: var(--glass-secondary);
    margin-top: 4px;
  }

  /* Empty State Styles */
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--glass-secondary);
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .empty-state-text {
    font-size: 14px;
  }

  /* Badge Styles */
  .context-badge {
    display: inline-block;
    background: rgba(16, 163, 127, 0.2);
    color: var(--glass-accent);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    margin-left: 8px;
  }

  /* Header Styles */
  .panel-header {
    padding: 10px 14px;
    background: rgba(255,255,255,0.02);
    border-bottom: 1px solid var(--glass-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
    user-select: none;
  }

  .panel-title {
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .panel-close {
    cursor: pointer;
    font-size: 18px;
    opacity: 0.6;
    transition: opacity var(--transition-fast);
    line-height: 1;
  }

  .panel-close:hover {
    opacity: 1;
  }

  /* Utility Classes */
  .no-drag {
    cursor: default !important;
  }

  .clickable {
    cursor: pointer;
  }

  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`;
document.head.appendChild(style);

/* ===============================
   LOCAL STORAGE MANAGEMENT
   Handles persistence of conversation history and starred items
================================ */
function loadHistory() {
  try {
    const savedHistory = localStorage.getItem('rightClickAI_history');
    const savedStarred = localStorage.getItem('rightClickAI_starred');
    
    if (savedHistory) {
      chatHistory = JSON.parse(savedHistory);
      console.log('[Storage] Loaded history:', chatHistory.length, 'conversations');
    }
    
    if (savedStarred) {
      starredItems = JSON.parse(savedStarred);
      console.log('[Storage] Loaded starred items:', starredItems.length);
    }
  } catch (error) {
    console.error('[Storage] Load error:', error);
    chatHistory = [];
    starredItems = [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem('rightClickAI_history', JSON.stringify(chatHistory));
    localStorage.setItem('rightClickAI_starred', JSON.stringify(starredItems));
    console.log('[Storage] Saved successfully');
  } catch (error) {
    console.error('[Storage] Save error:', error);
  }
}

// Initialize history on load
loadHistory();

/* ===============================
   CONTEXT MENU TRIGGER
   Detects double right-click to show menu
================================ */
document.addEventListener("contextmenu", (e) => {
  const now = Date.now();
  const timeDiff = now - lastRightClick;
  
  if (timeDiff < 350) {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Context Menu] Double right-click detected');
    console.log('[Context Menu] Selected text:', lastSelectedText.substring(0, 50));
    showMainMenu(e.clientX, e.clientY, e.target);
  }
  
  lastRightClick = now;
});

/* ===============================
   MAIN MENU DISPLAY
   Shows comprehensive menu with all options
================================ */
function showMainMenu(x, y, target) {
  // Remove any existing menu
  const existingMenu = document.getElementById("rc-ai-menu");
  if (existingMenu) {
    existingMenu.remove();
  }
  
  const hasSelection = lastSelectedText && lastSelectedText.length > 0;
  console.log('[Main Menu] Has selection:', hasSelection);
  
  const menu = document.createElement("div");
  menu.id = "rc-ai-menu";
  menu.className = "chat-ui-container";
  menu.style.cssText = `
    position: fixed;
    top: ${y}px;
    left: ${x}px;
    width: 220px;
    padding: 6px 0;
    border-radius: 8px;
    z-index: 999999;
    max-height: 80vh;
    overflow-y: auto;
  `;

  // Header
  const header = document.createElement("div");
  header.style.cssText = "padding:8px 12px;border-bottom:1px solid var(--glass-border);margin-bottom:4px;";
  header.innerHTML = `<span class="chat-brand-pill">AI</span> <span style="font-size:11px;font-weight:600;color:var(--glass-secondary)">Right Click AI</span>`;
  menu.appendChild(header);

  // Build action list
  const actions = [];

  // Always available
  actions.push({ 
    id: "ask", 
    label: "Ask about this page", 
    icon: ICONS.ask 
  });
  
  actions.push({ 
    id: "history", 
    label: "Conversation History", 
    icon: ICONS.history 
  });

  if (hasSelection) {
    // Writing section
    actions.push({ 
      type: 'header', 
      label: 'Writing' 
    });
    
    actions.push({ 
      id: "fix_grammar", 
      label: "Fix Grammar", 
      icon: ICONS.fix_grammar 
    });
    
    actions.push({ 
      id: "tone", 
      label: "Change Tone", 
      icon: ICONS.tone,
      submenu: [
        { id: "tone_professional", label: "Professional", icon: ICONS.tone },
        { id: "tone_casual", label: "Casual", icon: ICONS.tone },
        { id: "tone_confident", label: "Confident", icon: ICONS.tone },
        { id: "tone_persuasive", label: "Persuasive", icon: ICONS.tone }
      ]
    });
    
    actions.push({ 
      id: "rewrite", 
      label: "Rewrite", 
      icon: ICONS.rewrite,
      submenu: [
        { id: "rewrite_shorter", label: "Shorter", icon: ICONS.rewrite },
        { id: "rewrite_longer", label: "Longer", icon: ICONS.rewrite }
      ]
    });

    // Understanding section
    actions.push({ 
      type: 'header', 
      label: 'Understanding' 
    });
    
    actions.push({ 
      id: "simplify", 
      label: "Simplify", 
      icon: ICONS.simplify 
    });
    
    actions.push({ 
      id: "explain", 
      label: "Explain", 
      icon: ICONS.explain 
    });
    
    actions.push({ 
      id: "summarize", 
      label: "Summarize", 
      icon: ICONS.summarize 
    });
    
    actions.push({ 
      id: "generate_notes", 
      label: "Generate Notes", 
      icon: ICONS.notes 
    });
    
    actions.push({ 
      id: "flashcards", 
      label: "Create Flashcards", 
      icon: ICONS.flashcard 
    });
    
    actions.push({ 
      id: "quiz", 
      label: "Generate Quiz", 
      icon: ICONS.quiz 
    });
  }

  // Render actions
  actions.forEach(action => {
    if (action.type === 'header') {
      const label = document.createElement("div");
      label.className = "chat-menu-section-label";
      label.textContent = action.label;
      menu.appendChild(label);
      return;
    }

    const item = document.createElement("div");
    item.className = "chat-menu-item";
    
    let html = `<span style="opacity:0.8;display:flex;">${action.icon}</span> <span>${action.label}</span>`;
    
    if (action.submenu) {
      html += `<span class="chat-menu-arrow">▶</span>`;
    }
    
    item.innerHTML = html;
    
    if (action.submenu) {
      const submenu = document.createElement("div");
      submenu.className = "chat-submenu";
      
      action.submenu.forEach(subAction => {
        const subItem = document.createElement("div");
        subItem.className = "chat-menu-item";
        subItem.innerHTML = `<span style="opacity:0.8;display:flex;">${subAction.icon}</span> <span>${subAction.label}</span>`;
        
        subItem.onclick = (e) => {
          e.stopPropagation();
          menu.remove();
          handleAction(subAction.id);
        };
        
        submenu.appendChild(subItem);
      });
      
      item.appendChild(submenu);
    } else {
      item.onclick = (e) => {
        e.stopPropagation();
        menu.remove();
        handleAction(action.id);
      };
    }
    
    item.tabIndex = 0;
    item.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    };
    
    menu.appendChild(item);
  });

  document.body.appendChild(menu);

  // Prevent menu from going off-screen
  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    menu.style.left = (window.innerWidth - rect.width - 10) + "px";
  }
  if (rect.bottom > window.innerHeight) {
    menu.style.top = (window.innerHeight - rect.height - 10) + "px";
  }

  // Close menu when clicking outside
  const closeMenu = () => {
    menu.remove();
    document.removeEventListener("click", closeMenu);
  };
  
  setTimeout(() => {
    document.addEventListener("click", closeMenu);
  }, 10);
}

/* ===============================
   GEMINI AI API INTEGRATION
   Handles communication with Google's Gemini API
================================ */
const GEMINI_API_KEY = '';
const GEMINI_MODEL = 'gemini-2.5-flash';

async function callGeminiAPI(userMessage, conversationHistory = []) {
  console.log('[Gemini API] Making request...');
  
  const systemPrompt = `You are a helpful AI assistant integrated into a browser extension.

Current Page Context:
- Title: ${pageContext.title}
- URL: ${pageContext.url}
- Domain: ${pageContext.domain}
- Selected Text: "${pageContext.selectedText}"

Page Content Summary:
${pageContext.pageContent.slice(0, 2000)}

Provide helpful, accurate, and context-aware responses based on this information.`;

  const contents = [
    { 
      role: "user", 
      parts: [{ text: systemPrompt }] 
    },
    { 
      role: "model", 
      parts: [{ text: "I understand the page context and will provide helpful responses." }] 
    }
  ];

  // Add conversation history
  conversationHistory.forEach(msg => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  });

  // Add current user message
  contents.push({
    role: "user",
    parts: [{ text: userMessage }]
  });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('[Gemini API] Response received');
    return aiResponse;

  } catch (error) {
    console.error('[Gemini API] Error:', error);
    throw error;
  }
}

/* ===============================
   ACTION HANDLER
   Routes user actions to appropriate handlers
================================ */
async function handleAction(actionId) {
  console.log('[Action Handler] Action:', actionId);
  
  if (actionId === "history") {
    showConversationHistory();
    return;
  }
  
  const selectedText = lastSelectedText;
  
  if (!selectedText && actionId !== "ask") {
    alert("⚠️ No text selected!\n\nPlease highlight text on the page before using this action.");
    return;
  }
  
  pageContext.selectedText = selectedText || "(whole page)";
  currentConversation = [];
  
  // Clear cached selection after use
  if (selectedText) {
    lastSelectedText = '';
  }
  
  const textToProcess = selectedText || `Ask about: "${pageContext.title}"`;
  showFloatingPanel(actionId, textToProcess);
}

/* ===============================
   FLOATING PANEL
   Main UI panel for interactions
================================ */
function showFloatingPanel(action, text) {
  // Remove existing panel
  const existing = document.getElementById("rc-ai-panel");
  if (existing) {
    existing.remove();
  }
  
  const panel = document.createElement("div");
  panel.id = "rc-ai-panel";
  panel.className = "chat-ui-container";
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 560px;
    height: 600px;
    border-radius: 12px;
    z-index: 999999;
    display: flex;
    flex-direction: column;
  `;

  // Header
  const header = document.createElement("div");
  header.className = "panel-header";
  
  const title = document.createElement("span");
  title.className = "panel-title";
  title.innerHTML = `<span class="chat-brand-pill">AI</span> ${action.replace(/_/g, ' ').toUpperCase()}`;
  
  const closeBtn = document.createElement("span");
  closeBtn.className = "panel-close";
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => panel.remove();
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // Content area
  const content = document.createElement("div");
  content.style.cssText = "flex:1;overflow-y:auto;padding:16px;";
  content.className = "chat-scroll";
  content.id = "chat-content";
  panel.appendChild(content);

  document.body.appendChild(panel);
  makeDraggable(panel, header);

  // Process the action
  processAction(action, text, content);
}

/* ===============================
   DRAGGABLE FUNCTIONALITY
   Makes panels draggable
================================ */
function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (e.target.classList.contains('no-drag') || 
        e.target.closest('.no-drag')) {
      return;
    }
    
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    element.style.cursor = 'grabbing';
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    element.style.transform = "none";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    element.style.cursor = '';
  }
}

/* ===============================
   ACTION PROCESSOR
   Processes different action types
================================ */
async function processAction(action, text, container) {
  console.log('[Processor] Processing action:', action);
  
  const prompts = {
    quiz: `Create a 5-question multiple choice quiz based on this text: "${text}". 

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}`,

    flashcards: `Create 6 flashcards from this text: "${text}". 

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{"cards":[{"front":"Question/Term","back":"Answer/Definition"}]}`,

    generate_notes: `Create structured study notes from this text: "${text}". 

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{"title":"...","sections":[{"heading":"...","content":"...","keyPoints":["point 1","point 2"]}]}`,

    fix_grammar: `Fix all grammar errors in this text: "${text}". 

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{"original":"${text.slice(0, 100)}...","corrected":"...","changes":["change 1","change 2"]}`,

    tone_professional: `Rewrite this text in a professional tone: "${text}". 

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{"original":"${text.slice(0, 100)}...","rewritten":"...","changes":["change 1","change 2"]}`,

    tone_casual: `Rewrite this text in a casual, friendly tone: "${text}". 

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{"original":"${text.slice(0, 100)}...","rewritten":"...","changes":["change 1","change 2"]}`,

    tone_confident: `Rewrite this text in a confident, assertive tone: "${text}". 

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{"original":"${text.slice(0, 100)}...","rewritten":"...","changes":["change 1","change 2"]}`,

    tone_persuasive: `Rewrite this text in a persuasive tone: "${text}". 

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{"original":"${text.slice(0, 100)}...","rewritten":"...","changes":["change 1","change 2"]}`,

    rewrite_shorter: `Rewrite this text to be more concise: "${text}". 

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{"original":"${text.slice(0, 100)}...","rewritten":"...","changes":["change 1","change 2"]}`,

    rewrite_longer: `Expand this text with more detail: "${text}". 

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{"original":"${text.slice(0, 100)}...","rewritten":"...","changes":["change 1","change 2"]}`,

    simplify: `Simplify this text for easier understanding: "${text}". 

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{"original":"${text.slice(0, 100)}...","rewritten":"...","changes":["change 1","change 2"]}`,

    summarize: `Summarize this text concisely: "${text}"`,
    
    explain: `Explain this text in detail: "${text}"`,
    
    ask: text.includes("Ask about:") ? 
      `Tell me about this webpage: ${pageContext.title}` : 
      `Help me understand this: "${text}"`
  };

  const prompt = prompts[action] || `Help me with: "${text}"`;
  
  showTypingIndicator(container);
  
  try {
    const response = await callGeminiAPI(prompt);
    removeTypingIndicator(container);
    
    // Try to parse JSON for interactive features
    let jsonData = null;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.log('[Processor] Not JSON format, rendering as text');
    }
    
    // Render based on action type
    if (jsonData) {
      if (action === 'quiz' && jsonData.questions) {
        renderQuiz(container, jsonData, text, action);
        return;
      }
      if (action === 'flashcards' && jsonData.cards) {
        renderFlashcards(container, jsonData, text, action);
        return;
      }
      if (action === 'generate_notes' && jsonData.sections) {
        renderNotes(container, jsonData, text, action);
        return;
      }
      if (jsonData.original && jsonData.rewritten) {
        renderDiff(container, jsonData, text, action);
        return;
      }
    }
    
    // Fallback to text rendering
    addMessage(container, response, 'ai');
    saveToHistory(action, text, response);
    
  } catch (error) {
    removeTypingIndicator(container);
    const errorMsg = `⚠️ **Error:** ${error.message}\n\nPlease try again or check your API key.`;
    addMessage(container, errorMsg, 'ai');
  }
}

/* ===============================
   INTERACTIVE RENDERERS
================================ */

function renderQuiz(container, data, originalText, action) {
  const card = document.createElement("div");
  card.className = "interactive-card";
  
  // Star button
  const starBtn = createStarButton(data, action, originalText);
  card.appendChild(starBtn);
  
  let score = 0;
  const total = data.questions ? data.questions.length : 0;
  
  const header = document.createElement("div");
  header.style.cssText = "display:flex;justify-content:space-between;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid var(--glass-border);";
  header.innerHTML = `
    <span style="font-weight:600;color:var(--glass-accent);">Interactive Quiz</span>
    <span class="quiz-score" style="font-size:12px;opacity:0.8;">Score: 0/${total}</span>
  `;
  card.appendChild(header);
  
  if (!data.questions || data.questions.length === 0) {
    card.innerHTML += '<p style="color:var(--glass-secondary);">No quiz questions generated.</p>';
    container.appendChild(card);
    return;
  }
  
  data.questions.forEach((q, idx) => {
    const qBlock = document.createElement("div");
    qBlock.style.marginBottom = "16px";
    qBlock.innerHTML = `<div style="font-weight:600;margin-bottom:8px;">${idx + 1}. ${q.question}</div>`;
    
    const opts = document.createElement("div");
    q.options.forEach((opt, optIdx) => {
      const btn = document.createElement("div");
      btn.className = "quiz-option";
      btn.textContent = opt;
      
      btn.onclick = () => {
        if (btn.dataset.answered) return;
        
        const correct = optIdx === q.correctIndex;
        btn.classList.add(correct ? "correct" : "incorrect");
        
        if (correct) {
          // Disable all options for this question
          Array.from(opts.children).forEach(c => {
            c.dataset.answered = "true";
            c.classList.add('disabled');
          });
          
          // Update score only on first try
          if (!qBlock.dataset.attempted) {
            score++;
            card.querySelector('.quiz-score').textContent = `Score: ${score}/${total}`;
          }
          
          // Show explanation
          if (q.explanation) {
            const exp = document.createElement("div");
            exp.style.cssText = "font-size:12px;margin-top:8px;padding:8px;background:rgba(16,163,127,0.1);border-radius:4px;color:var(--glass-green);";
            exp.textContent = "✅ " + q.explanation;
            
            // Remove old explanation if exists
            const oldExp = qBlock.querySelector('.explanation');
            if (oldExp) oldExp.remove();
            
            exp.className = "explanation";
            qBlock.appendChild(exp);
          }
        } else {
          qBlock.dataset.attempted = "true";
        }
      };
      
      opts.appendChild(btn);
    });
    
    qBlock.appendChild(opts);
    card.appendChild(qBlock);
  });
  
  // Action bar
  const actionBar = document.createElement("div");
  actionBar.className = "action-bar";
  actionBar.style.marginTop = "16px";
  
  const copyBtn = document.createElement("button");
  copyBtn.className = "action-btn";
  copyBtn.innerHTML = `${ICONS.copy} Copy`;
  copyBtn.onclick = () => {
    const text = data.questions.map((q, i) => 
      `Q${i + 1}: ${q.question}\nOptions: ${q.options.join(', ')}\nAnswer: ${q.options[q.correctIndex]}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(text);
    copyBtn.innerHTML = `${ICONS.copy} Copied!`;
    setTimeout(() => copyBtn.innerHTML = `${ICONS.copy} Copy`, 2000);
  };
  actionBar.appendChild(copyBtn);
  
  card.appendChild(actionBar);
  container.appendChild(card);
  
  saveToHistory(action, originalText, `Quiz with ${total} questions`);
}

function renderFlashcards(container, data, originalText, action) {
  const card = document.createElement("div");
  card.className = "interactive-card";
  
  const starBtn = createStarButton(data, action, originalText);
  card.appendChild(starBtn);
  
  const header = document.createElement("div");
  header.style.cssText = "margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center;";
  
  const title = document.createElement("span");
  title.style.cssText = "font-weight:600;color:var(--glass-accent);";
  title.textContent = `Flashcards (${data.cards ? data.cards.length : 0})`;
  header.appendChild(title);
  
  const counter = document.createElement("span");
  counter.style.cssText = "font-size:12px;color:var(--glass-secondary);";
  counter.className = "flashcard-counter";
  header.appendChild(counter);
  
  card.appendChild(header);
  
  if (!data.cards || data.cards.length === 0) {
    card.innerHTML += '<p style="color:var(--glass-secondary);">No flashcards generated.</p>';
    container.appendChild(card);
    return;
  }
  
  let currentIndex = 0;
  let flipped = false;
  
  const flashcard = document.createElement("div");
  flashcard.className = "flashcard";
  
  const frontDiv = document.createElement("div");
  frontDiv.className = "flashcard-front";
  
  const backDiv = document.createElement("div");
  backDiv.className = "flashcard-back";
  backDiv.style.display = "none";
  
  const updateCard = () => {
    const currentCard = data.cards[currentIndex];
    frontDiv.textContent = currentCard.front;
    backDiv.textContent = currentCard.back;
    counter.textContent = `${currentIndex + 1} / ${data.cards.length}`;
    flipped = false;
    flashcard.classList.remove('flipped');
    frontDiv.style.display = 'block';
    backDiv.style.display = 'none';
  };
  
  flashcard.onclick = () => {
    flipped = !flipped;
    if (flipped) {
      flashcard.classList.add('flipped');
      frontDiv.style.display = 'none';
      backDiv.style.display = 'block';
    } else {
      flashcard.classList.remove('flipped');
      frontDiv.style.display = 'block';
      backDiv.style.display = 'none';
    }
  };
  
  flashcard.appendChild(frontDiv);
  flashcard.appendChild(backDiv);
  card.appendChild(flashcard);
  
  // Navigation
  const nav = document.createElement("div");
  nav.className = "action-bar";
  nav.style.cssText = "margin-top:12px;justify-content:space-between;";
  
  const prevBtn = document.createElement("button");
  prevBtn.className = "action-btn";
  prevBtn.textContent = "← Previous";
  prevBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + data.cards.length) % data.cards.length;
    updateCard();
  };
  
  const nextBtn = document.createElement("button");
  nextBtn.className = "action-btn";
  nextBtn.textContent = "Next →";
  nextBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % data.cards.length;
    updateCard();
  };
  
  nav.appendChild(prevBtn);
  nav.appendChild(nextBtn);
  card.appendChild(nav);
  
  // Copy button
  const copyBar = document.createElement("div");
  copyBar.className = "action-bar";
  
  const copyBtn = document.createElement("button");
  copyBtn.className = "action-btn";
  copyBtn.innerHTML = `${ICONS.copy} Copy All`;
  copyBtn.onclick = () => {
    const text = data.cards.map((c, i) => 
      `Card ${i + 1}:\nFront: ${c.front}\nBack: ${c.back}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(text);
    copyBtn.innerHTML = `${ICONS.copy} Copied!`;
    setTimeout(() => copyBtn.innerHTML = `${ICONS.copy} Copy All`, 2000);
  };
  copyBar.appendChild(copyBtn);
  card.appendChild(copyBar);
  
  updateCard();
  container.appendChild(card);
  
  saveToHistory(action, originalText, `${data.cards.length} flashcards`);
}

function renderNotes(container, data, originalText, action) {
  const card = document.createElement("div");
  card.className = "interactive-card";
  
  const starBtn = createStarButton(data, action, originalText);
  card.appendChild(starBtn);
  
  const header = document.createElement("div");
  header.style.cssText = "margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid var(--glass-border);";
  header.innerHTML = `<span style="font-weight:600;color:var(--glass-accent);font-size:16px;">${data.title || 'Study Notes'}</span>`;
  card.appendChild(header);
  
  if (!data.sections || data.sections.length === 0) {
    card.innerHTML += '<p style="color:var(--glass-secondary);">No notes generated.</p>';
    container.appendChild(card);
    return;
  }
  
  data.sections.forEach((section, idx) => {
    const sec = document.createElement("div");
    sec.style.cssText = "margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--glass-border);";
    
    const heading = document.createElement("div");
    heading.style.cssText = "font-weight:600;font-size:14px;margin-bottom:8px;color:var(--glass-text);";
    heading.textContent = section.heading;
    sec.appendChild(heading);
    
    const content = document.createElement("div");
    content.style.cssText = "font-size:13px;margin-bottom:8px;line-height:1.6;color:var(--glass-text);";
    content.textContent = section.content;
    sec.appendChild(content);
    
    if (section.keyPoints && section.keyPoints.length > 0) {
      const points = document.createElement("ul");
      points.style.cssText = "font-size:12px;padding-left:20px;color:var(--glass-secondary);margin:8px 0;";
      
      section.keyPoints.forEach(pt => {
        const li = document.createElement("li");
        li.textContent = pt;
        li.style.marginBottom = "4px";
        points.appendChild(li);
      });
      
      sec.appendChild(points);
    }
    
    card.appendChild(sec);
  });
  
  // Copy button
  const actionBar = document.createElement("div");
  actionBar.className = "action-bar";
  
  const copyBtn = document.createElement("button");
  copyBtn.className = "action-btn";
  copyBtn.innerHTML = `${ICONS.copy} Copy Notes`;
  copyBtn.onclick = () => {
    const text = data.sections.map(s => {
      let section = `${s.heading}\n${s.content}`;
      if (s.keyPoints && s.keyPoints.length > 0) {
        section += '\n\nKey Points:\n' + s.keyPoints.map(p => `• ${p}`).join('\n');
      }
      return section;
    }).join('\n\n');
    
    navigator.clipboard.writeText(text);
    copyBtn.innerHTML = `${ICONS.copy} Copied!`;
    setTimeout(() => copyBtn.innerHTML = `${ICONS.copy} Copy Notes`, 2000);
  };
  actionBar.appendChild(copyBtn);
  
  card.appendChild(actionBar);
  container.appendChild(card);
  
  saveToHistory(action, originalText, 'Study notes generated');
}

function renderDiff(container, data, originalText, action) {
  const card = document.createElement("div");
  card.className = "interactive-card";
  
  const starBtn = createStarButton(data, action, originalText);
  card.appendChild(starBtn);
  
  const header = document.createElement("div");
  header.style.cssText = "margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--glass-border);";
  header.innerHTML = `<span style="font-weight:600;color:var(--glass-accent);">${action.replace(/_/g, ' ').toUpperCase()}</span>`;
  card.appendChild(header);
  
  const diffView = document.createElement("div");
  diffView.className = "diff-view";
  
  const left = document.createElement("div");
  left.className = "diff-panel";
  left.innerHTML = `<div class="diff-label">Original</div><div style="line-height:1.5;">${data.original}</div>`;
  
  const right = document.createElement("div");
  right.className = "diff-panel";
  right.style.cssText = "background:rgba(16,163,127,0.1);border:1px solid rgba(16,163,127,0.2);";
  right.innerHTML = `<div class="diff-label" style="color:var(--glass-accent);">Improved</div><div style="line-height:1.5;">${data.rewritten}</div>`;
  
  diffView.appendChild(left);
  diffView.appendChild(right);
  card.appendChild(diffView);
  
  if (data.changes && data.changes.length > 0) {
    const changes = document.createElement("div");
    changes.style.cssText = "margin-top:12px;font-size:12px;padding:12px;background:rgba(0,0,0,0.3);border-radius:6px;";
    
    const changesLabel = document.createElement("div");
    changesLabel.className = "diff-label";
    changesLabel.textContent = "Changes Made";
    changesLabel.style.marginBottom = "8px";
    changes.appendChild(changesLabel);
    
    const list = document.createElement("ul");
    list.style.cssText = "padding-left:16px;margin:0;";
    
    data.changes.forEach(change => {
      const li = document.createElement("li");
      li.textContent = change;
      li.style.marginBottom = "4px";
      list.appendChild(li);
    });
    
    changes.appendChild(list);
    card.appendChild(changes);
  }
  
  // Action bar
  const actionBar = document.createElement("div");
  actionBar.className = "action-bar";
  actionBar.style.marginTop = "16px";
  
  const copyOriginal = document.createElement("button");
  copyOriginal.className = "action-btn";
  copyOriginal.innerHTML = `${ICONS.copy} Copy Original`;
  copyOriginal.onclick = () => {
    navigator.clipboard.writeText(data.original);
    copyOriginal.innerHTML = `${ICONS.copy} Copied!`;
    setTimeout(() => copyOriginal.innerHTML = `${ICONS.copy} Copy Original`, 2000);
  };
  
  const copyImproved = document.createElement("button");
  copyImproved.className = "action-btn active";
  copyImproved.innerHTML = `${ICONS.copy} Copy Improved`;
  copyImproved.onclick = () => {
    navigator.clipboard.writeText(data.rewritten);
    copyImproved.innerHTML = `${ICONS.copy} Copied!`;
    setTimeout(() => copyImproved.innerHTML = `${ICONS.copy} Copy Improved`, 2000);
  };
  
  actionBar.appendChild(copyOriginal);
  actionBar.appendChild(copyImproved);
  card.appendChild(actionBar);
  
  container.appendChild(card);
  
  saveToHistory(action, originalText, 'Text rewritten');
}

/* ===============================
   HELPER FUNCTIONS
================================ */

function createStarButton(data, type, text) {
  const btn = document.createElement("button");
  btn.className = "star-btn";
  btn.innerHTML = ICONS.star;
  btn.title = "Star this item";
  
  const isStarred = starredItems.some(item => 
    item.text === text && item.type === type
  );
  
  if (isStarred) {
    btn.classList.add('starred');
  }
  
  btn.onclick = (e) => {
    e.stopPropagation();
    
    const idx = starredItems.findIndex(item => 
      item.text === text && item.type === type
    );
    
    if (idx >= 0) {
      starredItems.splice(idx, 1);
      btn.classList.remove('starred');
      console.log('[Star] Item unstarred');
    } else {
      starredItems.push({
        type,
        text: text.slice(0, 200),
        data,
        timestamp: Date.now()
      });
      btn.classList.add('starred');
      console.log('[Star] Item starred');
    }
    
    saveHistory();
  };
  
  return btn;
}

function saveToHistory(action, inputText, outputSummary) {
  const conversation = {
    id: Date.now().toString(),
    action: action,
    title: action.replace(/_/g, ' ').toUpperCase(),
    inputText: inputText.slice(0, 200),
    outputSummary: outputSummary,
    timestamp: Date.now(),
    url: pageContext.url,
    pageTitle: pageContext.title
  };
  
  chatHistory.unshift(conversation);
  
  // Keep only last 50 conversations
  if (chatHistory.length > 50) {
    chatHistory = chatHistory.slice(0, 50);
  }
  
  saveHistory();
  console.log('[History] Saved conversation:', conversation.title);
}

/* ===============================
   CONVERSATION HISTORY
================================ */

function showConversationHistory() {
  const existing = document.getElementById("rc-ai-panel");
  if (existing) {
    existing.remove();
  }
  
  const panel = document.createElement("div");
  panel.id = "rc-ai-panel";
  panel.className = "chat-ui-container";
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 560px;
    height: 600px;
    border-radius: 12px;
    z-index: 999999;
    display: flex;
    flex-direction: column;
  `;

  // Header
  const header = document.createElement("div");
  header.className = "panel-header";
  
  const title = document.createElement("span");
  title.className = "panel-title";
  title.innerHTML = `<span class="chat-brand-pill">AI</span> Conversation History`;
  
  const closeBtn = document.createElement("span");
  closeBtn.className = "panel-close no-drag";
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => panel.remove();
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // Tabs
  const tabs = document.createElement("div");
  tabs.className = "chat-tabs no-drag";
  
  const allTab = document.createElement("div");
  allTab.className = "chat-tab active";
  allTab.textContent = "All";
  allTab.onclick = () => switchHistoryTab('all');
  
  const starredTab = document.createElement("div");
  starredTab.className = "chat-tab";
  starredTab.textContent = "Starred";
  starredTab.onclick = () => switchHistoryTab('starred');
  
  tabs.appendChild(allTab);
  tabs.appendChild(starredTab);
  panel.appendChild(tabs);

  // Content
  const content = document.createElement("div");
  content.style.cssText = "flex:1;overflow-y:auto;padding:16px;";
  content.className = "chat-scroll";
  content.id = "history-content";
  panel.appendChild(content);

  // Clear all button
  const footer = document.createElement("div");
  footer.style.cssText = "padding:12px;border-top:1px solid var(--glass-border);";
  
  const clearBtn = document.createElement("button");
  clearBtn.className = "chat-send-btn";
  clearBtn.style.cssText = "width:100%;background:rgba(239,68,68,0.2);color:var(--glass-red);border:1px solid rgba(239,68,68,0.3);";
  clearBtn.innerHTML = `${ICONS.trash} Clear All History`;
  clearBtn.onclick = () => {
    if (confirm('Are you sure you want to delete all conversation history?')) {
      chatHistory = [];
      saveHistory();
      renderHistoryContent('all');
    }
  };
  footer.appendChild(clearBtn);
  panel.appendChild(footer);

  document.body.appendChild(panel);
  makeDraggable(panel, header);
  
  renderHistoryContent('all');
  
  function switchHistoryTab(tab) {
    allTab.className = tab === 'all' ? 'chat-tab active' : 'chat-tab';
    starredTab.className = tab === 'starred' ? 'chat-tab active' : 'chat-tab';
    renderHistoryContent(tab);
  }
  
  function renderHistoryContent(tab) {
    const container = document.getElementById('history-content');
    container.innerHTML = '';
    
    let items = tab === 'starred' ? starredItems : chatHistory;
    
    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = `
        <div class="empty-state-icon">${tab === 'starred' ? '⭐' : '📭'}</div>
        <div class="empty-state-text">No ${tab === 'starred' ? 'starred items' : 'conversation history'} yet</div>
      `;
      container.appendChild(empty);
      return;
    }
    
    items.forEach((item, idx) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";
      
      const itemTitle = document.createElement("div");
      itemTitle.className = "history-item-title";
      itemTitle.textContent = item.title || item.type || 'Conversation';
      
      const itemPreview = document.createElement("div");
      itemPreview.className = "history-item-preview";
      itemPreview.textContent = item.inputText || item.text || 'No preview available';
      
      const itemDate = document.createElement("div");
      itemDate.className = "history-item-date";
      const date = new Date(item.timestamp);
      itemDate.textContent = `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
      
      historyItem.appendChild(itemTitle);
      historyItem.appendChild(itemPreview);
      historyItem.appendChild(itemDate);
      
      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "action-btn";
      deleteBtn.style.cssText = "position:absolute;top:8px;right:8px;padding:4px 8px;font-size:10px;color:var(--glass-red);";
      deleteBtn.innerHTML = ICONS.trash;
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Delete this item?')) {
          if (tab === 'starred') {
            starredItems.splice(idx, 1);
          } else {
            chatHistory.splice(idx, 1);
          }
          saveHistory();
          renderHistoryContent(tab);
        }
      };
      historyItem.appendChild(deleteBtn);
      
      container.appendChild(historyItem);
    });
  }
}

/* ===============================
   MESSAGE RENDERING
================================ */

function addMessage(container, text, role) {
  const msg = document.createElement("div");
  msg.className = `chat-message ${role}`;
  
  const avatar = document.createElement("div");
  avatar.className = `chat-avatar ${role}`;
  avatar.innerHTML = role === 'user' ? ICONS.user : ICONS.sparkles;
  
  const content = document.createElement("div");
  content.className = "chat-content";
  
  // Process text formatting
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
  
  content.innerHTML = html;
  
  if (role === 'user') {
    msg.appendChild(content);
    msg.appendChild(avatar);
  } else {
    msg.appendChild(avatar);
    msg.appendChild(content);
  }
  
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator(container) {
  const msg = document.createElement("div");
  msg.className = "chat-message";
  msg.id = "typing-indicator";
  
  const avatar = document.createElement("div");
  avatar.className = "chat-avatar ai";
  avatar.innerHTML = ICONS.sparkles;
  
  const content = document.createElement("div");
  content.className = "chat-content";
  content.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  
  msg.appendChild(avatar);
  msg.appendChild(content);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator(container) {
  const indicator = container.querySelector("#typing-indicator");
  if (indicator) {
    indicator.remove();
  }
}

/* ===============================
   INITIALIZATION
   Final setup and console logging
================================ */

console.log(`
╔════════════════════════════════════════════╗
║   RIGHT CLICK AI - LOADED SUCCESSFULLY    ║
║   Version: 2.0                             ║
║   Features: Interactive AI Tools           ║
╚════════════════════════════════════════════╝

📝 Usage:
   • Double right-click anywhere on the page
   • Select text for writing/understanding tools
   • Access conversation history anytime

🎯 Available Actions:
   • Fix Grammar
   • Change Tone (Professional/Casual/Confident/Persuasive)
   • Rewrite (Shorter/Longer)
   • Simplify
   • Explain
   • Summarize
   • Generate Notes
   • Create Flashcards
   • Generate Quiz

✨ Features:
   • Star important items
   • Conversation history
   • Fast animations (120ms)
   • Draggable panels
   • Interactive quiz with scoring
   • Flip flashcards
   • Side-by-side diff view

🎨 Design:
   • Neutral background with glass effect
   • Single accent color (#10a37f)
   • Red for errors only
   • Green for success only
   • Purposeful animations

⚡ Total Lines: 2000+
`);

// Log current state
console.log('[Init] Page Context:', {
  title: pageContext.title,
  domain: pageContext.domain,
  contentLength: pageContext.pageContent.length
});

console.log('[Init] History loaded:', chatHistory.length, 'conversations');
console.log('[Init] Starred items:', starredItems.length);
console.log('[Init] Selection tracking active');
console.log('[Init] Ready to use - Double right-click to start!');

// Periodic status check
setInterval(() => {
  console.log('[Status] Extension active - Selections cached:', lastSelectedText.length, 'chars');
}, 60000);

/* ===============================
   END OF RIGHT CLICK AI EXTENSION
   Total lines: 2000+

================================ */

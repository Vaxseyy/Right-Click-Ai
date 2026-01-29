/* ===============================
   Tool Input Rendering
================================ */
function renderToolInput(container, action, text, onRun) {
  const card = document.createElement("div");
  card.className = "interactive-card";
  card.style.borderLeft = "3px solid var(--glass-accent)";
  
  // Header
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.marginBottom = "12px";
  header.style.fontWeight = "600";
  header.style.fontSize = "13px";
  header.style.textTransform = "uppercase";
  header.style.color = "var(--glass-accent)";
  header.innerHTML = `<span>${ICONS[action.split('_')[0]] || '✦'} ${action.replace(/_/g, ' ')}</span>`;
  card.appendChild(header);
  
  // Input Area
  const label = document.createElement("div");
  label.textContent = "Input Text";
  label.style.fontSize = "11px";
  label.style.color = "var(--glass-secondary)";
  label.style.marginBottom = "4px";
  card.appendChild(label);
  
  const textarea = document.createElement("textarea");
  textarea.className = "chat-input";
  textarea.style.minHeight = "60px";
  textarea.style.maxHeight = "200px";
  textarea.style.fontFamily = "monospace";
  textarea.style.fontSize = "12px";
  textarea.value = text;
  textarea.oninput = function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
  };
  card.appendChild(textarea);
  
  // Options Area
  const optionsContainer = document.createElement("div");
  optionsContainer.style.marginTop = "12px";
  
  let options = {};
  
  if (action === 'quiz' || action === 'student_quiz') {
    options.difficulty = 'Medium';
    
    const diffLabel = document.createElement("div");
    diffLabel.textContent = "Difficulty";
    diffLabel.style.fontSize = "11px";
    diffLabel.style.color = "var(--glass-secondary)";
    diffLabel.style.marginBottom = "4px";
    optionsContainer.appendChild(diffLabel);
    
    const diffSelect = document.createElement("select");
    diffSelect.className = "chat-input";
    ['Easy', 'Medium', 'Hard'].forEach(lvl => {
      const opt = document.createElement("option");
      opt.value = lvl;
      opt.textContent = lvl;
      if (lvl === 'Medium') opt.selected = true;
      diffSelect.appendChild(opt);
    });
    diffSelect.onchange = (e) => options.difficulty = e.target.value;
    optionsContainer.appendChild(diffSelect);
  }
  
  if (action.includes('rewrite') || action === 'tone') {
    options.tone = 'Professional';
    
    const toneLabel = document.createElement("div");
    toneLabel.textContent = "Tone";
    toneLabel.style.fontSize = "11px";
    toneLabel.style.color = "var(--glass-secondary)";
    toneLabel.style.marginBottom = "4px";
    optionsContainer.appendChild(toneLabel);
    
    const toneSelect = document.createElement("select");
    toneSelect.className = "chat-input";
    ['Professional', 'Casual', 'Confident', 'Persuasive', 'Academic'].forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      if (action.includes(t.toLowerCase())) opt.selected = true;
      toneSelect.appendChild(opt);
    });
    toneSelect.onchange = (e) => options.tone = e.target.value;
    optionsContainer.appendChild(toneSelect);
  }

  card.appendChild(optionsContainer);
  
  // Action Bar
  const actionBar = document.createElement("div");
  actionBar.style.display = "flex";
  actionBar.style.justifyContent = "flex-end";
  actionBar.style.marginTop = "16px";
  
  const runBtn = document.createElement("button");
  runBtn.className = "chat-send-btn";
  runBtn.innerHTML = "Generate ✨";
  runBtn.onclick = () => {
    // Lock input
    textarea.disabled = true;
    runBtn.disabled = true;
    runBtn.textContent = "Processing...";
    
    onRun(textarea.value, options);
  };
  
  actionBar.appendChild(runBtn);
  card.appendChild(actionBar);
  
  // Append to container
  const msg = document.createElement("div");
  msg.className = "chat-message";
  msg.style.flexDirection = "row-reverse"; // User side
  
  const avatar = document.createElement("div");
  avatar.className = "chat-avatar user";
  avatar.innerHTML = ICONS.user;
  
  const content = document.createElement("div");
  content.className = "chat-content";
  content.style.width = "100%"; // Full width for card
  content.appendChild(card);
  
  msg.appendChild(avatar);
  msg.appendChild(content);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  
  // Trigger auto-resize
  textarea.style.height = (textarea.scrollHeight) + "px";
}
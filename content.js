let lastProcessed = "";
let isReadingActive = false;
let isSolvingActive = false;
let currentTheme = { bg: "rgba(18, 18, 18, 0.85)", text: "#fff", accent: "#8000ff" };

function injectBox() {
  if (document.getElementById('sparx-v4-ui')) return;
  
  const root = document.createElement('div');
  root.id = 'sparx-v4-ui';
  root.style.cssText = `
    position: fixed !important; bottom: 20px !important; right: 20px !important;
    width: 360px !important; background: ${currentTheme.bg} !important;
    backdrop-filter: blur(14px) !important; -webkit-backdrop-filter: blur(14px) !important;
    color: ${currentTheme.text} !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 20px !important; z-index: 2147483647 !important;
    padding: 20px !important; font-family: 'Segoe UI', sans-serif !important;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6) !important; transition: background 0.3s, color 0.3s;
  `;

  root.innerHTML = `
    <div style="margin-bottom:15px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; font-size:18px; color:${currentTheme.accent};">Sparx reader solver</span>
        <div id="api-dot" style="width:10px; height:10px; background:#aaa; border-radius:50%;"></div>
      </div>
      <div style="font-size:11px; opacity:0.6;">V1Beta26 Pro Edition</div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom:15px;">
      <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius:12px;">
        <div style="font-size:11px; font-weight:700; margin-bottom:8px;">📖 BOOK SCANNER</div>
        <button id="toggle-read" style="width:100%; background:#333; color:white; border:none; border-radius:8px; padding:6px; cursor:pointer; font-size:10px; font-weight:bold;">START</button>
      </div>
      <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius:12px;">
        <div style="font-size:11px; font-weight:700; margin-bottom:8px;">⚡ SOLVER</div>
        <button id="toggle-solve" style="width:100%; background:#333; color:white; border:none; border-radius:8px; padding:6px; cursor:pointer; font-size:10px; font-weight:bold;">START</button>
      </div>
    </div>

    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius:12px; margin-bottom:15px;">
      <div style="font-size:11px; font-weight:700; margin-bottom:10px;">🎨 ACCESSIBILITY</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="theme-btn" data-bg="rgba(18,18,18,0.85)" data-text="#fff" style="width:20px; height:20px; background:#121212; border:1px solid #fff; cursor:pointer; border-radius:4px;"></button>
        <button class="theme-btn" data-bg="rgba(255,255,200,0.95)" data-text="#000" style="width:20px; height:20px; background:#ffffc8; border:none; cursor:pointer; border-radius:4px;"></button>
        <button class="theme-btn" data-bg="rgba(200,255,200,0.95)" data-text="#000" style="width:20px; height:20px; background:#c8ffc8; border:none; cursor:pointer; border-radius:4px;"></button>
        <button class="theme-btn" data-bg="rgba(255,220,180,0.95)" data-text="#000" style="width:20px; height:20px; background:#ffdbb4; border:none; cursor:pointer; border-radius:4px;"></button>
        <button id="btn-inverse" style="font-size:9px; padding:2px 6px; cursor:pointer; background:#444; color:white; border:none; border-radius:4px;">INVERSE</button>
      </div>
    </div>

    <div id="g-ans" style="margin-bottom:15px; padding:12px; background:rgba(128,0,255,0.1); border-left:4px solid #8000ff; border-radius:6px; font-size:14px; font-weight:600; display:none;"></div>

    <div style="border-top: 1px solid rgba(255,255,255,0.1); pt: 10px; display:flex; justify-content:space-between; align-items:center; font-size:10px; opacity:0.7;">
      <span>API Status: <span id="api-text">Idle</span></span>
      <span id="api-latency">-- ms</span>
    </div>
  `;

  document.body.appendChild(root);

  // --- Logic for Themes ---
  root.querySelectorAll('.theme-btn').forEach(btn => {
    btn.onclick = () => {
      currentTheme.bg = btn.getAttribute('data-bg');
      currentTheme.text = btn.getAttribute('data-text');
      root.style.background = currentTheme.bg;
      root.style.color = currentTheme.text;
    };
  });

  root.querySelector('#btn-inverse').onclick = () => {
    const isDark = currentTheme.text === "#fff";
    currentTheme.bg = isDark ? "rgba(255,255,255,0.95)" : "rgba(18,18,18,0.85)";
    currentTheme.text = isDark ? "#000" : "#fff";
    root.style.background = currentTheme.bg;
    root.style.color = currentTheme.text;
  };

  // --- Core Handlers ---
  const readBtn = root.querySelector('#toggle-read');
  const solveBtn = root.querySelector('#toggle-solve');

  readBtn.onclick = () => {
    isReadingActive = !isReadingActive;
    updateBtn(readBtn, isReadingActive, "#8000ff");
  };

  solveBtn.onclick = () => {
    isSolvingActive = !isSolvingActive;
    updateBtn(solveBtn, isSolvingActive, "#28a745");
    if (!isSolvingActive) root.querySelector('#g-ans').style.display = "none";
  };
}

function updateBtn(btn, active, color) {
  btn.innerText = active ? "STOP" : "START";
  btn.style.background = active ? color : "#333";
}

function updateAPIStatus(status, color, latency = null) {
  const text = document.getElementById('api-text');
  const dot = document.getElementById('api-dot');
  const lat = document.getElementById('api-latency');
  if (text) text.innerText = status;
  if (dot) {
    dot.style.background = color;
    dot.style.boxShadow = `0 0 8px ${color}`;
  }
  if (lat && latency) lat.innerText = `${latency}ms`;
}

function coreLogic() {
  injectBox();
  
  if (isReadingActive) {
    const storyNodes = document.querySelectorAll('.read-content p, .sr-text, article p');
    if (storyNodes.length > 0) {
      const sText = Array.from(storyNodes).map(p => p.innerText).join(" ").trim();
      if (sText.length > 30 && sText !== lastProcessed) {
        lastProcessed = sText;
        chrome.runtime.sendMessage({ type: "UPDATE_PAGE", text: sText });
        updateAPIStatus("Memory Updated", "#8000ff");
      }
    }
  }

  if (isSolvingActive) {
    const qEl = document.querySelector('.question-text, .sr-question, h1, h2');
    if (qEl && qEl.innerText.trim().length > 5 && qEl.innerText.trim() !== lastProcessed) {
      lastProcessed = qEl.innerText.trim();
      const startTime = Date.now();
      updateAPIStatus("Thinking...", "#ffc107");
      
      const buttons = document.querySelectorAll('button, .option-label');
      const opts = Array.from(buttons).map(b => b.innerText.trim()).filter(t => t.length > 0).join(" | ");
      
      chrome.runtime.sendMessage({ type: "GET_ANSWER", question: lastProcessed, options: opts }, (res) => {
        const ansDiv = document.getElementById('g-ans');
        ansDiv.style.display = "block";
        ansDiv.innerText = res.answer;
        updateAPIStatus("Connected", "#28a745", Date.now() - startTime);
      });
    }
  }
}

setInterval(coreLogic, 1500);
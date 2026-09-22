/**
 * Universal Accessibility Toolbar & Compliance Widget (v2.0)
 * WCAG 2.1 AA & ADA Title III Standard
 * Fixed positioning architecture: avoids ancestor filter/transform bugs
 */
(function() {
  if (document.getElementById('a11y-widget-root')) return;

  // Inject Styles
  const style = document.createElement('style');
  style.id = 'a11y-widget-styles';
  style.textContent = `
    /* Widget Trigger Button - Anchored to Bottom-Right */
    .a11y-btn {
      position: fixed !important;
      bottom: 80px !important; /* Clears mobile bottom bars */
      right: 20px !important;
      left: auto !important;
      z-index: 999999 !important;
      width: 48px !important;
      height: 48px !important;
      border-radius: 50% !important;
      background: #0f172a !important;
      border: 2px solid #38bdf8 !important;
      color: #38bdf8 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(56, 189, 248, 0.3) !important;
      cursor: pointer !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    @media (min-width: 768px) {
      .a11y-btn {
        bottom: 24px !important;
        right: 24px !important;
      }
    }
    .a11y-btn:hover {
      transform: scale(1.08) !important;
      background: #1e293b !important;
      box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.9), 0 0 20px rgba(56, 189, 248, 0.5) !important;
    }
    .a11y-btn:focus-visible {
      outline: 3px solid #f59e0b !important;
      outline-offset: 3px !important;
    }

    /* Accessibility Controls Panel */
    .a11y-panel {
      position: fixed !important;
      bottom: 140px !important;
      right: 20px !important;
      left: auto !important;
      z-index: 999999 !important;
      width: 320px !important;
      max-width: calc(100vw - 40px) !important;
      background: #0f172a !important;
      border: 1px solid #334155 !important;
      border-radius: 16px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85) !important;
      padding: 18px !important;
      color: #f8fafc !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      display: none;
      flex-direction: column !important;
      gap: 12px !important;
      animation: a11yFadeIn 0.2s ease-out !important;
    }
    @media (min-width: 768px) {
      .a11y-panel {
        bottom: 84px !important;
        right: 24px !important;
      }
    }
    @keyframes a11yFadeIn {
      from { opacity: 0; transform: translateY(8px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .a11y-panel.open { display: flex !important; }

    .a11y-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 8px !important;
    }
    .a11y-tool-btn {
      background: #1e293b !important;
      border: 1px solid #334155 !important;
      border-radius: 10px !important;
      padding: 9px 8px !important;
      color: #cbd5e1 !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 4px !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
      text-align: center !important;
    }
    .a11y-tool-btn:hover {
      background: #334155 !important;
      color: #ffffff !important;
      border-color: #475569 !important;
    }
    .a11y-tool-btn.active {
      background: #0284c7 !important;
      border-color: #38bdf8 !important;
      color: #ffffff !important;
    }

    /* Grayscale Overlay (does NOT touch body to avoid breaking position: fixed) */
    .a11y-grayscale-active #a11yGrayscaleOverlay {
      display: block !important;
    }
    #a11yGrayscaleOverlay {
      display: none;
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      backdrop-filter: grayscale(100%) !important;
      -webkit-backdrop-filter: grayscale(100%) !important;
      pointer-events: none !important;
      z-index: 999990 !important;
    }

    /* High Contrast Mode - pure CSS color overrides (ZERO filters on body) */
    body.a11y-high-contrast {
      background-color: #000000 !important;
      color: #ffff00 !important;
    }
    body.a11y-high-contrast *:not(#a11y-widget-root):not(#a11y-widget-root *) {
      background-color: #000000 !important;
      color: #ffffff !important;
      border-color: #ffffff !important;
      box-shadow: none !important;
    }
    body.a11y-high-contrast a:not(#a11y-widget-root *) {
      color: #ffff00 !important;
      text-decoration: underline !important;
      font-weight: bold !important;
    }

    /* Link Highlighting */
    body.a11y-highlight-links a:not(#a11y-widget-root *) {
      background-color: #fef08a !important;
      color: #854d0e !important;
      text-decoration: underline !important;
      font-weight: 700 !important;
      outline: 2px solid #eab308 !important;
    }

    /* Dyslexia-friendly Typography */
    body.a11y-dyslexic *:not(#a11y-widget-root):not(#a11y-widget-root *) {
      font-family: Comic Sans MS, Arial, Helvetica, sans-serif !important;
      letter-spacing: 0.08em !important;
      line-height: 1.8 !important;
    }

    /* Large Cursor */
    body.a11y-big-cursor, body.a11y-big-cursor * {
      cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="%2338bdf8" stroke="%230f172a" stroke-width="1.5"><path d="M4 0l16 12-7 2-4 8z"/></svg>'), auto !important;
    }

    /* Reading Guide Line */
    .a11y-reading-guide {
      position: fixed !important;
      left: 0 !important;
      right: 0 !important;
      height: 4px !important;
      background: #f59e0b !important;
      box-shadow: 0 0 12px #f59e0b !important;
      pointer-events: none !important;
      z-index: 999998 !important;
      display: none;
    }
  `;
  document.head.appendChild(style);

  // Create UI Container
  const container = document.createElement('div');
  container.id = 'a11y-widget-root';
  container.innerHTML = `
    <!-- Dedicated Grayscale Backdrop Filter -->
    <div id="a11yGrayscaleOverlay"></div>

    <!-- Floating Trigger Button -->
    <button id="a11yTriggerBtn" class="a11y-btn" aria-label="Open Accessibility Toolbar" title="Accessibility Tools (WCAG 2.1 AA)">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="4" r="2"/>
        <path d="M4 9h16"/>
        <path d="M12 9v12"/>
        <path d="M8 15l4-3 4 3"/>
      </svg>
    </button>

    <!-- Controls Panel -->
    <div id="a11yPanel" class="a11y-panel" role="region" aria-label="Accessibility Options">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; font-weight: 700; color: #38bdf8;">Accessibility Suite</span>
          <span style="font-size: 9px; background: #0369a1; color: #e0f2fe; padding: 2px 6px; border-radius: 4px; font-weight: bold;">ADA &bull; WCAG 2.1</span>
        </div>
        <button id="a11yCloseBtn" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; line-height: 1; padding: 2px;" aria-label="Close">&times;</button>
      </div>

      <!-- Font Resizing Controls -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 8px 10px; border-radius: 10px; border: 1px solid #334155;">
        <span style="font-size: 11px; font-weight: 600; color: #cbd5e1;">Text Size</span>
        <div style="display: flex; gap: 6px;">
          <button id="a11yFontDec" style="background: #334155; border: none; color: white; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 11px;">A-</button>
          <button id="a11yFontReset" style="background: #334155; border: none; color: white; height: 26px; border-radius: 6px; cursor: pointer; font-size: 10px; padding: 0 8px;">100%</button>
          <button id="a11yFontInc" style="background: #334155; border: none; color: white; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 11px;">A+</button>
        </div>
      </div>

      <!-- Tool Grid -->
      <div class="a11y-grid">
        <button id="btnContrast" class="a11y-tool-btn">
          <span>🌓 High Contrast</span>
        </button>
        <button id="btnGrayscale" class="a11y-tool-btn">
          <span>⚪ Grayscale</span>
        </button>
        <button id="btnHighlight" class="a11y-tool-btn">
          <span>🔗 Highlight Links</span>
        </button>
        <button id="btnDyslexic" class="a11y-tool-btn">
          <span>📖 Dyslexic Font</span>
        </button>
        <button id="btnCursor" class="a11y-tool-btn">
          <span>↖ Big Cursor</span>
        </button>
        <button id="btnGuide" class="a11y-tool-btn">
          <span>📏 Reading Guide</span>
        </button>
      </div>

      <!-- Footer & Reset -->
      <div style="border-top: 1px solid #334155; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
        <button id="btnResetAll" style="background: transparent; border: 1px solid #475569; color: #94a3b8; font-size: 10px; border-radius: 6px; padding: 4px 8px; cursor: pointer;">
          Reset Settings
        </button>
        <span style="font-size: 10px; color: #10b981; font-weight: 600; display: flex; align-items: center; gap: 4px;">
          <span>✓</span> WCAG 2.1 AA
        </span>
      </div>
    </div>

    <!-- Reading Guide Bar -->
    <div id="a11yReadingGuide" class="a11y-reading-guide"></div>
  `;
  document.body.appendChild(container);

  // Logic
  const panel = document.getElementById('a11yPanel');
  const triggerBtn = document.getElementById('a11yTriggerBtn');
  const closeBtn = document.getElementById('a11yCloseBtn');
  const readingGuide = document.getElementById('a11yReadingGuide');

  let currentFontSize = 100;

  function togglePanel(e) {
    if (e) e.stopPropagation();
    panel.classList.toggle('open');
  }

  triggerBtn.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.remove('open');
  });

  // Stop click propagation inside panel so it doesn't close accidentally
  panel.addEventListener('click', (e) => e.stopPropagation());

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && !container.contains(e.target)) {
      panel.classList.remove('open');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      panel.classList.remove('open');
      triggerBtn.focus();
    }
  });

  // Font Scaling
  document.getElementById('a11yFontInc').addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentFontSize < 140) {
      currentFontSize += 10;
      document.body.style.fontSize = currentFontSize + '%';
      document.getElementById('a11yFontReset').innerText = currentFontSize + '%';
    }
  });

  document.getElementById('a11yFontDec').addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentFontSize > 80) {
      currentFontSize -= 10;
      document.body.style.fontSize = currentFontSize + '%';
      document.getElementById('a11yFontReset').innerText = currentFontSize + '%';
    }
  });

  document.getElementById('a11yFontReset').addEventListener('click', (e) => {
    e.stopPropagation();
    currentFontSize = 100;
    document.body.style.fontSize = '';
    document.getElementById('a11yFontReset').innerText = '100%';
  });

  // High Contrast
  const btnContrast = document.getElementById('btnContrast');
  btnContrast.addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('a11y-high-contrast');
    btnContrast.classList.toggle('active', document.body.classList.contains('a11y-high-contrast'));
  });

  // Grayscale (uses backdrop overlay on html element, never touches body)
  const btnGrayscale = document.getElementById('btnGrayscale');
  btnGrayscale.addEventListener('click', (e) => {
    e.stopPropagation();
    document.documentElement.classList.toggle('a11y-grayscale-active');
    btnGrayscale.classList.toggle('active', document.documentElement.classList.contains('a11y-grayscale-active'));
  });

  // Highlight Links
  const btnHighlight = document.getElementById('btnHighlight');
  btnHighlight.addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('a11y-highlight-links');
    btnHighlight.classList.toggle('active', document.body.classList.contains('a11y-highlight-links'));
  });

  // Dyslexic Font
  const btnDyslexic = document.getElementById('btnDyslexic');
  btnDyslexic.addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('a11y-dyslexic');
    btnDyslexic.classList.toggle('active', document.body.classList.contains('a11y-dyslexic'));
  });

  // Big Cursor
  const btnCursor = document.getElementById('btnCursor');
  btnCursor.addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('a11y-big-cursor');
    btnCursor.classList.toggle('active', document.body.classList.contains('a11y-big-cursor'));
  });

  // Reading Guide
  const guideBtn = document.getElementById('btnGuide');
  guideBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    guideBtn.classList.toggle('active');
    const isActive = guideBtn.classList.contains('active');
    readingGuide.style.display = isActive ? 'block' : 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (readingGuide.style.display === 'block') {
      readingGuide.style.top = e.clientY + 'px';
    }
  });

  // Reset All Settings
  document.getElementById('btnResetAll').addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.remove(
      'a11y-high-contrast',
      'a11y-highlight-links',
      'a11y-dyslexic',
      'a11y-big-cursor'
    );
    document.documentElement.classList.remove('a11y-grayscale-active');
    document.body.style.fontSize = '';
    currentFontSize = 100;
    document.getElementById('a11yFontReset').innerText = '100%';
    readingGuide.style.display = 'none';
    document.querySelectorAll('.a11y-tool-btn').forEach(b => b.classList.remove('active'));
  });

})();

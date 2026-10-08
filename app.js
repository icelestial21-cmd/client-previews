/**
 * iCELESTIAL ENTERPRISES : JAVASCRIPT CONTROLLER
 * High-velocity creative engineering, living client consoles, 3D bento physics,
 * 498-module interactive catalog, Command Palette (Cmd+K), and cosmic canvas.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  const toastWrap = document.getElementById('toastWrap');

  function showToast(message, icon = '&#10022;') {
    if (!toastWrap) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="color: var(--accent-gold); font-size: 1rem;">${icon}</span><span>${message}</span>`;
    toastWrap.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  // ==========================================================================
  // 2. CUSTOM MAGNETIC CURSOR FOLLOWER
  // ==========================================================================
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }, { passive: true });

    function renderCursor() {
      // Spring lerp interpolation
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Expand on interactive elements
    const interactiveSelector = 'a, button, input, .lab-tab, .console-pill-btn, .vault-item-card, .bento-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursorRing.classList.add('active');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursorRing.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // 3. LIVING HERO CANVAS (Cosmic Purple, Orange & Celestial Gold Constellation)
  // ==========================================================================
  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 65;
    let heroMouseX = null;
    let heroMouseY = null;

    function resizeCanvas() {
      const rect = heroCanvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      heroCanvas.width = width * window.devicePixelRatio;
      heroCanvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.55;
        this.vy = (Math.random() - 0.5) * 0.55;
        this.radius = Math.random() * 2.2 + 1.2;
        this.baseAlpha = Math.random() * 0.45 + 0.25;

        // Tri-color cosmic palette: Purple, Solar Orange, Starlight Gold
        const rand = Math.random();
        if (rand < 0.45) {
          this.color = 'rgba(139, 79, 255,'; // Amethyst Purple
        } else if (rand < 0.75) {
          this.color = 'rgba(255, 122, 0,';  // Solar Orange
        } else {
          this.color = 'rgba(247, 201, 72,'; // Starlight Gold
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Pointer proximity reaction
        if (heroMouseX !== null && heroMouseY !== null) {
          const dx = this.x - heroMouseX;
          const dy = this.y - heroMouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const force = (140 - dist) / 140;
            this.x += (dx / dist) * force * 1.8;
            this.y += (dy / dist) * force * 1.8;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color} ${this.baseAlpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `${this.color} 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function initHeroParticles() {
      resizeCanvas();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animateHeroCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Draw celestial connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139, 79, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update & draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animateHeroCanvas);
    }

    window.addEventListener('resize', resizeCanvas);
    heroCanvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = heroCanvas.getBoundingClientRect();
      heroMouseX = e.clientX - rect.left;
      heroMouseY = e.clientY - rect.top;
    });
    heroCanvas.parentElement.addEventListener('mouseleave', () => {
      heroMouseX = null;
      heroMouseY = null;
    });

    initHeroParticles();
    animateHeroCanvas();
  }

  // ==========================================================================
  // 4. LIVING CLIENT CONSOLES
  // ==========================================================================

  // --- MMS Construction Services Estimator ---
  const mmsSqftSlider = document.getElementById('mmsSqftSlider');
  const mmsSqftLabel = document.getElementById('mmsSqftLabel');
  const mmsCementVal = document.getElementById('mmsCementVal');
  const mmsRebarVal = document.getElementById('mmsRebarVal');
  const mmsTotalJmd = document.getElementById('mmsTotalJmd');
  const mmsTotalUsd = document.getElementById('mmsTotalUsd');
  const mmsCopyEstimateBtn = document.getElementById('mmsCopyEstimateBtn');

  let mmsMultiplier = 1.0;

  function updateMmsEstimator() {
    if (!mmsSqftSlider) return;
    const sqft = parseInt(mmsSqftSlider.value, 10);
    if (mmsSqftLabel) mmsSqftLabel.textContent = `${sqft.toLocaleString()} sq ft`;

    // Calculation formulas
    const cementBags = Math.round(sqft * 0.52 * mmsMultiplier);
    const rebarTons = (sqft * 0.0028 * mmsMultiplier).toFixed(2);
    
    // Monetary totals
    const cementCost = cementBags * 1450;
    const rebarCost = parseFloat(rebarTons) * 215000;
    const aggregateCost = sqft * 650 * mmsMultiplier;
    const totalJmdNum = cementCost + rebarCost + aggregateCost;
    const totalUsdNum = Math.round(totalJmdNum / 158);

    if (mmsCementVal) mmsCementVal.textContent = `${cementBags.toLocaleString()} Bags`;
    if (mmsRebarVal) mmsRebarVal.textContent = `${rebarTons} Tons`;
    if (mmsTotalJmd) mmsTotalJmd.textContent = `$${(totalJmdNum / 1000000).toFixed(2)}M JMD`;
    if (mmsTotalUsd) mmsTotalUsd.textContent = `$${(totalUsdNum / 1000).toFixed(1)}K USD`;
  }

  if (mmsSqftSlider) {
    mmsSqftSlider.addEventListener('input', updateMmsEstimator);
  }

  document.querySelectorAll('[data-mms-system]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mms-system]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sys = btn.getAttribute('data-mms-system');
      if (sys === 'commercial') mmsMultiplier = 1.45;
      else if (sys === 'scip') mmsMultiplier = 1.20;
      else mmsMultiplier = 1.0;
      updateMmsEstimator();
    });
  });

  if (mmsCopyEstimateBtn) {
    mmsCopyEstimateBtn.addEventListener('click', () => {
      const sqft = mmsSqftSlider ? mmsSqftSlider.value : '2400';
      const text = `MMS Construction Estimate: ${sqft} sq ft footprint. Est Materials: ${mmsCementVal.textContent} cement, ${mmsRebarVal.textContent} rebar. Total: ${mmsTotalJmd.textContent} (${mmsTotalUsd.textContent}). Marcus Saunders Direct Dispatch.`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
      showToast('MMS Bill of Quantities copied to clipboard. Ready for Marcus Saunders direct dispatch.');
    });
  }

  // --- J.Mossis Paris Tailoring Studio ---
  const jmossisCollarDesc = document.getElementById('jmossisCollarDesc');
  const jmossisPriceLabel = document.getElementById('jmossisPriceLabel');
  const jmossisWhatsappPreviewBtn = document.getElementById('jmossisWhatsappPreviewBtn');

  let jmossisCurrentCollar = 'Col Tulipe';
  let jmossisCurrentPrice = '180 € EUR';

  document.querySelectorAll('[data-collar]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-collar]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      jmossisCurrentCollar = btn.textContent;
      if (jmossisCollarDesc) {
        jmossisCollarDesc.textContent = btn.getAttribute('data-desc');
      }
    });
  });

  document.querySelectorAll('[data-jm-curr]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-jm-curr]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const baseEur = 180;
      const rate = parseFloat(btn.getAttribute('data-rate'));
      const sym = btn.getAttribute('data-sym');
      const code = btn.getAttribute('data-code');
      const converted = Math.round(baseEur * rate);
      jmossisCurrentPrice = `${sym}${converted.toLocaleString()} ${code}`;
      if (jmossisPriceLabel) {
        jmossisPriceLabel.textContent = jmossisCurrentPrice;
      }
    });
  });

  if (jmossisWhatsappPreviewBtn) {
    jmossisWhatsappPreviewBtn.addEventListener('click', () => {
      showToast(`WhatsApp Concierge payload formatted: Chemise ${jmossisCurrentCollar} (${jmossisCurrentPrice}).`);
    });
  }

  // --- Marko Baku Garment Inspector ---
  const markoAngleDesc = document.getElementById('markoAngleDesc');
  const markoDeliveryTrackBtn = document.getElementById('markoDeliveryTrackBtn');

  document.querySelectorAll('[data-marko-angle]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-marko-angle]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (markoAngleDesc) {
        markoAngleDesc.textContent = btn.getAttribute('data-desc');
      }
    });
  });

  if (markoDeliveryTrackBtn) {
    markoDeliveryTrackBtn.addEventListener('click', () => {
      showToast('DHL European Escrow: Tracking cleared Baku to Frankfurt (48h transit guaranteed).', '&#128666;');
    });
  }


  // --- Chibest Worldwide Anthropometric Studio ---
  const chibestIntakeBtn = document.getElementById('chibestIntakeBtn');
  document.querySelectorAll('[data-ch-sil]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-ch-sil]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  if (chibestIntakeBtn) {
    chibestIntakeBtn.addEventListener('click', () => {
      showToast('Anthropometric Computer Vision Intake calibrated. 14-point body scan ready.', '&#128081;');
    });
  }

  // ==========================================================================
  // 5. 3D BENTO MATRIX TILT PHYSICS & SPECULAR GLOW
  // ==========================================================================
  const bentoCards = document.querySelectorAll('.bento-card');

  bentoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D perspective rotation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // ==========================================================================
  // 6. 498-MODULE iCELESTIAL CAPABILITY BROWSER
  // ==========================================================================
  let catalogData = [];
  const bentoVaultInput = document.getElementById('bentoVaultInput');
  const bentoVaultResults = document.getElementById('bentoVaultResults');
  const vaultCountBadge = document.getElementById('vaultCountBadge');

  async function loadCatalog() {
    try {
      const res = await fetch('catalog.json');
      if (res.ok) {
        catalogData = await res.json();
        if (vaultCountBadge) {
          vaultCountBadge.textContent = `${catalogData.length} Modules Available`;
        }
        renderVaultResults(catalogData.slice(0, 8));
      }
    } catch (e) {
      console.warn('Catalog local fetch deferred:', e);
    }
  }

  function renderVaultResults(items) {
    if (!bentoVaultResults) return;
    bentoVaultResults.innerHTML = '';

    if (items.length === 0) {
      bentoVaultResults.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 2rem; color: var(--ink-tertiary);">No modules found matching search.</div>';
      return;
    }

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'vault-item-card';
      div.innerHTML = `
        <div class="vault-item-top">
          <span class="vault-item-name">${item.title || item.id}</span>
          <span class="vault-item-cat">${item.category || 'Module'}</span>
        </div>
        <p class="vault-item-desc">${item.summary || 'Custom interactive visual module engineered by iCelestial.'}</p>
      `;
      div.addEventListener('click', () => {
        showToast(`Module inspected: ${item.title || item.id}. Ready for bespoke integration.`);
      });
      bentoVaultResults.appendChild(div);
    });
  }

  let activeVaultFilter = 'all';

  function filterVaultItems() {
    const query = (bentoVaultInput ? bentoVaultInput.value.toLowerCase().trim() : '');
    let filtered = catalogData;

    if (activeVaultFilter !== 'all') {
      filtered = filtered.filter(item => {
        const cat = (item.category || '') + ' ' + (item.taxonomy_category || '') + ' ' + (item.tags || []).join(' ');
        return cat.toLowerCase().includes(activeVaultFilter.toLowerCase());
      });
    }

    if (query) {
      filtered = filtered.filter(item => {
        const text = `${item.title} ${item.summary} ${item.id} ${(item.tags || []).join(' ')}`.toLowerCase();
        return text.includes(query);
      });
    }

    renderVaultResults(filtered.slice(0, 10));
  }

  if (bentoVaultInput) {
    bentoVaultInput.addEventListener('input', filterVaultItems);
  }

  document.querySelectorAll('[data-bento-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-bento-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeVaultFilter = btn.getAttribute('data-bento-filter');
      filterVaultItems();
    });
  });

  loadCatalog();

  // ==========================================================================
  // 7. COMMAND PALETTE (Cmd + K / Ctrl + K)
  // ==========================================================================
  const cmdPalette = document.getElementById('cmdPalette');
  const cmdSearchInput = document.getElementById('cmdSearchInput');
  const cmdResultsList = document.getElementById('cmdResultsList');
  const cmdCloseBtn = document.getElementById('cmdCloseBtn');
  const navSearchTrigger = document.getElementById('navSearchTrigger');
  const heroSearchTrigger = document.getElementById('heroSearchTrigger');

  const STATIC_CMD_ITEMS = [
    {
      type: 'flagship',
      title: 'MMS Construction Services',
      desc: 'Civil contracting platform with Jamaican building materials calculator.',
      tag: 'Jamaica',
      action: () => document.getElementById('flagships').scrollIntoView({ behavior: 'smooth' })
    },
    {
      type: 'flagship',
      title: 'J.Mossis Paris',
      desc: 'Haute confection menswear atelier with Col Tulipe drop engine.',
      tag: 'Paris 75018',
      action: () => document.getElementById('flagships').scrollIntoView({ behavior: 'smooth' })
    },
    {
      type: 'flagship',
      title: 'Marko Baku Digital Atelier',
      desc: 'Caspian bespoke suiting with runway motion and European delivery escrow.',
      tag: 'Baku Nizami',
      action: () => document.getElementById('flagships').scrollIntoView({ behavior: 'smooth' })
    },
    {
      type: 'flagship',
      title: 'Chibest Fashion Worldwide',
      desc: 'Imperial Nigerian couture with anthropometric computer vision scan.',
      tag: 'Lagos Royal',
      action: () => document.getElementById('flagships').scrollIntoView({ behavior: 'smooth' })
    },
    {
      type: 'flagship',
      title: 'Apex Athlete Exchange (AAX)',
      desc: 'Global athletic scouting platform with combine laser telemetry.',
      tag: 'Kingston & Miami',
      action: () => document.getElementById('flagships').scrollIntoView({ behavior: 'smooth' })
    },
    {
      type: 'flagship',
      title: 'Caribbean Sports Quest (CSQ)',
      desc: 'Regional sports media network, live tournament scores, and ticketing analytics.',
      tag: 'West Indies',
      action: () => document.getElementById('flagships').scrollIntoView({ behavior: 'smooth' })
    },
    {
      type: 'flagship',
      title: 'Atelier Veylora',
      desc: 'Haute couture and 22-Momme Mulberry silk evening wear flagship.',
      tag: 'Parisian Silk',
      action: () => document.getElementById('flagships').scrollIntoView({ behavior: 'smooth' })
    },
    {
      type: 'engine',
      title: 'Spatial 3D & WebGL Shaders',
      desc: 'Cinematic visual atmospheres, raymarched celestial horizons, and luminous cards.',
      tag: 'Core Pillar',
      action: () => document.getElementById('matrix').scrollIntoView({ behavior: 'smooth' })
    },
    {
      type: 'engine',
      title: 'Storefront Physical Extraction',
      desc: 'Translating physical storefronts and heritage materials into digital flagships.',
      tag: 'Core Pillar',
      action: () => document.getElementById('matrix').scrollIntoView({ behavior: 'smooth' })
    },
    {
      type: 'engine',
      title: 'Interactive Visual Commerce',
      desc: 'Embedded live material estimators, bespoke tailoring studios, and sizing matrices.',
      tag: 'Core Pillar',
      action: () => document.getElementById('matrix').scrollIntoView({ behavior: 'smooth' })
    },
    {
      type: 'engine',
      title: 'Enterprise Zero-Bloat Speed',
      desc: 'Sub-50ms instantaneous page loads and complete intellectual property ownership.',
      tag: 'Core Pillar',
      action: () => document.getElementById('matrix').scrollIntoView({ behavior: 'smooth' })
    },
    {
      type: 'horizonx',
      title: 'Planetrise WebGL Celestial Shader',
      desc: 'Raymarched spherical star limb with atmospheric Rayleigh scattering.',
      tag: 'Shader FX',
      action: () => {
        document.getElementById('lab').scrollIntoView({ behavior: 'smooth' });
        const tab = document.querySelector('[data-component="planetrise"]');
        if (tab) tab.click();
      }
    },
    {
      type: 'horizonx',
      title: '3D Layered Gesture Sheet Stack',
      desc: 'Layered card deck with spring gesture dragging and smooth dismissal.',
      tag: 'Spatial 3D',
      action: () => {
        document.getElementById('lab').scrollIntoView({ behavior: 'smooth' });
        const tab = document.querySelector('[data-component="sheet-stack"]');
        if (tab) tab.click();
      }
    },
    {
      type: 'horizonx',
      title: 'Kinetic Vector Text Ring',
      desc: 'Circular SVG textPath rotating with pointer angular velocity.',
      tag: 'Typography',
      action: () => {
        document.getElementById('lab').scrollIntoView({ behavior: 'smooth' });
        const tab = document.querySelector('[data-component="text-ring"]');
        if (tab) tab.click();
      }
    },
    {
      type: 'horizonx',
      title: 'Luminous Slit Optics Card',
      desc: 'Directional traveling aperture highlight with ambient specular bloom.',
      tag: 'Lighting',
      action: () => {
        document.getElementById('lab').scrollIntoView({ behavior: 'smooth' });
        const tab = document.querySelector('[data-component="luminous-card"]');
        if (tab) tab.click();
      }
    },
    {
      type: 'horizonx',
      title: 'Magnetic Gravitational CTA Button',
      desc: 'Elastic proximity attraction with damped spring return.',
      tag: 'Input Interaction',
      action: () => {
        document.getElementById('lab').scrollIntoView({ behavior: 'smooth' });
        const tab = document.querySelector('[data-component="magnetic-button"]');
        if (tab) tab.click();
      }
    }
  ];

  let activeCmdFilter = 'all';

  function openCmdPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.add('open');
    if (cmdSearchInput) {
      cmdSearchInput.value = '';
      cmdSearchInput.focus();
    }
    renderCmdResults();
  }

  function closeCmdPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.remove('open');
  }

  function renderCmdResults() {
    if (!cmdResultsList) return;
    cmdResultsList.innerHTML = '';

    const query = (cmdSearchInput ? cmdSearchInput.value.toLowerCase().trim() : '');

    // Combine static items with top catalog items
    let pool = [...STATIC_CMD_ITEMS];
    if (catalogData.length > 0) {
      catalogData.slice(0, 30).forEach(c => {
        pool.push({
          type: 'horizonx',
          title: c.title || c.id,
          desc: c.summary || 'Custom iCelestial interactive module',
          tag: c.category || 'Module',
          action: () => showToast(`Module selected: ${c.title || c.id}`)
        });
      });
    }

    if (activeCmdFilter !== 'all') {
      pool = pool.filter(item => item.type === activeCmdFilter);
    }

    if (query) {
      pool = pool.filter(item => {
        return (item.title + ' ' + item.desc + ' ' + item.tag).toLowerCase().includes(query);
      });
    }

    if (pool.length === 0) {
      cmdResultsList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--ink-tertiary);">No matching capabilities found.</div>';
      return;
    }

    pool.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = `cmd-result-item ${index === 0 ? 'highlighted' : ''}`;
      el.innerHTML = `
        <div class="cmd-result-left">
          <div class="cmd-result-icon">${item.type === 'flagship' ? '&#127970;' : (item.type === 'engine' ? '&#9881;' : '&#10022;')}</div>
          <div>
            <div class="cmd-result-title">${item.title}</div>
            <div class="cmd-result-desc">${item.desc}</div>
          </div>
        </div>
        <span class="cmd-result-tag">${item.tag}</span>
      `;
      el.addEventListener('click', () => {
        closeCmdPalette();
        if (item.action) item.action();
      });
      cmdResultsList.appendChild(el);
    });
  }

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (cmdPalette && cmdPalette.classList.contains('open')) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
    } else if (e.key === 'Escape') {
      closeCmdPalette();
    }
  });

  if (navSearchTrigger) navSearchTrigger.addEventListener('click', openCmdPalette);
  if (heroSearchTrigger) heroSearchTrigger.addEventListener('click', openCmdPalette);
  if (cmdCloseBtn) cmdCloseBtn.addEventListener('click', closeCmdPalette);

  if (cmdPalette) {
    cmdPalette.addEventListener('click', (e) => {
      if (e.target === cmdPalette) closeCmdPalette();
    });
  }

  if (cmdSearchInput) {
    cmdSearchInput.addEventListener('input', renderCmdResults);
  }

  document.querySelectorAll('[data-cmd-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-cmd-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCmdFilter = btn.getAttribute('data-cmd-cat');
      renderCmdResults();
    });
  });

  // ==========================================================================
  // 8. INTERACTIVE COMPONENT LAB
  // ==========================================================================
  const LAB_COMPONENTS = {
    'sheet-stack': {
      title: '3D Layered Sheet Stack',
      url: 'components/sheet_stack.html',
      tech: 'CSS 3D Transforms (preserve-3d), pointer gesture dragging, spring dismissal physics'
    },
    'planetrise': {
      title: 'Planetrise WebGL Celestial Shader',
      url: 'shaders/planetrise.html',
      tech: 'WebGL2 fragment shader, Raymarched spherical limb, atmospheric Rayleigh scattering, dynamic pointer flare'
    },
    'text-ring': {
      title: 'Kinetic Vector Text Ring',
      url: 'components/text_ring.html',
      tech: 'SVG textPath curvature, pointer angular velocity tracking, elastic RPM damping'
    },
    'luminous-card': {
      title: 'Luminous Slit Directional Lighting Card',
      url: 'components/luminous_card.html',
      tech: 'CSS custom properties (--mouse-x, --mouse-y), traveling aperture highlight, sub-pixel ambient bloom'
    },
    'magnetic-button': {
      title: 'Magnetic Gravitational CTA Button',
      url: 'components/magnetic_button.html',
      tech: 'Elastic proximity attraction, two-stage vector offset (text + badge), damped spring return'
    }
  };

  const labTabs = document.querySelectorAll('.lab-tab');
  const labIframe = document.getElementById('labIframe');
  const labCaptionTitle = document.getElementById('labCaptionTitle');
  const labCaptionTech = document.getElementById('labCaptionTech');

  if (labTabs.length && labIframe) {
    labTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const componentKey = tab.getAttribute('data-component');
        if (!componentKey || !LAB_COMPONENTS[componentKey]) return;

        labTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const comp = LAB_COMPONENTS[componentKey];
        labIframe.src = comp.url;
        if (labCaptionTitle) labCaptionTitle.textContent = comp.title;
        if (labCaptionTech) labCaptionTech.textContent = comp.tech;
      });
    });
  }

  // ==========================================================================
  // 9. ANIMATED NUMBER COUNTERS ON SCROLL
  // ==========================================================================
  const metricNums = document.querySelectorAll('.metric-num');
  let metricsAnimated = false;

  function animateMetrics() {
    if (metricsAnimated) return;
    const heroBar = document.querySelector('.hero-metrics-bar');
    if (!heroBar) return;

    const rect = heroBar.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.9) {
      metricsAnimated = true;
      metricNums.forEach(el => {
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = target % 1 !== 0;

        let current = 0;
        const duration = 1200;
        const stepTime = 20;
        const increment = target / (duration / stepTime);

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = `${isDecimal ? current.toFixed(1) : Math.floor(current)}${suffix}`;
        }, stepTime);
      });
    }
  }

  window.addEventListener('scroll', animateMetrics, { passive: true });
  animateMetrics();

  // ==========================================================================
  // 10. SMOOTH SCROLL FOR NAV LINKS
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();

/**
 * Apex Athlete Exchange — demo client.
 * Vanilla JS, no dependencies. Data comes from data.js (all fictional).
 * Changes are saved to this browser's localStorage so the demo survives a refresh.
 */
(function () {
  'use strict';

  const SEED = window.AAX_DATA;
  const STORE_KEY = 'aax-demo-v2';
  const SECTIONS = ['discovery', 'profile', 'agents', 'scouting', 'opportunities', 'ledger'];
  const LEVELS = SEED.verificationLevels.map((l) => l.id);
  const PERMISSIONS = ['viewer', 'contributor', 'manager', 'representative'];
  const PERMISSION_LABELS = {
    viewer: ['View only', 'Sees the public profile, test results and video.'],
    contributor: ['Contributor', 'Can add game stats, training video and press coverage.'],
    manager: ['Manager', 'Can contact clubs and submit the athlete to trials. The athlete signs every contract.'],
    representative: ['Exclusive representative', 'Negotiates contracts and sponsorship and approves payouts from escrow.']
  };
  const COUNTRY_CODES = { 'Jamaica': 'JAM', 'Trinidad & Tobago': 'TTO', 'Barbados': 'BAR', 'Puerto Rico': 'PUR', 'Ghana': 'GHA' };
  // Who "you" are in each demo role.
  const ME = { athlete: 'ath-01', agent: 'agt-01', scout: 'sct-01', organization: 'org-01', admin: null };
  const DEFAULT_FILTER = { search: '', sport: 'all', position: 'all', country: 'all', status: 'all', verification: 'none', minHeight: 66 };

  const clone = (o) => JSON.parse(JSON.stringify(o));

  function freshState() {
    return {
      version: 2,
      role: 'athlete',
      actingAthleteId: 'ath-01',
      viewMode: 'grid',
      selectedAthleteId: SEED.featuredAthleteId,
      compare: [],
      athletes: clone(SEED.athletes),
      opportunities: clone(SEED.opportunities),
      watchlists: clone(SEED.watchlists),
      transactions: clone(SEED.transactions),
      agreements: clone(SEED.agreements),
      applications: clone(SEED.applications),
      counters: { agreement: 2, application: 1, watchlist: 4 }
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (saved && saved.version === 2) return Object.assign(freshState(), saved);
    } catch (e) { /* storage unavailable or corrupt: start fresh */ }
    return freshState();
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* private mode: demo still works, just not persisted */ }
  }

  let S = loadState();
  ME.athlete = S.actingAthleteId || 'ath-01';
  let filter = { ...DEFAULT_FILTER };
  let stepper = null;

  /* ==========================================================================
     HELPERS
     ========================================================================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const formatDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const feetIn = (inches) => `${Math.floor(inches / 12)}′${inches % 12}″`;
  const shortHeight = (inches) => `${Math.floor(inches / 12)}-${inches % 12}`;
  const initials = (name) => name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const plural = (n, word, many = word + 's') => `${n} ${n === 1 ? word : many}`;
  const code = (a) => COUNTRY_CODES[a.country] || a.country;
  const sportShort = (sport) => (sport === 'Track & Field' ? 'Track' : sport);
  const levelIndex = (id) => LEVELS.indexOf(id);
  const levelLabel = (id) => (SEED.verificationLevels.find((l) => l.id === id) || {}).label || id;
  const normName = (s) => s.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();

  function ageOf(dob) {
    const d = new Date(dob + 'T00:00:00');
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age -= 1;
    return age;
  }
  const isMinor = (a) => ageOf(a.dob) < 18;

  const athleteById = (id) => S.athletes.find((a) => a.id === id);
  const agentById = (id) => SEED.agents.find((a) => a.id === id);
  const orgById = (id) => SEED.organizations.find((o) => o.id === id);
  const byGrade = (list) => [...list].sort((a, b) => b.grade - a.grade);

  function myName() {
    const id = ME[S.role];
    if (S.role === 'athlete') return athleteById(id).name;
    if (S.role === 'agent') return agentById(id).name;
    if (S.role === 'scout') return SEED.scouts[0].name;
    if (S.role === 'organization') return orgById(id).name;
    return 'Platform admin';
  }

  // Live or pending agreement for an athlete (an athlete can have only one).
  const openAgreementFor = (athleteId) => S.agreements.find((g) => g.athleteId === athleteId && (g.status === 'active' || g.status === 'pending'));

  function repStatus(a) {
    const g = openAgreementFor(a.id);
    if (g && g.status === 'active') return { kind: 'represented', agent: agentById(g.agentId) };
    if (g) return { kind: 'pending', agent: agentById(g.agentId) };
    return { kind: a.status === 'Free Agent' ? 'free' : 'seeking' };
  }

  function statusMarkup(a) {
    const r = repStatus(a);
    if (r.kind === 'represented') return `<span class="status status-neutral">Represented by ${esc(r.agent.name)}</span>`;
    if (r.kind === 'pending') return '<span class="status status-info">Agreement pending</span>';
    if (r.kind === 'free') return '<span class="status status-ok">Free agent</span>';
    return '<span class="status status-wait">Seeking an agent</span>';
  }

  const verificationBadge = (a) => `<span class="badge badge-${a.verification}">${esc(levelLabel(a.verification))}</span>`;
  const minorBadge = (a) => (isMinor(a) ? '<span class="badge badge-minor">Under 18</span>' : '');

  // Ranked by scout grade within three pools (recruiting-site national / position / state convention).
  function ranks(a) {
    const place = (pool) => ({ rank: byGrade(pool).findIndex((x) => x.id === a.id) + 1, of: pool.length });
    return {
      board: place(S.athletes),
      sport: place(S.athletes.filter((x) => x.sport === a.sport)),
      country: place(S.athletes.filter((x) => x.country === a.country))
    };
  }

  function rankRow(a) {
    const r = ranks(a);
    const cell = (label, p, title) => `<div title="${esc(title)}"><dt>${label}</dt><dd class="num">${p.rank}<span>/${p.of}</span></dd></div>`;
    return `<dl class="rank-row">
      ${cell('Board', r.board, 'Rank among all athletes on the board, by scout grade')}
      ${cell(esc(sportShort(a.sport)), r.sport, `Rank among ${a.sport} athletes`)}
      ${cell(code(a), r.country, `Rank among athletes from ${a.country}`)}
    </dl>`;
  }

  // Change since last week's board (the +/- column on federation rankings and motorsport standings).
  function movement(a) {
    const diff = (a.prevRank || ranks(a).board.rank) - ranks(a).board.rank;
    if (diff > 0) return `<span class="move move-up" title="Up ${diff} since last week"><span aria-hidden="true">▲</span>${diff}<span class="visually-hidden"> up</span></span>`;
    if (diff < 0) return `<span class="move move-down" title="Down ${-diff} since last week"><span aria-hidden="true">▼</span>${-diff}<span class="visually-hidden"> down</span></span>`;
    return '<span class="move move-same" title="No change since last week"><span aria-hidden="true">–</span><span class="visually-hidden">no change</span></span>';
  }

  // Small inline trend line (Tremor spark-chart pattern). Decorative; callers add a text equivalent.
  function sparkline(values, { width = 56, height = 18, area = true, dot = true } = {}) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = 2;
    const x = (i) => pad + (i * (width - pad * 2)) / (values.length - 1);
    const y = (v) => (max === min ? height / 2 : pad + (1 - (v - min) / (max - min)) * (height - pad * 2));
    const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    const last = pts[pts.length - 1].split(',');
    return `<svg class="spark" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">
      ${area ? `<path class="spark-area" d="M${pts[0]} L${pts.join(' L')} L${x(values.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z"/>` : ''}
      <polyline class="spark-line" points="${pts.join(' ')}"/>
      ${dot ? `<circle class="spark-dot" cx="${last[0]}" cy="${last[1]}" r="2.5"/>` : ''}
    </svg>`;
  }

  const signed = (n) => `${n > 0 ? '+' : n < 0 ? '−' : '±'}${Math.abs(n).toFixed(1)}`;

  function splitName(name) {
    const parts = name.split(' ');
    const last = parts.pop();
    return `<span class="name-first">${esc(parts.join(' '))}</span> <span class="name-last">${esc(last)}</span>`;
  }

  // Where an athlete stands among everyone on the board for a measurable.
  function standing(getter, a) {
    const values = S.athletes.map(getter);
    const value = getter(a);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return {
      rank: values.filter((v) => v > value).length + 1,
      of: values.length,
      pct: max === min ? 100 : Math.round(((value - min) / (max - min)) * 100)
    };
  }

  function canSeeAcademics(a) {
    if (S.role === 'admin') return true;
    if (S.role === 'athlete') return a.id === ME.athlete;
    if (S.role === 'agent') {
      const g = openAgreementFor(a.id);
      return !!g && g.status === 'active' && g.agentId === ME.agent && !isMinor(a) &&
        PERMISSIONS.indexOf(a.permission) >= PERMISSIONS.indexOf('manager');
    }
    return false;
  }

  function visibleTransactions() {
    if (S.role === 'admin') return S.transactions;
    if (S.role === 'athlete') return S.transactions.filter((t) => t.athleteId === ME.athlete);
    if (S.role === 'agent') return S.transactions.filter((t) => t.agentId === ME.agent);
    if (S.role === 'organization') return S.transactions.filter((t) => t.orgId === ME.organization);
    return [];
  }

  function visibleAgreements() {
    if (S.role === 'admin') return S.agreements;
    if (S.role === 'athlete') return S.agreements.filter((g) => g.athleteId === ME.athlete);
    if (S.role === 'agent') return S.agreements.filter((g) => g.agentId === ME.agent);
    return null; // private to the parties
  }

  /* ==========================================================================
     INIT
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    wireTheme();
    wireControls();
    wireModals();
    trackHeaderHeight();
    renderAll();

    const initial = location.hash.slice(1);
    switchSection(SECTIONS.includes(initial) ? initial : 'discovery', { push: false, focus: false });
    window.addEventListener('popstate', () => {
      const s = location.hash.slice(1);
      switchSection(SECTIONS.includes(s) ? s : 'discovery', { push: false });
    });
  });

  function renderAll() {
    $('#roleSelect').value = S.role === 'athlete' ? `athlete:${ME.athlete}` : S.role;
    $$('.segmented-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === S.viewMode)));
    renderRoleChrome();
    renderScores();
    renderSpotlight();
    renderWire();
    renderLeaders();
    renderGlance();
    renderBoard();
    renderProfile(S.selectedAthleteId);
    renderAgents();
    renderAgreements();
    renderWatchlists();
    renderCompare();
    renderOpportunities();
    renderLedger();
    $('#compareCount').textContent = S.compare.length;
  }

  // Persist, then re-render everything that depends on representation, payments or applications.
  function refresh() {
    save();
    renderAll();
  }

  function currentTheme() {
    const set = document.documentElement.dataset.theme;
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function wireTheme() {
    const btn = $('#themeToggle');
    const sync = () => {
      const dark = currentTheme() === 'dark';
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('aria-pressed', String(dark));
    };
    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('aax-theme', next); } catch (e) { /* not persisted */ }
      sync();
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
    sync();
  }

  function trackHeaderHeight() {
    const header = $('.site-header');
    const update = () => {
      const sticky = getComputedStyle(header).position === 'sticky';
      document.documentElement.style.setProperty('--header-h', sticky ? `${header.offsetHeight}px` : '0px');
    };
    update();
    window.addEventListener('resize', update);
  }

  /* ==========================================================================
     NAVIGATION & ROLES
     ========================================================================== */
  function switchSection(id, { push = true, focus = true } = {}) {
    if (!SECTIONS.includes(id)) return;
    $$('#navTabs .nav-tab').forEach((t) => {
      if (t.dataset.section === id) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
    $$('.view').forEach((v) => v.classList.toggle('is-active', v.id === `section-${id}`));
    if (push && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    if (focus) {
      window.scrollTo(0, 0);
      const heading = $(`#section-${id} h1`);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }

  function viewProfile(id) {
    S.selectedAthleteId = id;
    save();
    renderProfile(id);
    switchSection('profile');
  }

  function scrollToEl(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }

  function roleConfig() {
    const role = S.role;
    if (role === 'athlete') {
      const me = athleteById(ME.athlete);
      const r = ranks(me);
      const openTrials = S.opportunities.filter((o) => eligibility(me, o).length === 0).length;
      const g = openAgreementFor(me.id);
      const agentLine = g ? (g.status === 'active' ? `Represented by ${agentById(g.agentId).name}.` : 'Your agent agreement is waiting for a signature.') : 'You don’t have an agent yet.';
      return {
        avatar: initials(me.name),
        title: `Welcome back, ${me.name.split(' ')[0]}`,
        text: `You’re #${r.board.rank} of ${r.board.of} on the board. ${agentLine} ${plural(openTrials, 'trial')} open to you.`,
        balanceLabel: 'Held for you',
        balance: money(S.transactions.filter((t) => t.athleteId === me.id && t.payee === me.name && t.status === 'held').reduce((s, t) => s + t.amount, 0)),
        header: ['My profile', () => viewProfile(me.id)],
        one: ['Find an agent', () => switchSection('agents')],
        two: ['Open trials', () => switchSection('opportunities')]
      };
    }
    if (role === 'agent') {
      const me = agentById(ME.agent);
      const mine = S.agreements.filter((g) => g.agentId === me.id);
      const available = S.athletes.filter((a) => !openAgreementFor(a.id)).length;
      return {
        avatar: initials(me.name),
        title: `${me.name} · ${me.agency}`,
        text: `${plural(mine.filter((g) => g.status === 'active').length, 'active agreement')}, ${mine.filter((g) => g.status === 'pending').length} pending. ${plural(available, 'athlete')} on the board without an agent.`,
        balanceLabel: 'Commission received',
        balance: money(S.transactions.filter((t) => t.agentId === me.id && t.status === 'settled').reduce((s, t) => s + t.amount, 0)),
        header: ['Find athletes', () => { switchSection('discovery'); applyPreset('available'); }],
        one: ['Your agreements', () => { switchSection('agents', { focus: false }); scrollToEl($('#h-agreements')); }],
        two: ['Payments', () => switchSection('ledger')]
      };
    }
    if (role === 'scout') {
      const me = SEED.scouts[0];
      const lists = S.watchlists.filter((w) => w.owner === me.name);
      return {
        avatar: initials(me.name),
        title: `${me.name} · ${me.org}`,
        text: `${plural(lists.length, 'watchlist')}, ${plural(S.compare.length, 'athlete')} in your comparison.`,
        balanceLabel: 'Watchlists',
        balance: String(lists.length),
        header: ['Save comparison', saveComparisonAsWatchlist],
        one: ['Watchlists', () => switchSection('scouting')],
        two: ['Compare', openCompare]
      };
    }
    if (role === 'organization') {
      const me = orgById(ME.organization);
      const myOpps = S.opportunities.filter((o) => o.orgId === me.id);
      const apps = S.applications.filter((ap) => myOpps.some((o) => o.id === ap.oppId));
      return {
        avatar: initials(me.name),
        title: me.name,
        text: `${plural(myOpps.length, 'trial')} listed. ${plural(apps.length, 'application')} received through the exchange.`,
        balanceLabel: 'Applications',
        balance: String(apps.length),
        header: ['Review applications', () => switchSection('opportunities')],
        one: ['Your trials', () => switchSection('opportunities')],
        two: ['Payments', () => switchSection('ledger')]
      };
    }
    const held = S.transactions.filter((t) => t.status === 'held');
    return {
      avatar: 'AX',
      title: 'Platform admin',
      text: `${plural(S.agreements.filter((g) => g.status === 'pending').length, 'agreement')} waiting for a signature. ${plural(held.length, 'payment')} held in escrow.`,
      balanceLabel: 'Held in escrow',
      balance: money(held.reduce((s, t) => s + t.amount, 0)),
      header: ['Download ledger', exportCsv],
      one: ['Payments', () => switchSection('ledger')],
      two: ['Agreements', () => { switchSection('agents', { focus: false }); scrollToEl($('#h-agreements')); }]
    };
  }

  function renderRoleChrome() {
    const c = roleConfig();
    $('#welcomeAvatar').textContent = c.avatar;
    $('#welcomeTitle').textContent = c.title;
    $('#welcomeText').textContent = c.text;
    $('#balanceLabel').textContent = c.balanceLabel;
    $('#balanceValue').textContent = c.balance;
    const bind = (el, [label, fn]) => { el.textContent = label; el.onclick = fn; };
    bind($('#headerActionBtn'), c.header);
    bind($('#welcomeActionOne'), c.one);
    bind($('#welcomeActionTwo'), c.two);
    $('#saveWatchlistBtn').hidden = S.role === 'athlete';
  }

  /* ==========================================================================
     CONTROLS (delegated)
     ========================================================================== */
  function wireControls() {
    $('#roleSelect').addEventListener('change', (e) => {
      const [role, athleteId] = e.target.value.split(':');
      S.role = role;
      if (athleteId) S.actingAthleteId = ME.athlete = athleteId;
      refresh();
    });

    $('#searchInput').addEventListener('input', (e) => { filter.search = e.target.value.trim().toLowerCase(); renderBoard(); });
    $$('#sportTabs .sport-tab').forEach((t) => t.addEventListener('click', () => { filter.sport = t.dataset.sport; syncFilters(); renderBoard(); }));
    [['#filterPosition', 'position'], ['#filterCountry', 'country'], ['#filterStatus', 'status'], ['#filterVerification', 'verification']].forEach(([sel, key]) => {
      $(sel).addEventListener('change', (e) => { filter[key] = e.target.value; renderBoard(); });
    });
    $('#filterHeight').addEventListener('input', (e) => {
      filter.minHeight = parseInt(e.target.value, 10);
      $('#filterHeightVal').textContent = feetIn(filter.minHeight);
      renderBoard();
    });
    $$('[data-preset]').forEach((b) => b.addEventListener('click', () => applyPreset(b.dataset.preset)));
    $$('.segmented-btn').forEach((b) => b.addEventListener('click', () => {
      S.viewMode = b.dataset.view;
      save();
      $$('.segmented-btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      renderBoard();
    }));

    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const { action, id } = el.dataset;
      switch (action) {
        case 'nav': e.preventDefault(); switchSection(el.dataset.section); break;
        case 'view-profile': e.preventDefault(); viewProfile(id); break;
        case 'toggle-compare': toggleCompare(id); break;
        case 'open-compare': openCompare(); break;
        case 'clear-compare': S.compare = []; refresh(); break;
        case 'load-list': loadWatchlist(id); break;
        case 'delete-list': deleteWatchlist(id); break;
        case 'save-watchlist': saveComparisonAsWatchlist(); break;
        case 'print': window.print(); break;
        case 'export-csv': exportCsv(); break;
        case 'start-agreement': openAgreement({ athleteId: el.dataset.athlete, agentId: el.dataset.agent }, el); break;
        case 'countersign': openCountersign(id, el); break;
        case 'toggle-contact': toggleContact(el); break;
        case 'apply': openApply(id, el); break;
        case 'play-clip': selectClip(parseInt(el.dataset.index, 10)); break;
        case 'jump': scrollToEl(document.getElementById(el.dataset.target)); break;
        case 'close-modal': closeModal(); break;
        case 'step': goToStep(parseInt(el.dataset.to, 10)); break;
        case 'sign': sign(); break;
        case 'reset-filters': applyPreset('reset'); break;
        case 'dismiss-toast': dismissToast(el.closest('.toast')); break;
        case 'reset-demo': openModal($('#confirmModal'), el); break;
        case 'confirm-reset': resetDemo(); break;
        default: break;
      }
    });
  }

  /* ==========================================================================
     SCORES, SPOTLIGHT, TRENDING
     ========================================================================== */
  function renderScores() {
    $('#scoresList').innerHTML = SEED.results.map((r) => `
      <li class="score">
        <span class="score-event">${esc(r.event)}</span>
        ${r.rows.map(([name, value]) => `<span class="score-row"><span>${esc(name)}</span><strong>${esc(value)}</strong></span>`).join('')}
        <span class="score-status">${esc(r.status)}</span>
      </li>`).join('');
  }

  function renderSpotlight() {
    const a = athleteById(SEED.featuredAthleteId);
    const r = ranks(a);
    const stats = a.season.slice(0, 3).concat([{ label: 'Vertical', value: `${a.vertical_in}″` }, { label: 'Wingspan', value: feetIn(a.size.wingspan_in) }]);
    $('#spotlight').innerHTML = `
      <div class="spotlight-tags">
        <span class="badge badge-live">Featured</span>
        ${verificationBadge(a)} ${minorBadge(a)}
      </div>
      <div>
        <p class="spotlight-sport">${esc(a.sport)} · ${esc(a.position)}</p>
        <h2 class="spotlight-name"><a href="#profile" data-action="view-profile" data-id="${a.id}">${splitName(a.name)}</a></h2>
        <p class="spotlight-copy">${esc(a.summary || '')}</p>
        <dl class="spotlight-stats">
          ${stats.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}
        </dl>
        <div class="spotlight-actions">
          <button type="button" class="btn btn-accent" data-action="view-profile" data-id="${a.id}">Open profile</button>
          ${statusMarkup(a)}
        </div>
      </div>
      <div class="spotlight-side">
        <div class="jersey" aria-hidden="true">
          <span class="jersey-number">${a.jersey !== '—' ? esc(a.jersey) : esc(initials(a.name))}</span>
          <span class="jersey-name">${esc(a.name.split(' ').pop())}</span>
        </div>
        <div class="grade-box">
          <div class="grade-figure">${a.grade.toFixed(1)}</div>
          <div class="grade-label">Scout grade · #${r.board.rank} of ${r.board.of}</div>
        </div>
      </div>`;
  }

  function renderWire() {
    $('#wireList').innerHTML = SEED.risers.map((x) => {
      const a = athleteById(x.athleteId);
      return `
        <li class="wire-item">
          <span class="avatar" aria-hidden="true">${esc(initials(a.name))}</span>
          <button type="button" class="wire-name" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button>
          <span class="wire-delta">${esc(x.delta)}</span>
          <span class="wire-note">${esc(sportShort(a.sport))} · ${esc(x.note)}</span>
        </li>`;
    }).join('');
  }

  function renderLeaders() {
    const cats = [
      ['Scout grade', (a) => a.grade, (a) => a.grade.toFixed(1)],
      ['Vertical jump', (a) => a.vertical_in, (a) => `${a.vertical_in}″`],
      ['Wingspan', (a) => a.size.wingspan_in, (a) => feetIn(a.size.wingspan_in)],
      ['Height', (a) => a.size.height_in, (a) => feetIn(a.size.height_in)]
    ];
    $('#leadersGrid').innerHTML = cats.map(([title, get, show]) => {
      const top = [...S.athletes].sort((x, y) => get(y) - get(x)).slice(0, 3);
      return `
        <div class="leaders-cat">
          <h3>${title}</h3>
          <ol>${top.map((a) => `
            <li class="leader">
              <button type="button" class="leader-name" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button>
              <span class="leader-value">${show(a)}</span>
            </li>`).join('')}</ol>
        </div>`;
    }).join('');
  }

  function renderGlance() {
    const today = new Date();
    const cells = [
      ['Athletes', S.athletes.length],
      ['Combine verified', S.athletes.filter((a) => a.verification === 'pro').length],
      ['Without an agent', S.athletes.filter((a) => !openAgreementFor(a.id)).length],
      ['Open trials', S.opportunities.filter((o) => new Date(o.deadline + 'T23:59:59') >= today).length]
    ];
    $('#glance').innerHTML = cells.map(([k, v]) => `<div><dt>${k}</dt><dd class="num">${v}</dd></div>`).join('');
  }

  /* ==========================================================================
     PROSPECT BOARD
     ========================================================================== */
  function syncFilters() {
    $('#searchInput').value = filter.search;
    $('#filterPosition').value = filter.position;
    $('#filterCountry').value = filter.country;
    $('#filterStatus').value = filter.status;
    $('#filterVerification').value = filter.verification;
    $('#filterHeight').value = filter.minHeight;
    $('#filterHeightVal').textContent = feetIn(filter.minHeight);
    $$('#sportTabs .sport-tab').forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.sport === filter.sport)));
  }

  function applyPreset(name) {
    const presets = {
      'jamaican-wingers': { sport: 'Football', country: 'Jamaica', position: 'Winger' },
      'tall-basketball': { sport: 'Basketball', minHeight: 77 },
      'sprinters': { sport: 'Track & Field', position: '100 m' },
      'available': { status: 'available' },
      'combine': { verification: 'pro' },
      'reset': {}
    };
    filter = { ...DEFAULT_FILTER, ...(presets[name] || {}) };
    syncFilters();
    renderBoard();
  }

  function filteredAthletes() {
    return byGrade(S.athletes.filter((a) => {
      if (filter.search) {
        const hay = `${a.name} ${a.sport} ${a.position} ${a.country} ${code(a)} ${a.city} ${a.team} ${a.school}`.toLowerCase();
        if (!filter.search.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      if (filter.sport !== 'all' && a.sport !== filter.sport) return false;
      if (filter.position !== 'all' && !a.position.toLowerCase().includes(filter.position.toLowerCase())) return false;
      if (filter.country !== 'all' && a.country !== filter.country) return false;
      if (filter.status !== 'all') {
        const kind = repStatus(a).kind;
        if (filter.status === 'available' && !(kind === 'free' || kind === 'seeking')) return false;
        if (filter.status === 'Seeking Agent' && kind !== 'seeking') return false;
        if (filter.status === 'Free Agent' && kind !== 'free') return false;
        if (filter.status === 'Represented' && kind !== 'represented') return false;
      }
      if (levelIndex(a.verification) < levelIndex(filter.verification)) return false;
      if (a.size.height_in < filter.minHeight) return false;
      return true;
    }));
  }

  function compareButton(id) {
    const on = S.compare.includes(id);
    return `<button type="button" class="btn btn-quiet btn-sm" data-action="toggle-compare" data-id="${id}" aria-pressed="${on}">${on ? 'Comparing' : 'Compare'}</button>`;
  }

  function renderBoard() {
    const list = filteredAthletes();
    $('#resultCount').textContent = list.length;
    $('#resultNoun').textContent = list.length === 1 ? 'athlete' : 'athletes';
    const empty = `
      <div class="empty">
        <h3>No athletes match</h3>
        <p>Try a lower minimum height or a different sport.</p>
        <button type="button" class="btn btn-secondary btn-sm" data-action="reset-filters">Clear filters</button>
      </div>`;

    const grid = $('#prospectGrid');
    const tableWrap = $('#prospectTableWrap');
    const table = S.viewMode === 'table';
    grid.hidden = table;
    tableWrap.hidden = !table;

    if (table) {
      $('#prospectTableBody').innerHTML = list.length ? list.map((a) => {
        const r = ranks(a);
        const key = a.season[0];
        return `
          <tr>
            <td class="col-num"><span class="board-rank">${r.board.rank}</span></td>
            <td>${movement(a)}</td>
            <td>
              <button type="button" class="board-name" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button>
              <span class="cell-sub">${esc(a.team)} · ${esc(a.city)}, ${code(a)}</span>
            </td>
            <td>${esc(a.position)}<span class="cell-sub">${esc(a.sport)}</span></td>
            <td class="col-num">${ageOf(a.dob)}</td>
            <td class="cell-nowrap">${shortHeight(a.size.height_in)} / ${a.size.weight_lb}</td>
            <td class="cell-nowrap"><span class="cell-strong">${esc(key.value)}</span> <span class="cell-unit">${esc(key.label)}</span></td>
            <td class="col-num"><span class="board-grade">${a.grade.toFixed(1)}</span></td>
            <td class="col-num">${r.sport.rank} <span class="cell-unit">·</span> ${r.country.rank}</td>
            <td>${statusMarkup(a)}</td>
            <td><div class="cell-actions">${compareButton(a.id)}</div></td>
          </tr>`;
      }).join('') : `<tr><td colspan="11">${empty}</td></tr>`;
      return;
    }

    grid.innerHTML = list.length ? list.map((a, i) => `
      <article class="card prospect" style="--i:${i}">
        <div class="prospect-head">
          <div class="prospect-rank-col"><span class="prospect-rank num" title="Board rank">${ranks(a).board.rank}</span>${movement(a)}</div>
          <div>
            <p class="prospect-meta"><strong>${code(a)}</strong> · ${esc(a.sport)} · Age ${ageOf(a.dob)} ${verificationBadge(a)} ${minorBadge(a)}</p>
            <h3 class="prospect-name"><button type="button" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button></h3>
            <p class="prospect-pos">${esc(a.position)}</p>
            <p class="prospect-team">${esc(a.team)}</p>
          </div>
          <div class="grade-tile"><strong>${a.grade.toFixed(1)}</strong><span>Grade</span>${sparkline(a.gradeHistory, { width: 44, height: 14, area: false })}<span class="visually-hidden">Six-month change ${signed(a.grade - a.gradeHistory[0])}</span></div>
        </div>
        ${rankRow(a)}
        <dl class="metric-grid">
          <div><dt>Height</dt><dd>${feetIn(a.size.height_in)}</dd></div>
          <div><dt>Weight</dt><dd>${a.size.weight_lb} lb</dd></div>
          <div><dt>Wingspan</dt><dd>${feetIn(a.size.wingspan_in)}</dd></div>
        </dl>
        <dl class="metric-grid alt">
          ${a.season.slice(0, 3).map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}
        </dl>
        <div class="prospect-foot">
          ${statusMarkup(a)}
          <div class="prospect-actions">${compareButton(a.id)}</div>
        </div>
      </article>`).join('') : empty;
  }

  /* ==========================================================================
     PROFILE
     ========================================================================== */
  function profileActions(a) {
    const r = repStatus(a);
    const parts = [];
    if (r.kind === 'represented') parts.push(`<p class="player-represented">Represented by ${esc(r.agent.name)}</p>`);
    else if (r.kind === 'pending') parts.push(`<p class="player-represented">Agreement with ${esc(r.agent.name)} waiting for a signature</p>`);
    else if (S.role === 'athlete' && a.id === ME.athlete) parts.push('<button type="button" class="btn btn-accent" data-action="nav" data-section="agents">Find an agent</button>');
    else if (S.role === 'agent') parts.push(`<button type="button" class="btn btn-accent" data-action="start-agreement" data-athlete="${a.id}" data-agent="${ME.agent}">Offer representation</button>`);
    const on = S.compare.includes(a.id);
    parts.push(`<button type="button" class="btn btn-quiet" data-action="toggle-compare" data-id="${a.id}" aria-pressed="${on}">${on ? 'In comparison' : 'Add to comparison'}</button>`);
    parts.push('<button type="button" class="btn btn-quiet" data-action="print">Print / save PDF</button>');
    return parts.join('');
  }

  function renderProfile(id) {
    const a = athleteById(id) || athleteById(SEED.featuredAthleteId);
    S.selectedAthleteId = a.id;
    const age = ageOf(a.dob);
    const academics = canSeeAcademics(a);
    const isMe = S.role === 'athlete' && a.id === ME.athlete;
    const standings = [
      ['Height', feetIn(a.size.height_in), standing((x) => x.size.height_in, a)],
      ['Wingspan', feetIn(a.size.wingspan_in), standing((x) => x.size.wingspan_in, a)],
      ['Vertical jump', `${a.vertical_in}″`, standing((x) => x.vertical_in, a)]
    ];
    const verifyNote = {
      pro: 'measured at a partner combine.',
      athletic: 'results checked against official meet or match records.',
      identity: 'identity checked; results are self-reported.',
      none: 'nothing checked yet.'
    }[a.verification];
    const lockIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    const card = (hid, title, body) => `
      <section class="card profile-card" aria-labelledby="${hid}">
        <div class="card-head"><h2 class="card-title" id="${hid}">${title}</h2></div>
        <div class="profile-card-body">${body}</div>
      </section>`;

    $('#profileBody').innerHTML = `
      <header class="player-header">
        <div class="player-header-main">
          <div>
            <a href="#discovery" class="player-back" data-action="nav" data-section="discovery">← Prospect board</a>
            <p class="player-sport">${esc(a.sport)} · ${esc(a.position)}</p>
            ${a.jersey !== '—' ? `<p class="player-number num" aria-label="Shirt number ${esc(a.jersey)}">#${esc(a.jersey)}</p>` : ''}
            <h1 class="player-name" id="profileName">${splitName(a.name)}</h1>
            <div class="player-badges">${verificationBadge(a)} ${minorBadge(a)}</div>
          </div>
          <dl class="bio-list">
            <div><dt>Ht / Wt</dt><dd>${feetIn(a.size.height_in)}, ${a.size.weight_lb} lb</dd></div>
            <div><dt>Age</dt><dd>${age}</dd></div>
            <div><dt>From</dt><dd>${esc(a.city)}, ${esc(a.country)}</dd></div>
            <div><dt>Team</dt><dd>${esc(a.team)}</dd></div>
            <div><dt>Status</dt><dd>${statusMarkup(a)}</dd></div>
          </dl>
          <div class="player-side">
            <div class="grade-box">
              <div class="grade-label">Scout grade</div>
              <div class="grade-figure">${a.grade.toFixed(1)}</div>
            </div>
            <div class="player-actions">${profileActions(a)}</div>
          </div>
        </div>
        <div class="player-statblock">
          <p class="player-statblock-title">This season</p>
          <dl>${a.season.slice(0, 4).map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}</dl>
          ${rankRow(a)}
        </div>
      </header>

      ${age < 18 ? `<p class="notice minor-notice">${esc(a.name.split(' ')[0])} is under 18. A parent or guardian must approve applications and sign any agreement. Academic records are hidden.</p>` : ''}

      <nav class="profile-tabs" aria-label="Profile sections">
        ${[['p-season', 'Season'], ['p-trend', 'Grade'], ['p-measure', 'Measurements'], ['p-tests', 'Testing'], ['p-career', 'Career'], ['p-video', 'Video'], ['p-honours', 'Honours'], ['p-school', 'Education'], ['p-news', 'News'], ['p-perms', 'Permissions']]
          .map(([t, l]) => `<button type="button" class="profile-tab" data-action="jump" data-target="${t}">${l}</button>`).join('')}
      </nav>

      <div class="profile-grid">
        <div class="profile-col">
          <section class="card profile-card" aria-labelledby="p-season">
            <div class="card-head"><h2 class="card-title" id="p-season">Season stats</h2></div>
            <dl class="metric-grid">${a.season.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}</dl>
          </section>
          ${card('p-trend', 'Grade history', (() => {
            const h = a.gradeHistory;
            const change = a.grade - h[0];
            const r = ranks(a).board.rank;
            const moved = (a.prevRank || r) - r;
            return `
              <div class="trend-card">
                <div>
                  <div class="trend-chart ${change >= 0 ? '' : 'trend-down'}">${sparkline(h, { width: 320, height: 120 }).replace('class="spark"', 'class="spark" preserveAspectRatio="none" style="width:100%;height:120px"')}</div>
                  <div class="trend-axis" aria-hidden="true">${SEED.gradeMonths.map((m) => `<span>${m}</span>`).join('')}</div>
                  <p class="visually-hidden">Scout grade by month: ${SEED.gradeMonths.map((m, i) => `${m} ${h[i]}`).join(', ')}.</p>
                </div>
                <dl class="trend-summary">
                  <dt>6-month change</dt><dd class="${change >= 0 ? 'trend-up' : 'trend-down'}">${signed(change)}</dd>
                  <dt>High</dt><dd>${Math.max(...h).toFixed(1)}</dd>
                  <dt>This week</dt><dd>${moved > 0 ? `Up ${moved}` : moved < 0 ? `Down ${-moved}` : 'No change'}</dd>
                </dl>
              </div>`;
          })())}
          ${card('p-measure', 'Measurements', `
            <dl class="kv">
              <div><dt>Height</dt><dd>${feetIn(a.size.height_in)}</dd></div>
              <div><dt>Weight</dt><dd>${a.size.weight_lb} lb</dd></div>
              <div><dt>Wingspan</dt><dd>${feetIn(a.size.wingspan_in)}</dd></div>
              <div><dt>Standing reach</dt><dd>${feetIn(a.size.reach_in)}</dd></div>
              <div><dt>Dominant hand</dt><dd>${esc(a.size.hand)}</dd></div>
              <div><dt>Dominant foot</dt><dd>${esc(a.size.foot)}</dd></div>
            </dl>
            <h3 class="label" style="margin:16px 0 4px">Against the board</h3>
            <p class="muted" style="font-size:13px">Rank among all ${S.athletes.length} athletes, across sports.</p>
            <ul>${standings.map(([label, value, s]) => `
              <li class="standing">
                <span class="standing-label">${label}</span>
                <span class="standing-value num">${value}</span>
                <span class="standing-rank num">${s.rank} of ${s.of}</span>
                <span class="standing-bar" aria-hidden="true"><span style="width:${Math.max(4, s.pct)}%"></span></span>
              </li>`).join('')}</ul>`)}
          ${card('p-tests', 'Testing', `
            <dl class="kv">${a.tests.map((t) => `<div><dt>${esc(t.label)}</dt><dd>${esc(t.value)}</dd></div>`).join('')}</dl>
            <p class="muted" style="font-size:13px;margin-top:8px">${esc(levelLabel(a.verification))}: ${verifyNote}</p>`)}
          ${card('p-career', 'Career', `
            <ol class="timeline">${a.career.map((c) => `
              <li><div class="timeline-when">${esc(c.season)} · ${esc(c.league)}</div><div class="timeline-team">${esc(c.team)}</div><p class="timeline-note">${esc(c.note)}</p></li>`).join('')}</ol>`)}
        </div>
        <div class="profile-col">
          ${card('p-video', 'Video', `
            <div class="player">
              <span class="badge badge-identity player-soon">Playback coming soon</span>
              <span class="player-play" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
              <p class="player-title" id="playerTitle">${esc(a.video[0].title)}</p>
              <p class="player-meta num" id="playerMeta">${esc(a.video[0].tag)} · ${esc(a.video[0].duration)}</p>
            </div>
            <ul class="clip-list">${a.video.map((v, i) => `
              <li><button type="button" class="clip" data-action="play-clip" data-index="${i}" aria-current="${i === 0}"><span class="clip-title">${esc(v.title)}</span><span class="clip-time">${esc(v.duration)}</span></button></li>`).join('')}</ul>`)}
          ${card('p-honours', 'Honours', `<ul class="plain-list">${a.honours.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`)}
          ${card('p-school', 'Education', academics ? `
            <dl class="kv">
              <div><dt>School</dt><dd>${esc(a.academics.school)}</dd></div>
              <div><dt>GPA</dt><dd>${esc(a.academics.gpa)}</dd></div>
              <div><dt>Exams</dt><dd>${esc(a.academics.exams)}</dd></div>
              <div><dt>Eligibility</dt><dd>${esc(a.academics.eligibility)}</dd></div>
            </dl>
            <p class="muted" style="font-size:13px;margin-top:8px">${isMe ? 'Only you, the platform and an agent you’ve given manager access can see this.' : 'Visible because of your role or the athlete’s permission.'}</p>` : `
            <p class="locked">${lockIcon}<span>Academic records are private. ${age < 18 ? 'They are hidden for athletes under 18.' : 'The athlete shares them only with their own agent (manager access or higher).'}</span></p>`)}
          ${card('p-news', 'In the news', `<ul class="plain-list">${a.news.map((n) => `<li><div class="news-source">${esc(n.source)} · ${esc(n.date)}</div><div class="news-head">${esc(n.headline)}</div></li>`).join('')}</ul>`)}
        </div>
      </div>

      <section class="card profile-card" style="margin-top:16px" aria-labelledby="p-perms">
        <div class="card-head card-head-lg">
          <div>
            <h2 class="card-title" id="p-perms">Agent permissions</h2>
            <p class="muted">${isMe ? 'You own your profile. Choose how much an agent can do for you; you can change this at any time.' : `Set by ${esc(a.name.split(' ')[0])}. Only the athlete can change this.`}</p>
          </div>
        </div>
        <div class="profile-card-body">
          <fieldset class="perm-grid" id="permList">
            <legend class="visually-hidden">Permission level</legend>
            ${PERMISSIONS.map((p) => `
              <label class="option">
                <input type="radio" name="perm" value="${p}" ${a.permission === p ? 'checked' : ''} ${isMe ? '' : 'disabled'}>
                <span><strong>${PERMISSION_LABELS[p][0]}</strong><span>${PERMISSION_LABELS[p][1]}</span></span>
              </label>`).join('')}
          </fieldset>
        </div>
      </section>`;

    if (isMe) {
      $$('#permList input').forEach((input) => input.addEventListener('change', () => {
        a.permission = input.value;
        save();
        showToast(`Agent permission set to ${PERMISSION_LABELS[input.value][0].toLowerCase()}.`, 'success');
      }));
    }
  }

  function selectClip(i) {
    const a = athleteById(S.selectedAthleteId);
    const v = a && a.video[i];
    if (!v) return;
    $('#playerTitle').textContent = v.title;
    $('#playerMeta').textContent = `${v.tag} · ${v.duration}`;
    $$('.clip').forEach((c) => c.setAttribute('aria-current', String(parseInt(c.dataset.index, 10) === i)));
  }

  /* ==========================================================================
     AGENTS & AGREEMENTS
     ========================================================================== */
  function renderAgents() {
    const me = S.role === 'athlete' ? athleteById(ME.athlete) : null;
    const myOpen = me && openAgreementFor(me.id);
    $('#agentList').innerHTML = SEED.agents.map((g, i) => {
      let action = '';
      if (S.role === 'athlete') {
        action = myOpen
          ? `<span class="muted" style="font-size:13px;align-self:center">${myOpen.agentId === g.id ? (myOpen.status === 'active' ? 'Your agent' : 'Agreement pending') : 'You already have an agreement'}</span>`
          : `<button type="button" class="btn btn-accent btn-sm" data-action="start-agreement" data-athlete="${me.id}" data-agent="${g.id}">Start an agreement</button>`;
      }
      return `
        <article class="card agent" style="--i:${i}">
          <div class="agent-head">
            <span class="avatar" aria-hidden="true">${esc(initials(g.name))}</span>
            <div>
              <h2 class="agent-name">${esc(g.name)}</h2>
              <p class="agent-firm">${esc(g.agency)}</p>
              <p class="agent-where">${esc(g.city)} · ${esc(g.sports.join(', '))}</p>
            </div>
            <div class="agent-rating"><strong class="num">${g.rating.toFixed(2)}</strong><span>${g.reviews} reviews</span></div>
          </div>
          <dl class="metric-grid alt">
            <div><dt>Athletes</dt><dd>${g.athletes}</dd></div>
            <div><dt>Years</dt><dd>${g.years}</dd></div>
            <div><dt>Commission</dt><dd>${esc(g.commission)}</dd></div>
          </dl>
          <div class="agent-body" style="padding-top:14px">
            <p class="agent-bio">${esc(g.bio)}</p>
            <ul class="agent-licences" aria-label="Credentials">${g.credentials.map((c) => `<li class="badge badge-identity">${esc(c)}</li>`).join('')}</ul>
            <p class="agent-clients">${esc(g.clients)}</p>
            <div class="agent-contact" id="contact-${g.id}" hidden>
              <span>Email: <a href="mailto:${esc(g.contact.email)}">${esc(g.contact.email)}</a></span>
              <span>Phone: <a href="tel:${esc(g.contact.phone.replace(/\s/g, ''))}">${esc(g.contact.phone)}</a></span>
            </div>
          </div>
          <div class="agent-foot">
            ${action}
            <button type="button" class="btn btn-quiet btn-sm" data-action="toggle-contact" aria-expanded="false" aria-controls="contact-${g.id}">Show contact details</button>
          </div>
        </article>`;
    }).join('');
  }

  function toggleContact(btn) {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const open = btn.getAttribute('aria-expanded') !== 'true';
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Hide contact details' : 'Show contact details';
  }

  function agreementStatusText(g) {
    if (g.status === 'active') return '<span class="status status-ok">Active</span>';
    if (!g.agentSigned) return '<span class="status status-info">Waiting for the agent to sign</span>';
    return '<span class="status status-info">Waiting for the athlete to sign</span>';
  }

  function renderAgreements() {
    const list = visibleAgreements();
    const el = $('#agreementList');
    if (list === null) {
      el.innerHTML = '<div class="card empty"><h3>Private</h3><p>Agreements are visible only to the athlete, the agent and the platform. Switch to the athlete, agent or admin view to see them.</p></div>';
      return;
    }
    if (!list.length) {
      el.innerHTML = `<div class="card empty"><h3>No agreements yet</h3><p>${S.role === 'athlete' ? 'Start one from an agent’s card above.' : 'Offer representation from an athlete’s profile.'}</p></div>`;
      return;
    }
    el.innerHTML = list.map((g) => {
      const a = athleteById(g.athleteId);
      const ag = agentById(g.agentId);
      const canSign = g.status === 'pending' && (
        (S.role === 'agent' && g.agentId === ME.agent && !g.agentSigned) ||
        (S.role === 'athlete' && g.athleteId === ME.athlete && !g.athleteSigned));
      const dealStatus = { signed: '<span class="status status-ok">Signed</span>', held: '<span class="status status-wait">In escrow</span>', review: '<span class="status status-info">In review</span>' };
      return `
        <article class="card">
          <div class="agreement-head">
            <h3 class="agreement-parties">${esc(a.name)} &amp; ${esc(ag.name)}</h3>
            ${agreementStatusText(g)}
          </div>
          <div class="agreement-body">
            <div>
              <h3>Terms</h3>
              <dl class="kv">
                <div><dt>Authority</dt><dd>${esc(PERMISSION_LABELS[g.authority][0])}</dd></div>
                <div><dt>Commission</dt><dd>${esc(g.commission)} of earnings</dd></div>
                <div><dt>Athlete signed</dt><dd>${g.athleteSigned ? formatDate(g.athleteSigned) : '—'}${g.guardian ? ` (guardian: ${esc(g.guardian)})` : ''}</dd></div>
                <div><dt>Agent signed</dt><dd>${g.agentSigned ? formatDate(g.agentSigned) : '—'}</dd></div>
              </dl>
            </div>
            <div>
              <h3>Deals</h3>
              ${g.deals.length ? `<ul class="plain-list">${g.deals.map((d) => `<li><strong>${esc(d.name)}</strong> — ${esc(d.detail)} ${dealStatus[d.status] || ''}</li>`).join('')}</ul>` : '<p class="muted">No deals yet.</p>'}
            </div>
            <div>
              <h3>Documents</h3>
              <ul class="plain-list">${g.documents.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
            </div>
          </div>
          ${canSign ? `<div class="agreement-foot"><button type="button" class="btn btn-accent btn-sm" data-action="countersign" data-id="${g.id}">Review and sign</button><span class="muted" style="font-size:13px">Your signature makes the agreement active.</span></div>` : ''}
        </article>`;
    }).join('');
  }

  /* ---------- Agreement flow ---------- */

  const availableAthletes = () => S.athletes.filter((a) => !openAgreementFor(a.id));

  function openAgreement({ athleteId, agentId }, opener) {
    if (S.role !== 'athlete' && S.role !== 'agent') {
      showToast('Only an athlete or an agent can start an agreement.');
      return;
    }
    stepper = { mode: 'new', authority: 'representative' };
    const athleteSel = $('#repAthlete');
    const agentSel = $('#repAgent');

    if (S.role === 'athlete') {
      const me = athleteById(ME.athlete);
      athleteSel.innerHTML = `<option value="${me.id}">${esc(me.name)} (you)</option>`;
      athleteSel.disabled = true;
      agentSel.disabled = false;
      agentSel.innerHTML = '<option value="">Choose an agent</option>' + SEED.agents.map((g) => `<option value="${g.id}">${esc(g.name)} — ${esc(g.agency)}</option>`).join('');
      agentSel.value = agentId || '';
    } else {
      const me = agentById(ME.agent);
      agentSel.innerHTML = `<option value="${me.id}">${esc(me.name)} (you)</option>`;
      agentSel.disabled = true;
      athleteSel.disabled = false;
      athleteSel.innerHTML = '<option value="">Choose an athlete</option>' + availableAthletes().map((a) => `<option value="${a.id}">${esc(a.name)} — ${esc(a.sport)}, ${ageOf(a.dob)}</option>`).join('');
      athleteSel.value = availableAthletes().some((a) => a.id === athleteId) ? athleteId : '';
    }
    athleteSel.onchange = renderPartySummary;
    agentSel.onchange = renderPartySummary;
    $$('input[name="repAuthority"]').forEach((r) => { r.checked = r.value === 'representative'; });
    $('#repTitle').textContent = 'New agreement';
    renderPartySummary();
    goToStep(1, false);
    openModal($('#repModal'), opener);
  }

  function renderPartySummary() {
    const a = athleteById($('#repAthlete').value);
    const g = agentById($('#repAgent').value);
    $('#repPartyError').hidden = true;
    $('#repTitle').textContent = a && g ? `${a.name} & ${g.name}` : 'New agreement';
    $('#repSummary').innerHTML = g ? `
      <div><strong>${esc(g.name)}</strong>, ${esc(g.agency)} · commission ${esc(g.commission)} of earnings</div>
      <ul aria-label="Credentials">${g.credentials.map((c) => `<li class="badge badge-identity">${esc(c)}</li>`).join('')}</ul>
      ${a && isMinor(a) ? `<div class="notice">${esc(a.name)} is ${ageOf(a.dob)}. A parent or guardian must also sign.</div>` : ''}
      ${a && !g.sports.includes(a.sport) ? `<div class="notice">${esc(g.name)} doesn’t list ${esc(a.sport.toLowerCase())} among their sports.</div>` : ''}` : '';
  }

  function openCountersign(agreementId, opener) {
    const g = S.agreements.find((x) => x.id === agreementId);
    if (!g) return;
    stepper = { mode: 'countersign', agreementId };
    const a = athleteById(g.athleteId);
    const ag = agentById(g.agentId);
    $('#repTitle').textContent = `${a.name} & ${ag.name}`;
    $('#repAthlete').innerHTML = `<option value="${a.id}">${esc(a.name)}</option>`;
    $('#repAgent').innerHTML = `<option value="${ag.id}">${esc(ag.name)}</option>`;
    $$('input[name="repAuthority"]').forEach((r) => { r.checked = r.value === g.authority; });
    goToStep(3, false);
    openModal($('#repModal'), opener);
  }

  function goToStep(n, moveFocus = true) {
    if (!stepper) return;
    if (stepper.mode === 'new' && n > 1) {
      const a = athleteById($('#repAthlete').value);
      const g = agentById($('#repAgent').value);
      const err = $('#repPartyError');
      if (!a || !g) { err.textContent = 'Choose both an athlete and an agent.'; err.hidden = false; return; }
      if (openAgreementFor(a.id)) { err.textContent = `${a.name} already has an agreement. It must end before a new one starts.`; err.hidden = false; return; }
    }
    if (stepper.mode === 'countersign' && n < 3) n = 3;
    if (stepper.mode === 'new' && n === 3) stepper.authority = ($('input[name="repAuthority"]:checked') || {}).value || 'representative';
    if (n === 4) prepareSignStep();

    $$('#repSteps li').forEach((li) => {
      const s = parseInt(li.dataset.step, 10);
      li.classList.toggle('is-done', s < n);
      if (s === n) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    $$('#repModal .step').forEach((p) => { p.hidden = parseInt(p.dataset.pane, 10) !== n; });
    $$('#repModal .step[data-pane="3"] [data-to="2"]').forEach((b) => { b.hidden = stepper.mode === 'countersign'; });
    if (moveFocus) {
      const pane = $(`#repModal .step[data-pane="${n}"]`);
      const target = pane.querySelector('input:not([type="radio"]):not([type="checkbox"]):not([disabled])') || pane.querySelector('.btn-accent');
      if (target) target.focus();
    }
  }

  // The signer is the current role's side of the agreement.
  const signerParty = () => (S.role === 'athlete' ? 'athlete' : 'agent');

  function prepareSignStep() {
    const a = athleteById($('#repAthlete').value);
    const g = agentById($('#repAgent').value);
    const party = signerParty();
    const minorSigning = party === 'athlete' && isMinor(a);
    const expected = party === 'athlete' ? a.name : g.name;
    $('#signAs').textContent = party === 'athlete'
      ? `Signing as the athlete, ${a.name}${minorSigning ? ', with a parent or guardian' : ''}.`
      : `Signing as the agent, ${g.name} (${g.agency}).`;
    $('#guardianFields').hidden = !minorSigning;
    $('#guardianNote').textContent = minorSigning ? `${a.name} is ${ageOf(a.dob)}. A parent or legal guardian must sign too.` : '';
    $('#guardianName').value = '';
    $('#guardianConsent').checked = false;
    $('#signerLabel').textContent = `Type your full name (${expected}) to sign`;
    $('#signerName').value = '';
    $('#signaturePreview').textContent = '';
    $('#signatureMeta').textContent = `E-signature (demo) · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;
    $('#signError').hidden = true;
    $('#signBtn').textContent = stepper.mode === 'countersign' ? 'Sign and activate' : `Sign and send to the ${party === 'athlete' ? 'agent' : 'athlete'}`;
    $('#signerName').oninput = (e) => { $('#signaturePreview').textContent = e.target.value; };
  }

  function sign() {
    if (!stepper) return;
    const a = athleteById($('#repAthlete').value);
    const g = agentById($('#repAgent').value);
    const party = signerParty();
    const expected = party === 'athlete' ? a.name : g.name;
    const err = $('#signError');
    const fail = (msg, focusEl) => { err.textContent = msg; err.hidden = false; if (focusEl) focusEl.focus(); };

    if (normName($('#signerName').value) !== normName(expected)) return fail(`The name must match ${expected}.`, $('#signerName'));
    let guardian = null;
    if (party === 'athlete' && isMinor(a)) {
      guardian = $('#guardianName').value.trim();
      if (guardian.split(/\s+/).length < 2) return fail('Enter the parent or guardian’s full name.', $('#guardianName'));
      if (!$('#guardianConsent').checked) return fail('The parent or guardian must confirm they agree.', $('#guardianConsent'));
    }

    if (stepper.mode === 'countersign') {
      const ag = S.agreements.find((x) => x.id === stepper.agreementId);
      if (party === 'agent') ag.agentSigned = todayISO();
      else { ag.athleteSigned = todayISO(); ag.guardian = guardian; }
      if (ag.agentSigned && ag.athleteSigned) ag.status = 'active';
      closeModal();
      refresh();
      showToast(`The agreement between ${a.name} and ${g.name} is now active.`, 'success');
      return;
    }

    if (openAgreementFor(a.id)) return fail(`${a.name} already has an agreement.`);
    S.agreements.unshift({
      id: `agr-${String(S.counters.agreement++).padStart(4, '0')}`,
      athleteId: a.id,
      agentId: g.id,
      authority: stepper.authority,
      commission: g.commission,
      athleteSigned: party === 'athlete' ? todayISO() : null,
      agentSigned: party === 'agent' ? todayISO() : null,
      guardian,
      status: 'pending',
      deals: [],
      documents: ['Representation agreement (e-signature, demo)']
    });
    closeModal();
    refresh();
    showToast(`Signed. Waiting for ${party === 'athlete' ? g.name : a.name} to sign — switch to the ${party === 'athlete' ? 'agent' : 'athlete'} view to do that.`, 'success');
  }

  /* ==========================================================================
     WATCHLISTS & COMPARE
     ========================================================================== */
  function renderWatchlists() {
    $('#watchlists').innerHTML = S.watchlists.map((w, i) => {
      const names = w.athleteIds.map(athleteById).filter(Boolean);
      const mine = w.owner === myName();
      return `
        <article class="card watchlist" style="--i:${i}">
          <div class="watchlist-body">
            <p class="kicker">${esc(w.owner)} · updated ${formatDate(w.updated)}</p>
            <h2 class="watchlist-title">${esc(w.title)}</h2>
            ${w.description ? `<p class="watchlist-desc">${esc(w.description)}</p>` : ''}
            <ul class="watchlist-names">${names.map((a) => `<li><button type="button" class="btn-link" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button><span>${esc(a.position)}</span></li>`).join('')}</ul>
            ${w.note ? `<p class="watchlist-note">“${esc(w.note)}”</p>` : ''}
          </div>
          <div class="watchlist-foot card-actions">
            <button type="button" class="btn btn-secondary btn-sm" data-action="load-list" data-id="${w.id}">Compare these</button>
            ${mine && w.custom ? `<button type="button" class="btn btn-quiet btn-sm" data-action="delete-list" data-id="${w.id}">Delete</button>` : ''}
          </div>
        </article>`;
    }).join('');
  }

  function toggleCompare(id) {
    const i = S.compare.indexOf(id);
    if (i > -1) S.compare.splice(i, 1);
    else S.compare.push(id);
    refresh();
  }

  function openCompare() {
    switchSection('scouting', { focus: false });
    scrollToEl($('#comparePanel'));
  }

  function loadWatchlist(id) {
    const w = S.watchlists.find((x) => x.id === id);
    if (!w) return;
    S.compare = [...w.athleteIds];
    refresh();
    openCompare();
  }

  function saveComparisonAsWatchlist() {
    if (S.role === 'athlete') return;
    if (S.compare.length < 2) {
      showToast('Add at least two athletes to the comparison first.');
      openCompare();
      return;
    }
    S.watchlists.unshift({
      id: `list-${S.counters.watchlist++}`,
      custom: true,
      title: `Shortlist ${S.watchlists.filter((w) => w.custom).length + 1}`,
      owner: myName(),
      updated: todayISO(),
      description: '',
      athleteIds: [...S.compare],
      note: ''
    });
    refresh();
    switchSection('scouting');
    showToast('Comparison saved as a watchlist.', 'success');
  }

  function deleteWatchlist(id) {
    S.watchlists = S.watchlists.filter((w) => w.id !== id);
    refresh();
  }

  function renderCompare() {
    const wrap = $('#compareWrap');
    const list = S.compare.map(athleteById).filter(Boolean);
    if (!list.length) {
      wrap.innerHTML = `
        <div class="empty">
          <h3>Nothing to compare yet</h3>
          <p>Add athletes from the prospect board, or open a watchlist above.</p>
          <button type="button" class="btn btn-secondary btn-sm" data-action="nav" data-section="discovery">Go to the board</button>
        </div>`;
      return;
    }

    // "Best" is only meaningful between athletes in the same sport.
    const bestIn = (getter) => {
      const best = {};
      list.forEach((a) => {
        const peers = list.filter((x) => x.sport === a.sport);
        if (peers.length > 1) best[a.id] = getter(a) === Math.max(...peers.map(getter));
      });
      return (a) => (best[a.id] ? 'best' : '');
    };
    const mark = {
      grade: bestIn((a) => a.grade),
      height: bestIn((a) => a.size.height_in),
      wing: bestIn((a) => a.size.wingspan_in),
      vert: bestIn((a) => a.vertical_in)
    };
    const row = (label, cell) => `<tr><td>${label}</td>${list.map((a) => `<td>${cell(a)}</td>`).join('')}</tr>`;

    wrap.innerHTML = `
      <table class="data-table compare-table">
        <thead>
          <tr>
            <th scope="col"><span class="visually-hidden">Measure</span></th>
            ${list.map((a) => `
              <th scope="col">
                <div class="compare-head">
                  <div>
                    <button type="button" class="compare-name" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button>
                    <span class="compare-sub">${code(a)} · ${esc(a.sport)}</span>
                  </div>
                  <button type="button" class="compare-remove" data-action="toggle-compare" data-id="${a.id}" aria-label="Remove ${esc(a.name)}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
                  </button>
                </div>
              </th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${row('Scout grade', (a) => `<span class="${mark.grade(a)}">${a.grade.toFixed(1)}</span>`)}
          ${row('Board rank', (a) => `${ranks(a).board.rank} of ${S.athletes.length}`)}
          ${row('Position', (a) => esc(a.position))}
          ${row('Age', (a) => ageOf(a.dob))}
          ${row('Height', (a) => `<span class="${mark.height(a)}">${feetIn(a.size.height_in)}</span>`)}
          ${row('Weight', (a) => `${a.size.weight_lb} lb`)}
          ${row('Wingspan', (a) => `<span class="${mark.wing(a)}">${feetIn(a.size.wingspan_in)}</span>`)}
          ${row('Vertical jump', (a) => `<span class="${mark.vert(a)}">${a.vertical_in}″</span>`)}
          ${row('Key stat', (a) => `<strong>${esc(a.season[0].value)}</strong> ${esc(a.season[0].label)}`)}
          ${row('Verification', (a) => verificationBadge(a))}
          ${row('Status', (a) => statusMarkup(a))}
        </tbody>
      </table>`;
  }

  /* ==========================================================================
     TRIALS
     ========================================================================== */
  function daysUntil(iso) {
    return Math.ceil((new Date(iso + 'T23:59:59') - new Date()) / 86400000);
  }

  // Reasons an athlete can't apply; an empty list means eligible.
  function eligibility(a, o) {
    const reasons = [];
    const age = ageOf(a.dob);
    if (a.sport !== o.sport) reasons.push(`This listing is for ${o.sport.toLowerCase()}.`);
    else if (o.positions.length && !o.positions.some((p) => a.position.toLowerCase().includes(p.toLowerCase()))) reasons.push(`Open to ${o.positions.join(', ').toLowerCase()} only.`);
    if (age < o.age[0] || age > o.age[1]) reasons.push(`Ages ${o.age[0]}–${o.age[1]} only (${a.name.split(' ')[0]} is ${age}).`);
    if (levelIndex(a.verification) < levelIndex(o.minVerification)) reasons.push(`Needs ${levelLabel(o.minVerification).toLowerCase()} (profile is ${levelLabel(a.verification).toLowerCase()}).`);
    if (daysUntil(o.deadline) < 0) reasons.push('Applications have closed.');
    if (S.applications.some((ap) => ap.oppId === o.id && ap.athleteId === a.id)) reasons.push('Already applied.');
    return reasons;
  }

  function applicantsFor() {
    if (S.role === 'athlete') return [athleteById(ME.athlete)];
    if (S.role === 'agent') return S.agreements.filter((g) => g.agentId === ME.agent && g.status === 'active').map((g) => athleteById(g.athleteId));
    return [];
  }

  function renderOpportunities() {
    const applicants = applicantsFor();
    $('#oppList').innerHTML = S.opportunities.map((o, i) => {
      const days = daysUntil(o.deadline);
      const closed = days < 0;
      const org = orgById(o.orgId);
      const mineAsOrg = S.role === 'organization' && o.orgId === ME.organization;
      const apps = S.applications.filter((ap) => ap.oppId === o.id);
      const myApps = apps.filter((ap) => applicants.some((a) => a && a.id === ap.athleteId));
      let action = '';
      if (S.role === 'athlete' || S.role === 'agent') {
        action = closed ? '<span class="muted">Closed</span>' : `<button type="button" class="btn btn-accent" data-action="apply" data-id="${o.id}">Apply</button>`;
      }
      return `
        <article class="card opp" style="--i:${i}">
          <div>
            <p class="opp-type">${esc(o.sport)} · ${esc(o.type)}</p>
            <h2 class="opp-title">${esc(o.title)}</h2>
            <p class="opp-org">${esc(org.name)}</p>
            <div class="opp-tags">${o.tags.map((t) => `<span class="badge badge-identity">${esc(t)}</span>`).join('')}</div>
          </div>
          <dl class="kv">
            <div><dt>Where</dt><dd>${esc(o.location)}</dd></div>
            <div><dt>When</dt><dd>${esc(o.date)}</dd></div>
            <div><dt>Apply by</dt><dd class="${closed ? 'deadline-past' : days <= 30 ? 'deadline-soon' : ''}">${formatDate(o.deadline)}${closed ? ' (closed)' : days <= 30 ? ` — ${plural(days, 'day')} left` : ''}</dd></div>
            <div><dt>Ages</dt><dd>${o.age[0]}–${o.age[1]}</dd></div>
            <div><dt>Standard</dt><dd>${esc(o.standard)}</dd></div>
            <div><dt>Verification</dt><dd>${esc(levelLabel(o.minVerification))} or higher</dd></div>
            <div><dt>On offer</dt><dd>${esc(o.offer)}</dd></div>
          </dl>
          <div class="opp-side">
            <p class="opp-places"><strong class="num">${o.places}</strong><span>places · ${o.applicants} applications</span></p>
            ${action}
          </div>
          ${myApps.length ? `<div class="opp-applicants"><h3>Your applications</h3><ul class="plain-list">${myApps.map((ap) => `<li>${esc(athleteById(ap.athleteId).name)} — sent ${formatDate(ap.date)}</li>`).join('')}</ul></div>` : ''}
          ${mineAsOrg ? `<div class="opp-applicants"><h3>Applications through the exchange</h3>${apps.length ? `<ul class="plain-list">${apps.map((ap) => { const a = athleteById(ap.athleteId); return `<li><button type="button" class="btn-link" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button> — ${esc(a.position)}, ${ageOf(a.dob)} · ${formatDate(ap.date)}${ap.note ? ` · “${esc(ap.note)}”` : ''}</li>`; }).join('')}</ul>` : '<p class="muted">None yet. The total above includes applications sent outside the exchange.</p>'}</div>` : ''}
        </article>`;
    }).join('');
  }

  function openApply(oppId, opener) {
    const o = S.opportunities.find((x) => x.id === oppId);
    if (!o) return;
    const people = applicantsFor().filter(Boolean);
    if (!people.length) {
      showToast('You don’t represent any athletes yet. Sign an agreement first.');
      return;
    }
    $('#applyTitle').textContent = o.title;
    $('#applyOrg').textContent = `${orgById(o.orgId).name} · ${o.location} · ${o.date}`;
    const select = $('#applyAthlete');
    select.innerHTML = people.map((a) => `<option value="${a.id}">${esc(a.name)} — ${esc(a.position)}</option>`).join('');
    select.disabled = people.length === 1;
    $('#applyNote').value = '';
    $('#applyError').hidden = true;

    const update = () => {
      const a = athleteById(select.value);
      const reasons = eligibility(a, o);
      const box = $('#applyEligibility');
      box.className = `eligibility ${reasons.length ? 'no' : 'ok'}`;
      box.textContent = reasons.length ? `Not eligible: ${reasons.join(' ')}` : `${a.name} meets this listing’s requirements.`;
      const g = openAgreementFor(a.id);
      $('#applyAgent').value = g && g.status === 'active' ? agentById(g.agentId).name : 'None — applying directly';
      $('#applyGuardianRow').hidden = !isMinor(a);
      $('#applyGuardian').checked = false;
      $('#applySubmit').disabled = reasons.length > 0;
    };
    select.onchange = update;
    update();

    $('#applyForm').onsubmit = (e) => {
      e.preventDefault();
      const a = athleteById(select.value);
      if (eligibility(a, o).length) return;
      if (isMinor(a) && !$('#applyGuardian').checked) {
        $('#applyError').textContent = 'A parent or guardian must approve applications for athletes under 18.';
        $('#applyError').hidden = false;
        return;
      }
      S.applications.push({ id: `app-${S.counters.application++}`, oppId: o.id, athleteId: a.id, date: todayISO(), note: $('#applyNote').value.trim() });
      o.applicants += 1;
      closeModal();
      refresh();
      showToast(`Application for ${a.name} sent to ${orgById(o.orgId).name}.`, 'success');
    };
    openModal($('#applyModal'), opener);
  }

  /* ==========================================================================
     PAYMENTS
     ========================================================================== */
  function renderLedger() {
    const txs = visibleTransactions();
    const held = txs.filter((t) => t.status === 'held');
    const settled = txs.filter((t) => t.status === 'settled');
    const commission = txs.filter((t) => t.type === 'Agent commission');
    const sum = (arr) => arr.reduce((s, t) => s + t.amount, 0);

    $('#ledgerLede').textContent = S.role === 'scout'
      ? 'Scouts don’t have payments on the exchange. Switch to another view to see the ledger.'
      : `Showing payments for ${S.role === 'admin' ? 'all accounts' : myName()}. Agents are paid commission only, never an upfront fee. In a live build, money is held by a licensed escrow partner, not by the exchange.`;

    $('#ledgerTotals').innerHTML = `
      <div class="card kpi kpi-held"><dt>Held in escrow</dt><dd>${money(sum(held))}<span>${plural(held.length, 'payment')} waiting for release</span></dd></div>
      <div class="card kpi kpi-settled"><dt>Settled</dt><dd>${money(sum(settled))}<span>${plural(settled.length, 'payment')}</span></dd></div>
      <div class="card kpi"><dt>Agent commission</dt><dd>${money(sum(commission))}<span>${plural(commission.length, 'payment')}</span></dd></div>`;

    $('#ledgerBody').innerHTML = txs.length ? txs.map((t) => `
      <tr>
        <td>${formatDate(t.date)}<span class="cell-sub">${esc(t.id)}</span></td>
        <td><span class="cell-strong">${esc(t.type)}</span><span class="cell-sub">${esc(t.description)}</span></td>
        <td>${esc(t.payer)}</td>
        <td>${esc(t.payee)}</td>
        <td class="col-num">${money(t.amount)}</td>
        <td>${t.status === 'settled' ? '<span class="status status-ok">Settled</span>' : '<span class="status status-wait">In escrow</span>'}</td>
      </tr>`).join('') : '<tr><td colspan="6"><div class="empty"><h3>No payments</h3><p>Nothing to show for this account yet.</p></div></td></tr>';
  }

  function exportCsv() {
    const txs = visibleTransactions();
    if (!txs.length) { showToast('There are no payments to download in this view.'); return; }
    const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [['Date', 'Reference', 'Type', 'Description', 'From', 'To', 'Amount (USD)', 'Status']]
      .concat(txs.map((t) => [t.date, t.id, t.type, t.description, t.payer, t.payee, t.amount.toFixed(2), t.status === 'settled' ? 'Settled' : 'In escrow']));
    const blob = new Blob([rows.map((r) => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `aax-payments-${todayISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  /* ==========================================================================
     MODALS
     ========================================================================== */
  let activeModal = null;
  let lastFocus = null;

  function wireModals() {
    document.addEventListener('keydown', (e) => {
      if (!activeModal) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key !== 'Tab') return;
      const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', activeModal.querySelector('.modal-dialog'))
        .filter((el) => !el.disabled && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function openModal(modal, opener) {
    if (activeModal) closeModal();
    lastFocus = opener || document.activeElement;
    activeModal = modal;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    ['main', '.site-header', '.site-footer'].forEach((sel) => $(sel).setAttribute('inert', ''));
    const first = modal.querySelector('.confirm-actions .btn-quiet, .step:not([hidden]) select:not([disabled]), .step:not([hidden]) .btn-accent, form select:not([disabled]), form .btn-accent, .modal-close');
    if (first) first.focus();
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.hidden = true;
    activeModal = null;
    stepper = null;
    document.body.style.overflow = '';
    ['main', '.site-header', '.site-footer'].forEach((sel) => $(sel).removeAttribute('inert'));
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  /* ==========================================================================
     TOASTS (at most three, each dismissible)
     ========================================================================== */
  function showToast(message, type = 'info') {
    const box = $('#toasts');
    while (box.children.length >= 3) box.firstElementChild.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<p>${esc(message)}</p><button type="button" class="toast-close" data-action="dismiss-toast" aria-label="Dismiss"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
    box.appendChild(toast);
    setTimeout(() => dismissToast(toast), 6000);
  }

  function dismissToast(toast) {
    if (!toast || !toast.isConnected) return;
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 200);
  }

  function resetDemo() {
    closeModal();
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    S = freshState();
    ME.athlete = S.actingAthleteId;
    filter = { ...DEFAULT_FILTER };
    syncFilters();
    renderAll();
    switchSection('discovery');
    showToast('Demo data reset.', 'success');
  }

  // Small public hook for the showcase page and debugging.
  window.AAX = { viewProfile, switchSection };
})();

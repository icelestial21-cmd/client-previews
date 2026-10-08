/**
 * Apex Athlete Exchange — demo client.
 * Vanilla JS, no dependencies. Data comes from data.js (all fictional).
 * Each demo role gets its own navigation and home page; changes are saved to
 * this browser's localStorage so the demo survives a refresh.
 */
(function () {
  'use strict';

  const SEED = window.AAX_DATA;
  const STORE_KEY = 'aax-demo-v4';
  const LEVELS = SEED.verificationLevels.map((l) => l.id);
  const PERMISSIONS = ['viewer', 'contributor', 'manager', 'representative'];
  const PERMISSION_LABELS = {
    viewer: ['View only', 'Sees the public profile, test results and video.'],
    contributor: ['Contributor', 'Can add game stats, training video and press coverage.'],
    manager: ['Manager', 'Can contact clubs and submit the athlete to trials. The athlete signs every contract.'],
    representative: ['Exclusive representative', 'Negotiates contracts and sponsorship and approves payouts from escrow.']
  };
  const COUNTRY_CODES = { 'Jamaica': 'JAM', 'Trinidad & Tobago': 'TTO', 'Barbados': 'BAR', 'Puerto Rico': 'PUR', 'Ghana': 'GHA' };
  // Who "you" are in each demo role. The athlete is switchable (adult or under-18).
  const ME = { visitor: null, athlete: 'ath-01', agent: 'agt-01', scout: 'sct-01', organization: 'org-01', admin: null };
  const DEFAULT_FILTER = { search: '', sport: 'all', position: 'all', country: 'all', status: 'all', verification: 'none', minHeight: 66 };

  // Navigation per role. Everyone shares the site's front page ('front');
  // each signed-in role also lands on its own page when it switches in.
  const ROLE_NAV = {
    visitor: [['front', 'Home'], ['board', 'Prospects'], ['trials', 'Trials'], ['agents', 'Agents']],
    athlete: [['front', 'Home'], ['home', 'Dashboard'], ['me', 'My profile'], ['agents', 'Agents'], ['trials', 'Trials'], ['payments', 'Payments']],
    agent: [['front', 'Home'], ['home', 'Dashboard'], ['board', 'Prospects'], ['shortlists', 'Shortlists'], ['clients', 'Clients'], ['trials', 'Trials'], ['payments', 'Payments']],
    scout: [['front', 'Home'], ['board', 'Prospects'], ['shortlists', 'Shortlists'], ['trials', 'Trials & combines']],
    organization: [['front', 'Home'], ['trials', 'Your trials'], ['board', 'Prospects'], ['shortlists', 'Shortlists'], ['payments', 'Payments']],
    admin: [['front', 'Home'], ['home', 'Overview'], ['board', 'Prospects'], ['agents', 'Agents'], ['agreements', 'Agreements'], ['payments', 'Payments']]
  };
  const ROLE_HOME = { visitor: 'front', athlete: 'home', agent: 'home', scout: 'board', organization: 'trials', admin: 'home' };

  const clone = (o) => JSON.parse(JSON.stringify(o));

  function freshState() {
    return {
      version: 4,
      role: 'visitor',
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
      guardians: {},
      counters: { agreement: 2, application: 2, watchlist: 5 }
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (saved && saved.version === 4) return Object.assign(freshState(), saved);
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
  let current = { route: null, id: null };

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
  // Metric alongside imperial: the exchange sells to UK and European clubs as well as US colleges.
  const cm = (inches) => `${Math.round(inches * 2.54)} cm`;
  const kg = (lb) => `${Math.round(lb * 0.4536)} kg`;
  const levelMeans = (id) => (SEED.verificationLevels.find((l) => l.id === id) || {}).means || '';
  const shortHeight = (inches) => `${Math.floor(inches / 12)}-${inches % 12}`;
  const plural = (n, word, many = word + 's') => `${n} ${n === 1 ? word : many}`;
  const code = (a) => COUNTRY_CODES[a.country] || a.country;
  const sportShort = (sport) => (sport === 'Track & Field' ? 'Track' : sport);
  const levelIndex = (id) => LEVELS.indexOf(id);
  const levelLabel = (id) => (SEED.verificationLevels.find((l) => l.id === id) || {}).label || id;
  // Mid-sentence form, quoting the stamp: “Results checked”.
  const levelText = (id) => (id === 'none' ? 'no stamp yet' : `the “${levelLabel(id)}” stamp`);
  const normName = (s) => s.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
  const firstName = (a) => a.name.split(' ')[0];
  const signed = (n) => `${n > 0 ? '+' : n < 0 ? '−' : '±'}${Math.abs(n).toFixed(1)}`;

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
  const oppById = (id) => S.opportunities.find((o) => o.id === id);
  const byGrade = (list) => [...list].sort((a, b) => b.grade - a.grade);
  const navFor = (role = S.role) => ROLE_NAV[role];
  const homeRoute = () => ROLE_HOME[S.role];
  const hasRoute = (route) => navFor().some(([r]) => r === route);

  // Visitors (not signed in) don't see athletes under 18 anywhere on the site.
  const pool = () => (S.role === 'visitor' ? S.athletes.filter((a) => !isMinor(a)) : S.athletes);
  const inPool = (id) => pool().some((a) => a.id === id);

  function myName() {
    if (S.role === 'visitor') return 'Visitor';
    if (S.role === 'athlete') return athleteById(ME.athlete).name;
    if (S.role === 'agent') return agentById(ME.agent).name;
    if (S.role === 'scout') return SEED.scouts[0].name;
    if (S.role === 'organization') return orgById(ME.organization).name;
    return 'Platform admin';
  }

  // Live or pending agreement for an athlete (an athlete can have only one).
  const openAgreementFor = (athleteId) => S.agreements.find((g) => g.athleteId === athleteId && (g.status === 'active' || g.status === 'pending'));
  const myClients = () => S.agreements.filter((g) => g.agentId === ME.agent && g.status === 'active').map((g) => athleteById(g.athleteId));

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

  const APP_STATUS = {
    guardian: ['status-wait', 'Waiting for guardian'],
    submitted: ['status-info', 'Submitted'],
    invited: ['status-ok', 'Invited'],
    declined: ['status-neutral', 'Not selected']
  };
  const appStatusMarkup = (ap) => `<span class="status ${APP_STATUS[ap.status][0]}">${APP_STATUS[ap.status][1]}</span>`;

  // Verification is printed as an ink stamp on the entry. No check at all gets a pencilled "unofficial" note instead.
  function stampFor(level, { big = false } = {}) {
    if (level === 'none') return `<span class="pencil"><span class="visually-hidden">Checked: </span>Unofficial · not checked</span>`;
    return `<span class="stamp stamp-${level}${big ? ' stamp-big' : ''}"><span class="visually-hidden">Checked: </span>${esc(levelLabel(level))}</span>`;
  }
  const verificationBadge = (a) => stampFor(a.verification);
  const minorBadge = (a) => (isMinor(a) ? '<span class="tag tag-minor">Under 18</span>' : '');

  // Stock photo standing in for a fictional athlete, printed as a halftone plate.
  // size 'sm' for list entries (lazy), 'lg' for the profile and the featured entry.
  function photoFor(a, { sizes = '120px', eager = false, cls = '' } = {}) {
    const ph = a.photo;
    if (!ph) return '';
    return `<span class="plate ${cls}"><img src="${esc(ph.src)}-sm.webp" srcset="${esc(ph.src)}-sm.webp ${ph.smW}w, ${esc(ph.src)}.webp ${ph.w}w" sizes="${sizes}" width="${ph.w}" height="${ph.h}" alt="${esc(ph.alt)}" decoding="async"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}></span>`;
  }

  // The user's own mark: a blue ballpoint ring drawn round an entry they are comparing.
  // Only the entry just added draws itself in; every other ring is already on the page.
  let justMarked = null;
  function ballpoint(id) {
    if (!S.compare.includes(id)) return '';
    return `<svg class="ballpoint${justMarked === id ? ' is-drawing' : ''}" viewBox="0 0 120 80" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path pathLength="1" d="M70 6C40 3 10 14 6 38c-3 22 22 37 56 36 32-1 54-15 52-37C112 15 86 4 52 7c-12 1-22 5-28 10"/></svg>`;
  }

  // Ranked by scout grade within three pools (recruiting-site national / position / state convention).
  function ranks(a) {
    const place = (pool) => ({ rank: byGrade(pool).findIndex((x) => x.id === a.id) + 1, of: pool.length });
    return {
      board: place(pool()),
      sport: place(pool().filter((x) => x.sport === a.sport)),
      country: place(pool().filter((x) => x.country === a.country))
    };
  }

  function rankRow(a) {
    const r = ranks(a);
    const sport = a.sport === 'Track & Field' ? 'track & field' : a.sport.toLowerCase();
    return `<p class="rank-line"><span>#${r.board.rank} of ${r.board.of} on the board</span><span>#${r.sport.rank} of ${r.sport.of} in ${esc(sport)}</span><span>#${r.country.rank} of ${r.country.of} from ${esc(a.country)}</span></p>`;
  }

  // Change since last week's board (the +/- column on federation rankings and motorsport standings).
  function movement(a) {
    const diff = (a.prevRank || ranks(a).board.rank) - ranks(a).board.rank;
    const tri = (d) => `<svg width="8" height="7" viewBox="0 0 8 7" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
    if (diff > 0) return `<span class="move move-up" title="Up ${diff} since last week">${tri('M4 0 8 7H0Z')}${diff}<span class="visually-hidden"> up since last week</span></span>`;
    if (diff < 0) return `<span class="move move-down" title="Down ${-diff} since last week">${tri('M0 0h8L4 7Z')}${-diff}<span class="visually-hidden"> down since last week</span></span>`;
    return '<span class="move move-same" title="No change since last week"><svg width="8" height="7" viewBox="0 0 8 7" aria-hidden="true" focusable="false"><path d="M0 3h8v1.4H0Z"/></svg><span class="visually-hidden">no change since last week</span></span>';
  }

  // Small inline trend line (spark-chart pattern). Decorative; callers add a text equivalent.
  function sparkline(values, { width = 56, height = 18, area = true, dot = true, fill = false } = {}) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = 2;
    const x = (i) => pad + (i * (width - pad * 2)) / (values.length - 1);
    const y = (v) => (max === min ? height / 2 : pad + (1 - (v - min) / (max - min)) * (height - pad * 2));
    const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    const last = pts[pts.length - 1].split(',');
    const sizing = fill ? `preserveAspectRatio="none" style="width:100%;height:${height}px"` : `width="${width}" height="${height}"`;
    return `<svg class="spark" ${sizing} viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">
      ${area ? `<path class="spark-area" d="M${pts[0]} L${pts.join(' L')} L${x(values.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z"/>` : ''}
      <polyline class="spark-line" points="${pts.join(' ')}"/>
      ${dot && !fill ? `<circle class="spark-dot" cx="${last[0]}" cy="${last[1]}" r="2.5"/>` : ''}
    </svg>`;
  }

  function splitName(name) {
    const parts = name.split(' ');
    const last = parts.pop();
    return `<span class="name-first">${esc(parts.join(' '))}</span> <span class="name-last">${esc(last)}</span>`;
  }

  // Where an athlete stands for a measurable among others in the same sport.
  function standing(getter, a) {
    const values = pool().filter((x) => x.sport === a.sport).map(getter);
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
    const newestFirst = (list) => [...list].sort((x, y) => y.date.localeCompare(x.date));
    if (S.role === 'admin') return newestFirst(S.transactions);
    if (S.role === 'athlete') return newestFirst(S.transactions.filter((t) => t.athleteId === ME.athlete));
    if (S.role === 'agent') return newestFirst(S.transactions.filter((t) => t.agentId === ME.agent));
    if (S.role === 'organization') return newestFirst(S.transactions.filter((t) => t.orgId === ME.organization));
    return [];
  }

  // The name this role appears under in the ledger, so each row can say money in or money out.
  function ledgerParty() {
    if (S.role === 'athlete') return athleteById(ME.athlete).name;
    if (S.role === 'agent') return agentById(ME.agent).agency;
    if (S.role === 'organization') return orgById(ME.organization).name;
    return null;
  }

  /* ==========================================================================
     TRIAL ELIGIBILITY & APPLICATIONS
     ========================================================================== */
  function daysUntil(iso) {
    return Math.ceil((new Date(iso + 'T23:59:59') - new Date()) / 86400000);
  }
  const isOpen = (o) => daysUntil(o.deadline) >= 0;
  const applicationFor = (athleteId, oppId) => S.applications.find((ap) => ap.athleteId === athleteId && ap.oppId === oppId);

  // Reasons an athlete can't apply; an empty list means eligible.
  function eligibility(a, o, { ignoreExisting = false } = {}) {
    const reasons = [];
    const age = ageOf(a.dob);
    if (a.sport !== o.sport) reasons.push(`This listing is for ${o.sport.toLowerCase()}.`);
    else if (o.positions.length && !o.positions.some((p) => a.position.toLowerCase().includes(p.toLowerCase()))) reasons.push(`Open to ${o.positions.join(', ').toLowerCase()} only.`);
    if (age < o.age[0] || age > o.age[1]) reasons.push(`Ages ${o.age[0]}–${o.age[1]} only (${firstName(a)} is ${age}).`);
    if (levelIndex(a.verification) < levelIndex(o.minVerification)) reasons.push(`Needs ${levelText(o.minVerification)} or higher (this profile has ${levelText(a.verification)}).`);
    if (!isOpen(o)) reasons.push('Applications have closed.');
    if (!ignoreExisting && applicationFor(a.id, o.id)) reasons.push('Already applied.');
    return reasons;
  }

  const eligibleAthletes = (o) => pool().filter((a) => eligibility(a, o, { ignoreExisting: true }).length === 0);

  function applicantsFor() {
    if (S.role === 'athlete') return [athleteById(ME.athlete)];
    if (S.role === 'agent') return myClients();
    return [];
  }

  /* ==========================================================================
     INIT
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    wireTheme();
    wireControls();
    wireModals();
    wireFrontSearch();
    trackHeaderHeight();
    $('#navTabs').addEventListener('scroll', syncNavCue, { passive: true });
    // Esc or a click outside closes the explainer natively; put focus back where it came from.
    $('#explain').addEventListener('toggle', (e) => { if (e.newState === 'closed' && explainOpener && document.contains(explainOpener)) explainOpener.focus(); });
    window.addEventListener('resize', syncNavCue);
    renderAll();
    go(parseHash(), { push: false, focus: false });
    window.addEventListener('popstate', () => go(parseHash(), { push: false }));
  });

  function renderAll() {
    $('#roleSelect').value = S.role === 'athlete' ? `athlete:${ME.athlete}` : S.role;
    $$('.segmented-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === S.viewMode)));
    renderChrome();
    renderFront();
    renderBoard();
    renderHome();
    renderAgents();
    renderClients();
    renderAgreementsPage();
    renderShortlists();
    renderCompare();
    renderTrials();
    renderLedger();
    if (current.route === 'athlete') renderProfile(current.id);
    $('#compareCount').textContent = S.compare.length;
    justMarked = null; // a ring draws itself in once, on the render right after it was added
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

  // On wide screens the masthead scrolls away and the running header (the nav) stays pinned.
  // --masthead-h lets the header stick with only the nav showing; --header-h keeps jump targets clear of it.
  function trackHeaderHeight() {
    const header = $('.site-header');
    const update = () => {
      const sticky = getComputedStyle(header).position === 'sticky';
      const masthead = $('.masthead').offsetHeight;
      document.documentElement.style.setProperty('--masthead-h', `${masthead}px`);
      document.documentElement.style.setProperty('--header-h', sticky ? `${header.offsetHeight - masthead}px` : '0px');
    };
    update();
    window.addEventListener('resize', update);
  }

  /* ==========================================================================
     ROUTING
     Routes: #home #board #athlete/<id> #me #agents #clients #agreements
     #shortlists #trials #payments. A route the current role doesn't have
     falls back to that role's home page.
     ========================================================================== */
  function parseHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith('athlete/')) return { route: 'athlete', id: h.slice(8) };
    return { route: h || homeRoute(), id: null };
  }

  const hashFor = ({ route, id }) => (route === 'athlete' ? `#athlete/${id}` : `#${route}`);

  // Which nav tab a route belongs to.
  function navKeyFor({ route, id }) {
    if (route !== 'athlete') return route;
    if (S.role === 'athlete' && id === ME.athlete) return 'me';
    return hasRoute('board') ? 'board' : null;
  }

  function markNav() {
    const key = navKeyFor(current);
    $$('#navTabs .nav-tab').forEach((t) => {
      if (t.dataset.route === key) {
        t.setAttribute('aria-current', 'page');
        const strip = $('#navTabs');
        if (strip.scrollWidth > strip.clientWidth) strip.scrollLeft = Math.max(0, t.offsetLeft - 16);
      } else t.removeAttribute('aria-current');
    });
    syncNavCue();
  }

  // On narrow screens the tabs scroll sideways; fade the edge that has more tabs behind it.
  function syncNavCue() {
    const strip = $('#navTabs');
    const more = strip.scrollWidth - strip.clientWidth - strip.scrollLeft > 4;
    strip.classList.toggle('has-more', more);
    strip.classList.toggle('has-before', strip.scrollLeft > 4);
  }

  function go(target, { push = true, focus = true } = {}) {
    let { route, id } = typeof target === 'string' ? { route: target, id: null } : target;
    if (route === 'me' && S.role === 'athlete') { route = 'athlete'; id = ME.athlete; }
    if (route === 'athlete' && !inPool(id)) route = homeRoute();
    if (route !== 'athlete' && !hasRoute(route)) route = homeRoute();
    if (route === 'me') { route = 'athlete'; id = ME.athlete; }
    current = { route, id: route === 'athlete' ? id : null };

    if (route === 'athlete') {
      S.selectedAthleteId = id;
      save();
      renderProfile(id);
    }

    markNav();
    $$('.view').forEach((v) => v.classList.toggle('is-active', v.id === `section-${route}`));

    const hash = hashFor(current);
    if (location.hash !== hash) history[push ? 'pushState' : 'replaceState'](null, '', hash);

    if (focus) {
      window.scrollTo(0, 0);
      const heading = $(`#section-${route} h1`);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }

  const viewProfile = (id) => go({ route: 'athlete', id });

  function scrollToEl(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }

  /* ==========================================================================
     CHROME: nav, header figure, footer
     ========================================================================== */
  // The one number each role most wants to see in the header (none for scouts).
  function headerFigure() {
    if (S.role === 'athlete') {
      const me = athleteById(ME.athlete);
      return ['Held for you', money(S.transactions.filter((t) => t.athleteId === me.id && t.payee === me.name && t.status === 'held').reduce((s, t) => s + t.amount, 0))];
    }
    if (S.role === 'agent') return ['Commission received', money(S.transactions.filter((t) => t.agentId === ME.agent && t.status === 'settled').reduce((s, t) => s + t.amount, 0))];
    if (S.role === 'organization') {
      const mine = S.opportunities.filter((o) => o.orgId === ME.organization).map((o) => o.id);
      return ['Applications to review', String(S.applications.filter((ap) => mine.includes(ap.oppId) && ap.status === 'submitted').length)];
    }
    if (S.role === 'admin') return ['Held in escrow', money(S.transactions.filter((t) => t.status === 'held').reduce((s, t) => s + t.amount, 0))];
    return null;
  }

  function renderChrome() {
    const nav = navFor();
    $('#navTabs').innerHTML = nav.map(([route, label]) => `<a href="#${route}" class="nav-tab" data-action="go" data-route="${route}">${esc(label)}</a>`).join('');
    $('#footerLinks').innerHTML = nav.map(([route, label]) => `<li><a href="#${route}" data-action="go" data-route="${route}">${esc(label)}</a></li>`).join('');
    $('#compareBtn').hidden = !hasRoute('shortlists');
    const fig = headerFigure();
    $('.account-balance').hidden = !fig;
    if (fig) {
      $('#balanceLabel').textContent = fig[0];
      $('#balanceValue').textContent = fig[1];
    }
    markNav();
  }

  /* ==========================================================================
     CONTROLS (delegated)
     ========================================================================== */
  function wireControls() {
    $('#roleSelect').addEventListener('change', (e) => {
      const [role, athleteId] = e.target.value.split(':');
      S.role = role;
      if (athleteId) S.actingAthleteId = ME.athlete = athleteId;
      S.compare = [];
      current = { route: null, id: null };
      refresh();
      go(homeRoute(), { focus: false });
    });

    $('#searchInput').addEventListener('input', (e) => { filter.search = e.target.value.trim(); renderBoard(); });
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
      if (el.tagName === 'A') e.preventDefault();
      const { action, id } = el.dataset;
      switch (action) {
        case 'go': go(el.dataset.route); break;
        case 'home': go('front'); break;
        case 'front-sport': openBoardWith({ sport: el.dataset.sport }); break;
        case 'try-role': $('#roleSelect').value = el.dataset.role; $('#roleSelect').dispatchEvent(new Event('change')); break;
        case 'back': if (history.length > 1) history.back(); else go(homeRoute()); break;
        case 'view-profile': viewProfile(id); break;
        case 'find-unsigned': go('board'); applyPreset('available'); break;
        case 'find-for-trial': go('board'); filter = { ...DEFAULT_FILTER, sport: el.dataset.sport }; syncFilters(); renderBoard(); break;
        case 'toggle-compare': toggleCompare(id, el); break;
        case 'open-compare': openCompare(); break;
        case 'clear-compare': S.compare = []; refresh(); break;
        case 'load-list': loadWatchlist(id); break;
        case 'delete-list': deleteWatchlist(id); break;
        case 'save-watchlist': saveComparisonAsWatchlist(); break;
        case 'print': window.print(); break;
        case 'export-csv': exportCsv(); break;
        case 'start-agreement': openAgreement({ athleteId: el.dataset.athlete, agentId: el.dataset.agent }, el); break;
        case 'countersign': openCountersign(id, el); break;
        case 'guardian-sign': openGuardianSign(id, el); break;
        case 'guardian-approve': openGuardianApprove(id, el); break;
        case 'explain': explain(el.dataset.topic, el); break;
        case 'close-explain': closeExplain(); break;
        case 'toggle-filters': toggleFilters(); break;
        case 'toggle-contact': toggleContact(el); break;
        case 'apply': openApply(id, el); break;
        case 'invite': inviteToTrial(el.dataset.athlete, el.dataset.opp); break;
        case 'app-status': setApplicationStatus(id, el.dataset.status); break;
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
     HOME (per role)
     ========================================================================== */
  function kpis(items) {
    return `<dl class="kpi-grid kpi-grid-4">${items.map(([label, value, sub, tone]) => `
      <div class="card kpi ${tone ? `kpi-${tone}` : ''}"><dt>${label}</dt><dd>${value}${sub ? `<span>${sub}</span>` : ''}</dd></div>`).join('')}</dl>`;
  }

  const TASK_ICONS = {
    todo: '<circle cx="12" cy="12" r="9"/>',
    done: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    wait: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
  };

  // A row in a to-do style list. title and text must already be escaped.
  function task({ title, text = '', action = '', tone = 'todo' }) {
    return `<li class="task task-${tone}">
      <svg class="task-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${TASK_ICONS[tone]}</svg>
      <div class="task-body"><p class="task-title">${title}</p>${text ? `<p class="task-text">${text}</p>` : ''}</div>
      ${action ? `<div class="task-action">${action}</div>` : ''}
    </li>`;
  }

  function renderHome() {
    const el = $('#homeBody');
    if (S.role === 'athlete') el.innerHTML = athleteHome();
    else if (S.role === 'agent') el.innerHTML = agentHome();
    else if (S.role === 'admin') el.innerHTML = adminHome();
    else el.innerHTML = '';
  }

  function athleteHome() {
    const me = athleteById(ME.athlete);
    const h = me.gradeHistory;
    const change = me.grade - h[0];
    const g = openAgreementFor(me.id);
    const agent = g && agentById(g.agentId);
    const myApps = S.applications.filter((ap) => ap.athleteId === me.id);
    const openForMe = S.opportunities.filter((o) => eligibility(me, o).length === 0);
    const mine = S.transactions.filter((t) => t.athleteId === me.id);
    const toMe = mine.filter((t) => t.payee === me.name);
    const held = toMe.filter((t) => t.status === 'held');
    const settled = toMe.filter((t) => t.status === 'settled');
    const paid = mine.filter((t) => t.payer === me.name);

    const steps = [];
    if (!g) steps.push(task({ title: 'Find an agent', text: 'Agents are paid a share of what you earn — never an upfront fee.', action: '<button type="button" class="btn btn-accent btn-sm" data-action="go" data-route="agents">Browse agents</button>' }));
    else if (g.status === 'pending' && !g.athleteSigned) steps.push(task({ title: `Sign your agreement with ${esc(agent.name)}`, text: `${esc(agent.name)} has signed. ${isMinor(me) ? 'After you sign, we send your parent or guardian a link to sign too.' : 'Your signature makes it active.'}`, action: `<button type="button" class="btn btn-accent btn-sm" data-action="countersign" data-id="${g.id}">Review and sign</button>` }));
    else if (g.status === 'pending' && needsGuardian(g)) steps.push(task({ tone: 'wait', title: `Waiting for ${esc(g.guardian)} to sign`, text: `We sent them a link at ${esc(g.guardianContact)}. The agreement starts when they sign.`, action: `<button type="button" class="btn btn-quiet btn-sm" data-action="guardian-sign" data-id="${g.id}">Open their link (demo)</button>` }));
    else if (g.status === 'pending') steps.push(task({ tone: 'wait', title: `Waiting for ${esc(agent.name)} to sign`, text: 'You’ve signed. Nothing to do until the agent signs.' }));
    else steps.push(task({ tone: 'done', title: `Represented by ${esc(agent.name)}`, text: `${esc(agent.agency)} · ${esc(PERMISSION_LABELS[g.authority][0])}` }));

    myApps.filter((ap) => ap.status === 'guardian').forEach((ap) => {
      const o = oppById(ap.oppId);
      steps.push(task({ tone: 'wait', title: `Waiting for ${esc(ap.guardian)} to approve your application`, text: `${esc(o.title)}. It goes to ${esc(orgById(o.orgId).name)} once they approve.`, action: `<button type="button" class="btn btn-quiet btn-sm" data-action="guardian-approve" data-id="${ap.id}">Open their link (demo)</button>` }));
    });
    openForMe.forEach((o) => steps.push(task({ title: `Apply: ${esc(o.title)}`, text: `${esc(orgById(o.orgId).name)} · closes ${formatDate(o.deadline)}`, action: `<button type="button" class="btn btn-quiet btn-sm" data-action="apply" data-id="${o.id}">Apply</button>` })));
    myApps.filter((ap) => ap.status === 'invited').forEach((ap) => {
      const o = oppById(ap.oppId);
      steps.push(task({ tone: 'done', title: `${esc(orgById(o.orgId).name)} invited you to the ${esc(o.title.toLowerCase())}`, text: `${esc(o.location)} · ${esc(o.date)}. The club will contact you with details.` }));
    });
    if (!openForMe.length && !myApps.length) steps.push(task({ tone: 'info', title: 'No open trials match your profile yet', text: 'Each trial says what it needs. Higher verification opens more of them.', action: '<button type="button" class="btn btn-quiet btn-sm" data-action="go" data-route="trials">See all trials</button>' }));
    if (me.verification !== 'pro') steps.push(task({ tone: 'info', title: `Your profile has ${esc(levelText(me.verification))}`, text: 'Profiles measured at a combine qualify for more trials.', action: '<button type="button" class="btn btn-quiet btn-sm" data-action="explain" data-topic="verification">How the stamps work</button>' }));
    if (isMinor(me)) steps.push(task({ tone: 'info', title: 'You’re under 18', text: 'Your parent or guardian approves each application and signs any agreement, from a link we send them. Visitors to the site can’t see your profile.' }));

    return `
      <header class="view-head">
        <div>
          <h1 id="homeTitle">Welcome back, ${esc(firstName(me))}</h1>
          <p class="view-lede">Your board position, what needs doing next, and where things stand.</p>
        </div>
      </header>
      <div class="home-grid">
        <section class="home-hero" aria-labelledby="h-entry">
          <h2 class="sheet-title" id="h-entry"><span>Your entry</span> <span class="sheet-title-meta">${esc(me.sport)} · ${esc(me.position)}</span></h2>
          <div class="home-hero-main">
            <p class="player-place"><span class="place place-xl">${ranks(me).board.rank}</span><span class="player-place-text">Place on the board<br><span class="num">of ${ranks(me).board.of}</span> ${movement(me)}</span></p>
            <div class="home-hero-who">
              <p class="home-hero-name">${splitName(me.name)}</p>
              <div class="player-badges">${verificationBadge(me)} ${minorBadge(me)}</div>
            </div>
            ${photoFor(me, { sizes: '96px', cls: 'home-hero-photo' })}
            <div class="grade-box">
              <div class="grade-label">Scout grade</div>
              <div class="grade-figure num">${me.grade.toFixed(1)}</div>
              <div class="grade-label">${signed(change)} in 6 months</div>
            </div>
          </div>
          <div class="home-hero-trend">
            ${sparkline(h, { width: 400, height: 56, fill: true })}
            <div class="trend-axis" aria-hidden="true">${SEED.gradeMonths.map((m) => `<span>${m}</span>`).join('')}</div>
            <span class="visually-hidden">Grade went from ${h[0]} in ${SEED.gradeMonths[0]} to ${me.grade} now.</span>
          </div>
          <div class="home-hero-foot">
            ${rankRow(me)}
            <button type="button" class="btn btn-accent btn-sm" data-action="go" data-route="me">Open my entry</button>
          </div>
        </section>
        <section class="card" aria-labelledby="h-next">
          <div class="card-head"><h2 class="card-title" id="h-next">Next steps</h2></div>
          <ul class="task-list">${steps.join('')}</ul>
        </section>
      </div>
      <div class="home-cols">
        <section class="card" aria-labelledby="h-myapps">
          <div class="card-head"><h2 class="card-title" id="h-myapps">Your applications</h2><a href="#trials" class="btn-link" data-action="go" data-route="trials">All trials</a></div>
          <div class="profile-card-body">${myApps.length ? `<ul class="plain-list">${myApps.map((ap) => {
            const o = oppById(ap.oppId);
            return `<li class="row-split"><span><strong>${esc(o.title)}</strong><span class="cell-sub">${esc(orgById(o.orgId).name)} · ${ap.via === 'club' ? 'invited' : 'sent'} ${formatDate(ap.date)}</span></span>${appStatusMarkup(ap)}</li>`;
          }).join('')}</ul>` : '<p class="muted">You haven’t applied to anything yet.</p>'}</div>
        </section>
        <section class="card" aria-labelledby="h-mypay">
          <div class="card-head"><h2 class="card-title" id="h-mypay">Payments</h2><a href="#payments" class="btn-link" data-action="go" data-route="payments">Details</a></div>
          <div class="profile-card-body">
            <dl class="kv">
              <div><dt>Held for you</dt><dd>${money(held.reduce((s, t) => s + t.amount, 0))}</dd></div>
              <div><dt>Paid to you</dt><dd>${money(settled.reduce((s, t) => s + t.amount, 0))}</dd></div>
              <div><dt>Fees you’ve paid</dt><dd>${money(paid.reduce((s, t) => s + t.amount, 0))}</dd></div>
            </dl>
            ${toMe.length ? '' : '<p class="muted card-note">Sponsor and contract payments will show here.</p>'}
          </div>
        </section>
      </div>`;
  }

  function agentHome() {
    const me = agentById(ME.agent);
    const mine = S.agreements.filter((g) => g.agentId === me.id);
    const clients = myClients();
    const toSign = mine.filter((g) => g.status === 'pending' && !g.agentSigned);
    const waiting = mine.filter((g) => g.status === 'pending' && g.agentSigned);
    const pendingApps = S.applications.filter((ap) => ap.status === 'guardian');
    const apps = S.applications.filter((ap) => clients.some((c) => c.id === ap.athleteId));
    const commission = S.transactions.filter((t) => t.agentId === me.id && t.status === 'settled').reduce((s, t) => s + t.amount, 0);
    const prospects = byGrade(S.athletes.filter((a) => !openAgreementFor(a.id) && me.sports.includes(a.sport))).slice(0, 4);

    const attention = [
      ...toSign.map((g) => {
        const a = athleteById(g.athleteId);
        return task({ title: `Sign the agreement with ${esc(a.name)}`, text: `${esc(a.name)}${g.guardianSigned ? ' and their guardian have' : ' has'} signed. Your signature makes it active.`, action: `<button type="button" class="btn btn-accent btn-sm" data-action="countersign" data-id="${g.id}">Review and sign</button>` });
      }),
      ...waiting.map((g) => {
        const a = athleteById(g.athleteId);
        if (needsGuardian(g)) return task({ tone: 'wait', title: `Waiting for ${esc(a.name)}’s parent or guardian to sign`, text: `${esc(a.name)} has signed. The agreement starts when ${esc(g.guardian)} signs.` });
        return task({ tone: 'wait', title: `Waiting for ${esc(a.name)} to sign`, text: isMinor(a) ? 'Under 18: a parent or guardian signs after them.' : 'You’ve signed and sent it.' });
      }),
      ...pendingApps.filter((ap) => clients.some((c) => c.id === ap.athleteId)).map((ap) => {
        const a = athleteById(ap.athleteId);
        return task({ tone: 'wait', title: `${esc(a.name)}’s application is waiting for guardian approval`, text: `${esc(oppById(ap.oppId).title)}. It goes to the club once ${esc(ap.guardian)} approves.` });
      }),
      ...apps.filter((ap) => ap.status === 'invited').map((ap) => {
        const o = oppById(ap.oppId);
        return task({ tone: 'done', title: `${esc(athleteById(ap.athleteId).name)} invited to the ${esc(o.title.toLowerCase())}`, text: `${esc(orgById(o.orgId).name)} · ${esc(o.date)}` });
      })
    ];
    S.opportunities.forEach((o) => {
      const ready = clients.filter((c) => eligibility(c, o).length === 0);
      if (ready.length) attention.push(task({ title: `${ready.map((c) => esc(c.name)).join(', ')} can apply to the ${esc(o.title.toLowerCase())}`, text: `${esc(orgById(o.orgId).name)} · closes ${formatDate(o.deadline)}`, action: `<button type="button" class="btn btn-quiet btn-sm" data-action="apply" data-id="${o.id}">Apply</button>` }));
    });

    return `
      <header class="view-head">
        <div>
          <h1 id="homeTitle">${esc(me.name)}</h1>
          <p class="view-lede">${esc(me.agency)} · ${esc(me.sports.join(', '))}</p>
        </div>
      </header>
      ${kpis([
        ['Clients', clients.length, 'active agreements'],
        ['To sign', toSign.length, 'waiting for you', toSign.length ? 'held' : ''],
        ['Applications', apps.length, 'sent for clients'],
        ['Commission', money(commission), 'received', 'settled']
      ])}
      <div class="home-cols">
        <section class="card" aria-labelledby="h-attention">
          <div class="card-head"><h2 class="card-title" id="h-attention">Needs your attention</h2></div>
          <ul class="task-list">${attention.length ? attention.join('') : task({ tone: 'done', title: 'Nothing waiting on you', text: 'New agreements and trial invitations will show up here.' })}</ul>
        </section>
        <section class="card" aria-labelledby="h-prospects">
          <div class="card-head"><h2 class="card-title" id="h-prospects">Unsigned in your sports</h2><a href="#board" class="btn-link" data-action="find-unsigned">See all</a></div>
          <ul class="mini-list">${prospects.map((a) => `
            <li>
              <span class="mini-rank num" title="Place on the board">${ranks(a).board.rank}</span>
              <span class="mini-main"><button type="button" class="leader-name" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button><span class="cell-sub">${esc(a.sport)} · ${esc(a.position)} · age ${ageOf(a.dob)}</span></span>
              <span class="mini-grade num" title="Scout grade">${a.grade.toFixed(1)}</span>
              <button type="button" class="btn btn-quiet btn-sm mini-action" data-action="start-agreement" data-athlete="${a.id}" data-agent="${me.id}">Offer<span class="visually-hidden"> representation to ${esc(a.name)}</span></button>
            </li>`).join('') || '<li class="muted">Everyone in your sports has an agent.</li>'}</ul>
        </section>
      </div>`;
  }

  function adminHome() {
    const pending = S.agreements.filter((g) => g.status === 'pending');
    const active = S.agreements.filter((g) => g.status === 'active');
    const held = S.transactions.filter((t) => t.status === 'held');
    const total = S.athletes.length;
    const recent = [...S.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    return `
      <header class="view-head">
        <div>
          <h1 id="homeTitle">Overview</h1>
          <p class="view-lede">Agreements, verification and escrow across the exchange.</p>
        </div>
      </header>
      ${kpis([
        ['Athletes', total, `${S.athletes.filter(isMinor).length} under 18`],
        ['Active agreements', active.length, 'signed by both sides', 'settled'],
        ['Awaiting signature', pending.length, 'agreements', pending.length ? 'held' : ''],
        ['Held in escrow', money(held.reduce((s, t) => s + t.amount, 0)), plural(held.length, 'payment')]
      ])}
      <div class="home-cols">
        <section class="card" aria-labelledby="h-pending">
          <div class="card-head"><h2 class="card-title" id="h-pending">Awaiting signature</h2><a href="#agreements" class="btn-link" data-action="go" data-route="agreements">All agreements</a></div>
          <ul class="task-list">${pending.length
            ? pending.map((g) => task({ tone: 'wait', title: `${esc(athleteById(g.athleteId).name)} &amp; ${esc(agentById(g.agentId).name)}`, text: g.agentSigned ? 'Waiting for the athlete' : 'Waiting for the agent' })).join('')
            : task({ tone: 'done', title: 'Nothing waiting', text: 'Every agreement has both signatures.' })}</ul>
        </section>
        <section class="card" aria-labelledby="h-verify">
          <div class="card-head"><h2 class="card-title" id="h-verify">Stamps on the board</h2><span class="card-meta">${total} athletes</span></div>
          <div class="profile-card-body"><ul>${[...LEVELS].reverse().map((l) => {
            const n = S.athletes.filter((a) => a.verification === l).length;
            return `
            <li class="standing">
              <span class="standing-label">${esc(levelLabel(l))}</span>
              <span class="standing-value num">${n}</span>
              <span class="standing-rank num">${Math.round((n / total) * 100)}%</span>
              <span class="standing-bar" aria-hidden="true"><span style="width:${Math.max(2, (n / total) * 100)}%"></span></span>
            </li>`;
          }).join('')}</ul></div>
        </section>
      </div>
      <section class="card home-wide" aria-labelledby="h-recent">
        <div class="card-head"><h2 class="card-title" id="h-recent">Recent payments</h2><a href="#payments" class="btn-link" data-action="go" data-route="payments">Ledger</a></div>
        <div class="profile-card-body"><ul class="plain-list">${recent.map((t) => `
          <li class="row-split"><span><strong>${esc(t.type)}</strong><span class="cell-sub">${esc(t.payer)} → ${esc(t.payee)} · ${formatDate(t.date)}</span></span><span class="num cell-strong">${money(t.amount)}</span></li>`).join('')}</ul></div>
      </section>`;
  }

  /* ==========================================================================
     FRONT PAGE: the season's programme (same for every role; minors hidden from visitors)
     ========================================================================== */
  const shortDay = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  // The search on the front of the programme opens the board with the query (or a sport) already applied.
  function wireFrontSearch() {
    $('#frontSearch').addEventListener('submit', (e) => {
      e.preventDefault();
      openBoardWith({ search: $('#frontSearchInput').value.trim() });
    });
  }

  function openBoardWith(patch) {
    filter = { ...DEFAULT_FILTER, ...patch };
    syncFilters();
    renderBoard();
    go('board');
  }

  function renderFront() {
    renderSpotlight();
    renderResultsBrief();
    renderWire();
    renderGlance();

    // Roles without the board (athletes) get their own entry instead of a search they can't use.
    const canSearch = hasRoute('board');
    $('#frontSearch').hidden = !canSearch;
    $('#frontBoardLink').hidden = !canSearch;
    const own = $('#frontOwn');
    own.hidden = canSearch;
    if (!canSearch && S.role === 'athlete') {
      const me = athleteById(ME.athlete);
      const r = ranks(me);
      own.innerHTML = `
        <p>You’re viewing as <strong>${esc(me.name)}</strong>, place ${r.board.rank} of ${r.board.of} on the board. Scouts, agents and clubs search the board; you keep your own entry up to date.</p>
        <div class="card-actions">
          <button type="button" class="btn btn-accent" data-action="go" data-route="me">Open your entry</button>
          <button type="button" class="btn btn-secondary" data-action="go" data-route="home">Your dashboard</button>
        </div>`;
    } else own.innerHTML = '';

    $('#frontBoard').innerHTML = byGrade(pool()).slice(0, 5).map((a) => {
      const key = a.season[0];
      const mine = S.role === 'athlete' && a.id === ME.athlete;
      return `
      <tr${mine ? ' class="is-mine"' : ''}>
        <td class="col-num"><span class="place">${ranks(a).board.rank}${ballpoint(a.id)}</span></td>
        <td>
          <a href="#athlete/${a.id}" class="entry-name" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</a>${mine ? ' <span class="tag tag-you">You</span>' : ''}
          <span class="cell-sub">${esc(a.team)} · ${code(a)}<span class="heat-sub-narrow"> · ${esc(sportShort(a.sport))} · ${esc(key.value)} ${esc(key.label)}</span></span>
          <span class="heat-sub-narrow heat-sub-stamp">${verificationBadge(a)}</span>
        </td>
        <td class="heat-event">${esc(sportShort(a.sport))}<span class="cell-sub">${esc(a.position)}</span></td>
        <td class="col-num heat-mark"><span class="mark">${esc(key.value)}</span><span class="cell-sub">${esc(key.label)}</span></td>
        <td class="col-num"><span class="grade">${a.grade.toFixed(1)}</span>${movement(a)}</td>
        <td class="heat-check">${verificationBadge(a)}</td>
      </tr>`;
    }).join('');

    const when = (d) => new Date(`1 ${d.date}`).getTime() || 0;
    const stories = pool().flatMap((a) => a.news.map((n) => ({ ...n, a })))
      .sort((x, y) => when(y) - when(x)).slice(0, 5);
    $('#storyList').innerHTML = stories.map(({ a, source, date, headline }, i) => `
      <li class="story${i === 0 ? ' story-lead' : ''}">
        <h3 class="story-head"><a href="#athlete/${a.id}" class="link-inherit" data-action="view-profile" data-id="${a.id}">${esc(headline)}</a></h3>
        <p class="story-meta">${esc(source)} · ${esc(date)} · ${esc(sportShort(a.sport))}</p>
      </li>`).join('');

    const closing = S.opportunities.filter(isOpen).sort((x, y) => x.deadline.localeCompare(y.deadline)).slice(0, 3);
    $('#frontTrials').innerHTML = closing.map((o) => {
      const days = daysUntil(o.deadline);
      return `
      <li class="fixture">
        <p class="fixture-date"><span class="fixture-label">Closes</span> <span class="num">${shortDay(o.deadline)}</span> <span class="fixture-left">${plural(days, 'day')} left</span></p>
        <p class="fixture-main"><strong>${esc(o.title)}</strong><span class="cell-sub">${esc(orgById(o.orgId).name)} · ${esc(o.sport)} · ${esc(o.location)}</span></p>
      </li>`;
    }).join('') || '<li class="fixture fixture-empty"><p>No trials are open right now. New listings show here first.</p></li>';

    const how = [
      ['Athletes', 'Get ranked, get seen, get represented.', 'Post your season’s marks and video, get measured at a combine, and sign with an agent who is paid only when you are. Under-18s need a parent or guardian to approve.', [['athlete:ath-01', 'Try it as an athlete']]],
      ['Agents', 'Find talent before anyone else does.', 'Filter the board for unsigned athletes in your sports, send agreements for e-signature, and apply to trials for your clients.', [['agent', 'Try it as an agent']]],
      ['Scouts and clubs', 'Search by what athletes can actually do.', 'Compare measurements and checked results side by side, keep shortlists, list trials and invite the athletes who qualify.', [['scout', 'Try it as a scout'], ['organization', 'Try it as a club']]]
    ];
    $('#howGrid').innerHTML = how.map(([who, head, text, ctas]) => `
      <article class="how">
        <h3 class="how-who">${who}</h3>
        <p class="how-head">${head}</p>
        <p class="how-text">${text}</p>
        <div class="card-actions">${ctas.map(([role, label]) => (role.split(':')[0] === S.role
          ? '<span class="muted how-current">You’re viewing as this role</span>'
          : `<button type="button" class="btn btn-secondary btn-sm" data-action="try-role" data-role="${role}">${label}</button>`)).join('')}</div>
      </article>`).join('');
  }

  // The featured entry: a halftone plate with the scout grade stamped on its corner.
  function renderSpotlight() {
    const a = athleteById(SEED.featuredAthleteId);
    const r = ranks(a);
    const marks = a.season.slice(0, 3).concat([{ label: 'Vertical', value: `${a.vertical_in}″` }, { label: 'Wingspan', value: feetIn(a.size.wingspan_in) }]);
    $('#spotlight').innerHTML = `
      <h2 class="sheet-title" id="h-feature"><span>Featured entry</span></h2>
      <div class="feature-photo">
        ${photoFor(a, { sizes: '(max-width: 860px) 44vw, 360px', eager: true, cls: 'plate-lg' })}
        <p class="grade-stamp"><span class="grade-stamp-label">Scout grade</span><span class="grade-stamp-figure num">${a.grade.toFixed(1)}</span><span class="grade-stamp-label">Place ${r.board.rank} of ${r.board.of}</span></p>
      </div>
      <h3 class="feature-name"><a href="#athlete/${a.id}" data-action="view-profile" data-id="${a.id}">${splitName(a.name)}</a></h3>
      <p class="feature-event">${esc(a.sport)} · ${esc(a.position)}<br>${esc(a.team)} · ${esc(a.city)}, ${code(a)}</p>
      <p class="feature-stamps">${verificationBadge(a)} ${statusMarkup(a)}</p>
      <p class="feature-copy">${esc(a.summary || '')}</p>
      <dl class="feature-marks">${marks.map((s) => `<div><dt>${esc(s.label)}</dt><dd class="num">${esc(s.value)}</dd></div>`).join('')}</dl>
      <button type="button" class="btn btn-secondary" data-action="view-profile" data-id="${a.id}">Read ${esc(firstName(a))}’s entry</button>`;
  }

  // Results in brief: printed, not scrolling. Static demo data, not a live feed.
  function renderResultsBrief() {
    const items = SEED.results.filter((r) => inPool(r.athleteId));
    $('#resultsBrief').innerHTML = items.map((r) => `
      <li class="brief-item">
        <p class="brief-head"><strong>${esc(r.sport)}.</strong> ${esc(r.event)}</p>
        <p class="brief-line">${r.rows.map(([name, value]) => `${esc(name)} <strong class="num">${esc(value)}</strong>`).join(', ')}. ${esc(r.status)}. <span class="brief-date">${shortDay(r.date)}</span> <a href="#athlete/${r.athleteId}" class="btn-link" data-action="view-profile" data-id="${r.athleteId}">Entry<span class="visually-hidden">: ${esc(athleteById(r.athleteId).name)}</span></a></p>
      </li>`).join('');
    const last = SEED.results.map((r) => r.date).sort().pop();
    $('#mastheadMeta').innerHTML = `Scouting and representation for Caribbean athletes<br>Results to ${formatDate(last)}`;
  }

  function renderWire() {
    $('#wireList').innerHTML = SEED.risers.filter((x) => inPool(x.athleteId)).map((x) => {
      const a = athleteById(x.athleteId);
      return `
        <li class="wire-item">
          <a href="#athlete/${a.id}" class="wire-name" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</a>
          <span class="wire-delta num">${esc(x.delta)}</span>
          <span class="wire-note">${esc(sportShort(a.sport))} · ${esc(x.note)}</span>
        </li>`;
    }).join('');
  }

  function renderGlance() {
    const p = pool();
    $('#glance').textContent = `${plural(p.length, 'entry', 'entries')} on the board · ${p.filter((a) => a.verification === 'pro').length} measured at a combine · ${p.filter((a) => !openAgreementFor(a.id)).length} without an agent · ${plural(S.opportunities.filter(isOpen).length, 'trial')} open.`;
  }

  /* ==========================================================================
     PROSPECT BOARD
     ========================================================================== */
  function activeFilterCount() {
    return ['position', 'country', 'status', 'verification', 'minHeight'].filter((k) => filter[k] !== DEFAULT_FILTER[k]).length;
  }

  function toggleFilters(open) {
    const box = $('.filters');
    const next = typeof open === 'boolean' ? open : !box.classList.contains('is-open');
    box.classList.toggle('is-open', next);
    $('#filterToggle').setAttribute('aria-expanded', String(next));
  }

  function syncFilterCount() {
    const n = activeFilterCount();
    $('#filterCount').textContent = n;
    $('#filterCount').hidden = !n;
  }

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
    syncFilterCount();
    return byGrade(pool().filter((a) => {
      if (filter.search) {
        const hay = `${a.name} ${a.sport} ${a.position} ${a.country} ${code(a)} ${a.city} ${a.team} ${a.school}`.toLowerCase();
        if (!filter.search.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
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

  // Comparing is for the roles that keep shortlists (agents, scouts, clubs).
  const canCompare = () => hasRoute('shortlists');

  function compareButton(id) {
    if (!canCompare()) return '';
    const on = S.compare.includes(id);
    return `<button type="button" class="btn btn-quiet btn-sm" data-action="toggle-compare" data-id="${id}" aria-pressed="${on}">${on ? 'Comparing' : 'Compare'}</button>`;
  }

  function renderBoard() {
    const list = filteredAthletes();
    $('#resultCount').textContent = list.length;
    $('#resultNoun').textContent = list.length === 1 ? 'athlete' : 'athletes';
    const hint = filter.search
      ? `Nothing on the board matches “${esc(filter.search)}”. Check the spelling, or search by sport, position, team or country.`
      : 'No one meets every filter at once. Loosen one, such as the minimum height or the verification level.';
    const empty = `
      <div class="empty">
        <h2>No athletes match</h2>
        <p>${hint}</p>
        <button type="button" class="btn btn-secondary btn-sm" data-action="reset-filters">Clear search and filters</button>
      </div>`;

    const grid = $('#prospectGrid');
    const tableWrap = $('#prospectTableWrap');
    const table = S.viewMode === 'table';
    grid.hidden = table;
    tableWrap.hidden = !table;
    $('#heatHead').hidden = table || !list.length;

    if (table) {
      $('#prospectTableBody').innerHTML = list.length ? list.map((a) => {
        const r = ranks(a);
        const key = a.season[0];
        return `
          <tr>
            <td class="col-num"><span class="board-rank place">${r.board.rank}${ballpoint(a.id)}</span></td>
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
            <td>${verificationBadge(a)}</td>
            <td class="col-num">${r.sport.rank} <span class="cell-unit">·</span> ${r.country.rank}</td>
            <td>${statusMarkup(a)}</td>
            <td><div class="cell-actions">${compareButton(a.id)}</div></td>
          </tr>`;
      }).join('') : `<tr><td colspan="12">${empty}</td></tr>`;
      return;
    }

    // Heat-sheet entries: place, plate, name and stamp, marks, grade; ranks in words underneath.
    grid.innerHTML = list.length ? list.map((a) => `
      <article class="prospect${S.compare.includes(a.id) ? ' is-compared' : ''}" aria-labelledby="pn-${a.id}">
        <div class="prospect-place"><span class="place place-lg" title="Place on the board">${ranks(a).board.rank}${ballpoint(a.id)}</span>${movement(a)}</div>
        ${photoFor(a, { sizes: '(max-width: 640px) 84px, 112px', cls: 'prospect-photo' })}
        <div class="prospect-main">
          <h3 class="prospect-name" id="pn-${a.id}"><button type="button" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button></h3>
          <p class="prospect-pos">${esc(a.position)} · ${esc(a.sport)}</p>
          <p class="prospect-team">${esc(a.team)} · ${esc(a.country)} · age ${ageOf(a.dob)}</p>
          <p class="prospect-badges">${verificationBadge(a)} ${minorBadge(a)}</p>
        </div>
        <dl class="metric-grid metric-grid-4">
          <div><dt>Height</dt><dd>${feetIn(a.size.height_in)}</dd></div>
          <div><dt>Weight</dt><dd>${a.size.weight_lb} lb</dd></div>
          ${a.season.slice(0, 2).map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}
        </dl>
        <div class="grade-tile">
          <strong class="num">${a.grade.toFixed(1)}</strong>
          <button type="button" class="grade-help" data-action="explain" data-topic="grade" aria-label="Scout grade: what it means">Grade</button>
        </div>
        <div class="prospect-foot">
          ${rankRow(a)}
          ${statusMarkup(a)}
          <div class="prospect-actions">${compareButton(a.id)}</div>
        </div>
      </article>`).join('') : empty;
  }

  /* ==========================================================================
     ATHLETE PROFILE
     ========================================================================== */
  // What the current role can do from this profile.
  function profileActions(a) {
    const r = repStatus(a);
    const isMe = S.role === 'athlete' && a.id === ME.athlete;
    const parts = [];
    if (r.kind === 'represented') parts.push(`<p class="player-represented">Represented by ${esc(r.agent.name)}</p>`);
    else if (r.kind === 'pending') parts.push(`<p class="player-represented">Agreement with ${esc(r.agent.name)} waiting for a signature</p>`);
    else if (isMe) parts.push('<button type="button" class="btn btn-accent" data-action="go" data-route="agents">Find an agent</button>');
    else if (S.role === 'agent') parts.push(`<button type="button" class="btn btn-accent" data-action="start-agreement" data-athlete="${a.id}" data-agent="${ME.agent}">Offer representation</button>`);

    if (S.role === 'organization') {
      S.opportunities.filter((o) => o.orgId === ME.organization).forEach((o) => {
        const ap = applicationFor(a.id, o.id);
        if (ap) parts.push(`<p class="player-represented">${esc(o.title)}: ${APP_STATUS[ap.status][1].toLowerCase()}</p>`);
        else if (!eligibility(a, o).length) parts.push(`<button type="button" class="btn btn-accent" data-action="invite" data-athlete="${a.id}" data-opp="${o.id}">Invite to ${esc(o.title.toLowerCase())}</button>`);
        else if (a.sport === o.sport) parts.push(`<p class="player-represented">Not eligible for your ${esc(o.title.toLowerCase())}: ${esc(eligibility(a, o).join(' '))}</p>`);
      });
    }
    if (S.role === 'visitor') parts.push('<p class="player-represented">Agents, scouts and clubs can compare and contact athletes once signed in.</p>');
    if (canCompare()) {
      const on = S.compare.includes(a.id);
      parts.push(`<button type="button" class="btn btn-quiet" data-action="toggle-compare" data-id="${a.id}" aria-pressed="${on}">${on ? 'In comparison' : 'Add to comparison'}</button>`);
    }
    parts.push('<button type="button" class="btn btn-quiet" data-action="print">Print / save PDF</button>');
    return parts.join('');
  }

  function renderProfile(id) {
    const a = athleteById(id) || athleteById(SEED.featuredAthleteId);
    S.selectedAthleteId = a.id;
    const age = ageOf(a.dob);
    const academics = canSeeAcademics(a);
    const isMe = S.role === 'athlete' && a.id === ME.athlete;
    const crumbs = isMe ? '' : `
      <nav class="crumbs" aria-label="Breadcrumb"><ol>
        <li>${hasRoute('board') ? '<a href="#board" data-action="go" data-route="board">Prospects</a>' : '<a href="#" data-action="back">Back</a>'}</li>
        <li aria-current="page">${esc(a.name)}</li>
      </ol></nav>`;
    const standings = [
      ['Height', feetIn(a.size.height_in), standing((x) => x.size.height_in, a)],
      ['Wingspan', feetIn(a.size.wingspan_in), standing((x) => x.size.wingspan_in, a)],
      ['Vertical jump', `${a.vertical_in}″`, standing((x) => x.vertical_in, a)]
    ];
    const sportPeers = pool().filter((x) => x.sport === a.sport).length;
    const sportName = a.sport === 'Track & Field' ? 'track & field' : a.sport.toLowerCase();
    const lockIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    const card = (hid, title, body) => `
      <section class="card profile-card" aria-labelledby="${hid}">
        <div class="card-head"><h2 class="card-title" id="${hid}">${title}</h2></div>
        <div class="profile-card-body">${body}</div>
      </section>`;
    const h = a.gradeHistory;
    const change = a.grade - h[0];
    const moved = (a.prevRank || ranks(a).board.rank) - ranks(a).board.rank;

    const r = ranks(a);
    $('#profileBody').innerHTML = `
      ${crumbs}
      <header class="player-header">
        <div class="player-photo">
          ${photoFor(a, { sizes: '(max-width: 640px) 92vw, (max-width: 1080px) 40vw, 400px', eager: true, cls: 'plate-lg' })}
          <div class="grade-stamp">
            <button type="button" class="grade-help grade-stamp-label" data-action="explain" data-topic="grade">Scout grade</button>
            <span class="grade-stamp-figure num">${a.grade.toFixed(1)}</span>
            <span class="grade-stamp-label">${signed(change)} in 6 months</span>
          </div>
        </div>
        <div class="player-header-main">
          <p class="player-place"><span class="place place-xl">${r.board.rank}${ballpoint(a.id)}</span><span class="player-place-text">Place on the board<br><span class="num">of ${r.board.of}</span> ${movement(a)}</span></p>
          <h1 class="player-name" id="profileName">${splitName(a.name)}</h1>
          <p class="player-sport">${isMe ? 'Your entry · ' : ''}${esc(a.sport)} · ${esc(a.position)}${a.jersey !== '—' ? ` · <span class="num">No. ${esc(a.jersey)}</span>` : ''}</p>
          <div class="player-badges">${stampFor(a.verification, { big: true })} ${minorBadge(a)}</div>
          <dl class="bio-list">
            <div><dt>Height</dt><dd>${feetIn(a.size.height_in)} <span class="unit-alt">${cm(a.size.height_in)}</span></dd></div>
            <div><dt>Weight</dt><dd>${a.size.weight_lb} lb <span class="unit-alt">${kg(a.size.weight_lb)}</span></dd></div>
            <div><dt>Age</dt><dd>${age}</dd></div>
            <div><dt>From</dt><dd>${esc(a.city)}, ${esc(a.country)}</dd></div>
            <div><dt>Team</dt><dd>${esc(a.team)}</dd></div>
            <div><dt>Status</dt><dd>${statusMarkup(a)}</dd></div>
          </dl>
          <div class="player-actions">${profileActions(a)}</div>
        </div>
        <div class="player-statblock">
          ${rankRow(a)}
        </div>
      </header>

      ${age < 18 ? `<p class="notice minor-notice">${esc(firstName(a))} is under 18. A parent or guardian must approve applications and sign any agreement. Academic records are hidden.</p>` : ''}

      <nav class="profile-tabs" aria-label="In this entry">
        ${[['p-season', 'Season'], ['p-trend', 'Grade'], ['p-measure', 'Measurements'], ['p-tests', 'Testing'], ['p-career', 'Career'], ['p-video', 'Video'], ['p-honours', 'Honours'], ['p-school', 'Education'], ['p-news', 'News'], ['p-perms', 'Permissions']]
          .map(([t, l]) => `<button type="button" class="profile-tab" data-action="jump" data-target="${t}">${l}</button>`).join('')}
      </nav>

      <div class="profile-grid">
        <div class="profile-col">
          <section class="card profile-card" aria-labelledby="p-season">
            <div class="card-head"><h2 class="card-title" id="p-season">Season stats</h2></div>
            <dl class="metric-grid">${a.season.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}</dl>
          </section>
          ${card('p-trend', 'Grade history', `
            <div class="trend-card">
              <div>
                <div class="trend-chart ${change >= 0 ? '' : 'trend-down'}">${sparkline(h, { width: 320, height: 120, fill: true })}</div>
                <div class="trend-axis" aria-hidden="true">${SEED.gradeMonths.map((m) => `<span>${m}</span>`).join('')}</div>
                <p class="visually-hidden">Scout grade by month: ${SEED.gradeMonths.map((m, i) => `${m} ${h[i]}`).join(', ')}.</p>
              </div>
              <dl class="trend-summary">
                <dt>6-month change</dt><dd class="${change >= 0 ? 'trend-up' : 'trend-down'}">${signed(change)}</dd>
                <dt>High</dt><dd>${Math.max(...h).toFixed(1)}</dd>
                <dt>This week</dt><dd>${moved > 0 ? `Up ${moved}` : moved < 0 ? `Down ${-moved}` : 'No change'}</dd>
              </dl>
            </div>`)}
          ${card('p-measure', 'Measurements', `
            <dl class="kv">
              <div><dt>Height</dt><dd>${feetIn(a.size.height_in)}</dd></div>
              <div><dt>Weight</dt><dd>${a.size.weight_lb} lb</dd></div>
              <div><dt>Wingspan</dt><dd>${feetIn(a.size.wingspan_in)}</dd></div>
              <div><dt>Standing reach</dt><dd>${feetIn(a.size.reach_in)}</dd></div>
              <div><dt>Dominant hand</dt><dd>${esc(a.size.hand)}</dd></div>
              <div><dt>Dominant foot</dt><dd>${esc(a.size.foot)}</dd></div>
            </dl>
            <h3 class="label standing-title">Against other ${esc(sportName)} athletes</h3>
            ${sportPeers < 2 ? `<p class="muted card-note">${esc(firstName(a))} is the only ${esc(sportName)} athlete on the board so far, so there is no one to compare with yet.</p>` : `
            <p class="muted card-note">Rank among the ${sportPeers} ${esc(sportName)} athletes on the board.</p>
            <ul>${standings.map(([label, value, s]) => `
              <li class="standing">
                <span class="standing-label">${label}</span>
                <span class="standing-value num">${value}</span>
                <span class="standing-rank num">${s.rank} of ${s.of}</span>
                <span class="standing-bar" aria-hidden="true"><span style="width:${Math.max(4, s.pct)}%"></span></span>
              </li>`).join('')}</ul>`}`)}
          ${card('p-tests', 'Testing', `
            <dl class="kv">${a.tests.map((t) => `<div><dt>${esc(t.label)}</dt><dd>${esc(t.value)}</dd></div>`).join('')}</dl>
            <p class="card-note">${verificationBadge(a)} ${esc(levelMeans(a.verification))} <button type="button" class="btn-link" data-action="explain" data-topic="verification">What the stamps mean</button></p>`)}
          ${card('p-career', 'Career', `
            <ol class="timeline">${a.career.map((c) => `
              <li><div class="timeline-when">${esc(c.season)} · ${esc(c.league)}</div><div class="timeline-team">${esc(c.team)}</div><p class="timeline-note">${esc(c.note)}</p></li>`).join('')}</ol>`)}
        </div>
        <div class="profile-col">
          ${card('p-video', 'Video', `
            <div class="player">
              <span class="tag player-soon">Playback coming soon</span>
              <span class="player-play" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
              <p class="player-title" id="playerTitle">${esc(a.video[0].title)}</p>
              <p class="player-meta num" id="playerMeta">${esc(a.video[0].tag)} · ${esc(a.video[0].duration)}</p>
            </div>
            <ul class="clip-list">${a.video.map((v, i) => `
              <li><button type="button" class="clip" data-action="play-clip" data-index="${i}" aria-current="${i === 0}"><span class="clip-title">${esc(v.title)}</span><span class="clip-time">${esc(v.duration)}</span></button></li>`).join('')}</ul>`)}
          ${card('p-honours', 'Honours', `<ul class="plain-list">${a.honours.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`)}
          ${card('p-school', 'Education', academics ? `
            <dl class="kv">
              <div><dt>School</dt><dd>${esc(a.academics.school)}</dd></div>
              <div><dt>GPA</dt><dd>${esc(a.academics.gpa)}</dd></div>
              <div><dt>Exams</dt><dd>${esc(a.academics.exams)}</dd></div>
              <div><dt>Eligibility</dt><dd>${esc(a.academics.eligibility)}</dd></div>
            </dl>
            <p class="muted card-note">${isMe ? 'Only you, the platform and an agent you’ve given manager access can see this.' : 'Visible because of your role or the athlete’s permission.'}</p>` : `
            <p class="locked">${lockIcon}<span>Academic records are private. ${age < 18 ? 'They are hidden for athletes under 18.' : 'The athlete shares them only with their own agent (manager access or higher).'}</span></p>`)}
          ${card('p-news', 'In the news', `<ul class="plain-list">${a.news.map((n) => `<li><div class="news-source">${esc(n.source)} · ${esc(n.date)}</div><div class="news-head">${esc(n.headline)}</div></li>`).join('')}</ul>`)}
        </div>
      </div>

      <section class="card profile-card home-wide" aria-labelledby="p-perms">
        <div class="card-head card-head-lg">
          <div>
            <h2 class="card-title" id="p-perms">Agent permissions</h2>
            <p class="muted">${isMe ? 'You own your profile. Choose how much an agent can do for you; you can change this at any time.' : `Set by ${esc(firstName(a))}. Only the athlete can change this.`}</p>
          </div>
        </div>
        <div class="profile-card-body">
          ${isMe ? `<fieldset class="perm-grid" id="permList">
            <legend class="visually-hidden">Permission level</legend>
            ${PERMISSIONS.map((p) => `
              <label class="option">
                <input type="radio" name="perm" value="${p}" ${a.permission === p ? 'checked' : ''}>
                <span><strong>${PERMISSION_LABELS[p][0]}</strong><span>${PERMISSION_LABELS[p][1]}</span></span>
              </label>`).join('')}
          </fieldset>` : `<p class="perm-current"><strong>${PERMISSION_LABELS[a.permission][0]}.</strong> ${PERMISSION_LABELS[a.permission][1]}</p>`}
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
     AGENTS, CLIENTS, AGREEMENTS
     ========================================================================== */
  function renderAgents() {
    const me = S.role === 'athlete' ? athleteById(ME.athlete) : null;
    const myOpen = me && openAgreementFor(me.id);
    $('#agentsLede').textContent = me
      ? 'Agents are paid a share of what you earn, never an upfront fee. Pick one and start an agreement; it becomes active when everyone has signed.'
      : 'Agents working with athletes on the exchange. They are paid a share of what an athlete earns, never an upfront fee.';
    let banner = '';
    if (myOpen) banner = `<h2 class="section-title">Your agreement</h2><article class="card agreement-wrap">${agreementCard(myOpen, 3)}</article>`;
    else if (S.role === 'visitor') banner = visitorNote('To start an agreement with an agent, try the demo as an athlete.', [['athlete:ath-01', 'Try it as an athlete']]);
    $('#agentBanner').innerHTML = banner;

    $('#agentList').innerHTML = SEED.agents.map((g, i) => {
      let action = '';
      if (me) {
        action = myOpen
          ? `<span class="muted agent-note">${myOpen.agentId === g.id ? (myOpen.status === 'active' ? 'Your agent' : 'Agreement in progress') : 'You already have an agreement'}</span>`
          : `<button type="button" class="btn btn-accent btn-sm" data-action="start-agreement" data-athlete="${me.id}" data-agent="${g.id}">Start an agreement</button>`;
      }
      const onExchange = S.agreements.filter((x) => x.agentId === g.id && x.status === 'active').length;
      return `
        <article class="card agent" style="--i:${i}">
          <div class="agent-head">
            <div>
              <h2 class="agent-name">${esc(g.name)}</h2>
              <p class="agent-firm">${esc(g.agency)}</p>
              <p class="agent-where">${esc(g.city)} · ${esc(g.sports.join(', '))}</p>
            </div>
            <div class="agent-rating"><strong class="num">${g.rating.toFixed(1)}</strong><span>rating from ${g.reviews} athletes</span></div>
          </div>
          <dl class="metric-grid alt">
            <div><dt>Athletes</dt><dd>${g.athletes}</dd></div>
            <div><dt>Years</dt><dd>${g.years}</dd></div>
            <div><dt>Commission</dt><dd>${esc(g.commission)}</dd></div>
          </dl>
          <div class="agent-body">
            <p class="agent-bio">${esc(g.bio)}</p>
            <ul class="agent-licences" aria-label="Credentials the agent lists">${g.credentials.map((c) => `<li class="tag">${esc(c)}</li>`).join('')}</ul>
            <p class="agent-clients">${S.role === 'admin' ? `${plural(onExchange, 'active agreement')} on the exchange` : esc(g.clients)}</p>
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

  // A short prompt for signed-out visitors on pages where the real action needs a role.
  function visitorNote(text, roles) {
    return `<div class="visitor-note"><p>${esc(text)}</p><div class="card-actions">${roles.map(([role, label]) => `<button type="button" class="btn btn-secondary btn-sm" data-action="try-role" data-role="${role}">${esc(label)}</button>`).join('')}</div></div>`;
  }

  function toggleContact(btn) {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const open = btn.getAttribute('aria-expanded') !== 'true';
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Hide contact details' : 'Show contact details';
  }

  // Under-18 agreements need the guardian's signature as well; it comes from a link sent to them.
  const needsGuardian = (g) => !!g.guardianRequired && !!g.athleteSigned && !g.guardianSigned;

  function agreementStatusText(g) {
    if (g.status === 'active') return '<span class="status status-ok">Active</span>';
    if (!g.athleteSigned) return '<span class="status status-info">Waiting for the athlete to sign</span>';
    if (needsGuardian(g)) return '<span class="status status-info">Waiting for a parent or guardian to sign</span>';
    return '<span class="status status-info">Waiting for the agent to sign</span>';
  }

  function agreementCard(g, level = 2) {
    const a = athleteById(g.athleteId);
    const ag = agentById(g.agentId);
    const h = `h${level}`;
    const sub = `h${level + 1}`;
    const canSign = g.status === 'pending' && (
      (S.role === 'agent' && g.agentId === ME.agent && !g.agentSigned) ||
      (S.role === 'athlete' && g.athleteId === ME.athlete && !g.athleteSigned));
    const dealStatus = { signed: '<span class="status status-ok">Signed</span>', held: '<span class="status status-wait">In escrow</span>', review: '<span class="status status-info">In review</span>' };
    return `
      <div class="agreement-head">
        <${h} class="agreement-parties"><button type="button" class="link-inherit" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button> &amp; ${esc(ag.name)}</${h}>
        ${agreementStatusText(g)}
      </div>
      <div class="agreement-body">
        <div>
          <${sub}>Terms</${sub}>
          <dl class="kv">
            <div><dt>Authority</dt><dd>${esc(PERMISSION_LABELS[g.authority][0])}</dd></div>
            <div><dt>Commission</dt><dd>${esc(g.commission)} of earnings</dd></div>
            <div><dt>Athlete signed</dt><dd>${g.athleteSigned ? formatDate(g.athleteSigned) : 'Not yet'}</dd></div>
            ${g.guardianRequired ? `<div><dt>Guardian signed</dt><dd>${g.guardianSigned ? `${formatDate(g.guardianSigned)} (${esc(g.guardian)})` : g.guardian ? `Not yet. Link sent to ${esc(g.guardianContact)}` : 'Not yet'}</dd></div>` : ''}
            <div><dt>Agent signed</dt><dd>${g.agentSigned ? formatDate(g.agentSigned) : 'Not yet'}</dd></div>
          </dl>
        </div>
        <div>
          <${sub}>Deals</${sub}>
          ${g.deals.length ? `<ul class="plain-list">${g.deals.map((d) => `<li><strong>${esc(d.name)}</strong>: ${esc(d.detail)} ${dealStatus[d.status] || ''}</li>`).join('')}</ul>` : '<p class="muted">No deals yet.</p>'}
        </div>
        <div>
          <${sub}>Documents</${sub}>
          <ul class="plain-list">${g.documents.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
        </div>
      </div>
      ${canSign ? `<div class="agreement-foot"><button type="button" class="btn btn-accent btn-sm" data-action="countersign" data-id="${g.id}">Review and sign</button><span class="muted">${S.role === 'athlete' && g.guardianRequired ? 'Your parent or guardian signs after you.' : 'Your signature makes the agreement active.'}</span></div>` : ''}`;
  }

  // Pending first: those are the ones somebody needs to act on.
  const pendingFirst = (list) => [...list].sort((x, y) => (x.status === y.status ? 0 : x.status === 'pending' ? -1 : 1));

  function renderAgreementList(el, list, emptyHtml) {
    el.innerHTML = list.length ? pendingFirst(list).map((g) => `<article class="card agreement-wrap">${agreementCard(g)}</article>`).join('') : emptyHtml;
  }

  function renderClients() {
    renderAgreementList($('#clientList'), S.agreements.filter((g) => g.agentId === ME.agent), `
      <div class="card empty"><h2>No clients yet</h2><p>Find an athlete without an agent and offer representation from their profile.</p>
      <button type="button" class="btn btn-secondary btn-sm" data-action="find-unsigned">Find unsigned athletes</button></div>`);
  }

  function renderAgreementsPage() {
    renderAgreementList($('#agreementList'), S.agreements, '<div class="card empty"><h2>No agreements yet</h2><p>Agreements show up here once an athlete or agent starts one.</p></div>');
  }

  /* ---------- Agreement flow ---------- */

  const availableAthletes = () => S.athletes.filter((a) => !openAgreementFor(a.id));

  // Start from the athlete's own permission setting; under-18s start at Manager, never full authority.
  function defaultAuthority(a) {
    if (!a) return 'manager';
    if (isMinor(a)) return 'manager';
    return a.permission === 'representative' ? 'representative' : 'manager';
  }

  function syncAuthority() {
    const a = athleteById($('#repAthlete').value);
    const value = defaultAuthority(a);
    $$('input[name="repAuthority"]').forEach((r) => { r.checked = r.value === value; });
    $('#repAuthorityHint').textContent = !a ? ''
      : isMinor(a) ? `${a.name} is under 18, so this starts at Manager. A parent or guardian also signs.`
      : `Starts from ${firstName(a)}’s own profile setting: ${PERMISSION_LABELS[a.permission][0].toLowerCase()}.`;
  }

  function openAgreement({ athleteId, agentId }, opener) {
    if (S.role !== 'athlete' && S.role !== 'agent') return;
    stepper = { mode: 'new' };
    const athleteSel = $('#repAthlete');
    const agentSel = $('#repAgent');

    if (S.role === 'athlete') {
      const me = athleteById(ME.athlete);
      athleteSel.innerHTML = `<option value="${me.id}">${esc(me.name)} (you)</option>`;
      athleteSel.disabled = true;
      agentSel.disabled = false;
      agentSel.innerHTML = '<option value="">Choose an agent</option>' + SEED.agents.map((g) => `<option value="${g.id}">${esc(g.name)}, ${esc(g.agency)}</option>`).join('');
      agentSel.value = agentId || '';
    } else {
      const me = agentById(ME.agent);
      agentSel.innerHTML = `<option value="${me.id}">${esc(me.name)} (you)</option>`;
      agentSel.disabled = true;
      athleteSel.disabled = false;
      athleteSel.innerHTML = '<option value="">Choose an athlete</option>' + availableAthletes().map((a) => `<option value="${a.id}">${esc(a.name)}: ${esc(a.sport)}, age ${ageOf(a.dob)}</option>`).join('');
      athleteSel.value = availableAthletes().some((a) => a.id === athleteId) ? athleteId : '';
    }
    athleteSel.onchange = () => { renderPartySummary(); syncAuthority(); };
    agentSel.onchange = renderPartySummary;
    renderPartySummary();
    syncAuthority();
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
      <ul aria-label="Credentials the agent lists">${g.credentials.map((c) => `<li class="tag">${esc(c)}</li>`).join('')}</ul>
      ${a && isMinor(a) ? `<div class="notice">${esc(a.name)} is ${ageOf(a.dob)}. A parent or guardian must also sign.</div>` : ''}
      ${a && !g.sports.includes(a.sport) ? `<div class="notice">${esc(g.name)} doesn’t list ${esc(a.sport.toLowerCase())} among their sports.</div>` : ''}` : '';
  }

  // Opens an existing agreement at the terms step: to countersign, or as the guardian (from their link).
  function openExisting(agreementId, mode, opener) {
    const g = S.agreements.find((x) => x.id === agreementId);
    if (!g) return;
    stepper = { mode, agreementId };
    const a = athleteById(g.athleteId);
    const ag = agentById(g.agentId);
    $('#repTitle').textContent = mode === 'guardian' ? `${a.name}’s agreement with ${ag.name}` : `${a.name} & ${ag.name}`;
    $('#repAthlete').innerHTML = `<option value="${a.id}">${esc(a.name)}</option>`;
    $('#repAgent').innerHTML = `<option value="${ag.id}">${esc(ag.name)}</option>`;
    $$('input[name="repAuthority"]').forEach((r) => { r.checked = r.value === g.authority; });
    goToStep(3, false);
    openModal($('#repModal'), opener);
  }
  const openCountersign = (id, opener) => openExisting(id, 'countersign', opener);
  const openGuardianSign = (id, opener) => openExisting(id, 'guardian', opener);

  // The terms in one glance, shown on the terms and signing steps.
  function termsSummary() {
    const a = athleteById($('#repAthlete').value);
    const g = agentById($('#repAgent').value);
    const existing = stepper && stepper.agreementId && S.agreements.find((x) => x.id === stepper.agreementId);
    const authority = existing ? existing.authority : stepper.authority;
    const signers = [`${a.name}`, isMinor(a) ? 'a parent or guardian' : null, g.name].filter(Boolean);
    return `
      <div><dt>Agent</dt><dd>${esc(g.name)}, ${esc(g.agency)}</dd></div>
      <div><dt>Commission</dt><dd>${esc(g.commission)} of what ${esc(firstName(a))} earns from deals the agent arranges. No upfront fee.</dd></div>
      <div><dt>Authority</dt><dd>${esc(PERMISSION_LABELS[authority][0])}: ${esc(PERMISSION_LABELS[authority][1])}</dd></div>
      <div><dt>Length</dt><dd>24 months, with 30 days’ notice to end it</dd></div>
      <div><dt>Signed by</dt><dd>${esc(signers.join(', '))}</dd></div>`;
  }

  function goToStep(n, moveFocus = true) {
    if (!stepper) return;
    if (stepper.mode === 'new' && n > 1 && n < 5) {
      const a = athleteById($('#repAthlete').value);
      const g = agentById($('#repAgent').value);
      const err = $('#repPartyError');
      if (!a || !g) { err.textContent = 'Choose both an athlete and an agent.'; err.hidden = false; return; }
      if (openAgreementFor(a.id)) { err.textContent = `${a.name} already has an agreement. It must end before a new one starts.`; err.hidden = false; return; }
    }
    if (stepper.mode !== 'new' && n < 3) n = 3;
    if (stepper.mode === 'new' && n === 3) stepper.authority = ($('input[name="repAuthority"]:checked') || {}).value || 'manager';
    if (n === 3 || n === 4) {
      const g = agentById($('#repAgent').value);
      $('#termsCommission').textContent = `${g.commission}`;
      $('#termsSummary').innerHTML = termsSummary();
      $('#signSummary').innerHTML = termsSummary();
    }
    if (n === 4) prepareSignStep();

    $('#repSteps').hidden = n === 5;
    $$('#repSteps li').forEach((li) => {
      const s = parseInt(li.dataset.step, 10);
      li.classList.toggle('is-done', s < n);
      if (s === n) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    $$('#repModal .step').forEach((p) => { p.hidden = parseInt(p.dataset.pane, 10) !== n; });
    $$('#repModal .step[data-pane="3"] [data-to="2"]').forEach((b) => { b.hidden = stepper.mode !== 'new'; });
    if (moveFocus) {
      const pane = $(`#repModal .step[data-pane="${n}"]`);
      const target = pane.querySelector('input:not([type="radio"]):not([type="checkbox"]):not([disabled])') || pane.querySelector('.btn-accent');
      if (target) target.focus();
    }
  }

  // Who is signing now: the guardian (from their link), the athlete, or the agent.
  const signerParty = () => (stepper && stepper.mode === 'guardian' ? 'guardian' : S.role === 'athlete' ? 'athlete' : 'agent');

  function prepareSignStep() {
    const a = athleteById($('#repAthlete').value);
    const g = agentById($('#repAgent').value);
    const party = signerParty();
    const existing = stepper.agreementId && S.agreements.find((x) => x.id === stepper.agreementId);
    const minorAthlete = party === 'athlete' && isMinor(a);
    const known = S.guardians[a.id] || {};
    const expected = party === 'guardian' ? existing.guardian : party === 'athlete' ? a.name : g.name;
    $('#signAs').textContent = party === 'guardian'
      ? `Signing as ${a.name}’s parent or guardian, ${existing.guardian}.`
      : party === 'athlete' ? `Signing as the athlete, ${a.name}.` : `Signing as the agent, ${g.name} (${g.agency}).`;
    $('#guardianFields').hidden = !minorAthlete;
    $('#guardianNote').textContent = minorAthlete ? `You’re ${ageOf(a.dob)}, so a parent or guardian signs too. We’ll send them a link to read these terms and sign on their own phone. The agreement starts only when they do.` : '';
    $('#guardianName').value = known.name || '';
    $('#guardianContact').value = known.contact || '';
    $('#guardianConsentRow').hidden = party !== 'guardian';
    $('#guardianConsent').checked = false;
    $('#guardianConsentText').textContent = `I am ${a.name}’s parent or legal guardian and I agree to these terms on their behalf.`;
    $('#signerLabel').textContent = `Type your full name (${expected}) to sign`;
    $('#signerName').value = '';
    $('#signaturePreview').textContent = '';
    $('#signatureMeta').textContent = `E-signature (demo) · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;
    $('#signError').hidden = true;
    $('#signBtn').textContent = party === 'guardian' ? 'Sign as guardian'
      : minorAthlete ? 'Sign and send to my guardian'
      : stepper.mode === 'countersign' ? 'Sign and activate'
      : `Sign and send to the ${party === 'athlete' ? 'agent' : 'athlete'}`;
    $('#signerName').oninput = (e) => { $('#signaturePreview').textContent = e.target.value; };
  }

  // After signing: say what happened and what happens next, instead of a toast that disappears.
  function showDone(g) {
    const a = athleteById(g.athleteId);
    const ag = agentById(g.agentId);
    const next = g.status === 'active'
      ? `The agreement is active from ${formatDate(todayISO())}. ${ag.name} can now act for ${firstName(a)} as ${PERMISSION_LABELS[g.authority][0].toLowerCase()}. Commission is ${g.commission} of earnings from deals ${firstName(ag)} arranges, paid only when ${firstName(a)} is paid.`
      : !g.athleteSigned ? `It’s on ${a.name}’s dashboard to review and sign.`
      : needsGuardian(g) ? `We’ve sent ${g.guardian} a link at ${g.guardianContact}. The agreement starts when they sign.`
      : `It’s on ${ag.name}’s dashboard to sign. The agreement starts when they do.`;
    $('#doneBody').innerHTML = `
      <span class="stamp stamp-big stamp-press" aria-hidden="true">${g.status === 'active' ? 'Active' : 'Signed'}<span class="stamp-date num">${formatDate(todayISO())}</span></span>
      <h3>${g.status === 'active' ? 'Agreement active' : 'Your signature is on it'}</h3>
      <p>${esc(next)}</p>
      <dl class="terms-summary">${termsSummary()}</dl>`;
    goToStep(5);
  }

  function sign() {
    if (!stepper) return;
    const a = athleteById($('#repAthlete').value);
    const g = agentById($('#repAgent').value);
    const party = signerParty();
    const existing = stepper.agreementId && S.agreements.find((x) => x.id === stepper.agreementId);
    const expected = party === 'guardian' ? existing.guardian : party === 'athlete' ? a.name : g.name;
    const err = $('#signError');
    const fail = (msg, focusEl) => { err.textContent = msg; err.hidden = false; if (focusEl) focusEl.focus(); };

    let guardian = null;
    if (party === 'athlete' && isMinor(a)) {
      guardian = { name: $('#guardianName').value.trim(), contact: $('#guardianContact').value.trim() };
      if (guardian.name.split(/\s+/).length < 2) return fail('Enter your parent or guardian’s full name.', $('#guardianName'));
      if (!/@|\d{7,}/.test(guardian.contact.replace(/[\s()-]/g, ''))) return fail('Enter a mobile number or email address so we can send them the link.', $('#guardianContact'));
    }
    if (party === 'guardian' && !$('#guardianConsent').checked) return fail('Tick the box to confirm you are the parent or legal guardian.', $('#guardianConsent'));
    if (normName($('#signerName').value) !== normName(expected)) return fail(`Type the name exactly as shown: ${expected}.`, $('#signerName'));

    let ag = existing;
    if (existing) {
      if (party === 'guardian') existing.guardianSigned = todayISO();
      else if (party === 'agent') existing.agentSigned = todayISO();
      else {
        existing.athleteSigned = todayISO();
        if (guardian) Object.assign(existing, { guardian: guardian.name, guardianContact: guardian.contact });
      }
    } else {
      if (openAgreementFor(a.id)) return fail(`${a.name} already has an agreement.`);
      ag = {
        id: `agr-${String(S.counters.agreement++).padStart(4, '0')}`,
        athleteId: a.id,
        agentId: g.id,
        authority: stepper.authority,
        commission: g.commission,
        athleteSigned: party === 'athlete' ? todayISO() : null,
        agentSigned: party === 'agent' ? todayISO() : null,
        guardianRequired: isMinor(a),
        guardian: guardian ? guardian.name : null,
        guardianContact: guardian ? guardian.contact : null,
        guardianSigned: null,
        status: 'pending',
        deals: [],
        documents: ['Representation agreement (e-signature, demo)']
      };
      S.agreements.unshift(ag);
    }
    if (guardian) S.guardians[a.id] = guardian;
    if (ag.agentSigned && ag.athleteSigned && (!ag.guardianRequired || ag.guardianSigned)) ag.status = 'active';
    refresh();
    showDone(ag);
  }

  /* ==========================================================================
     SHORTLISTS & COMPARE
     ========================================================================== */
  function watchlistCard(w, i, mine) {
    const names = w.athleteIds.map(athleteById).filter(Boolean);
    return `
      <article class="card watchlist" style="--i:${i}">
        <div class="watchlist-body">
          <h3 class="watchlist-title">${esc(w.title)}</h3>
          <p class="watchlist-meta">${mine ? (w.shared ? 'Shared' : 'Private') : esc(w.owner)} · updated ${formatDate(w.updated)}</p>
          ${w.description ? `<p class="watchlist-desc">${esc(w.description)}</p>` : ''}
          <ul class="watchlist-names">${names.map((a) => `<li><button type="button" class="btn-link" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button><span>${esc(a.position)}</span></li>`).join('')}</ul>
          ${w.note ? `<p class="watchlist-note">“${esc(w.note)}”</p>` : ''}
        </div>
        <div class="watchlist-foot card-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-action="load-list" data-id="${w.id}">Compare these</button>
          ${mine && w.custom ? `<button type="button" class="btn btn-quiet btn-sm" data-action="delete-list" data-id="${w.id}">Delete</button>` : ''}
        </div>
      </article>`;
  }

  function renderShortlists() {
    const me = myName();
    const mine = S.watchlists.filter((w) => w.owner === me);
    const shared = S.watchlists.filter((w) => w.owner !== me && w.shared);
    $('#myLists').innerHTML = mine.length
      ? mine.map((w, i) => watchlistCard(w, i, true)).join('')
      : '<div class="card empty"><h3>No shortlists yet</h3><p>Add athletes to the comparison from the prospect board, then save it here as a shortlist.</p><button type="button" class="btn btn-secondary btn-sm" data-action="go" data-route="board">Go to the board</button></div>';
    $('#sharedTitle').hidden = !shared.length;
    $('#sharedLists').innerHTML = shared.map((w, i) => watchlistCard(w, i, false)).join('');
  }

  // Adding an entry draws the ballpoint ring round its place. Everything re-renders, so focus goes
  // back to the same control (or, after a remove in the comparison, to the comparison itself).
  function toggleCompare(id, opener) {
    const i = S.compare.indexOf(id);
    if (i > -1) S.compare.splice(i, 1);
    else { S.compare.push(id); justMarked = id; }
    const box = opener && opener.closest('[id]');
    refresh();
    if (!box) return;
    const again = document.querySelector(`#${box.id} [data-action="toggle-compare"][data-id="${id}"]`);
    if (again) again.focus();
    else if (box.closest('#comparePanel')) $('#comparePanel').focus();
  }

  function openCompare() {
    go('shortlists', { focus: false });
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
    if (S.compare.length < 2) {
      showToast('Add at least two athletes to the comparison first.');
      return;
    }
    S.watchlists.unshift({
      id: `list-${S.counters.watchlist++}`,
      custom: true,
      shared: false,
      title: `Shortlist ${S.watchlists.filter((w) => w.custom && w.owner === myName()).length + 1}`,
      owner: myName(),
      updated: todayISO(),
      description: '',
      athleteIds: [...S.compare],
      note: ''
    });
    refresh();
    go('shortlists');
    showToast('Comparison saved as a private shortlist.', 'success');
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
          <p>Add athletes from the prospect board, or open a shortlist above.</p>
          <button type="button" class="btn btn-secondary btn-sm" data-action="go" data-route="board">Go to the board</button>
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
          ${row('Board rank', (a) => `${ranks(a).board.rank} of ${pool().length} ${movement(a)}`)}
          ${row('Position', (a) => esc(a.position))}
          ${row('Age', (a) => ageOf(a.dob))}
          ${row('Height', (a) => `<span class="${mark.height(a)}">${feetIn(a.size.height_in)}</span>`)}
          ${row('Weight', (a) => `${a.size.weight_lb} lb`)}
          ${row('Wingspan', (a) => `<span class="${mark.wing(a)}">${feetIn(a.size.wingspan_in)}</span>`)}
          ${row('Vertical jump', (a) => `<span class="${mark.vert(a)}">${a.vertical_in}″</span>`)}
          ${row('Key stat', (a) => `<strong>${esc(a.season[0].value)}</strong> ${esc(a.season[0].label)}`)}
          ${row('Checked', (a) => verificationBadge(a))}
          ${row('Status', (a) => statusMarkup(a))}
        </tbody>
      </table>`;
  }

  /* ==========================================================================
     TRIALS (per role)
     ========================================================================== */
  function oppSummary(o) {
    const days = daysUntil(o.deadline);
    const closed = days < 0;
    return `
      <div>
        <h2 class="opp-title">${esc(o.title)}</h2>
        <p class="opp-org">${esc(orgById(o.orgId).name)}</p>
        <p class="opp-type">${esc(o.sport)} · ${esc(o.type)}</p>
        <div class="opp-tags">${o.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      </div>
      <dl class="kv">
        <div><dt>Where</dt><dd>${esc(o.location)}</dd></div>
        <div><dt>When</dt><dd>${esc(o.date)}</dd></div>
        <div><dt>Apply by</dt><dd class="${closed ? 'deadline-past' : days <= 30 ? 'deadline-soon' : ''}">${formatDate(o.deadline)}${closed ? ' (closed)' : days <= 30 ? ` — ${plural(days, 'day')} left` : ''}</dd></div>
        <div><dt>Ages</dt><dd>${o.age[0]}–${o.age[1]}</dd></div>
        <div><dt>Standard</dt><dd>${esc(o.standard)}</dd></div>
        <div><dt>Stamp needed</dt><dd>${o.minVerification === 'none' ? 'None' : `${esc(levelLabel(o.minVerification))} or higher`}</dd></div>
        <div><dt>On offer</dt><dd>${esc(o.offer)}</dd></div>
      </dl>`;
  }

  const nameLinks = (list) => list.map((a) => `<button type="button" class="btn-link" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button>`).join(', ');

  function clubTrialCard(o, i) {
    const apps = S.applications.filter((ap) => ap.oppId === o.id && ap.status !== 'guardian');
    const notApplied = eligibleAthletes(o).filter((a) => !applicationFor(a.id, o.id));
    const via = { club: 'Invited by you', agent: 'Sent by their agent', athlete: '' };
    return `
      <article class="card opp" style="--i:${i}">
        ${oppSummary(o)}
        <div class="opp-side">
          <p class="opp-places"><strong class="num">${o.places}</strong> ${o.places === 1 ? 'place' : 'places'}<span>${o.applicants} applications in total</span></p>
        </div>
        <div class="opp-applicants">
          <h3>Applications through the exchange</h3>
          ${apps.length ? `<div class="table-wrap"><table class="data-table applicant-table">
            <thead><tr><th scope="col">Athlete</th><th scope="col">Position</th><th scope="col" class="col-num">Age</th><th scope="col">Checked</th><th scope="col">Date</th><th scope="col">Status</th><th scope="col"><span class="visually-hidden">Decision</span></th></tr></thead>
            <tbody>${apps.map((ap) => {
              const a = athleteById(ap.athleteId);
              return `
              <tr>
                <td><button type="button" class="board-name" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button>${ap.note ? `<span class="cell-sub">“${esc(ap.note)}”</span>` : ''}</td>
                <td>${esc(a.position)}</td>
                <td class="col-num">${ageOf(a.dob)}</td>
                <td>${verificationBadge(a)}</td>
                <td class="cell-nowrap">${formatDate(ap.date)}${via[ap.via] ? `<span class="cell-sub">${via[ap.via]}</span>` : ''}</td>
                <td>${appStatusMarkup(ap)}</td>
                <td><div class="cell-actions">${ap.status === 'submitted' ? `<button type="button" class="btn btn-accent btn-sm" data-action="app-status" data-id="${ap.id}" data-status="invited">Invite</button><button type="button" class="btn btn-quiet btn-sm" data-action="app-status" data-id="${ap.id}" data-status="declined">Decline</button>` : ''}</div></td>
              </tr>`;
            }).join('')}</tbody></table></div>` : '<p class="muted">No applications through the exchange yet.</p>'}
          <div class="opp-find">
            <p>${notApplied.length ? `Meet this listing but haven’t applied: ${nameLinks(notApplied)}. Invite them from their profile.` : 'No other athletes on the board meet this listing yet.'}</p>
            <button type="button" class="btn btn-quiet btn-sm" data-action="find-for-trial" data-sport="${esc(o.sport)}">Browse ${esc(o.sport.toLowerCase())} prospects</button>
          </div>
        </div>
      </article>`;
  }

  function renderTrials() {
    const title = $('#h-trials');
    const lede = $('#trialsLede');
    const list = $('#oppList');

    if (S.role === 'organization') {
      title.textContent = 'Your trials';
      lede.textContent = 'Review applications, invite athletes, and find more on the prospect board.';
      const mine = S.opportunities.filter((o) => o.orgId === ME.organization);
      list.innerHTML = mine.map(clubTrialCard).join('') || '<div class="card empty"><h2>No trials listed</h2><p>Your listings will show up here.</p></div>';
      return;
    }

    const people = applicantsFor().filter(Boolean);
    const copy = {
      athlete: ['Trials & scholarships', 'Listings you can apply to come first. Each is checked against your sport, age, stamp and the deadline.'],
      agent: ['Trials & scholarships', 'Apply for your clients. Each listing shows which of them qualify.'],
      scout: ['Trials & combines', 'Where to see prospects in person, and which athletes on the board qualify for each.'],
      visitor: ['Trials & scholarships', 'Trials, combines and scholarship places posted by clubs, leagues and colleges. Each one lists exactly who can apply.']
    }[S.role] || ['Trials & scholarships', 'Trials, combines and scholarship places posted by clubs, leagues and colleges.'];
    title.textContent = copy[0];
    lede.textContent = copy[1];

    const me = S.role === 'athlete' ? people[0] : null;
    const sorted = [...S.opportunities].sort((x, y) => {
      if (!me) return x.deadline.localeCompare(y.deadline);
      const blocked = (o) => (eligibility(me, o, { ignoreExisting: true }).length ? 1 : 0);
      return blocked(x) - blocked(y) || x.deadline.localeCompare(y.deadline);
    });

    const intro = S.role === 'visitor' ? visitorNote('Athletes apply here, and agents apply for their clients. Try the demo to see how.', [['athlete:ath-01', 'Try it as an athlete'], ['agent', 'Try it as an agent']]) : '';
    list.innerHTML = intro + sorted.map((o, i) => {
      let side = '';
      let foot = '';
      let verdict = '';
      if (me) {
        const ap = applicationFor(me.id, o.id);
        const reasons = eligibility(me, o, { ignoreExisting: true });
        if (ap) side = `${appStatusMarkup(ap)}<span class="cell-sub">${ap.via === 'club' ? 'Invited' : 'Sent'} ${formatDate(ap.date)}</span>`;
        else if (!reasons.length) side = `<button type="button" class="btn btn-accent" data-action="apply" data-id="${o.id}">Apply</button>`;
        // The verdict leads the card: it is the first thing an athlete needs to know.
        if (!ap) {
          const verifyBlocked = levelIndex(me.verification) < levelIndex(o.minVerification);
          verdict = `<div class="opp-verdict fit ${reasons.length ? 'fit-no' : 'fit-yes'}"><p>${reasons.length ? `<strong>Not open to you yet.</strong> ${esc(reasons.join(' '))}` : `<strong>You can apply.</strong> You meet every requirement${isMinor(me) ? '; your parent or guardian approves it first' : ''}.`}</p>${verifyBlocked ? '<button type="button" class="btn btn-quiet btn-sm" data-action="explain" data-topic="verification">How to get checked</button>' : ''}</div>`;
        }
      } else if (S.role === 'agent') {
        const ready = people.filter((c) => eligibility(c, o).length === 0);
        const sent = S.applications.filter((ap) => ap.oppId === o.id && people.some((c) => c.id === ap.athleteId));
        if (ready.length) side = `<button type="button" class="btn btn-accent" data-action="apply" data-id="${o.id}">Apply for a client</button>`;
        foot = `<p class="fit ${ready.length ? 'fit-yes' : 'fit-no'}">${ready.length ? `Clients who qualify: ${ready.map((c) => esc(c.name)).join(', ')}.` : people.length ? 'None of your clients qualify.' : 'You don’t represent anyone yet.'}</p>
          ${sent.length ? `<ul class="plain-list">${sent.map((ap) => `<li class="row-split"><span>${esc(athleteById(ap.athleteId).name)} · ${formatDate(ap.date)}</span>${appStatusMarkup(ap)}</li>`).join('')}</ul>` : ''}`;
      } else if (S.role === 'visitor') {
        foot = '';
      } else {
        const eligible = eligibleAthletes(o);
        foot = `<p class="fit ${eligible.length ? 'fit-yes' : 'fit-no'}">${eligible.length ? `On the board and eligible: ${nameLinks(eligible)}.` : 'No athletes on the board qualify yet.'}</p>`;
      }
      return `
        <article class="card opp" style="--i:${i}">
          ${verdict}
          ${oppSummary(o)}
          <div class="opp-side">
            <p class="opp-places"><strong class="num">${o.places}</strong> ${o.places === 1 ? 'place' : 'places'}<span>${o.applicants} applications so far</span></p>
            ${side}
          </div>
          ${foot ? `<div class="opp-applicants">${foot}</div>` : ''}
        </article>`;
    }).join('');
  }

  function openApply(oppId, opener) {
    const o = oppById(oppId);
    if (!o) return;
    const people = applicantsFor().filter(Boolean);
    if (!people.length) {
      showToast('You don’t represent any athletes yet. Sign an agreement first.');
      return;
    }
    $('#applyTitle').textContent = o.title;
    $('#applyOrg').textContent = `${orgById(o.orgId).name} · ${o.location} · ${o.date}`;
    const select = $('#applyAthlete');
    const ordered = [...people].sort((x, y) => eligibility(x, o).length - eligibility(y, o).length);
    select.innerHTML = ordered.map((a) => `<option value="${a.id}">${esc(a.name)}: ${esc(a.position)}</option>`).join('');
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
      $('#applyAgent').textContent = g && g.status === 'active' ? agentById(g.agentId).name : 'no agent, applying directly';
      const known = S.guardians[a.id] || {};
      $('#applyGuardianRow').hidden = !isMinor(a);
      $('#applyGuardianNote').textContent = `${a.name} is ${ageOf(a.dob)}. We’ll send a parent or guardian a link to approve this application; it goes to the club once they do.`;
      $('#applyGuardianName').value = known.name || '';
      $('#applyGuardianContact').value = known.contact || '';
      $('#applySubmit').textContent = isMinor(a) ? 'Send to guardian for approval' : 'Send application';
      $('#applySubmit').disabled = reasons.length > 0;
    };
    select.onchange = update;
    update();

    $('#applyForm').onsubmit = (e) => {
      e.preventDefault();
      const a = athleteById(select.value);
      if (eligibility(a, o).length) return;
      const fail = (msg, el) => { $('#applyError').textContent = msg; $('#applyError').hidden = false; el.focus(); };
      let guardian = null;
      if (isMinor(a)) {
        guardian = { name: $('#applyGuardianName').value.trim(), contact: $('#applyGuardianContact').value.trim() };
        if (guardian.name.split(/\s+/).length < 2) return fail('Enter the parent or guardian’s full name.', $('#applyGuardianName'));
        if (!/@|\d{7,}/.test(guardian.contact.replace(/[\s()-]/g, ''))) return fail('Enter a mobile number or email address so we can send them the link.', $('#applyGuardianContact'));
        S.guardians[a.id] = guardian;
      }
      S.applications.push({ id: `app-${String(S.counters.application++).padStart(4, '0')}`, oppId: o.id, athleteId: a.id, date: todayISO(), note: $('#applyNote').value.trim(), status: guardian ? 'guardian' : 'submitted', via: S.role, guardian: guardian && guardian.name, guardianContact: guardian && guardian.contact });
      if (!guardian) o.applicants += 1;
      closeModal();
      refresh();
      showToast(guardian ? `Sent to ${guardian.name} to approve. It goes to ${orgById(o.orgId).name} once they do.` : `Application for ${a.name} sent to ${orgById(o.orgId).name}.`, 'success');
    };
    openModal($('#applyModal'), opener);
  }

  // Demo stand-in for the page a guardian reaches from the link we send them.
  function openGuardianApprove(id, opener) {
    const ap = S.applications.find((x) => x.id === id);
    if (!ap || ap.status !== 'guardian') return;
    const a = athleteById(ap.athleteId);
    const o = oppById(ap.oppId);
    $('#guardianTitle').textContent = `Approve ${firstName(a)}’s application`;
    $('#guardianIntro').textContent = `${ap.guardian}, ${a.name} (${ageOf(a.dob)}) wants to apply to the ${o.title.toLowerCase()} run by ${orgById(o.orgId).name} in ${o.location}, ${o.date}. Once you approve, the application goes to the club. This is what you’d see from the link we sent to ${ap.guardianContact}.`;
    $('#guardianSignLabel').textContent = `Type your full name (${ap.guardian}) to approve`;
    $('#guardianSignName').value = '';
    $('#guardianError').hidden = true;
    $('#guardianForm').onsubmit = (e) => {
      e.preventDefault();
      if (normName($('#guardianSignName').value) !== normName(ap.guardian)) {
        $('#guardianError').textContent = `Type the name exactly as shown: ${ap.guardian}.`;
        $('#guardianError').hidden = false;
        $('#guardianSignName').focus();
        return;
      }
      ap.status = 'submitted';
      ap.guardianApproved = todayISO();
      o.applicants += 1;
      closeModal();
      refresh();
      showToast(`Approved. ${a.name}’s application is now with ${orgById(o.orgId).name}.`, 'success');
    };
    openModal($('#guardianModal'), opener);
  }

  function inviteToTrial(athleteId, oppId) {
    const a = athleteById(athleteId);
    const o = oppById(oppId);
    if (!a || !o || S.role !== 'organization' || applicationFor(a.id, o.id) || eligibility(a, o).length) return;
    S.applications.push({ id: `app-${String(S.counters.application++).padStart(4, '0')}`, oppId: o.id, athleteId: a.id, date: todayISO(), note: '', status: 'invited', via: 'club' });
    o.applicants += 1;
    refresh();
    showToast(`${a.name} invited to the ${o.title.toLowerCase()}. It now shows on their home page.`, 'success');
  }

  function setApplicationStatus(id, status) {
    const ap = S.applications.find((x) => x.id === id);
    if (!ap || S.role !== 'organization' || !APP_STATUS[status]) return;
    ap.status = status;
    refresh();
    showToast(`${athleteById(ap.athleteId).name}: ${APP_STATUS[status][1].toLowerCase()}.`, 'success');
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

    $('#ledgerLede').textContent = `Payments for ${S.role === 'admin' ? 'all accounts' : myName()}. Agents are paid commission only, never an upfront fee. In a live build, money is held by a licensed escrow partner, not by the exchange.`;

    $('#ledgerTotals').innerHTML = `
      <div class="card kpi kpi-held"><dt>Held in escrow</dt><dd>${money(sum(held))}<span>${plural(held.length, 'payment')} waiting for release</span></dd></div>
      <div class="card kpi kpi-settled"><dt>Settled</dt><dd>${money(sum(settled))}<span>${plural(settled.length, 'payment')}</span></dd></div>
      ${commission.length || S.role === 'agent' || S.role === 'admin' ? `<div class="card kpi"><dt>Agent commission</dt><dd>${money(sum(commission))}<span>${plural(commission.length, 'payment')}</span></dd></div>` : ''}`;

    const me = ledgerParty();
    const amount = (t) => {
      if (me && t.payee === me) return `<span class="amount-in">+${money(t.amount)}</span><span class="visually-hidden"> received</span>`;
      if (me && t.payer === me) return `<span class="amount-out">−${money(t.amount)}</span><span class="visually-hidden"> paid</span>`;
      return money(t.amount);
    };
    $('#ledgerBody').innerHTML = txs.length ? txs.map((t) => `
      <tr>
        <td>${formatDate(t.date)}<span class="cell-sub">${esc(t.id)}</span></td>
        <td><span class="cell-strong">${esc(t.type)}</span><span class="cell-sub">${esc(t.description)}</span></td>
        <td>${esc(t.payer)}</td>
        <td>${esc(t.payee)}</td>
        <td class="col-num cell-nowrap">${amount(t)}</td>
        <td>${t.status === 'settled' ? '<span class="status status-ok">Settled</span>' : `<span class="status status-wait">In escrow</span>${t.release ? `<span class="cell-sub">${esc(t.release)}</span>` : ''}`}</td>
      </tr>`).join('') : `<tr><td colspan="6"><div class="empty"><h2>No payments yet</h2><p>${S.role === 'athlete' ? 'Sponsor and contract payments will show here once you sign deals.' : 'Nothing to show for this account yet.'}</p></div></td></tr>`;
    $('[data-action="export-csv"]').hidden = !txs.length;
  }

  function exportCsv() {
    const txs = visibleTransactions();
    if (!txs.length) return;
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
     EXPLAINER (scout grade, verification levels)
     ========================================================================== */
  let explainOpener = null;

  function ladder() {
    return `<ol class="ladder">${[...SEED.verificationLevels].reverse().map((l) => `
      <li><span class="ladder-mark">${stampFor(l.id)}</span><span>${esc(l.means)}</span></li>`).join('')}</ol>`;
  }

  function explain(topic, opener) {
    const panel = $('#explain');
    const body = {
      grade: ['Scout grade', `
        <p>A score out of 100 that sets the order of the board: the higher the grade, the higher the athlete’s place. It weighs measurements, test results and recent performances.</p>
        <p>A grade is only as reliable as the figures behind it, so every grade sits next to the athlete’s stamp. Read a 96 with no stamp with care next to a 95 measured at a combine.</p>
        <p class="muted">In this demo, every grade is a fictional sample figure.</p>
        <h3 class="explain-sub">The stamps</h3>${ladder()}`],
      verification: ['How the stamps work', `
        <p>Every entry carries a stamp that says how much of it has been checked. Higher stamps qualify for more trials, and scouts trust them more. An entry nobody has checked carries a pencilled “unofficial” note instead.</p>
        ${ladder()}
        <p class="muted">Combine measurements are taken in person at partner combines. Each trial lists the stamp it needs.</p>`]
    }[topic];
    if (!body) return;
    $('#explainTitle').textContent = body[0];
    $('#explainBody').innerHTML = body[1];
    explainOpener = opener || document.activeElement;
    if (panel.showPopover) {
      if (!panel.matches(':popover-open')) panel.showPopover();
    } else panel.classList.add('is-open');
    $('.modal-close', panel).focus();
  }

  function closeExplain() {
    const panel = $('#explain');
    if (panel.hidePopover && panel.matches(':popover-open')) panel.hidePopover();
    panel.classList.remove('is-open');
    if (explainOpener && document.contains(explainOpener)) explainOpener.focus();
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
    // First match in priority order (not document order), so focus never lands on Close.
    const first = ['.confirm-actions .btn-quiet', '.step:not([hidden]) select:not([disabled])', '.step:not([hidden]) input:not([type="radio"]):not([type="checkbox"])', '.step:not([hidden]) .btn-accent', 'form select:not([disabled])', 'form input:not([type="hidden"])', 'form .btn-accent', '.modal-close']
      .map((sel) => modal.querySelector(sel)).find((el) => el && el.offsetParent !== null);
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
    current = { route: null, id: null };
    syncFilters();
    renderAll();
    go(homeRoute());
    showToast('Demo data reset.', 'success');
  }

  // Small public hook for the showcase page and debugging.
  window.AAX = { viewProfile, go };
})();

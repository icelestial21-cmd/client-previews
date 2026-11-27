/* Kings of the Cage app demo, by iCelestial. Vanilla JS, no build step.
   Routes: #scores, #teams, #team/MAL, #player/mal-10, #news, #news/<id>, #shop, #bag, #profile.
   Team and player pages borrow from the Apex Athlete Exchange profile (header, bio, stats, form line,
   career timeline, clips, news) and the CSQ Leagues & Tournaments demo (team hero, follow, roster).
   All teams, players, scores, stats, stories, products and prices are SAMPLE DATA (see data.js). */
(function () {
  'use strict';

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => 'US$' + n.toFixed(2);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const { TEAMS, PLAYERS, NEWS } = window.KOC_DATA;
  const T = Object.fromEntries(TEAMS.map((t) => [t.id, t]));
  const P = Object.fromEntries(PLAYERS.map((p) => [p.id, p]));
  const squad = (tid) => PLAYERS.filter((p) => p.team === tid);
  const pts = (t) => t.rec[0] * 3 + t.rec[1];
  const played = (t) => t.rec[0] + t.rec[1] + t.rec[2];
  const surname = (n) => n.split(' ').slice(1).join(' ');
  const firstName = (n) => n.split(' ')[0];
  const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');
  const portrait = (p, cls) => `<img class="${cls || 'portrait'}" src="img/players/${p.id}.svg" alt="${esc(p.name)}, illustrated portrait" loading="lazy" width="180" height="216">`;

  const icon = {
    ball: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 5h-5L8 10z"/></svg>',
    glove: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11V6a1.5 1.5 0 0 1 3 0v4m0-5a1.5 1.5 0 0 1 3 0v5m0-4a1.5 1.5 0 0 1 3 0v6c0 4-2 7-6 7s-6-3-6-6v-2a1.5 1.5 0 0 1 3 0"/></svg>',
    card: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="4" width="10" height="16" rx="1.5" fill="#e3b23c" stroke="#e3b23c"/></svg>',
    shot: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20 20 4M14 4h6v6"/></svg>',
    whistle: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="14" r="5"/><path d="M12 10h9v3h-5M9 9V5"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14l11-7z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v13M7 8l5-5 5 5M5 14v6h14v-6"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    crown: '<svg viewBox="0 0 24 24" aria-hidden="true" style="stroke:#e3b23c"><path d="M3 18h18l-1.5-10-4.5 4-3-7-3 7-4.5-4z"/><path d="M4 21h16"/></svg>'
  };
  // 3dicons crown (CC0), with an inline SVG fallback if the CDN is unreachable.
  window.KOC_CROWN = icon.crown.replace('viewBox', 'width="64" height="64" viewBox');
  const crown3d = (cls) => `<img class="${cls}" src="https://3dicons.sgp1.cdn.digitaloceanspaces.com/v1/dynamic/premium/crow-dynamic-premium.png" alt="" width="110" height="110" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'${cls}',innerHTML:window.KOC_CROWN}))">`;

  // ---------- products (sample) ----------
  const PRODUCTS = [
    { id: 'home-jersey', name: 'KOC Home Jersey', cat: 'jerseys', type: 'jersey', price: 45, c: '#e3b23c', trim: '#0a0a0a', tag: 'New', desc: 'The official home kit. Breathable mesh, crown crest on the chest and room for your name on the back.', sold: ['XXL'] },
    { id: 'away-jersey', name: 'KOC Away Jersey', cat: 'jerseys', type: 'jersey', price: 45, was: 55, c: '#0f0f0f', trim: '#e3b23c', desc: 'Black away kit with gold trim, the one the champions lifted the rings in.', sold: [] },
    { id: 'crown-tee', name: 'Crown Logo Tee', cat: 'tees', type: 'tee', price: 25, c: '#f5f1e8', trim: '#0a0a0a', desc: 'Heavyweight cotton tee with the Kings of the Cage crown.', sold: [] },
    { id: 'maloney-tee', name: 'Maloney Since 2020 Tee', cat: 'tees', type: 'tee', price: 28, c: '#1d1d1d', trim: '#e3b23c', tag: 'Limited', desc: 'A nod to where it started: the outdoor court in Maloney Gardens, summer 2020.', sold: ['S'] },
    { id: 'cage-hoodie', name: 'Cage Hoodie', cat: 'tees', type: 'hoodie', price: 60, c: '#2a2a2a', trim: '#e3b23c', desc: 'Brushed fleece hoodie with a tonal crown on the chest.', sold: [] },
    { id: 'snapback', name: 'Crown Snapback', cat: 'accessories', type: 'cap', price: 22, c: '#0f0f0f', trim: '#e3b23c', desc: 'Structured snapback with an embroidered gold crown. One size fits most.', sizes: ['One size'], sold: [] },
    { id: 'match-ball', name: 'Small-Goal Match Ball', cat: 'accessories', type: 'ball', price: 35, c: '#f5f1e8', trim: '#0a0a0a', desc: 'The size 4 ball used on court, built for fast 4v4 play.', sizes: ['Size 4'], sold: [] },
    { id: 'ja-band', name: 'Jamaica 2027 Wristband', cat: 'accessories', type: 'band', price: 8, c: '#1f8a5a', trim: '#e3b23c', tag: 'Jamaica', desc: 'Silicone wristband for the first Kings of the Cage Jamaica edition.', sizes: ['One size'], sold: [] }
  ];
  const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
  const FREE_SHIP = 75;
  function art(p, label) {
    const c = p.c, t = p.trim;
    const crest = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M3 18h18l-1.5-10-4.5 4-3-7-3 7-4.5-4z" fill="${t}" stroke="${t}" stroke-width="1"/>`;
    let body = '';
    if (p.type === 'jersey' || p.type === 'tee' || p.type === 'hoodie') {
      const long = p.type === 'hoodie';
      body = `<path d="M68 24 40 36 ${long ? '20 130 40 134 54 74' : '14 76 38 94 54 80'} 54 204h92V${long ? '74' : '80'}l${long ? '14 60 20-4-20-94' : '16 14 24-18-26-40'}-28-12Q100 50 68 24z" fill="${c}" stroke="${t}" stroke-width="3" stroke-linejoin="round"/>`
        + (long ? `<path d="M68 24q32 34 64 0" fill="none" stroke="${t}" stroke-width="3"/><path d="M74 26q26 44 52 0" fill="${c}" stroke="${t}" stroke-width="2"/>` : `<path d="M74 28q26 20 52 0" fill="none" stroke="${t}" stroke-width="4"/>`)
        + crest(p.type === 'jersey' ? 108 : 88, p.type === 'jersey' ? 76 : 92, p.type === 'jersey' ? 1.2 : 1.1)
        + (p.type === 'jersey' ? `<text x="78" y="160" font-family="Anton,Impact,sans-serif" font-size="54" fill="${t}">10</text>` : '');
    } else if (p.type === 'cap') {
      body = `<path d="M40 130a60 60 0 0 1 120 0z" fill="${c}" stroke="${t}" stroke-width="3"/><path d="M36 130h150q-10 22-70 16-60-4-80-16z" fill="${c}" stroke="${t}" stroke-width="3"/><circle cx="100" cy="70" r="5" fill="${t}"/>` + crest(86, 94, 1.15);
    } else if (p.type === 'ball') {
      body = `<circle cx="100" cy="112" r="72" fill="${c}" stroke="${t}" stroke-width="3"/><path d="m100 80 30 22-11 35H81l-11-35z" fill="${t}"/><path d="M100 80V42M130 102l34-12M119 137l20 30M81 137l-20 30M70 102l-34-12" stroke="${t}" stroke-width="3"/>`;
    } else {
      body = `<ellipse cx="100" cy="112" rx="70" ry="34" fill="none" stroke="${c}" stroke-width="22"/><text x="100" y="118" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="15" letter-spacing="2" fill="${t}">KOC JA 27</text>`;
    }
    return `<svg class="art" viewBox="0 0 200 220" role="img" aria-label="${esc(label || p.name)} placeholder art">${body}</svg>`;
  }

  // ---------- state ----------
  const state = {
    route: ['scores'], scoreSeg: 'live', teamsSeg: 'teams', q: '', pos: 'all', newsCat: 'all', cat: 'all', liveTab: 'feed', day: 'fri',
    bag: store.get('koc-bag-v1', []),
    wish: store.get('koc-wish-v1', []),
    follow: store.get('koc-follow-v1', { teams: [], players: [] }),
    user: store.get('koc-user-v1', { name: 'Demo Fan', handle: 'demofan', since: 'Nov 2026' }),
    alerts: store.get('koc-alerts-v1', { goals: true, kickoff: true, news: false, drops: true }),
    orders: store.get('koc-orders-v1', []),
    sheet: null, navCount: 0
  };
  const view = $('#view');

  // ---------- live match (sample simulation) ----------
  const HALF = 600;
  const match = {
    home: 'MAL', away: 'ARS', secs: 552, hs: 3, as: 2,
    stats: { shots: [9, 7], target: [5, 4], saves: [2, 2], poss: 54 },
    feed: [
      { t: 501, type: 'goal', p: 'mal-10', note: 'Low finish into the small goal' },
      { t: 430, type: 'save', p: 'ars-4', note: 'Point-blank stop' },
      { t: 352, type: 'goal', p: 'ars-9', note: 'Rebound off the boards' },
      { t: 260, type: 'goal', p: 'mal-9', note: 'Nutmeg, then a tap-in' },
      { t: 181, type: 'card', p: 'ars-7', note: 'Yellow for a late challenge' },
      { t: 95, type: 'goal', p: 'ars-10', note: 'Curled in from the corner' },
      { t: 40, type: 'goal', p: 'mal-7', note: 'Opening goal of the night' },
      { t: 0, type: 'whistle', note: 'Kick-off · Court 1' }
    ]
  };
  const others = [
    { h: 'KGN', a: 'TOB', hs: 2, as: 2, secs: 840, court: 'Court 2' },
    { h: 'BKN', a: 'LAV', hs: 4, as: 1, secs: 1200, court: 'Court 1' }
  ];
  const DAYS = [
    { id: 'fri', d: 'Fri', n: '13', label: 'Matchday 5' },
    { id: 'sat', d: 'Sat', n: '14', label: 'Matchday 6' },
    { id: 'sun', d: 'Sun', n: '15', label: 'Finals Night' }
  ];
  const FIXTURES = {
    fri: [['BKN', 'LAV', '4 – 1', 'Full time'], ['KGN', 'TOB', 'LIVE', 'Court 2'], ['MAL', 'ARS', 'LIVE', 'Court 1'], ['MAL', 'KGN', '7:30 PM', 'Court 1'], ['ARS', 'TOB', '8:15 PM', 'Court 2']],
    sat: [['LAV', 'KGN', '6:00 PM', 'Court 1'], ['TOB', 'MAL', '6:45 PM', 'Court 2'], ['ARS', 'BKN', '7:30 PM', 'Court 1'], ['LAV', 'MAL', '8:15 PM', 'Court 2']],
    sun: [['Semi-final 1', '1st v 4th', '6:30 PM', 'Court 1'], ['Semi-final 2', '2nd v 3rd', '7:30 PM', 'Court 1'], ['Final', 'Championship Rings on the line', '9:00 PM', 'Court 1']]
  };
  const RESULTS = { MAL: [['ARS', '3–2', 'W'], ['TOB', '4–1', 'W'], ['KGN', '2–2', 'D']], ARS: [['MAL', '2–3', 'L'], ['BKN', '5–2', 'W'], ['LAV', '4–0', 'W']], KGN: [['TOB', '2–2', 'D'], ['MAL', '2–2', 'D'], ['LAV', '3–1', 'W']], TOB: [['KGN', '2–2', 'D'], ['MAL', '1–4', 'L'], ['BKN', '3–2', 'W']], BKN: [['LAV', '4–1', 'W'], ['ARS', '2–5', 'L'], ['TOB', '2–3', 'L']], LAV: [['BKN', '1–4', 'L'], ['ARS', '0–4', 'L'], ['KGN', '1–3', 'L']] };
  const fmt = (s) => { const half = s >= HALF ? 2 : 1; const t = s - (half - 1) * HALF; return { half, txt: String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0') }; };
  const crestEl = (code, size) => { const t = T[code]; return t ? `<span class="${size || 'crest'}" style="background:${t.c};color:${t.ink}">${code}</span>` : ''; };
  const teamLink = (code, inner) => `<a href="#team/${code}" class="tlink">${inner || esc(T[code].name)}</a>`;
  const playerLink = (pid, inner) => `<a href="#player/${pid}" class="plink">${inner || esc(P[pid].name)}</a>`;
  const formPips = (f) => `<span class="pips" aria-label="Recent form: ${f.join(', ')}">${f.map((r) => `<i class="pip ${r}">${r}</i>`).join('')}</span>`;
  const standings = () => TEAMS.slice().sort((a, b) => pts(b) - pts(a) || (b.gf - b.ga) - (a.gf - a.ga));
  const isFollowing = (kind, id) => state.follow[kind].includes(id);
  const followBtn = (kind, id, label) => { const on = isFollowing(kind, id); return `<button type="button" class="btn-follow" data-follow="${kind}:${id}" data-label="${esc(label || 'Follow')}" aria-pressed="${on}">${icon.star}<span>${on ? 'Following' : esc(label || 'Follow')}</span></button>`; };
  function sparkline(vals, w, h) {
    const min = Math.min(...vals) - 0.3, max = Math.max(...vals) + 0.3;
    const xy = vals.map((v, i) => [(i / (vals.length - 1)) * w, 4 + (h - 8) - ((v - min) / (max - min)) * (h - 8)]);
    const d = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    return `<svg class="spark" viewBox="-6 0 ${w + 12} ${h}" aria-hidden="true"><path d="${d} L${w} ${h} L0 ${h}Z" fill="rgba(227,178,60,.14)"/><path d="${d}" fill="none" stroke="#e3b23c" stroke-width="2.5" stroke-linejoin="round"/>${xy.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="#0a0a0a" stroke="#e3b23c" stroke-width="2"/>`).join('')}</svg>`;
  }
  // MasterClass-style portrait poster tile with a dark caption fade.
  const posterTile = (p) => { const t = T[p.team]; return `<a class="poster-tile" href="#player/${p.id}" style="--tc:${t.c}"><span class="pt-num" aria-hidden="true">${p.num}</span>${portrait(p, 'pt-img')}<span class="pt-cap"><b>${esc(p.name)}</b><small>${esc(t.short)} · ${esc(p.pos)}</small></span></a>`; };
  const segHTML = (name, opts, cur) => `<div class="seg" role="tablist">${opts.map(([id, l]) => `<button role="tab" type="button" data-seg="${name}:${id}" aria-selected="${cur === id}">${l}</button>`).join('')}</div>`;

  // ---------- SCORES ----------
  function evRow(e, isNew) {
    const ic = { goal: icon.ball, save: icon.glove, card: icon.card, shot: icon.shot, whistle: icon.whistle }[e.type];
    const what = { goal: 'Goal', save: 'Save', card: 'Yellow card', shot: 'Shot off target', whistle: '' }[e.type];
    const m = Math.floor(e.t / 60) + 1 + "'";
    const p = e.p && P[e.p];
    const who = p ? `${playerLink(p.id)} · ${esc(T[p.team].short)}` : '';
    return `<div class="ev ev-${e.type}${isNew ? ' new' : ''}"><span class="m">${e.type === 'whistle' ? '' : m}</span><span class="ic">${ic}</span><p>${what ? `<b>${what}</b> · ` : ''}${who}<small>${esc(e.note)}</small></p></div>`;
  }
  function statsHTML() {
    const s = match.stats;
    const rows = [['Possession', s.poss, 100 - s.poss, '%'], ['Shots', s.shots[0], s.shots[1], ''], ['On target', s.target[0], s.target[1], ''], ['Saves', s.saves[0], s.saves[1], '']];
    return rows.map(([l, a, b, u]) => {
      const tot = Math.max(a + b, 1);
      return `<div><div class="stat-h"><span>${a}${u}</span><span>${l}</span><span>${b}${u}</span></div><div class="bar"><i><b style="width:${(a / tot) * 100}%;background:${T[match.home].c}"></b></i><i><b style="width:${(b / tot) * 100}%;background:${T[match.away].c}"></b></i></div></div>`;
    }).join('');
  }
  function renderScores() {
    const body = state.scoreSeg === 'live' ? liveHTML() : state.scoreSeg === 'fixtures' ? fixturesHTML() : tableHTML();
    view.innerHTML = `<div class="sec">${segHTML('score', [['live', 'Live'], ['fixtures', 'Fixtures'], ['table', 'Standings']], state.scoreSeg)}</div>${body}`;
  }
  function liveHTML() {
    const h = T[match.home], a = T[match.away], c = fmt(match.secs);
    const watch = PLAYERS.slice().sort((x, y) => y.rating - x.rating).slice(0, 6);
    return `
      <div class="sec" style="padding-top:16px"><span class="live-pill"><i></i>Live now · Court 1</span></div>
      <article class="banner" style="--home:${h.c};--away:${a.c}" aria-label="${esc(h.name)} versus ${esc(a.name)}">
        <div class="banner-split" aria-hidden="true"></div>
        <div class="banner-in">
          <div class="banner-meta"><span>Matchday 5</span><span>Maloney Indoor</span></div>
          <div class="score-row">
            <a class="team" href="#team/${h.id}">${crestEl(h.id)}<b>${esc(h.name)}</b></a>
            <div><div class="score" id="score" aria-live="polite">${match.hs} – ${match.as}</div><div class="clock" id="clock">${c.half === 1 ? '1st' : '2nd'} · ${c.txt}</div></div>
            <a class="team" href="#team/${a.id}">${crestEl(a.id)}<b>${esc(a.name)}</b></a>
          </div>
          <div class="progress" aria-hidden="true"><i id="prog" style="width:${(match.secs / (HALF * 2)) * 100}%"></i></div>
          <div class="progress-l" aria-hidden="true"><span>Kick-off</span><span>Half</span><span>Full time</span></div>
          <button class="watch" type="button" data-act="watch">${icon.play}Watch the live stream</button>
        </div>
      </article>
      <div class="sec">
        ${segHTML('live', [['feed', 'Play-by-play'], ['stats', 'Stats']], state.liveTab)}
        <div id="liveBody">${state.liveTab === 'feed' ? `<div class="feed" id="feed">${match.feed.map((e) => evRow(e)).join('')}</div>` : `<div class="stats" id="stats">${statsHTML()}</div>`}</div>
      </div>
      <div class="sec">
        <div class="sec-h"><h2 class="h2">Other courts</h2><button type="button" class="link" data-seg="score:fixtures">All fixtures</button></div>
        <div class="rail">${others.map((o, i) => `<div class="mini"><div class="r">${teamLink(o.h)}<b id="o${i}h">${o.hs}</b></div><div class="r">${teamLink(o.a)}<b id="o${i}a">${o.as}</b></div><small id="o${i}s" style="color:${o.secs >= HALF * 2 ? 'var(--muted)' : 'var(--live)'}">${o.secs >= HALF * 2 ? 'Full time' : 'Live · ' + fmt(o.secs).txt} · ${o.court}</small></div>`).join('')}</div>
      </div>
      <div class="sec">
        <div class="sec-h"><h2 class="h2">Players to watch</h2><a class="link" href="#teams" data-seg-go="teams:players">All players</a></div>
        <div class="rail">${watch.map(posterTile).join('')}</div>
      </div>
      <div class="sec">
        <a class="drop" href="#news/${NEWS[0].id}" style="margin:0">
          <div class="drop-t"><span class="eyebrow">${esc(NEWS[0].kicker)}</span><h2 style="font-size:28px">${esc(NEWS[0].head)}</h2><p>${esc(NEWS[0].dek)}</p></div>
          ${crown3d('i3d')}
        </a>
      </div>`;
  }
  function fixturesHTML() {
    const list = FIXTURES[state.day], finals = state.day === 'sun';
    return `
      <div class="sec"><div class="days">${DAYS.map((d) => `<button type="button" class="day" data-day="${d.id}" aria-pressed="${state.day === d.id}">${d.d}<b>${d.n}</b></button>`).join('')}</div>
        <p class="mut" style="font-size:14px;margin-top:10px">${DAYS.find((d) => d.id === state.day).label}</p></div>
      <div class="sec">${list.map(([h, a, mid, sub]) => finals
        ? `<div class="fx" style="grid-template-columns:1fr auto"><div><b class="fx-title">${esc(h)}</b><div class="mut" style="font-size:14px">${esc(a)}</div></div><div class="mid"><b>${esc(mid)}</b><small class="mut">${esc(sub)}</small></div></div>`
        : `<div class="fx"><a class="h" href="#team/${h}">${crestEl(h, 'dot')}<span>${esc(T[h].name)}</span></a><div class="mid"><b ${mid === 'LIVE' ? 'style="color:var(--live);font-size:18px"' : ''}>${esc(mid)}</b><small class="mut">${esc(sub)}</small></div><a class="a" href="#team/${a}">${crestEl(a, 'dot')}<span>${esc(T[a].name)}</span></a></div>`).join('')}
      </div>`;
  }
  function tableHTML() {
    return `
      <div class="sec">
        <div class="table"><table>
          <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead>
          <tbody>${standings().map((t, i) => { const gd = t.gf - t.ga; return `<tr class="${i < 4 ? 'q' : ''}"><td>${i + 1}</td><td><a href="#team/${t.id}" class="trow">${crestEl(t.id, 'dot')}<span>${esc(t.short)}</span></a></td><td>${played(t)}</td><td>${t.rec[0]}</td><td>${t.rec[1]}</td><td>${t.rec[2]}</td><td>${gd > 0 ? '+' + gd : gd}</td><td class="pts">${pts(t)}</td></tr>`; }).join('')}</tbody>
        </table></div>
        <p class="legend"><i></i>Top four go through to Finals Night</p>
      </div>
      <div class="sec">
        <div class="sec-h"><h2 class="h2">Top scorers</h2></div>
        <ol class="leaders">${PLAYERS.slice().sort((a, b) => b.goals - a.goals).slice(0, 5).map((p, i) => `<li><a href="#player/${p.id}"><span class="rank">${i + 1}</span>${portrait(p, 'av')}<span class="ln"><b>${esc(p.name)}</b><small>${esc(T[p.team].name)}</small></span><span class="val">${p.goals}</span></a></li>`).join('')}</ol>
      </div>`;
  }

  // ---------- TEAMS & PLAYERS ----------
  function renderTeams() {
    view.innerHTML = `<div class="sec">${segHTML('teams', [['teams', 'Teams'], ['players', 'Players']], state.teamsSeg)}</div>` + (state.teamsSeg === 'teams' ? teamsListHTML() : playersListHTML());
  }
  function teamsListHTML() {
    return `<div class="sec cards">${standings().map((t, i) => `
      <article class="tcard" style="--tc:${t.c}">
        <a class="tcard-hit" href="#team/${t.id}" aria-label="Open ${esc(t.name)}"></a>
        <div class="tcard-top">${crestEl(t.id)}<div class="tcard-id"><b>${esc(t.name)}</b><small>${esc(t.area)}</small></div>${followBtn('teams', t.id)}</div>
        <div class="tcard-faces" aria-hidden="true">${squad(t.id).slice(0, 5).map((p) => portrait(p, 'face')).join('')}</div>
        <div class="tcard-bot"><span><b>${ordinal(i + 1)}</b> · ${pts(t)} pts</span>${formPips(t.form)}</div>
      </article>`).join('')}</div>`;
  }
  const filterPlayers = () => {
    const q = state.q.trim().toLowerCase();
    return PLAYERS.filter((p) => (state.pos === 'all' || p.pos === state.pos) && (!q || p.name.toLowerCase().includes(q) || T[p.team].name.toLowerCase().includes(q))).sort((a, b) => b.rating - a.rating);
  };
  function playersListHTML() {
    const poss = [['all', 'All'], ['Forward', 'Forwards'], ['Midfield', 'Midfield'], ['Defender', 'Defenders'], ['Utility', 'Utility']];
    return `
      <div class="sec"><label class="search">${icon.search}<span class="sr">Search players or teams</span><input id="q" type="search" placeholder="Search players or teams" value="${esc(state.q)}" autocomplete="off"></label></div>
      <div class="chips" role="group" aria-label="Filter by position">${poss.map(([id, l]) => `<button type="button" class="chip" data-pos="${id}" aria-pressed="${state.pos === id}">${l}</button>`).join('')}</div>
      <div class="sec" id="plist">${playersRows(filterPlayers())}</div>`;
  }
  function playersRows(list) {
    if (!list.length) return '<p class="mut" style="padding:24px 0;text-align:center">No players match that search.</p>';
    return `<ul class="prow-list">${list.map((p) => `<li><a class="prow" href="#player/${p.id}">${portrait(p, 'av')}<span class="ln"><b>${esc(p.name)}${p.captain ? ' <i class="cap" title="Captain">C</i>' : ''}</b><small>#${p.num} · ${esc(p.pos)} · ${esc(T[p.team].name)}</small></span><span class="val"><b>${p.goals}</b><small>goals</small></span></a></li>`).join('')}</ul>`;
  }
  function renderTeam(id) {
    const t = T[id]; if (!t) return renderTeams();
    const sq = squad(id), gd = t.gf - t.ga, pos = standings().findIndex((x) => x.id === id) + 1;
    const top = sq.slice().sort((a, b) => b.goals - a.goals)[0], ast = sq.slice().sort((a, b) => b.assists - a.assists)[0];
    const next = Object.values(FIXTURES).flat().find((f) => (f[0] === id || f[1] === id) && /PM/.test(f[2]));
    const teamNews = NEWS.filter((n) => n.team === id || (n.player && P[n.player].team === id));
    view.innerHTML = `
      <header class="hero-team" style="--tc:${t.c}">
        <div class="hero-faces" aria-hidden="true">${sq.slice(0, 3).map((p) => portrait(p, 'hf')).join('')}</div>
        <div class="hero-in">
          <span class="eyebrow">Kings of the Cage · Team</span>
          <h1 class="poster-h">${esc(t.name)}</h1>
          <p class="mut">${esc(t.area)} · In the cage since ${t.since}</p>
          <div class="hero-actions">${followBtn('teams', id, 'Follow team')}<button type="button" class="btn ghost sm" data-act="share">${icon.share}Share</button></div>
        </div>
      </header>
      <div class="sec"><div class="statcard"><div><b>${ordinal(pos)}</b><small>Position</small></div><div><b>${pts(t)}</b><small>Points</small></div><div><b>${gd > 0 ? '+' + gd : gd}</b><small>Goal diff</small></div></div>
        <div class="form-row"><span class="mut">Form</span>${formPips(t.form)}<span class="mut">${t.rec[0]}W ${t.rec[1]}D ${t.rec[2]}L</span></div></div>
      ${next ? `<div class="sec"><div class="sec-h"><h2 class="h2">Next match</h2></div>
        <div class="fx"><a class="h" href="#team/${next[0]}">${crestEl(next[0], 'dot')}<span>${esc(T[next[0]].name)}</span></a><div class="mid"><b>${esc(next[2])}</b><small class="mut">${esc(next[3])}</small></div><a class="a" href="#team/${next[1]}">${crestEl(next[1], 'dot')}<span>${esc(T[next[1]].name)}</span></a></div></div>` : ''}
      <div class="sec"><div class="sec-h"><h2 class="h2">Squad</h2><span class="mut" style="font-size:14px">${sq.length} players</span></div>
        <div class="rail">${sq.map(posterTile).join('')}</div></div>
      <div class="sec"><div class="sec-h"><h2 class="h2">Season leaders</h2></div>
        <div class="leaders2">
          <a href="#player/${top.id}">${portrait(top, 'av')}<span><small>Top scorer</small><b>${esc(top.name)}</b></span><em>${top.goals}</em></a>
          <a href="#player/${ast.id}">${portrait(ast, 'av')}<span><small>Most assists</small><b>${esc(ast.name)}</b></span><em>${ast.assists}</em></a>
        </div></div>
      <div class="sec"><div class="sec-h"><h2 class="h2">Recent results</h2></div>
        <ul class="results">${RESULTS[id].map(([opp, sc, r]) => `<li><i class="pip ${r}">${r}</i><span>v ${teamLink(opp)}</span><b>${sc}</b></li>`).join('')}</ul></div>
      <div class="sec"><div class="sec-h"><h2 class="h2">About</h2></div>
        <div class="panel"><p>${esc(t.blurb)}</p>${t.titles.length ? `<p class="honours">${icon.crown}<span>${t.titles.map(esc).join(' · ')}</span></p>` : ''}</div></div>
      ${teamNews.length ? `<div class="sec"><div class="sec-h"><h2 class="h2">In the news</h2></div>${teamNews.map(newsRow).join('')}</div>` : ''}`;
  }
  function renderPlayer(id) {
    const p = P[id]; if (!p) return renderTeams();
    const t = T[p.team];
    const mates = squad(p.team).filter((x) => x.id !== id);
    const years = []; for (let y = p.since; y <= 2026; y++) years.push(y);
    const pNews = NEWS.filter((n) => n.player === id).concat(NEWS.filter((n) => n.team === p.team && n.player !== id)).slice(0, 2);
    const teamRank = squad(p.team).slice().sort((a, b) => b.goals - a.goals).findIndex((x) => x.id === id) + 1;
    view.innerHTML = `
      <header class="hero-player" style="--tc:${t.c}">
        <span class="hp-num" aria-hidden="true">${p.num}</span>
        ${portrait(p, 'hp-img')}
        <div class="hp-in">
          <span class="eyebrow">${esc(p.pos)} · No. ${p.num}${p.captain ? ' · Captain' : ''}</span>
          <h1 class="hp-name"><small>${esc(firstName(p.name))}</small>${esc(surname(p.name))}</h1>
          <p>${teamLink(p.team, `${crestEl(p.team, 'dot')}<span>${esc(t.name)}</span>`)}</p>
          <div class="hero-actions">${followBtn('players', id, 'Follow player')}<button type="button" class="btn ghost sm" data-act="share">${icon.share}Share</button></div>
        </div>
      </header>
      <div class="sec"><div class="statcard"><div><b>${p.goals}</b><small>Goals</small></div><div><b>${p.assists}</b><small>Assists</small></div><div><b>${p.apps}</b><small>Apps</small></div></div></div>
      <nav class="jump" aria-label="Player sections">${[['pp-bio', 'Bio'], ['pp-season', 'Season'], ['pp-form', 'Form'], ['pp-career', 'Career'], ['pp-clips', 'Clips'], ['pp-mates', 'Teammates']].map(([a, l]) => `<button type="button" data-jump="${a}">${l}</button>`).join('')}</nav>
      <section class="sec" id="pp-bio"><h2 class="h2">Bio</h2>
        <dl class="bio"><div><dt>Age</dt><dd>${p.age}</dd></div><div><dt>From</dt><dd>${esc(p.from)}</dd></div><div><dt>Strong foot</dt><dd>${esc(p.foot)}</dd></div><div><dt>KOC debut</dt><dd>${p.since}</dd></div><div><dt>Position</dt><dd>${esc(p.pos)}</dd></div><div><dt>Team</dt><dd>${teamLink(p.team, esc(t.short))}</dd></div></dl></section>
      <section class="sec" id="pp-season"><h2 class="h2">This season</h2>
        <dl class="metrics"><div><dt>Average rating</dt><dd>${p.rating.toFixed(1)}</dd></div><div><dt>MVP awards</dt><dd>${p.mvp}</dd></div><div><dt>${p.pos === 'Defender' ? 'Clean sheets' : 'Goals per game'}</dt><dd>${p.pos === 'Defender' ? p.clean : (p.goals / p.apps).toFixed(1)}</dd></div><div><dt>Team scoring rank</dt><dd>${ordinal(teamRank)}</dd></div></dl></section>
      <section class="sec" id="pp-form"><h2 class="h2">Form</h2>
        <div class="panel"><div class="spark-wrap">${sparkline(p.form, 320, 96)}</div><div class="spark-axis" aria-hidden="true">${p.form.map((v, i) => `<span>MD${i + 1}<b>${v.toFixed(1)}</b></span>`).join('')}</div>
        <p class="sr">Match ratings: ${p.form.join(', ')}.</p><p class="mut" style="font-size:14px;margin-top:10px">Match rating out of 10 over the last six matchdays.</p></div></section>
      <section class="sec" id="pp-career"><h2 class="h2">Career</h2>
        <ol class="timeline">${years.slice().reverse().map((y) => `<li><b>${y === 2026 ? 'KOC 2026 · current season' : 'KOC ' + y}</b><span>${esc(t.name)}${y === p.since ? ' · debut season' : ''}</span></li>`).join('')}</ol></section>
      <section class="sec" id="pp-clips"><h2 class="h2">Clips</h2>
        <div class="clip-stage" style="--tc:${t.c}"><span class="soon">Playback coming soon</span><span class="cs-play">${icon.play}</span><p>${esc(firstName(p.name))}’s best of the season</p></div>
        <ul class="clips">${['Goals of the season', 'Skills reel', 'Finals Night walkout'].map((c, i) => `<li><button type="button" data-act="clip">${icon.play}<span>${c}</span><small>${['1:12', '0:48', '0:35'][i]}</small></button></li>`).join('')}</ul></section>
      ${pNews.length ? `<section class="sec"><h2 class="h2">In the news</h2>${pNews.map(newsRow).join('')}</section>` : ''}
      <section class="sec" id="pp-mates"><div class="sec-h"><h2 class="h2">Teammates</h2>${teamLink(p.team, 'Team page')}</div><div class="rail">${mates.map(posterTile).join('')}</div></section>`;
  }

  // ---------- NEWS ----------
  function newsArt(n, cls) {
    const p = n.player && P[n.player];
    return `<div class="${cls}" style="--nt:${n.tint}">${p ? portrait(p, 'na-img') : n.team ? squad(n.team).slice(1, 3).map((x) => portrait(x, 'na-img')).join('') : crown3d('na-crown')}</div>`;
  }
  const newsRow = (n) => `<a class="nrow" href="#news/${n.id}"><span class="ln"><small class="kick">${esc(n.kicker)}</small><b>${esc(n.head)}</b><small>${esc(n.date)} · ${n.mins} min read</small></span>${newsArt(n, 'nthumb')}</a>`;
  function renderNews() {
    const cats = [['all', 'All'], ['match', 'Match reports'], ['jamaica', 'Jamaica 2027'], ['inside', 'Inside KOC']];
    const inCat = (n) => state.newsCat === 'all' || (state.newsCat === 'match' && /Match|Team/.test(n.kicker)) || (state.newsCat === 'jamaica' && /Jamaica/.test(n.kicker + n.head)) || (state.newsCat === 'inside' && /Inside|Partners|Community/.test(n.kicker));
    const list = NEWS.filter(inCat);
    const [lead, ...rest] = list;
    view.innerHTML = `
      <div class="chips" role="group" aria-label="News categories">${cats.map(([id, l]) => `<button type="button" class="chip" data-ncat="${id}" aria-pressed="${state.newsCat === id}">${l}</button>`).join('')}</div>
      ${lead ? `<div class="sec"><a class="nlead" href="#news/${lead.id}">${newsArt(lead, 'nl-art')}<span class="kick">${esc(lead.kicker)}</span><h2>${esc(lead.head)}</h2><p>${esc(lead.dek)}</p><small class="mut">${esc(lead.date)} · ${lead.mins} min read</small></a></div>` : ''}
      <div class="sec">${rest.map(newsRow).join('') || '<p class="mut">More stories soon.</p>'}</div>`;
  }
  function renderArticle(id) {
    const n = NEWS.find((x) => x.id === id); if (!n) return renderNews();
    const more = NEWS.filter((x) => x.id !== id).slice(0, 3);
    view.innerHTML = `
      <article class="article">
        ${newsArt(n, 'nl-art big')}
        <div class="sec"><span class="kick">${esc(n.kicker)}</span><h1 class="art-h">${esc(n.head)}</h1><p class="dek">${esc(n.dek)}</p>
          <div class="art-meta"><span>KOC Media · ${esc(n.date)} · ${n.mins} min read</span><button type="button" class="icon-btn" data-act="share" aria-label="Share story">${icon.share}</button></div>
          <div class="art-body">${n.body.map((b) => `<p>${esc(b)}</p>`).join('')}</div>
          ${(n.team || n.player) ? `<div class="related">${n.team ? `<a href="#team/${n.team}">${crestEl(n.team, 'dot')}${esc(T[n.team].name)}</a>` : ''}${n.player ? `<a href="#player/${n.player}">${portrait(P[n.player], 'av sm')}${esc(P[n.player].name)}</a>` : ''}</div>` : ''}
        </div>
      </article>
      <div class="sec"><div class="sec-h"><h2 class="h2">More stories</h2></div>${more.map(newsRow).join('')}</div>`;
  }

  // ---------- SHOP & BAG ----------
  const priceHTML = (p) => p.was ? `<span class="price"><span class="now">${money(p.price)}</span><s>${money(p.was)}</s></span>` : `<span class="price">${money(p.price)}</span>`;
  function renderShop() {
    const cats = [['all', 'All'], ['jerseys', 'Jerseys'], ['tees', 'Tees & hoodies'], ['accessories', 'Accessories']];
    const items = PRODUCTS.filter((p) => state.cat === 'all' || p.cat === state.cat);
    view.innerHTML = `
      <section class="drop" aria-label="New drop">
        <div class="drop-t"><span class="eyebrow">New drop</span><h2>Jamaica 2027 collection</h2><p>Official KOC gear, shipped across the Caribbean.</p></div>
        ${crown3d('i3d')}
      </section>
      <div class="chips" role="group" aria-label="Filter products">${cats.map(([id, l]) => `<button type="button" class="chip" data-cat="${id}" aria-pressed="${state.cat === id}">${l}</button>`).join('')}</div>
      <div class="grid">${items.map((p) => {
        const off = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
        const wished = state.wish.includes(p.id);
        return `<article class="card">
          <div class="card-img">${art(p)}<span class="ph-label">Placeholder art</span>${p.was ? `<span class="tag sale">${off}% off</span>` : p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ''}
            <button type="button" class="wish" data-wish="${p.id}" aria-pressed="${wished}" aria-label="${wished ? 'Remove from' : 'Save to'} wishlist: ${esc(p.name)}">${icon.heart}</button>
          </div>
          <button type="button" class="card-hit" data-open="${p.id}" aria-label="View ${esc(p.name)}"></button>
          <div class="card-name">${esc(p.name)}</div>
          ${priceHTML(p)}
        </article>`;
      }).join('')}</div>`;
  }
  const bagCount = () => state.bag.reduce((n, l) => n + l.qty, 0);
  const subtotal = () => state.bag.reduce((n, l) => n + PRODUCTS.find((p) => p.id === l.id).price * l.qty, 0);
  function saveBag() { store.set('koc-bag-v1', state.bag); const b = $('#bagCount'); const n = bagCount(); b.hidden = !n; b.textContent = n; }
  function renderBag() {
    if (!state.bag.length) {
      view.innerHTML = `<div class="empty">${crown3d('i3d')}<h2>Your bag is empty</h2><p class="mut">Grab a jersey before Finals Night.</p><a class="btn" href="#shop">Shop the collection</a></div>`;
      return;
    }
    const sub = subtotal(), left = Math.max(FREE_SHIP - sub, 0), ship = left ? 9 : 0;
    view.innerHTML = `
      <div class="sec"><div class="sec-h"><h2 class="h2">Your bag</h2><span class="mut" style="font-size:14px">${bagCount()} item${bagCount() > 1 ? 's' : ''}</span></div>
        <div class="ship"><span>${left ? `Add <b>${money(left)}</b> more for free Caribbean shipping` : '<b>You’ve unlocked free Caribbean shipping</b>'}</span><div class="ship-bar"><i style="width:${Math.min(sub / FREE_SHIP, 1) * 100}%"></i></div></div>
        ${state.bag.map((l, i) => { const p = PRODUCTS.find((x) => x.id === l.id); return `
          <div class="line"><div class="card-img">${art(p)}</div>
            <div><b>${esc(p.name)}</b><small>${esc(l.size)}</small>
              <div style="display:flex;align-items:center;gap:12px"><div class="qty"><button type="button" data-q="${i}" data-d="-1" aria-label="Decrease quantity">−</button><span>${l.qty}</span><button type="button" data-q="${i}" data-d="1" aria-label="Increase quantity">+</button></div><button type="button" class="rm" data-rm="${i}">Remove</button></div>
            </div><span class="amt">${money(p.price * l.qty)}</span></div>`; }).join('')}
        <div class="totals"><div><span>Subtotal</span><span>${money(sub)}</span></div><div><span>Shipping</span><span>${ship ? money(ship) : 'Free'}</span></div><div class="grand"><span>Total</span><span>${money(sub + ship)}</span></div></div>
        <div class="bag-cta"><button type="button" class="btn lumen" data-act="checkout">Checkout · ${money(sub + ship)}</button><a class="btn ghost" href="#shop">Keep shopping</a></div>
      </div>`;
  }

  // ---------- PROFILE (On account card + Turf stats card) ----------
  function renderProfile() {
    const u = state.user, ft = state.follow.teams.map((id) => T[id]).filter(Boolean), fp = state.follow.players.map((id) => P[id]).filter(Boolean);
    const wished = state.wish.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
    const initials = u.name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'KF';
    const toggles = [['goals', 'Goal alerts', 'For teams and players you follow'], ['kickoff', 'Kick-off reminders', '15 minutes before your teams play'], ['news', 'KOC news', 'Big stories and Jamaica 2027 updates'], ['drops', 'Merch drops', 'New collections and restocks']];
    view.innerHTML = `
      <div class="sec">
        <div class="pcard">
          <span class="pav" aria-hidden="true">${esc(initials)}</span>
          <div class="pid"><b>${esc(u.name)}</b><small>@${esc(u.handle)} · Fan since ${esc(u.since)}</small></div>
          <button type="button" class="btn ghost sm" data-act="edit-profile">Edit</button>
        </div>
        <div class="statcard" style="margin-top:10px"><div><b>${ft.length}</b><small>Teams</small></div><div><b>${fp.length}</b><small>Players</small></div><div><b>${wished.length}</b><small>Wishlist</small></div></div>
      </div>
      <div class="sec"><div class="sec-h"><h2 class="h2">Your teams</h2><a class="link" href="#teams" data-seg-go="teams:teams">Find teams</a></div>
        ${ft.length ? `<div class="rail">${ft.map((t) => `<a class="fteam" href="#team/${t.id}" style="--tc:${t.c}">${crestEl(t.id)}<b>${esc(t.short)}</b>${formPips(t.form.slice(-3))}</a>`).join('')}</div>` : `<div class="panel empty-s"><p>Follow a team to get its goals, kick-off times and news here.</p><a class="btn sm" href="#teams" data-seg-go="teams:teams">Browse teams</a></div>`}</div>
      <div class="sec"><div class="sec-h"><h2 class="h2">Your players</h2><a class="link" href="#teams" data-seg-go="teams:players">Find players</a></div>
        ${fp.length ? `<div class="rail">${fp.map(posterTile).join('')}</div>` : `<div class="panel empty-s"><p>Follow players from their page to track their goals and form.</p></div>`}</div>
      <div class="sec"><div class="sec-h"><h2 class="h2">Orders</h2></div>
        ${state.orders.length ? `<ul class="menu">${state.orders.map((o) => `<li><div class="mrow"><span><b>Order ${esc(o.ref)}</b><small>${o.items} item${o.items > 1 ? 's' : ''} · ${money(o.total)} · ${esc(o.date)}</small></span><span class="status">Demo order</span></div></li>`).join('')}</ul>` : `<div class="panel empty-s"><p>No orders yet. Your KOC gear will show up here.</p><a class="btn sm" href="#shop">Visit the shop</a></div>`}</div>
      ${wished.length ? `<div class="sec"><div class="sec-h"><h2 class="h2">Wishlist</h2><a class="link" href="#shop">Shop</a></div><div class="rail">${wished.map((p) => `<button type="button" class="wthumb" data-open="${p.id}"><span class="card-img">${art(p)}</span><small>${esc(p.name)}</small></button>`).join('')}</div></div>` : ''}
      <div class="sec"><div class="sec-h"><h2 class="h2">Notifications</h2></div>
        <ul class="menu">${toggles.map(([k, l, d]) => `<li><label class="mrow"><span><b>${l}</b><small>${d}</small></span><span class="switch"><input type="checkbox" role="switch" data-alert="${k}" ${state.alerts[k] ? 'checked' : ''}><i aria-hidden="true"></i></span></label></li>`).join('')}</ul></div>
      <div class="sec"><div class="sec-h"><h2 class="h2">Account</h2></div>
        <ul class="menu">
          <li><button type="button" class="mrow" data-act="ticket"><span><b>Ticket wallet</b><small>Finals Night and Jamaica 2027 passes</small></span>${icon.chev}</button></li>
          <li><a class="mrow" href="../jamaica.html"><span><b>Register a team</b><small>Kings of the Cage Jamaica 2027</small></span>${icon.chev}</a></li>
          <li><a class="mrow" href="../"><span><b>Visit the website</b><small>Story, community and sponsors</small></span>${icon.chev}</a></li>
          <li><button type="button" class="mrow" data-act="signout"><span><b>Sign out</b><small>This demo keeps everything on this device</small></span>${icon.chev}</button></li>
        </ul></div>`;
  }
  function editProfileSheet() {
    openSheet(`<div class="sheet-body"><h2 id="sheetTitle" class="sheet-h">Edit profile</h2>
      <label class="field"><span>Display name</span><input id="fName" value="${esc(state.user.name)}" maxlength="30" autocomplete="name"></label>
      <label class="field"><span>Username</span><input id="fHandle" value="${esc(state.user.handle)}" maxlength="20" autocomplete="username"></label>
      <button type="button" class="btn" data-act="save-profile" style="width:100%">Save</button></div>`);
  }

  // ---------- sheet ----------
  const sheet = $('#sheet'), scrim = $('#scrim');
  let lastFocus = null;
  function openSheet(html) {
    lastFocus = document.activeElement;
    sheet.innerHTML = `<div class="sheet-grip" aria-hidden="true"></div><button type="button" class="sheet-x" data-act="close" aria-label="Close">${icon.x}</button>${html}`;
    sheet.hidden = false; scrim.hidden = false; document.body.classList.add('sheet-open');
    const f = sheet.querySelector('h2, button'); if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
  }
  function closeSheet() { document.body.classList.remove('sheet-open'); sheet.hidden = true; scrim.hidden = true; sheet.innerHTML = ''; state.sheet = null; if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus({ preventScroll: true }); }
  function productSheet(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    const sizes = p.sizes || SIZES;
    state.sheet = { id, size: sizes.length === 1 ? sizes[0] : null, qty: 1 };
    openSheet(`
      <div class="sheet-body">
        <div class="gallery" aria-label="Product images">${['Front', 'Back', 'Detail'].map((v) => `<div class="card-img">${art(p, p.name + ', ' + v.toLowerCase())}<span class="ph-label">${v} · placeholder art</span></div>`).join('')}</div>
        <div class="p-head"><h2 id="sheetTitle">${esc(p.name)}</h2>${priceHTML(p)}</div>
        <p class="p-desc">${esc(p.desc)}</p>
        <div>
          <div class="lbl"><span>${sizes.length > 1 ? 'Select size' : 'Size'}</span>${sizes.length > 1 ? '<button type="button" data-act="guide">Size guide</button>' : ''}</div>
          <div class="sizes" id="sizes" role="radiogroup" aria-label="Size" style="margin-top:10px;${sizes.length === 1 ? 'grid-template-columns:1fr' : ''}">${sizes.map((s) => `<button type="button" class="size" role="radio" data-size="${esc(s)}" aria-checked="${state.sheet.size === s}" ${p.sold.includes(s) ? 'disabled aria-label="' + esc(s) + ', sold out"' : ''}>${esc(s)}</button>`).join('')}</div>
          <p class="stock" style="margin-top:8px">${p.sold.length ? 'Selling fast · some sizes sold out' : 'In stock · ships in 2 to 4 days'}</p>
        </div>
      </div>
      <div class="sheet-foot">
        <div class="qty"><button type="button" data-sq="-1" aria-label="Decrease quantity">−</button><span id="sq">1</span><button type="button" data-sq="1" aria-label="Increase quantity">+</button></div>
        <button type="button" class="btn btn-cart" data-act="add"><span class="bagi">${icon.bag}</span><span class="t">Add to bag</span></button>
      </div>`);
  }
  function guideSheet() {
    const back = state.sheet && state.sheet.id;
    openSheet(`<div class="sheet-body"><h2 id="sheetTitle" class="sheet-h">Size guide</h2>
      <p class="p-desc">Chest measurement in inches. Between sizes? Size up for a relaxed fit.</p>
      <table class="sizeguide"><thead><tr><th>Size</th><th>Chest</th><th>Length</th></tr></thead><tbody>
      ${[['S', '36–38', '28'], ['M', '39–41', '29'], ['L', '42–44', '30'], ['XL', '45–47', '31'], ['XXL', '48–50', '32']].map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}
      </tbody></table><button type="button" class="btn ghost" data-open="${back}">Back to product</button></div>`);
  }
  function checkoutSheet() {
    openSheet(`<div class="sheet-body" style="align-items:center;text-align:center;padding-bottom:28px">${crown3d('i3d')}
      <h2 id="sheetTitle" class="sheet-h">Checkout comes next</h2>
      <p class="p-desc">In the full app this step takes card and local Caribbean payment options, then confirms by email and WhatsApp. For the demo, place a test order to see it in your profile.</p>
      <button type="button" class="btn" data-act="place-order" style="width:100%">Place demo order</button>
      <button type="button" class="btn ghost" data-act="close" style="width:100%">Not now</button></div>`);
  }

  // ---------- toast ----------
  let tt;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2400); }

  // ---------- router ----------
  const brandHTML = `<a class="brand" href="#scores" aria-label="Kings of the Cage, scores"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18h18l-1.5-10-4.5 4-3-7-3 7-4.5-4z"/><path d="M4 21h16"/></svg><span>Kings of the Cage</span></a>`;
  function chrome() {
    const [r, id] = state.route;
    const tab = { scores: 'scores', teams: 'teams', team: 'teams', player: 'teams', news: 'news', shop: 'shop', bag: 'shop', profile: 'profile' }[r];
    document.querySelectorAll('.tabs a').forEach((a) => { if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const title = r === 'team' ? (T[id] && T[id].name) : r === 'player' ? (P[id] && P[id].name) : r === 'news' && id ? 'News' : r === 'bag' ? 'Your bag' : '';
    $('#topL').innerHTML = title ? `<button type="button" class="back" data-act="back" aria-label="Back">${icon.back}</button><span class="top-title">${esc(title)}</span>` : brandHTML;
  }
  let lastTab = 'scores';
  function route() {
    const h = (location.hash || '#scores').slice(1).split('/');
    if (h[0] === 'live' || h[0] === 'fixtures') { state.scoreSeg = h[0] === 'live' ? 'live' : 'fixtures'; h[0] = 'scores'; }
    const known = ['scores', 'teams', 'team', 'player', 'news', 'shop', 'bag', 'profile'];
    state.route = known.includes(h[0]) ? h : ['scores'];
    if (['scores', 'teams', 'news', 'shop', 'profile'].includes(state.route[0])) lastTab = state.route[0];
    if (!sheet.hidden) closeSheet();
    chrome();
    const [r, id] = state.route;
    ({ scores: renderScores, teams: renderTeams, team: () => renderTeam(id), player: () => renderPlayer(id), news: () => (id ? renderArticle(id) : renderNews()), shop: renderShop, bag: renderBag, profile: renderProfile })[r]();
    view.scrollTop = 0;
  }
  const rerender = () => { const y = view.scrollTop; route(); view.scrollTop = y; };

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const el = e.target.closest('button, a');
    if (!el) { if (e.target === scrim) closeSheet(); return; }
    const d = el.dataset;
    if (d.segGo) { const [k, v] = d.segGo.split(':'); if (k === 'teams') state.teamsSeg = v; if (location.hash === el.getAttribute('href')) rerender(); return; }
    if (d.seg) {
      const [k, v] = d.seg.split(':');
      if (k === 'score') state.scoreSeg = v;
      if (k === 'live') state.liveTab = v;
      if (k === 'teams') state.teamsSeg = v;
      rerender(); return;
    }
    if (d.day) { state.day = d.day; rerender(); return; }
    if (d.pos) { state.pos = d.pos; rerender(); return; }
    if (d.ncat) { state.newsCat = d.ncat; rerender(); return; }
    if (d.cat) { state.cat = d.cat; rerender(); return; }
    if (d.jump) { const t = document.getElementById(d.jump); if (t) view.scrollTo({ top: t.offsetTop - 8, behavior: 'smooth' }); return; }
    if (d.follow) {
      const [kind, id] = d.follow.split(':'); const list = state.follow[kind]; const i = list.indexOf(id);
      if (i >= 0) list.splice(i, 1); else list.push(id);
      store.set('koc-follow-v1', state.follow);
      const on = i < 0, name = kind === 'teams' ? T[id].name : P[id].name;
      document.querySelectorAll(`[data-follow="${d.follow}"]`).forEach((b) => { b.setAttribute('aria-pressed', on); b.querySelector('span').textContent = on ? 'Following' : b.dataset.label; });
      el.classList.remove('pop'); void el.offsetWidth; if (on) el.classList.add('pop');
      toast(on ? `Following ${name}. Find them in your profile.` : `Unfollowed ${name}`);
      return;
    }
    if (d.open) { productSheet(d.open); return; }
    if (d.wish) {
      const i = state.wish.indexOf(d.wish);
      if (i >= 0) state.wish.splice(i, 1); else state.wish.push(d.wish);
      store.set('koc-wish-v1', state.wish);
      const on = i < 0; el.setAttribute('aria-pressed', on); el.classList.remove('pop'); void el.offsetWidth; if (on) el.classList.add('pop');
      toast(on ? 'Saved to your wishlist' : 'Removed from your wishlist');
      return;
    }
    if (d.size !== undefined && state.sheet) {
      state.sheet.size = d.size;
      sheet.querySelectorAll('.size').forEach((b) => b.setAttribute('aria-checked', b.dataset.size === d.size));
      $('#sizes').classList.remove('need');
      return;
    }
    if (d.sq && state.sheet) { state.sheet.qty = Math.max(1, Math.min(9, state.sheet.qty + Number(d.sq))); $('#sq').textContent = state.sheet.qty; return; }
    if (d.q !== undefined) { const l = state.bag[Number(d.q)]; l.qty = Math.max(1, Math.min(9, l.qty + Number(d.d))); saveBag(); renderBag(); return; }
    if (d.rm !== undefined) { state.bag.splice(Number(d.rm), 1); saveBag(); renderBag(); toast('Removed from your bag'); return; }
    switch (d.act) {
      case 'close': closeSheet(); break;
      case 'back': if (state.navCount > 0) history.back(); else location.hash = '#' + lastTab; break;
      case 'guide': guideSheet(); break;
      case 'checkout': checkoutSheet(); break;
      case 'watch': toast('The live stream opens here on match nights'); break;
      case 'clip': toast('Clip playback comes with the full app'); break;
      case 'ticket': toast('Your passes will appear here once tickets go on sale'); break;
      case 'signout': toast('This is a demo: you stay signed in as a fan'); break;
      case 'share': {
        const url = location.href;
        if (navigator.share) navigator.share({ title: document.title, url }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Link copied'), () => toast(url));
        else toast(url);
        break;
      }
      case 'edit-profile': editProfileSheet(); break;
      case 'save-profile': {
        const name = $('#fName').value.trim() || 'Demo Fan';
        const handle = $('#fHandle').value.trim().replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'demofan';
        state.user = Object.assign({}, state.user, { name, handle }); store.set('koc-user-v1', state.user);
        closeSheet(); renderProfile(); toast('Profile updated'); break;
      }
      case 'place-order': {
        const sub = subtotal(), ship = sub >= FREE_SHIP ? 0 : 9;
        state.orders.unshift({ ref: 'KOC-' + (1000 + Math.floor(Math.random() * 9000)), items: bagCount(), total: sub + ship, date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) });
        store.set('koc-orders-v1', state.orders); state.bag = []; saveBag();
        closeSheet(); location.hash = '#profile'; toast('Demo order placed. See it under Orders.'); break;
      }
      case 'add': {
        const s = state.sheet, p = PRODUCTS.find((x) => x.id === s.id);
        if (!s.size) { $('#sizes').classList.add('need'); toast('Pick a size first'); return; }
        const ex = state.bag.find((l) => l.id === s.id && l.size === s.size);
        if (ex) ex.qty = Math.min(9, ex.qty + s.qty); else state.bag.push({ id: s.id, size: s.size, qty: s.qty });
        saveBag();
        el.classList.add('added'); el.querySelector('.t').textContent = 'Added to bag ✓';
        toast(`${p.name} (${s.size}) added to your bag`);
        setTimeout(closeSheet, 900);
        break;
      }
    }
  });
  document.addEventListener('input', (e) => { if (e.target.id === 'q') { state.q = e.target.value; $('#plist').innerHTML = playersRows(filterPlayers()); } });
  document.addEventListener('change', (e) => {
    if (e.target.dataset.alert) { state.alerts[e.target.dataset.alert] = e.target.checked; store.set('koc-alerts-v1', state.alerts); toast(e.target.checked ? 'Alert on' : 'Alert off'); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });
  window.addEventListener('hashchange', () => { state.navCount++; route(); });

  // ---------- live simulation (sample data) ----------
  function liveEvent() {
    const team = Math.random() < 0.5 ? match.home : match.away, side = team === match.home ? 0 : 1, other = 1 - side;
    const sq = squad(team), scorer = sq[1 + Math.floor(Math.random() * 4)];
    const r = Math.random();
    let ev;
    if (r < 0.32) {
      ev = { type: 'goal', p: scorer.id, note: ['Fires into the bottom corner', 'Rebound off the boards', 'Chipped over the defender', 'One-two, then a tap-in'][Math.floor(Math.random() * 4)] };
      if (side === 0) match.hs++; else match.as++;
      match.stats.shots[side]++; match.stats.target[side]++;
    } else if (r < 0.62) {
      ev = { type: 'save', p: sq[0].id, note: 'Big stop to keep it tight' };
      match.stats.saves[side]++; match.stats.shots[other]++; match.stats.target[other]++;
    } else if (r < 0.9) {
      ev = { type: 'shot', p: scorer.id, note: 'Wide of the small goal' }; match.stats.shots[side]++;
    } else {
      ev = { type: 'card', p: scorer.id, note: 'Yellow for a late challenge' };
    }
    ev.t = match.secs;
    match.feed.unshift(ev);
    match.stats.poss = Math.max(38, Math.min(62, match.stats.poss + (side === 0 ? 1 : -1)));
    const onLive = state.route[0] === 'scores' && state.scoreSeg === 'live';
    if (onLive) {
      const f = $('#feed'); if (f) f.insertAdjacentHTML('afterbegin', evRow(ev, true));
      const st = $('#stats'); if (st) st.innerHTML = statsHTML();
      if (ev.type === 'goal') { const sc = $('#score'); if (sc) { sc.classList.remove('bump'); void sc.offsetWidth; sc.classList.add('bump'); } }
    }
    if (ev.type === 'goal' && (onLive || state.alerts.goals)) toast(`Goal! ${P[ev.p].name} · ${T[match.home].short} ${match.hs} – ${match.as} ${T[match.away].short}`);
  }
  setInterval(() => {
    match.secs++;
    const onLive = state.route[0] === 'scores' && state.scoreSeg === 'live';
    if (match.secs >= HALF * 2) {
      match.secs = 0; match.hs = 0; match.as = 0; match.stats = { shots: [0, 0], target: [0, 0], saves: [0, 0], poss: 50 };
      match.feed = [{ t: 0, type: 'whistle', note: 'New match · Court 1' }];
      if (onLive) rerender();
    }
    if (match.secs % 11 === 0) liveEvent();
    others.forEach((o, i) => {
      if (o.secs < HALF * 2) {
        o.secs++;
        if (o.secs % 37 === 0) { if (Math.random() < 0.5) o.hs++; else o.as++; }
        if (onLive) {
          const s = $('#o' + i + 's'); if (s) s.textContent = (o.secs >= HALF * 2 ? 'Full time' : 'Live · ' + fmt(o.secs).txt) + ' · ' + o.court;
          const hh = $('#o' + i + 'h'), aa = $('#o' + i + 'a'); if (hh) { hh.textContent = o.hs; aa.textContent = o.as; }
        }
      }
    });
    if (onLive) {
      const c = fmt(match.secs);
      const ck = $('#clock'); if (ck) ck.textContent = (c.half === 1 ? '1st' : '2nd') + ' · ' + c.txt;
      const sc = $('#score'); if (sc) sc.textContent = match.hs + ' – ' + match.as;
      const pg = $('#prog'); if (pg) pg.style.width = (match.secs / (HALF * 2)) * 100 + '%';
    }
  }, 1000);

  saveBag();
  route();
})();

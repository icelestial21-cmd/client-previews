/* Kings of the Cage app demo, by iCelestial. Vanilla JS, no build step.
   All teams, scores, products and prices are SAMPLE DATA for the demo. */
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
  const icon = {
    ball: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 5h-5L8 10z"/></svg>',
    glove: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11V6a1.5 1.5 0 0 1 3 0v4m0-5a1.5 1.5 0 0 1 3 0v5m0-4a1.5 1.5 0 0 1 3 0v6c0 4-2 7-6 7s-6-3-6-6v-2a1.5 1.5 0 0 1 3 0"/></svg>',
    card: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="4" width="10" height="16" rx="1.5" fill="#e3b23c" stroke="#e3b23c"/></svg>',
    shot: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20 20 4M14 4h6v6"/></svg>',
    whistle: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="14" r="5"/><path d="M12 10h9v3h-5M9 9V5"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14l11-7z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
    crown: '<svg viewBox="0 0 24 24" aria-hidden="true" style="stroke:#e3b23c"><path d="M3 18h18l-1.5-10-4.5 4-3-7-3 7-4.5-4z"/><path d="M4 21h16"/></svg>'
  };
  // 3dicons crown (CC0), with an inline SVG fallback if the CDN is unreachable.
  window.KOC_CROWN = icon.crown.replace('viewBox', 'width="64" height="64" viewBox');
  const crown3d = (cls) => `<img class="${cls}" src="https://3dicons.sgp1.cdn.digitaloceanspaces.com/v1/dynamic/premium/crow-dynamic-premium.png" alt="" width="110" height="110" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'${cls}',innerHTML:window.KOC_CROWN}))">`;

  // ---------- sample data ----------
  const TEAMS = {
    MAL: { name: 'Maloney Ballers', c: '#e3b23c', ink: '#120d00' },
    ARS: { name: 'Arima Strikers', c: '#f5f1e8', ink: '#0a0a0a' },
    KGN: { name: 'Kingston Kings', c: '#1f8a5a', ink: '#fff' },
    TOB: { name: 'Tobago Tide', c: '#2f6fd6', ink: '#fff' },
    BKN: { name: 'Brooklyn Cage', c: '#8a8a8a', ink: '#0a0a0a' },
    LAV: { name: 'Laventille FC', c: '#b0312a', ink: '#fff' }
  };
  const PLAYERS = { MAL: ['K. Charles', 'J. Mohammed', 'D. Joseph', 'R. Phillip'], ARS: ['T. Baptiste', 'S. Ali', 'M. Pierre', 'A. Gomez'] };
  const HALF = 600; // two 10-minute halves (sample format)

  const match = {
    home: 'MAL', away: 'ARS', secs: 552, hs: 3, as: 2,
    stats: { shots: [9, 7], target: [5, 4], saves: [2, 2], poss: 54 },
    feed: [
      { t: 501, type: 'goal', team: 'MAL', who: 'K. Charles', note: 'Low finish into the small goal' },
      { t: 430, type: 'save', team: 'ARS', who: 'A. Gomez', note: 'Point-blank stop' },
      { t: 352, type: 'goal', team: 'ARS', who: 'T. Baptiste', note: 'Rebound off the boards' },
      { t: 260, type: 'goal', team: 'MAL', who: 'D. Joseph', note: 'Nutmeg, then a tap-in' },
      { t: 181, type: 'card', team: 'ARS', who: 'S. Ali', note: 'Yellow for a late challenge' },
      { t: 95, type: 'goal', team: 'ARS', who: 'M. Pierre', note: 'Curled in from the corner' },
      { t: 40, type: 'goal', team: 'MAL', who: 'J. Mohammed', note: 'Opening goal of the night' },
      { t: 0, type: 'whistle', team: '', who: 'Kick-off', note: 'Court 1 · Group A' }
    ]
  };
  const others = [
    { h: 'KGN', a: 'TOB', hs: 2, as: 2, secs: 840, court: 'Court 2' },
    { h: 'BKN', a: 'LAV', hs: 4, as: 1, secs: 1200, court: 'Court 1' }
  ];
  const DAYS = [
    { id: 'fri', d: 'Fri', n: '13', label: 'Group stage' },
    { id: 'sat', d: 'Sat', n: '14', label: 'Group stage' },
    { id: 'sun', d: 'Sun', n: '15', label: 'Finals night' }
  ];
  const FIXTURES = {
    fri: [['BKN', 'LAV', '4 – 1', 'Full time'], ['KGN', 'TOB', 'LIVE', 'Court 2'], ['MAL', 'ARS', 'LIVE', 'Court 1'], ['MAL', 'KGN', '7:30 PM', 'Court 1'], ['ARS', 'TOB', '8:15 PM', 'Court 2']],
    sat: [['LAV', 'KGN', '6:00 PM', 'Court 1'], ['TOB', 'MAL', '6:45 PM', 'Court 2'], ['ARS', 'BKN', '7:30 PM', 'Court 1'], ['LAV', 'MAL', '8:15 PM', 'Court 2']],
    sun: [['Semi-final 1', 'Group A winner v Group B runner-up', '6:30 PM', 'Court 1'], ['Semi-final 2', 'Group B winner v Group A runner-up', '7:30 PM', 'Court 1'], ['Final', 'Championship rings on the line', '9:00 PM', 'Court 1']]
  };
  const TABLE = [['MAL', 2, 2, 0, 0, 5, 6], ['ARS', 2, 1, 0, 1, 2, 3], ['KGN', 2, 1, 0, 1, 0, 3], ['TOB', 2, 0, 0, 2, -7, 0]];

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

  // Code-native placeholder art for each product type (real product photos replace these).
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
    tab: 'live', liveTab: 'feed', day: 'fri', cat: 'all',
    bag: store.get('koc-bag-v1', []),
    wish: store.get('koc-wish-v1', []),
    sheet: null
  };
  const view = $('#view');
  const fmt = (s) => { const half = s >= HALF ? 2 : 1; const t = s - (half - 1) * HALF; return { half, txt: String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0') }; };
  const crestEl = (code, size) => { const t = TEAMS[code]; return t ? `<span class="${size || 'crest'}" style="background:${t.c};color:${t.ink}">${code}</span>` : ''; };

  // ---------- LIVE ----------
  function evRow(e, isNew) {
    const ic = { goal: icon.ball, save: icon.glove, card: icon.card, shot: icon.shot, whistle: icon.whistle }[e.type];
    const what = { goal: 'Goal', save: 'Save', card: 'Yellow card', shot: 'Shot off target', whistle: '' }[e.type];
    const m = Math.floor(e.t / 60) + 1 + "'";
    const team = e.team ? ` · ${TEAMS[e.team].name}` : '';
    return `<div class="ev ev-${e.type}${isNew ? ' new' : ''}"><span class="m">${e.type === 'whistle' ? '' : m}</span><span class="ic">${ic}</span><p>${what ? `<b>${what}</b> · ` : ''}${esc(e.who)}${esc(team)}<small>${esc(e.note)}</small></p></div>`;
  }
  function statsHTML() {
    const s = match.stats;
    const rows = [['Possession', s.poss, 100 - s.poss, '%'], ['Shots', s.shots[0], s.shots[1], ''], ['On target', s.target[0], s.target[1], ''], ['Saves', s.saves[0], s.saves[1], '']];
    return rows.map(([l, a, b, u]) => {
      const tot = Math.max(a + b, 1);
      return `<div><div class="stat-h"><span>${a}${u}</span><span>${l}</span><span>${b}${u}</span></div><div class="bar"><i><b style="width:${(a / tot) * 100}%;background:${TEAMS[match.home].c}"></b></i><i><b style="width:${(b / tot) * 100}%;background:${TEAMS[match.away].c}"></b></i></div></div>`;
    }).join('');
  }
  function renderLive() {
    const h = TEAMS[match.home], a = TEAMS[match.away], c = fmt(match.secs);
    view.innerHTML = `
      <div class="sec" style="padding-top:16px"><span class="live-pill"><i></i>Live now · Court 1</span></div>
      <article class="banner" style="--home:${h.c};--away:${a.c}" aria-label="${esc(h.name)} versus ${esc(a.name)}">
        <div class="banner-split" aria-hidden="true"></div>
        <div class="banner-in">
          <div class="banner-meta"><span>Group A · Matchday 3</span><span>Maloney Indoor</span></div>
          <div class="score-row">
            <div class="team">${crestEl(match.home)}<b>${esc(h.name)}</b></div>
            <div><div class="score" id="score" aria-live="polite">${match.hs} – ${match.as}</div><div class="clock" id="clock">${c.half === 1 ? '1st' : '2nd'} · ${c.txt}</div></div>
            <div class="team">${crestEl(match.away)}<b>${esc(a.name)}</b></div>
          </div>
          <div class="progress" aria-hidden="true"><i id="prog" style="width:${(match.secs / (HALF * 2)) * 100}%"></i></div>
          <div class="progress-l" aria-hidden="true"><span>Kick-off</span><span>Half</span><span>Full time</span></div>
          <button class="watch" type="button" data-act="watch">${icon.play}Watch the live stream</button>
        </div>
      </article>
      <div class="sec">
        <div class="seg" role="tablist" aria-label="Match detail">
          <button role="tab" type="button" data-live="feed" aria-selected="${state.liveTab === 'feed'}">Play-by-play</button>
          <button role="tab" type="button" data-live="stats" aria-selected="${state.liveTab === 'stats'}">Stats</button>
        </div>
        <div id="liveBody">${state.liveTab === 'feed' ? `<div class="feed" id="feed">${match.feed.map((e) => evRow(e)).join('')}</div>` : `<div class="stats" id="stats">${statsHTML()}</div>`}</div>
      </div>
      <div class="sec">
        <div class="sec-h"><h2 class="h2">Other courts</h2><a class="link" href="#fixtures">All fixtures</a></div>
        <div class="other">${others.map((o, i) => `<a class="mini" href="#fixtures"><div class="r"><span>${esc(TEAMS[o.h].name)}</span><b id="o${i}h">${o.hs}</b></div><div class="r"><span>${esc(TEAMS[o.a].name)}</span><b id="o${i}a">${o.as}</b></div><small id="o${i}s" style="color:${o.secs >= HALF * 2 ? 'var(--muted)' : 'var(--live)'}">${o.secs >= HALF * 2 ? 'Full time' : 'Live · ' + fmt(o.secs).txt} · ${o.court}</small></a>`).join('')}</div>
      </div>
      <div class="sec">
        <a class="drop" href="#shop" style="margin:0">
          <div class="drop-t"><span class="eyebrow">Official shop</span><h2 style="font-size:30px">Rep your team</h2><p>New Jamaica 2027 drop is live.</p></div>
          ${crown3d('i3d')}
        </a>
      </div>`;
  }

  // ---------- FIXTURES ----------
  function renderFixtures() {
    const list = FIXTURES[state.day];
    const finals = state.day === 'sun';
    view.innerHTML = `
      <div class="sec">
        <div class="sec-h"><h2 class="h2">Fixtures</h2><span class="mut" style="font-size:14px">${DAYS.find((d) => d.id === state.day).label}</span></div>
        <div class="days">${DAYS.map((d) => `<button type="button" class="day" data-day="${d.id}" aria-pressed="${state.day === d.id}">${d.d}<b>${d.n}</b></button>`).join('')}</div>
      </div>
      <div class="sec">${list.map(([h, a, mid, sub]) => finals
        ? `<div class="fx" style="grid-template-columns:1fr auto"><div><b style="font:600 17px var(--cond);text-transform:uppercase;letter-spacing:.08em">${esc(h)}</b><div class="mut" style="font-size:14px">${esc(a)}</div></div><div class="mid"><b>${esc(mid)}</b><small class="mut">${esc(sub)}</small></div></div>`
        : `<div class="fx"><div class="h">${crestEl(h, 'dot')}<span>${esc(TEAMS[h].name)}</span></div><div class="mid"><b ${mid === 'LIVE' ? 'style="color:var(--live);font-size:18px"' : ''}>${esc(mid)}</b><small class="mut">${esc(sub)}</small></div><div class="a">${crestEl(a, 'dot')}<span>${esc(TEAMS[a].name)}</span></div></div>`).join('')}
      </div>
      <div class="sec">
        <div class="sec-h"><h2 class="h2">Group A table</h2></div>
        <div class="table"><table>
          <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead>
          <tbody>${TABLE.map((r, i) => `<tr class="${i < 2 ? 'q' : ''}"><td>${i + 1}</td><td>${esc(TEAMS[r[0]].name)}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5] > 0 ? '+' + r[5] : r[5]}</td><td class="pts">${r[6]}</td></tr>`).join('')}</tbody>
        </table></div>
        <p class="legend"><i></i>Top two go through to finals night</p>
      </div>`;
  }

  // ---------- SHOP ----------
  function priceHTML(p) {
    return p.was ? `<span class="price"><span class="now">${money(p.price)}</span><s>${money(p.was)}</s></span>` : `<span class="price">${money(p.price)}</span>`;
  }
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

  // ---------- BAG ----------
  const bagCount = () => state.bag.reduce((n, l) => n + l.qty, 0);
  const subtotal = () => state.bag.reduce((n, l) => n + PRODUCTS.find((p) => p.id === l.id).price * l.qty, 0);
  function saveBag() { store.set('koc-bag-v1', state.bag); const b = $('#bagCount'); const n = bagCount(); b.hidden = !n; b.textContent = n; }
  function renderBag() {
    if (!state.bag.length) {
      view.innerHTML = `<div class="empty">${crown3d('i3d')}<h2>Your bag is empty</h2><p class="mut">Grab a jersey before finals night.</p><a class="btn" href="#shop">Shop the collection</a></div>`;
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

  // ---------- sheet ----------
  const sheet = $('#sheet'), scrim = $('#scrim');
  let lastFocus = null;
  function openSheet(html) {
    lastFocus = document.activeElement;
    sheet.innerHTML = `<div class="sheet-grip" aria-hidden="true"></div><button type="button" class="sheet-x" data-act="close" aria-label="Close">${icon.x}</button>${html}`;
    sheet.hidden = false; scrim.hidden = false; document.body.classList.add('sheet-open');
    const f = sheet.querySelector('h2, button'); if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
  }
  function closeSheet() { document.body.classList.remove('sheet-open'); sheet.hidden = true; scrim.hidden = true; sheet.innerHTML = ''; state.sheet = null; if (lastFocus) lastFocus.focus({ preventScroll: true }); }
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
    openSheet(`<div class="sheet-body"><h2 id="sheetTitle" style="font:400 30px var(--display);text-transform:uppercase">Size guide</h2>
      <p class="p-desc">Chest measurement in inches. Between sizes? Size up for a relaxed fit.</p>
      <table class="sizeguide"><thead><tr><th>Size</th><th>Chest</th><th>Length</th></tr></thead><tbody>
      ${[['S', '36–38', '28'], ['M', '39–41', '29'], ['L', '42–44', '30'], ['XL', '45–47', '31'], ['XXL', '48–50', '32']].map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}
      </tbody></table><button type="button" class="btn ghost" data-open="${back}">Back to product</button></div>`);
  }
  function checkoutSheet() {
    openSheet(`<div class="sheet-body" style="align-items:center;text-align:center;padding-bottom:28px">${crown3d('i3d')}
      <h2 id="sheetTitle" style="font:400 32px/1 var(--display);text-transform:uppercase">Checkout comes next</h2>
      <p class="p-desc">In the full app this step takes card and local Caribbean payment options, then sends an order confirmation by email and WhatsApp.</p>
      <button type="button" class="btn" data-act="close" style="width:100%">Got it</button></div>`);
  }

  // ---------- toast ----------
  let tt;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200); }

  // ---------- router ----------
  const renderers = { live: renderLive, fixtures: renderFixtures, shop: renderShop, bag: renderBag };
  function route() {
    const tab = (location.hash || '#live').slice(1);
    state.tab = renderers[tab] ? tab : 'live';
    document.querySelectorAll('.tabs a').forEach((a) => { if (a.dataset.tab === state.tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (!sheet.hidden) closeSheet();
    renderers[state.tab]();
    view.scrollTop = 0;
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const el = e.target.closest('button, a');
    if (!el) { if (e.target === scrim) closeSheet(); return; }
    const d = el.dataset;
    if (d.live) { state.liveTab = d.live; renderLive(); return; }
    if (d.day) { state.day = d.day; renderFixtures(); return; }
    if (d.cat) { state.cat = d.cat; renderShop(); return; }
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
      case 'guide': guideSheet(); break;
      case 'checkout': checkoutSheet(); break;
      case 'watch': toast('The live stream opens here on match nights'); break;
      case 'add': {
        const s = state.sheet, p = PRODUCTS.find((x) => x.id === s.id);
        if (!s.size) { const z = $('#sizes'); z.classList.add('need'); toast('Pick a size first'); return; }
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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });
  window.addEventListener('hashchange', route);

  // ---------- live simulation (sample data) ----------
  function liveEvent() {
    const team = Math.random() < 0.5 ? match.home : match.away, side = team === match.home ? 0 : 1, other = 1 - side;
    const who = PLAYERS[team][Math.floor(Math.random() * 4)];
    const r = Math.random();
    let ev;
    if (r < 0.32) {
      ev = { type: 'goal', note: ['Fires into the bottom corner', 'Rebound off the boards', 'Chipped over the keeper', 'One-two, then a tap-in'][Math.floor(Math.random() * 4)] };
      if (side === 0) match.hs++; else match.as++;
      match.stats.shots[side]++; match.stats.target[side]++;
    } else if (r < 0.62) {
      ev = { type: 'save', note: 'Big stop to keep it tight' };
      match.stats.saves[side]++; match.stats.shots[other]++; match.stats.target[other]++;
    } else if (r < 0.9) {
      ev = { type: 'shot', note: 'Wide of the small goal' }; match.stats.shots[side]++;
    } else {
      ev = { type: 'card', note: 'Yellow for a late challenge' };
    }
    Object.assign(ev, { t: match.secs, team, who: ev.type === 'save' ? PLAYERS[team][3] : who });
    match.feed.unshift(ev);
    match.stats.poss = Math.max(38, Math.min(62, match.stats.poss + (side === 0 ? 1 : -1)));
    if (state.tab === 'live') {
      const f = $('#feed'); if (f) f.insertAdjacentHTML('afterbegin', evRow(ev, true));
      const st = $('#stats'); if (st) st.innerHTML = statsHTML();
      if (ev.type === 'goal') { const sc = $('#score'); sc.classList.remove('bump'); void sc.offsetWidth; sc.classList.add('bump'); }
    }
    if (ev.type === 'goal') toast(`Goal! ${TEAMS[team].name} · ${match.hs} – ${match.as}`);
  }
  setInterval(() => {
    match.secs++;
    if (match.secs >= HALF * 2) {
      match.secs = 0; match.hs = 0; match.as = 0; match.stats = { shots: [0, 0], target: [0, 0], saves: [0, 0], poss: 50 };
      match.feed = [{ t: 0, type: 'whistle', team: '', who: 'Kick-off', note: 'New match · Court 1' }];
      if (state.tab === 'live') renderLive();
    }
    if (match.secs % 11 === 0) liveEvent();
    others.forEach((o, i) => {
      if (o.secs < HALF * 2) {
        o.secs++;
        if (o.secs % 37 === 0) { if (Math.random() < 0.5) o.hs++; else o.as++; }
        if (state.tab === 'live') {
          const s = $('#o' + i + 's'); if (s) { s.textContent = (o.secs >= HALF * 2 ? 'Full time' : 'Live · ' + fmt(o.secs).txt) + ' · ' + o.court; }
          const hh = $('#o' + i + 'h'), aa = $('#o' + i + 'a'); if (hh) { hh.textContent = o.hs; aa.textContent = o.as; }
        }
      }
    });
    if (state.tab === 'live') {
      const c = fmt(match.secs);
      const ck = $('#clock'); if (ck) ck.textContent = (c.half === 1 ? '1st' : '2nd') + ' · ' + c.txt;
      const sc = $('#score'); if (sc) sc.textContent = match.hs + ' – ' + match.as;
      const pg = $('#prog'); if (pg) pg.style.width = (match.secs / (HALF * 2)) * 100 + '%';
    }
  }, 1000);

  saveBag();
  route();
})();

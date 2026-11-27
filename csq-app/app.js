/* Caribbean Sports Quest app demo, by iCelestial. Vanilla JS, hash routes, state kept on this device. */
(() => {
  const D = window.CSQ;
  const $ = (s, el = document) => el.querySelector(s);
  const view = $("#view");
  const KEY = "csq-app-demo-v1";

  /* ---------- state ---------- */
  const fresh = () => ({
    name: "Quest Fan", handle: "questfan", parish: "Kingston",
    balance: 742, lifetime: 742, week: 152, streak: 6,
    going: ["rugby-7s-final"], tickets: [], checkins: [], quizDay: "", pulseRead: [],
    likes: [], myPosts: [], reserved: [], redeemed: [], orders: [], follow: ["jdca-domino"],
    alerts: { events: true, leagues: true, rewards: true, opps: false },
    ccy: "JMD", seenBell: false,
    activity: [
      { what: "Checked in: Corporate T20 group stage", qp: 50, when: "6 days ago" },
      { what: "Daily quiz streak: 7 days", qp: 10, when: "1 week ago" },
      { what: "Bought tickets: Netball Super Series", qp: 25, when: "2 weeks ago" }
    ]
  });
  let S;
  try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { S = fresh(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

  /* ---------- helpers ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dateFor = d => new Date(today.getTime() + d * 864e5);
  const dayLabel = d => d === 0 ? "Today" : d === 1 ? "Tomorrow" : d === -1 ? "Yesterday" :
    dateFor(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const jmd = n => "J$" + n.toLocaleString("en-US");
  const usd = n => "US$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const money = (j, u) => { // j = JMD amount or null, u = USD amount or null
    if (j == null) j = Math.round(u * D.rate);
    if (u == null) u = j / D.rate;
    return S.ccy === "JMD" ? jmd(j) : usd(Math.round(u * 100) / 100);
  };
  const other = (j, u) => { if (j == null) j = Math.round(u * D.rate); if (u == null) u = j / D.rate; return S.ccy === "JMD" ? "≈ " + usd(Math.round(u)) : "≈ " + jmd(j); };
  const ev = id => D.events.find(e => e.id === id);
  const lg = id => D.leagues.find(l => l.id === id);
  const rankOf = lt => { let r = D.ranks[0], n = null; D.ranks.forEach((x, i) => { if (lt >= x.min) { r = x; n = D.ranks[i + 1] || null; } }); return { r, n }; };
  const initials = s => s.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const code = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  const questCode = "CSQ-" + (S.handle || "fan").slice(0, 3).toUpperCase() + "742";

  const I = {
    star: '<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    back: '<path d="m15 18-6-6 6-6"/>', chev: '<path d="m9 18 6-6-6-6"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
    bed: '<path d="M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="10" r="1.6"/>',
    trail: '<path d="m3 20 6-10 4 6 3-4 5 8z"/><circle cx="16" cy="6" r="2"/>',
    brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12h18"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>',
    trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 12v4M8 20h8"/>',
    qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2v2M18 18h2v2"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/><path d="m10 9 4 2-4 2z"/>',
    fire: '<path d="M12 21c4 0 7-2.7 7-7 0-4-3-6-4-9-1 3-3 3-3 3s0-2-2-4c0 4-5 6-5 10 0 4.3 3 7 7 7z"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', medal: '<circle cx="12" cy="15" r="6"/><path d="m8 3 4 6 4-6M12 12v6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', reply: '<path d="M4 5h16v11H9l-5 4z"/>',
    cart: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>', store: '<path d="M4 9 5 4h14l1 5M4 9v11h16V9M4 9h16M9 20v-6h6v6"/>',
    check: '<path d="m5 12 5 5 9-10"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    plane: '<path d="M10 14 3 11l1-2 8 1 5-6c1-1 3-1 3 1l-6 5 1 8-2 1-3-7"/>'
  };
  const ic = (n, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
  const bg = src => `style="background-image:url('${src}')"`;

  /* ---------- feedback ---------- */
  let tt;
  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2400); };
  const earn = (n, what) => {
    S.balance += n; S.lifetime += n; S.week += n;
    S.activity.unshift({ what, qp: n, when: "Just now" });
    save(); syncTop();
    const b = $("#burst"); b.textContent = "+" + n + " QP"; b.classList.remove("on"); void b.offsetWidth; b.classList.add("on");
    const p = $(".qp-pill"); p.classList.add("bump"); setTimeout(() => p.classList.remove("bump"), 250);
  };
  const syncTop = () => { $("#qpTop").textContent = S.balance.toLocaleString("en-US"); $("#bellDot").hidden = S.seenBell; };

  /* ---------- sheet ---------- */
  const sheet = $("#sheet"), scrim = $("#scrim");
  let sheetHandlers = null;
  let lastFocus;
  const openSheet = html => {
    lastFocus = document.activeElement;
    sheet.innerHTML = `<button class="x" data-act="close" aria-label="Close">${ic("x")}</button>` + html;
    sheet.hidden = false; scrim.hidden = false;
    setTimeout(() => (sheet.querySelector("input,button:not(.x)") || sheet).focus(), 50);
  };
  const closeSheet = () => { sheetHandlers = null; sheet.hidden = true; scrim.hidden = true; sheet.innerHTML = ""; lastFocus && lastFocus.focus && lastFocus.focus(); };
  scrim.addEventListener("click", closeSheet);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });

  /* ---------- shared pieces ---------- */
  const evCard = e => {
    const price = e.free ? "Free entry" : "From " + money(Math.min(...e.tiers.map(t => t.jmd)));
    return `<a class="ev-card" href="#event/${e.id}">
      <div class="img" ${bg(e.img)}><span class="tag">${esc(e.sport)}</span>${e.live && e.d === 0 ? '<span class="live"><i class="live-dot"></i>LIVE</span>' : ""}</div>
      <div class="body"><div class="when">${dayLabel(e.d)} · ${e.time}</div>
      <div class="h3 ell">${esc(e.title)}</div>
      <div class="small mut ell">${esc(e.venue)}, ${esc(e.parish)}</div>
      <div class="going"><span class="faces"><i></i><i></i><i></i></span>${(e.going + (S.going.includes(e.id) ? 1 : 0)).toLocaleString()} going · <b style="color:var(--ink)">${price}</b></div></div></a>`;
  };
  const evRow = e => {
    const on = S.going.includes(e.id);
    const price = e.free ? "Free entry" : "From " + money(Math.min(...e.tiers.map(t => t.jmd)));
    return `<div class="ev-row"><a class="th" href="#event/${e.id}" ${bg(e.img)} aria-label="${esc(e.title)}">${e.live && e.d === 0 ? '<span class="live">LIVE</span>' : ""}</a>
      <a class="grow" href="#event/${e.id}"><div class="h3">${esc(e.title)}</div>
      <div class="meta">${e.time} · ${esc(e.venue)}${e.island !== "Jamaica" ? " · " + esc(e.island) : ""}</div>
      <div class="price">${price}</div></a>
      <button class="going-btn" data-act="going" data-id="${e.id}" aria-pressed="${on}" aria-label="${on ? "You're going" : "I'm going"}">${ic("heart")}</button></div>`;
  };
  const back = (href, label) => `<a class="back" href="${href}">${ic("back")}${label}</a>`;

  /* ---------- screens ---------- */
  const R = {};

  R.home = () => {
    const { r, n } = rankOf(S.lifetime);
    const pct = n ? Math.round((S.lifetime - r.min) / (n.min - r.min) * 100) : 100;
    const wk = D.events.filter(e => e.d >= 0 && e.d <= 7);
    const qi = D.quiz[today.getDate() % D.quiz.length];
    const quizDone = S.quizDay === today.toDateString();
    const hr = new Date().getHours();
    const greet = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
    return `
    <div class="hello"><p>${greet}</p><h1>${esc(S.name.split(" ")[0])}, ready to quest?</h1></div>
    <a class="wallet" href="#me" aria-label="Quest Points wallet">
      <div class="lbl">Quest Points</div>
      <div class="num">${S.balance.toLocaleString()}<small>QP</small></div>
      <div class="rank-row"><span><b style="color:#fff">${r.name}</b></span><span>${n ? (n.min - S.lifetime).toLocaleString() + " QP to " + n.name : "Top rank"}</span></div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="wallet-foot">
        <div class="mini"><b>${S.streak} days</b>Streak 🔥</div>
        <div class="mini"><b>#${weeklyPos()} Gold</b>Weekly league</div>
        <div class="mini"><b>${S.checkins.length + 7}</b>Check-ins</div>
      </div>
    </a>

    <section class="sec"><div class="sec-h"><h2 class="h2">This week</h2><a class="link" href="#events">See all</a></div>
      <div class="hscroll">${wk.map(evCard).join("")}</div></section>

    <section class="sec"><h2 class="h2" style="margin-bottom:10px">Explore</h2>
      <div class="explore">
        <a href="#events/tickets"><span class="ic">${ic("ticket")}</span>Tickets</a>
        <a href="#travel"><span class="ic">${ic("bed")}</span>Stays</a>
        <a href="#travel/trails"><span class="ic">${ic("trail")}</span>Trails</a>
        <a href="#opps"><span class="ic">${ic("brief")}</span>Opportunities</a>
        <a href="#locker"><span class="ic">${ic("chat")}</span>Locker Room</a>
        <a href="#pulse"><span class="ic">${ic("news")}</span>Weekly Pulse</a>
      </div></section>

    <section class="sec"><div class="quiz" id="quiz">
      <div class="row"><span class="tag gold">${ic("bolt").replace('class=""', 'style="width:13px;height:13px"')} Daily quiz · +${D.earn.quiz} QP</span><span class="grow"></span><span class="small mut">${quizDone ? "Done for today" : "1 question"}</span></div>
      <div class="q">${esc(qi.q)}</div>
      <div class="quiz-opts">${qi.a.map((a, i) => `<button data-act="quiz" data-i="${i}" ${quizDone ? "disabled" : ""} class="${quizDone && i === qi.c ? "right" : ""}">${esc(a)}</button>`).join("")}</div>
    </div></section>

    <section class="sec"><div class="sec-h"><h2 class="h2">Weekly Pulse</h2><a class="link" href="#pulse">All stories</a></div>
      <a class="lead-story" href="#pulse/${D.pulse[0].id}" ${bg(D.pulse[0].img)}><div><span class="tag gold">${D.pulse[0].sport}</span><h3>${esc(D.pulse[0].title)}</h3></div></a>
      ${D.pulse.slice(1).map(storyRow).join("")}
    </section>

    <section class="sec"><div class="sec-h"><h2 class="h2">Locker Room</h2><a class="link" href="#locker">Join in</a></div></section>
    ${postHtml(D.posts[1])}`;
  };
  const storyRow = p => `<a class="story" href="#pulse/${p.id}"><div class="th" ${bg(p.img)}></div><div class="grow"><span class="tag">${p.sport}</span><div class="h3" style="margin-top:5px">${esc(p.title)}</div><div class="small mut">${p.mins} min read${S.pulseRead.includes(p.id) ? " · Read ✓" : " · +" + D.earn.pulse + " QP"}</div></div></a>`;
  const weeklyPos = () => { const arr = D.leaderboard.map(x => x.name === "YOU" ? { ...x, qp: S.week } : x).sort((a, b) => b.qp - a.qp); return arr.findIndex(x => x.name === "YOU") + 1; };

  let evFilter = { sport: "All", when: "all", q: "" };
  R.events = (sub) => {
    if (sub === "tickets") evFilter.when = "tickets";
    const list = D.events.filter(e => e.d >= 0)
      .filter(e => evFilter.sport === "All" || e.sport === evFilter.sport)
      .filter(e => evFilter.when === "all" || (evFilter.when === "week" && e.d <= 7) || (evFilter.when === "tickets" && !e.free))
      .filter(e => !evFilter.q || (e.title + e.venue + e.parish + e.island + e.sport).toLowerCase().includes(evFilter.q.toLowerCase()))
      .sort((a, b) => a.d - b.d);
    const groups = {}; list.forEach(e => (groups[e.d] = groups[e.d] || []).push(e));
    return `
    <label class="search">${ic("search")}<span class="sr">Search events</span><input id="evSearch" type="search" placeholder="Search events, venues, islands" value="${esc(evFilter.q)}"></label>
    <div class="seg" role="group" aria-label="Show">
      ${[["all", "All dates"], ["week", "This week"], ["tickets", "On sale"]].map(([k, l]) => `<button data-act="evwhen" data-k="${k}" aria-pressed="${evFilter.when === k}">${l}</button>`).join("")}
    </div>
    <div style="padding:0 16px"><div class="chips">${D.sports.map(s => `<button class="chip" data-act="evsport" data-s="${s}" aria-pressed="${evFilter.sport === s}">${s}</button>`).join("")}</div></div>
    <div id="evList">${Object.keys(groups).length ? Object.keys(groups).sort((a, b) => a - b).map(d => `<div class="day-h">${dayLabel(+d)}${+d > 1 ? "" : " · " + dateFor(+d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>${groups[d].map(evRow).join("")}`).join("") : '<p class="empty">No events match. Try another sport or date.</p>'}</div>
    <div class="sec"><div class="card" style="padding:14px;display:flex;gap:12px;align-items:center">${ic("plane").replace('class=""', 'style="width:28px;height:28px;color:var(--red);flex-shrink:0"')}<div class="grow"><div class="h3">Organizing an event?</div><div class="small mut">List it free. Approved events go on the calendar and ticket pages.</div></div><button class="btn btn-ghost" data-act="listevent" style="min-height:38px;padding:0 12px;font-size:13px">List it</button></div></div>`;
  };

  R.event = id => {
    const e = ev(id); if (!e) return R.events();
    const on = S.going.includes(e.id);
    const myT = S.tickets.filter(t => t.eventId === e.id);
    const checked = S.checkins.includes(e.id);
    const near = D.stays.filter(s => e.island === "Jamaica" ? ["kws", "mbl"].includes(s.id) : e.island === "Barbados" ? s.id === "bgh" : s.id === "pos");
    const league = e.league && lg(e.league);
    return `
    <div class="hero" ${bg(e.img)}>${back("#events", "Events")}
      <div class="hb"><span class="tag">${esc(e.sport)}</span>${e.live && e.d === 0 ? ' <span class="tag red"><i class="live-dot"></i> Live now</span>' : ""}<h1>${esc(e.title)}</h1></div></div>
    <div class="facts">
      <div class="fact"><span>When</span><b>${dayLabel(e.d)}, ${e.time}</b></div>
      <div class="fact"><span>Where</span><b>${esc(e.venue)}</b></div>
      <div class="fact"><span>Parish / city</span><b>${esc(e.parish)}, ${esc(e.island)}</b></div>
      <div class="fact"><span>Going</span><b>${(e.going + (on ? 1 : 0)).toLocaleString()} fans</b></div>
    </div>
    ${e.live && e.d === 0 ? `<div class="scoreboard"><div class="top-l"><span class="row" style="gap:6px"><i class="live-dot"></i>LIVE</span><span id="clock">${e.live.clock}</span></div>
      <div class="score-grid"><div class="team">${esc(e.live.home)}</div><div class="sc" id="liveScore">${e.live.hs} – ${e.live.as}</div><div class="team">${esc(e.live.away)}</div></div></div>` : ""}
    ${e.d === 0 ? `<div class="checkin">${ic("qr")}<div class="grow"><div class="h3">${checked ? "Checked in ✓" : "You're at the venue?"}</div><div class="small mut">${checked ? "+" + D.earn.checkin + " QP added to your wallet." : "Scan the venue QR or show your Quest code to earn " + D.earn.checkin + " QP."}</div></div>${checked ? "" : `<button class="btn btn-gold" data-act="checkin" data-id="${e.id}" style="min-height:40px;padding:0 14px">Check in</button>`}</div>`
      : `<div class="checkin" style="border-style:solid;background:#fff;border-color:var(--line)">${ic("star").replace('class=""', 'style="width:30px;height:30px;color:var(--gold-strong);flex-shrink:0;fill:var(--gold-soft)"')}<div class="grow"><div class="h3">Earn ${D.earn.checkin} QP on the day</div><div class="small mut">Check-in opens 2 hours before the start.</div></div></div>`}
    <section class="sec"><h2 class="h2" style="margin-bottom:8px">About</h2><p style="color:var(--text)">${esc(e.desc)}</p><p class="small mut" style="margin-top:6px">Organized by ${esc(e.organizer)}</p></section>
    ${e.watch ? `<div class="watch">${ic("tv")}<div class="grow"><div class="h3">Can't make it? Watch on ${esc(e.watch)}</div><div class="small mut">External broadcast link</div></div>${ic("chev").replace('class=""', 'style="width:16px;height:16px;color:var(--dim)"')}</div>` : ""}
    ${myT.length ? `<section class="sec"><h2 class="h2" style="margin-bottom:10px">Your tickets</h2></section>${myT.map(ticketHtml).join("")}` : ""}
    ${e.free ? "" : `<section class="sec"><div class="sec-h"><h2 class="h2">Tickets</h2><div class="ccy" role="group" aria-label="Currency">${["JMD", "USD"].map(c => `<button data-act="ccy" data-c="${c}" aria-pressed="${S.ccy === c}">${c}</button>`).join("")}</div></div>
      <div class="card" style="padding:2px 14px">${e.tiers.map(t => `<div class="tier"><div class="grow"><div class="h3">${esc(t.name)}</div><div class="small mut">${other(t.jmd)}</div></div><b style="color:var(--ink)">${money(t.jmd)}</b></div>`).join("")}</div>
      <p class="small mut" style="margin-top:6px">Online checkout is charged in USD at the CSQ rate of J$${D.rate} = US$1.</p></section>`}
    ${league ? `<section class="sec"><a class="lg-row" style="margin:0" href="#league/${league.id}"><div class="th" ${bg(league.img)}></div><div class="grow"><div class="small mut">Part of</div><div class="h3">${esc(league.name)}</div></div>${ic("chev").replace('class=""', 'style="width:16px;height:16px;color:var(--dim)"')}</a></section>` : ""}
    <section class="sec"><div class="sec-h"><h2 class="h2">Stay nearby</h2><a class="link" href="#travel">All stays</a></div><div class="hscroll">${near.map(stayHtml).join("")}</div></section>
    <div class="sticky-cta"><div class="row">
      <button class="btn btn-ghost" data-act="going" data-id="${e.id}" aria-pressed="${on}" style="flex:0 0 auto">${ic("heart").replace('class=""', on ? 'style="fill:var(--red);stroke:var(--red)"' : "")}${on ? "Going" : "I'm going"}</button>
      ${e.free ? `<button class="btn btn-teal grow" data-act="share" data-id="${e.id}">${ic("share")}Share with friends</button>`
        : `<button class="btn btn-cta grow" data-act="buy" data-id="${e.id}">${ic("ticket")}Get tickets</button>`}
    </div></div>`;
  };

  const ticketHtml = t => { const e = ev(t.eventId); return `<div class="ticket"><div class="l"><div class="small" style="color:var(--red);font-weight:700;text-transform:uppercase;letter-spacing:.04em">${dayLabel(e.d)} · ${e.time}</div><div class="h3">${esc(e.title)}</div><div class="small mut">${t.qty} × ${esc(t.tier)} · ${esc(e.venue)}</div><div class="small" style="margin-top:4px;font-weight:700;color:var(--ink)">#${t.code}</div></div><div class="r">${qrSvg(t.code)}</div></div>`; };
  const qrSvg = seed => { let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; let cells = ""; const n = 13; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const corner = (x < 4 && y < 4) || (x > 8 && y < 4) || (x < 4 && y > 8); if (corner) continue; h = (h * 1103515245 + 12345) >>> 0; if (h & 0x10000) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`; } const fin = (x, y) => `<rect x="${x + .5}" y="${y + .5}" width="3" height="3" fill="none" stroke="#13495d" stroke-width="1"/><rect x="${x + 1.5}" y="${y + 1.5}" width="1" height="1"/>`; return `<svg viewBox="0 0 13 13" style="fill:#13495d;stroke:none" aria-label="Ticket QR code">${cells}${fin(0, 0)}${fin(9, 0)}${fin(0, 9)}</svg>`; };
  const stayHtml = (s, full) => `<div class="stay"${full ? ' style="width:auto"' : ""}><div class="img" ${bg(s.img)}><span class="tag">${esc(s.tag)}</span></div><div class="b"><div class="h3 ell">${esc(s.name)}</div><div class="small mut ell">${esc(s.near)}</div><div class="row" style="margin-top:8px;justify-content:space-between"><span><b style="color:var(--ink)">${money(s.jmd)}</b><span class="small mut"> /night</span></span><button class="link" data-act="stay" data-id="${s.id}">Check dates</button></div></div></div>`;

  let lgTab = {};
  R.leagues = () => {
    const f = D.leagues[0];
    return `
    <div class="hello"><p>Leagues &amp; Tournaments</p><h1>Follow your league</h1></div>
    <a class="lg-feature" href="#league/${f.id}"><div class="img" ${bg(f.img)}></div><div class="b"><span class="tag gold">Featured · ${esc(f.season)}</span><h3>${esc(f.name)}</h3><div class="small" style="color:rgba(255,255,255,.75)">Leader: ${esc(f.table[0][0])} · ${f.table[0][4]} pts · Next matchday ${dayLabel(f.fixtures[0].d).toLowerCase()}</div></div></a>
    <section class="sec"><h2 class="h2" style="margin-bottom:10px">All leagues</h2></section>
    ${D.leagues.map(l => `<a class="lg-row" href="#league/${l.id}"><div class="th" ${bg(l.img)}></div><div class="grow"><div class="h3">${esc(l.name)}</div><div class="small mut">${esc(l.sport)} · ${esc(l.season)} · ${l.table.length} teams</div></div>${S.follow.includes(l.id) ? '<span class="tag ok">Following</span>' : ic("chev").replace('class=""', 'style="width:16px;height:16px;color:var(--dim)"')}</a>`).join("")}
    <section class="sec"><div class="card" style="padding:14px"><div class="h3">Run a league or tournament?</div><p class="small mut" style="margin:4px 0 10px">Organizers get their own section to post fixtures, enter results and update tables for any sport.</p><button class="btn btn-teal btn-block" data-act="organizer">Become an organizer</button></div></section>`;
  };

  R.league = id => {
    const l = lg(id); if (!l) return R.leagues();
    const tab = lgTab[id] || "table";
    const fol = S.follow.includes(id);
    const body = tab === "table"
      ? `<div class="card" style="padding:4px 10px"><table class="tbl"><thead><tr><th>#</th><th>Team</th>${l.cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${l.table.map((r, i) => `<tr class="${i < 2 ? "lead-row" : ""}"><td>${i + 1}</td><td>${esc(r[0])}</td>${r.slice(1).map((v, j) => `<td class="${j === r.length - 2 ? "pts" : ""}">${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
      : tab === "fixtures"
        ? `<div class="card" style="padding:2px 14px">${l.fixtures.map(f => `<div class="fx"><span class="h">${esc(f.h)}</span><span class="mid"><b>${f.t.replace(" ", "")}</b><small>${dayLabel(f.d)}</small></span><span>${esc(f.a)}</span></div>`).join("")}</div>`
        : `<div class="card" style="padding:2px 14px">${l.results.map(f => `<div class="fx"><span class="h">${esc(f.h)}</span><span class="mid"><b>${f.hs} – ${f.as}</b><small>${dayLabel(f.d)} · FT</small></span><span>${esc(f.a)}</span></div>`).join("")}</div>`;
    const evs = D.events.filter(e => e.league === id);
    return `
    <div class="hero" ${bg(l.img)} style="height:220px">${back("#leagues", "Leagues")}<div class="hb"><span class="tag">${esc(l.sport)} · ${esc(l.season)}</span><h1>${esc(l.name)}</h1></div></div>
    <div class="sec" style="padding-top:14px"><div class="row"><div class="grow small mut">Organized by ${esc(l.organizer)}</div><button class="btn ${fol ? "btn-ghost" : "btn-teal"}" data-act="follow" data-id="${id}" style="min-height:38px;font-size:13.5px">${fol ? "Following ✓" : "Follow"}</button></div></div>
    <div class="tabs-in" role="tablist">${[["table", "Table"], ["fixtures", "Fixtures"], ["results", "Results"]].map(([k, t]) => `<button role="tab" aria-selected="${tab === k}" data-act="lgtab" data-id="${id}" data-k="${k}">${t}</button>`).join("")}</div>
    <section class="sec" style="padding-top:14px">${body}</section>
    ${evs.length ? `<section class="sec"><h2 class="h2" style="margin-bottom:10px">Next event</h2></section>${evs.map(evRow).join("")}` : ""}`;
  };

  R.rewards = () => {
    const board = D.leaderboard.map(x => x.name === "YOU" ? { name: S.name, qp: S.week, me: true } : x).sort((a, b) => b.qp - a.qp);
    return `
    <div class="hello"><p>Spend and climb</p><h1>Rewards</h1></div>
    <section class="sec" style="padding-top:12px"><div class="league-card"><div class="row"><div class="league-badge">G</div><div class="grow"><div class="h3">Gold league · Week 48</div><div class="small mut">Top 3 move up to Diamond. Resets Monday.</div></div><span class="tag gold">#${weeklyPos()}</span></div>
      <table class="tbl" style="margin-top:8px"><tbody>${board.map((x, i) => `<tr class="${x.me ? "me" : ""}"><td>${i + 1}</td><td>${esc(x.name)}${x.me ? " (you)" : ""}</td><td class="pts">${x.qp} QP</td></tr>`).join("")}</tbody></table></div></section>

    <section class="sec"><div class="sec-h"><h2 class="h2">Reward Vault</h2><span class="small mut">Balance <b style="color:var(--gold-strong)">${S.balance.toLocaleString()} QP</b></span></div>
      <div class="hscroll">${D.vault.map(v => { const got = S.redeemed.includes(v.id), can = S.balance >= v.qp; return `<div class="vault-card"><div class="img" ${bg(v.img)}></div><div class="b"><div class="h3" style="font-size:14px">${esc(v.name)}</div><div class="small mut">${esc(v.note)}</div><div class="cost">${ic("star")}${v.qp.toLocaleString()} QP</div><button class="btn ${got ? "btn-ghost" : can ? "btn-gold" : "btn-ghost"}" data-act="redeem" data-id="${v.id}" ${got ? "disabled" : ""}>${got ? "Redeemed ✓" : can ? "Redeem" : (v.qp - S.balance).toLocaleString() + " QP to go"}</button></div></div>`; }).join("")}</div></section>

    <section class="sec"><div class="sec-h"><h2 class="h2">CSQ Store</h2><div class="ccy" role="group" aria-label="Currency">${["JMD", "USD"].map(c => `<button data-act="ccy" data-c="${c}" aria-pressed="${S.ccy === c}">${c}</button>`).join("")}</div></div>
      <div class="prod-grid">${D.merch.map(m => `<button class="prod" data-act="product" data-id="${m.id}"><div class="img" ${bg(m.img)}><span class="tag">CSQ</span></div><div class="b"><div class="nm">${esc(m.name)}</div><div class="pr">${money(null, m.usd)}<small>${other(null, m.usd)}</small></div></div></button>`).join("")}</div></section>

    <section class="sec"><div class="sec-h"><h2 class="h2">From partner stores</h2><button class="link" data-act="becomepartner">Become a partner</button></div>
      <p class="small mut" style="margin:-4px 0 10px">Reserve online, pay and collect in store.</p>
      <div class="prod-grid">${D.partnerItems.map(p => { const st = D.partners.find(x => x.id === p.partner); const r = S.reserved.includes(p.id); return `<button class="prod" data-act="reserve" data-id="${p.id}"><div class="img" ${bg(p.img)}><span class="tag gold">${r ? "Reserved ✓" : "Reserve"}</span></div><div class="b"><div class="nm">${esc(p.name)}</div><div class="small mut ell">${esc(st.name)}</div><div class="pr">${money(p.jmd)}</div></div></button>`; }).join("")}</div></section>`;
  };

  R.me = () => {
    const { r, n } = rankOf(S.lifetime);
    const pct = n ? Math.round((S.lifetime - r.min) / (n.min - r.min) * 100) : 100;
    const badges = [
      ["First check-in", "check", true], ["7-day streak", "fire", true], ["Ticket holder", "ticket", S.tickets.length > 0],
      ["Quiz whiz", "bolt", !!S.quizDay], ["Island hopper", "globe", S.going.some(id => ev(id) && ev(id).island !== "Jamaica")],
      ["Locker voice", "chat", S.myPosts.length > 0], ["Collector", "gift", S.redeemed.length > 0], ["Legend", "medal", S.lifetime >= 1500]
    ];
    return `
    <div class="prof"><div class="avatar">${initials(S.name)}</div><div class="grow"><h2>${esc(S.name)}</h2><div class="small" style="color:rgba(255,255,255,.75)">@${esc(S.handle)} · ${esc(S.parish)}</div>
      <div class="small" style="margin-top:6px"><span class="tag gold">${r.name}</span></div></div>
      <button class="icon-btn" data-act="editprofile" aria-label="Edit profile" style="color:#fff">${ic("user")}</button></div>
    <div class="stats3"><div><b>${S.lifetime.toLocaleString()}</b><span>Lifetime QP</span></div><div><b>${S.streak}🔥</b><span>Day streak</span></div><div><b>${S.going.length}</b><span>Going</span></div></div>
    <section class="sec"><div class="card" style="padding:14px"><div class="row" style="justify-content:space-between"><span class="h3">${r.name}</span><span class="small mut">${n ? (n.min - S.lifetime).toLocaleString() + " QP to " + n.name : "Top rank"}</span></div><div class="bar" style="background:var(--teal-soft)"><i style="width:${pct}%"></i></div>
      <div class="small mut" style="margin-top:8px">Ranks: ${D.ranks.map(x => x.name === r.name ? `<b style="color:var(--ink)">${x.name}</b>` : x.name).join(" → ")}</div></div></section>

    <section class="sec"><div class="sec-h"><h2 class="h2">My tickets</h2><a class="link" href="#events/tickets">Buy tickets</a></div></section>
    ${S.tickets.length ? S.tickets.map(ticketHtml).join("") : `<p class="empty" style="padding-top:4px">No tickets yet. Your QR tickets will appear here.</p>`}

    <section class="sec"><div class="sec-h"><h2 class="h2">Quest code</h2></div><div class="card" style="padding:14px"><div class="code-box">${questCode}</div><p class="small mut" style="margin-top:8px;text-align:center">Show this to the organizer at the gate to check in and earn Quest Points.</p></div></section>

    <section class="sec"><h2 class="h2" style="margin-bottom:10px">Badges</h2><div class="badges">${badges.map(([t, i, on]) => `<div class="bdg ${on ? "" : "locked"}"><i>${ic(on ? i : "lock")}</i>${t}</div>`).join("")}</div></section>

    <section class="sec"><h2 class="h2" style="margin-bottom:10px">Recent points</h2><div class="card" style="padding:4px 14px">${S.activity.slice(0, 6).map(a => `<div class="act"><span class="grow">${esc(a.what)}<br><span class="small mut">${a.when}</span></span><b class="${a.qp < 0 ? "neg" : ""}">${a.qp > 0 ? "+" : ""}${a.qp} QP</b></div>`).join("")}</div></section>

    <section class="sec"><h2 class="h2" style="margin-bottom:10px">Alerts</h2><div class="list">
      ${[["events", "Events I'm going to"], ["leagues", "Leagues I follow"], ["rewards", "New rewards and drops"], ["opps", "Sports Opportunities"]].map(([k, t]) => `<div class="li"><span class="grow">${t}</span><button class="switch" role="switch" aria-checked="${S.alerts[k]}" aria-label="${t}" data-act="alert" data-k="${k}"></button></div>`).join("")}
    </div></section>

    <section class="sec"><div class="list">
      <button class="li" data-act="invite">${ic("share", "ic")}<span class="grow">Invite a friend · you both get 50 QP</span>${ic("chev", "chev")}</button>
      <a class="li" href="#opps">${ic("brief", "ic")}<span class="grow">Sports Opportunities</span>${ic("chev", "chev")}</a>
      <a class="li" href="#locker">${ic("chat", "ic")}<span class="grow">Locker Room</span>${ic("chev", "chev")}</a>
      <button class="li" data-act="reset">${ic("x", "ic")}<span class="grow">Reset this demo</span>${ic("chev", "chev")}</button>
    </div></section>`;
  };

  R.travel = sub => `
    ${back("#home", "Home")}
    <div class="hello" style="padding-top:8px"><p>Sports travel</p><h1>Stay near the action</h1></div>
    <div class="tabs-in" role="tablist">${[["stays", "Stays"], ["trails", "Trails"]].map(([k, t]) => `<a role="tab" href="#travel${k === "trails" ? "/trails" : ""}" aria-selected="${(sub || "stays") === k}" style="padding:10px 12px;font-weight:700;font-size:14px;border-bottom:2.5px solid ${(sub || "stays") === k ? "var(--gold)" : "transparent"};color:${(sub || "stays") === k ? "var(--ink)" : "var(--dim)"};margin-bottom:-1px">${t}</a>`).join("")}</div>
    ${sub === "trails"
      ? `<section class="sec"><div class="card">${D.trails.map(t => `<div class="trail"><div class="km">${t.km}<small>km</small></div><div class="grow"><div class="h3">${esc(t.name)}</div><div class="small mut">${esc(t.parish)} · ${t.type} · ${t.level}</div></div><button class="link" data-act="trail" data-n="${esc(t.name)}">Save</button></div>`).join("")}</div>
         <p class="small mut" style="margin-top:10px">Log a trail run or hike to earn Quest Points (coming in the full app).</p></section>`
      : `<section class="sec"><div style="display:grid;gap:12px">${D.stays.map(s => stayHtml(s, true)).join("")}</div>
         <p class="small mut" style="margin-top:10px">Stays and travel packages come from CSQ travel partners; you book on the partner's site.</p></section>`}`;

  R.opps = () => `
    ${back("#home", "Home")}
    <div class="hello" style="padding-top:8px"><p>Jobs, trials, scholarships and more</p><h1>Sports Opportunities</h1></div>
    <section class="sec" style="padding-top:14px"></section>
    ${D.opps.map(o => `<div class="opp"><div class="row"><span class="tag">${esc(o.type)}</span><span class="grow"></span><span class="small mut">${esc(o.pay)}</span></div><div class="h3" style="margin-top:8px">${esc(o.title)}</div><div class="small mut">${esc(o.org)} · ${esc(o.where)}</div><button class="btn btn-ghost btn-block" style="margin-top:10px;min-height:40px" data-act="apply" data-id="${o.id}">Apply / register</button></div>`).join("")}
    <section class="sec"><button class="btn btn-teal btn-block" data-act="postopp">Post an opportunity</button></section>`;

  const postHtml = p => { const liked = S.likes.includes(p.id); return `<div class="post"><div class="u"><span class="av">${initials(p.user)}</span><div class="grow"><b style="font-size:14px">${esc(p.user)}</b><div class="small mut">${p.ago} · ${esc(p.sport)}</div></div></div><p>${esc(p.text)}</p><div class="post-actions"><button data-act="like" data-id="${p.id}" aria-pressed="${liked}">${ic("heart")}${p.likes + (liked ? 1 : 0)}</button><button data-act="replyp">${ic("reply")}${p.replies}</button><button data-act="sharepost">${ic("share")}Share</button></div></div>`; };
  R.locker = () => `
    ${back("#home", "Home")}
    <div class="hello" style="padding-top:8px"><p>Fans, athletes and organizers</p><h1>Locker Room</h1></div>
    <form class="composer" id="composer"><label class="sr" for="postText">Write a post</label><input id="postText" placeholder="Hot take? Share it… (+${D.earn.post} QP)" maxlength="240"><button class="btn btn-cta" type="submit" style="min-height:46px">Post</button></form>
    <div style="padding:0 16px 12px"><div class="chips">${["For you", "Cricket", "Football", "Netball", "Rugby", "Domino"].map((c, i) => `<button class="chip" aria-pressed="${i === 0}" data-act="chipnoop">${c}</button>`).join("")}</div></div>
    ${[...S.myPosts, ...D.posts].map(postHtml).join("")}
    <div class="sec" style="padding-top:4px"><div class="card" style="padding:12px 14px;display:flex;gap:10px;align-items:center;border-style:dashed"><span class="tag">Sponsored</span><span class="small mut grow">Your brand here: Locker Room sponsor slot</span></div></div>`;

  R.pulse = id => {
    if (id) {
      const p = D.pulse.find(x => x.id === id); if (!p) return R.pulse();
      if (!S.pulseRead.includes(id)) { S.pulseRead.push(id); setTimeout(() => earn(D.earn.pulse, "Read the Weekly Pulse"), 600); save(); }
      return `${back("#pulse", "Weekly Pulse")}<article class="article"><div class="img" ${bg(p.img)}></div><span class="tag gold" style="margin-top:14px">${p.sport}</span><h1>${esc(p.title)}</h1><p class="small mut" style="margin-bottom:14px">CSQ Media · ${p.mins} min read</p>${p.body.map(b => `<p>${esc(b)}</p>`).join("")}</article>
        <section class="sec"><button class="btn btn-ghost btn-block" data-act="sharepost">${ic("share")}Share this story</button></section>`;
    }
    return `${back("#home", "Home")}<div class="hello" style="padding-top:8px"><p>Read and earn ${D.earn.pulse} QP per story</p><h1>Weekly Pulse</h1></div><section class="sec">${D.pulse.map(storyRow).join("")}</section>`;
  };

  /* ---------- sheets ---------- */
  const buySheet = id => {
    const e = ev(id); const qty = e.tiers.map((_, i) => i === 0 ? 1 : 0);
    const draw = () => {
      const tot = e.tiers.reduce((s, t, i) => s + t.jmd * qty[i], 0); const n = qty.reduce((a, b) => a + b, 0);
      openSheet(`<h2 id="sheetTitle">Get tickets</h2><p class="small mut">${esc(e.title)} · ${dayLabel(e.d)}, ${e.time}</p>
        <div style="margin-top:8px">${e.tiers.map((t, i) => `<div class="tier"><div class="grow"><div class="h3">${esc(t.name)}</div><div class="small mut">${money(t.jmd)} · ${other(t.jmd)}</div></div><div class="stepper"><button data-act="q-" data-i="${i}" aria-label="Fewer ${esc(t.name)}">−</button><b>${qty[i]}</b><button data-act="q+" data-i="${i}" aria-label="More ${esc(t.name)}">+</button></div></div>`).join("")}</div>
        <div style="margin-top:12px"><div class="sum"><span>Tickets (${n})</span><span>${jmd(tot)}</span></div><div class="sum"><span>Charged in USD</span><span>${usd(Math.round(tot / D.rate * 100) / 100)}</span></div><div class="sum total"><span>You earn</span><span style="color:var(--gold-strong)">+${D.earn.ticket} QP</span></div></div>
        <button class="btn btn-cta btn-block" data-act="pay" ${n ? "" : "disabled"} style="margin-top:12px">${ic("lock")}Pay ${usd(Math.round(tot / D.rate * 100) / 100)} (demo)</button>
        <p class="small mut" style="text-align:center;margin-top:8px">Demo checkout: no card is charged.</p>`);
    };
    sheetHandlers = act => {
      const i = +act.dataset.i;
      if (act.dataset.act === "q+") { qty[i] = Math.min(10, qty[i] + 1); draw(); }
      if (act.dataset.act === "q-") { qty[i] = Math.max(0, qty[i] - 1); draw(); }
      if (act.dataset.act === "pay") {
        e.tiers.forEach((t, i) => { if (qty[i]) S.tickets.unshift({ eventId: e.id, tier: t.name, qty: qty[i], code: code() }); });
        if (!S.going.includes(e.id)) S.going.push(e.id);
        save(); closeSheet(); earn(D.earn.ticket, "Bought tickets: " + e.title); render();
        openSheet(`<h2 id="sheetTitle">You're in! 🎉</h2><p class="mut">Tickets for <b>${esc(e.title)}</b> are saved in <b>Me → My tickets</b> with a QR code for the gate. A confirmation email is on its way.</p>${ticketHtml(S.tickets[0])}<a class="btn btn-teal btn-block" href="#me" data-act="close" style="margin-top:6px">View my tickets</a>`);
      }
    };
    draw();
  };

  const productSheet = id => {
    const m = D.merch.find(x => x.id === id); let size = "";
    const draw = () => openSheet(`<div style="height:200px;border-radius:14px;margin:4px 0 12px;background:#ccd url('${m.img}') center/cover"></div><h2 id="sheetTitle">${esc(m.name)}</h2><p><b style="color:var(--ink);font-size:18px">${money(null, m.usd)}</b> <span class="small mut">${other(null, m.usd)}</span></p>
      <p class="small mut" style="margin-top:10px">Size</p><div class="sizes">${m.sizes.map(s => `<button data-act="size" data-s="${s}" aria-pressed="${size === s}">${s}</button>`).join("")}</div>
      <button class="btn btn-cta btn-block" data-act="order" ${size ? "" : "disabled"}>${ic("cart")}${size ? "Buy now (demo)" : "Choose a size"}</button><p class="small mut" style="text-align:center;margin-top:8px">Fulfilled through the CSQ Shopify store.</p>`);
    sheetHandlers = act => {
      if (act.dataset.act === "size") { size = act.dataset.s; draw(); }
      if (act.dataset.act === "order") { S.orders.push({ id, size }); save(); closeSheet(); toast(`Order placed: ${m.name} (${size}). Demo only.`); }
    };
    draw();
  };

  const reserveSheet = id => {
    const p = D.partnerItems.find(x => x.id === id), st = D.partners.find(x => x.id === p.partner), r = S.reserved.includes(id);
    openSheet(`<h2 id="sheetTitle">${r ? "Reserved ✓" : "Reserve in store"}</h2><p><b>${esc(p.name)}</b> · ${money(p.jmd)} <span class="small mut">${other(p.jmd)}</span></p>
      <div class="store-box"><div class="store-logo">${initials(st.name)}</div><div><div class="h3">${esc(st.name)}</div><div class="small mut">${esc(st.addr)}</div><div class="small mut">${esc(st.phone)}</div></div></div>
      <p class="small mut">The store holds it for <b>${st.hold} days</b>. Pay and collect in store; delivery is coming once CSQ adds a delivery partner. You'll get a confirmation email.</p>
      ${r ? `<button class="btn btn-ghost btn-block" data-act="close" style="margin-top:12px">Done</button>` : `<button class="btn btn-cta btn-block" data-act="doreserve" style="margin-top:12px">Reserve for pickup</button>`}`);
    sheetHandlers = act => { if (act.dataset.act === "doreserve") { S.reserved.push(id); save(); closeSheet(); toast(`Reserved at ${st.name}. Held for ${st.hold} days.`); render(); } };
  };

  const formSheet = (title, sub, fields, btn, done) => {
    openSheet(`<h2 id="sheetTitle">${title}</h2><p class="small mut">${sub}</p><form id="sheetForm">${fields.map(f => `<div class="field"><label for="f-${f[0]}">${f[1]}</label>${f[2] === "textarea" ? `<textarea id="f-${f[0]}"></textarea>` : f[2] === "select" ? `<select id="f-${f[0]}">${f[3].map(o => `<option>${o}</option>`).join("")}</select>` : `<input id="f-${f[0]}" type="${f[2] || "text"}" value="${esc(f[3] || "")}">`}</div>`).join("")}<button class="btn btn-cta btn-block" type="submit" style="margin-top:6px">${btn}</button></form>`);
    $("#sheetForm").addEventListener("submit", ev => { ev.preventDefault(); const vals = {}; fields.forEach(f => vals[f[0]] = $("#f-" + f[0]).value.trim()); closeSheet(); done(vals); });
  };

  const bellSheet = () => {
    S.seenBell = true; save(); syncTop();
    openSheet(`<h2 id="sheetTitle">Notifications</h2>
      <div class="notif"><i>${ic("bolt")}</i><div><b>Kingston Night Netball is live</b><div class="small mut">Liguanea Blaze lead 31–27. Check in at the arena for ${D.earn.checkin} QP.</div></div></div>
      <div class="notif"><i>${ic("trophy")}</i><div><b>Domino league: Matchday 6 tomorrow</b><div class="small mut">Grants Pen Kings v Six-Love Crew, 7:00 PM.</div></div></div>
      <div class="notif"><i>${ic("gift")}</i><div><b>New in the Reward Vault</b><div class="small mut">VIP upgrade at Rugby Finals Day: 20 left.</div></div></div>
      <div class="notif"><i>${ic("brief")}</i><div><b>Event-day stewards wanted</b><div class="small mut">Rugby Sevens Series, UWI Mona. JMD 6,000 / day.</div></div></div>`);
  };

  /* ---------- actions ---------- */
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-act]"); if (!a) return;
    const act = a.dataset.act, id = a.dataset.id;
    if (act === "close") { closeSheet(); return; }
    if (a.closest("#sheet") && sheetHandlers && !["close"].includes(act)) { sheetHandlers(a); if (["q+", "q-", "pay", "size", "order", "doreserve"].includes(act)) return; }
    switch (act) {
      case "going": {
        const i = S.going.indexOf(id);
        if (i > -1) { S.going.splice(i, 1); toast("Removed from your plans"); }
        else { S.going.push(id); const first = !S.activity.some(x => x.what === "Going: " + ev(id).title); if (first) earn(D.earn.going, "Going: " + ev(id).title); toast("Added to your plans. We'll remind you."); }
        save(); render(true); break;
      }
      case "buy": buySheet(id); break;
      case "checkin": if (!S.checkins.includes(id)) { S.checkins.push(id); save(); earn(D.earn.checkin, "Checked in: " + ev(id).title); render(true); } break;
      case "share": case "sharepost": {
        const url = location.href;
        if (navigator.share) navigator.share({ title: "Caribbean Sports Quest", url }).catch(() => {});
        else { try { navigator.clipboard.writeText(url); } catch {} toast("Link copied"); }
        break;
      }
      case "ccy": S.ccy = a.dataset.c; save(); render(true); break;
      case "evsport": evFilter.sport = a.dataset.s; render(true); break;
      case "evwhen": evFilter.when = a.dataset.k; if (location.hash === "#events/tickets") { history.replaceState(null, "", "#events"); } render(true); break;
      case "quiz": {
        const qi = D.quiz[today.getDate() % D.quiz.length], i = +a.dataset.i;
        const btns = a.parentElement.querySelectorAll("button");
        btns.forEach((b, j) => { b.disabled = true; if (j === qi.c) b.classList.add("right"); });
        if (i === qi.c) { S.quizDay = today.toDateString(); save(); earn(D.earn.quiz, "Daily quiz: correct answer"); toast("Correct! Come back tomorrow for another."); }
        else { a.classList.add("wrong"); S.quizDay = today.toDateString(); save(); toast("Not this time. New question tomorrow."); }
        break;
      }
      case "lgtab": lgTab[id] = a.dataset.k; render(true); break;
      case "follow": { const i = S.follow.indexOf(id); if (i > -1) S.follow.splice(i, 1); else { S.follow.push(id); toast("Following. You'll get fixture and result alerts."); } save(); render(true); break; }
      case "redeem": {
        const v = D.vault.find(x => x.id === id);
        if (S.balance < v.qp) { toast(`You need ${(v.qp - S.balance).toLocaleString()} more QP for this one.`); break; }
        openSheet(`<h2 id="sheetTitle">Redeem reward?</h2><p class="mut"><b>${esc(v.name)}</b> for <b style="color:var(--gold-strong)">${v.qp.toLocaleString()} QP</b>. Your balance after: ${(S.balance - v.qp).toLocaleString()} QP.</p><button class="btn btn-gold btn-block" data-act="confirmredeem" data-id="${id}" style="margin-top:14px">Redeem now</button>`);
        sheetHandlers = null; break;
      }
      case "confirmredeem": {
        const v = D.vault.find(x => x.id === id); S.balance -= v.qp; S.redeemed.push(id); S.activity.unshift({ what: "Redeemed: " + v.name, qp: -v.qp, when: "Just now" }); save(); syncTop(); closeSheet(); render(true);
        openSheet(`<h2 id="sheetTitle">Redeemed 🎁</h2><p class="mut">Your code for <b>${esc(v.name)}</b>:</p><div class="code-box" style="margin:12px 0">${code()}</div><p class="small mut">Also sent to your email. Show it at checkout or at the gate.</p>`); break;
      }
      case "product": productSheet(id); break;
      case "reserve": reserveSheet(id); break;
      case "becomepartner": formSheet("Become a partner store", "List your items on CSQ. Fans reserve online and collect in store; CSQ invoices a 10% commission monthly.", [["store", "Store name"], ["contact", "Contact name"], ["phone", "Phone", "tel"], ["addr", "Store address"], ["hold", "How long can you hold items?", "select", ["3 days", "4 days", "5 days"]]], "Send application", () => toast("Application sent. The CSQ team will be in touch.")); break;
      case "organizer": formSheet("Become an organizer", "Get an organizer section to run your league or tournament on CSQ.", [["org", "League or organization"], ["sport", "Sport", "select", D.sports.slice(1)], ["email", "Email", "email"]], "Request access", () => toast("Request sent. You'll hear back within 48 hours.")); break;
      case "listevent": formSheet("List your event", "Free to list. Approved events appear on the calendar and ticket pages.", [["name", "Event name"], ["sport", "Sport", "select", D.sports.slice(1)], ["date", "Date", "date"], ["venue", "Venue"], ["tickets", "Selling tickets?", "select", ["Yes, on CSQ", "Free entry", "Tickets elsewhere"]]], "Submit for review", () => toast("Submitted for review. Thanks!")); break;
      case "apply": { const o = D.opps.find(x => x.id === id); formSheet(o.title, o.org + " · " + o.where, [["name", "Full name", "text", S.name], ["phone", "Phone", "tel"], ["note", "Tell them about yourself", "textarea"]], "Send application", () => toast("Application sent to " + o.org)); break; }
      case "postopp": formSheet("Post an opportunity", "Jobs, event-day work, trials, scholarships, coaching or officiating.", [["title", "Title"], ["type", "Type", "select", ["Job", "Event-day work", "Volunteering", "Internship", "Trials", "Scholarship", "Coaching", "Officiating"]], ["where", "Location"]], "Submit for review", () => toast("Submitted. It goes live once approved.")); break;
      case "stay": { const s = D.stays.find(x => x.id === id); formSheet(s.name, s.near + " · " + money(s.jmd) + " /night", [["in", "Check-in", "date"], ["out", "Check-out", "date"], ["guests", "Guests", "select", ["1", "2", "3", "4"]]], "Check availability", () => toast("Opening the partner's booking page… (demo)")); break; }
      case "trail": toast("Saved: " + a.dataset.n); break;
      case "like": { const n = +id, i = S.likes.indexOf(n); if (i > -1) S.likes.splice(i, 1); else S.likes.push(n); save(); render(true); break; }
      case "replyp": toast("Replies open in the full app"); break;
      case "chipnoop": a.parentElement.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c === a)); break;
      case "alert": S.alerts[a.dataset.k] = !S.alerts[a.dataset.k]; a.setAttribute("aria-checked", S.alerts[a.dataset.k]); save(); break;
      case "editprofile": formSheet("Edit profile", "How other fans see you.", [["name", "Display name", "text", S.name], ["handle", "Username", "text", S.handle], ["parish", "Parish / city", "text", S.parish]], "Save", v => { if (v.name) S.name = v.name; if (v.handle) S.handle = v.handle.replace(/[^a-z0-9_]/gi, "").toLowerCase() || S.handle; if (v.parish) S.parish = v.parish; save(); render(true); toast("Profile saved"); }); break;
      case "invite": { const link = "https://caribbeansportsquest.com/join?ref=" + S.handle; try { navigator.clipboard.writeText(link); } catch {} toast("Invite link copied"); break; }
      case "reset": S = fresh(); save(); syncTop(); toast("Demo reset"); location.hash = "#home"; render(); break;
    }
  });

  document.addEventListener("input", e => {
    if (e.target.id === "evSearch") { evFilter.q = e.target.value; const pos = e.target.selectionStart; render(true); const s = $("#evSearch"); s.focus(); s.setSelectionRange(pos, pos); }
  });
  document.addEventListener("submit", e => {
    if (e.target.id === "composer") {
      e.preventDefault(); const t = $("#postText").value.trim(); if (!t) return;
      S.myPosts.unshift({ id: Date.now(), user: S.name, sport: "Fan", text: t, likes: 0, replies: 0, ago: "now" }); save();
      earn(D.earn.post, "Posted in the Locker Room"); render(true);
    }
  });
  $("#bellBtn").addEventListener("click", bellSheet);

  /* ---------- live score tick ---------- */
  setInterval(() => {
    const live = D.events.find(e => e.live && e.d === 0); if (!live) return;
    if (Math.random() < .5) live.live.hs += Math.random() < .5 ? 1 : 0; else live.live.as += Math.random() < .45 ? 1 : 0;
    const [q, t] = live.live.clock.split(" · "); let [m, s] = t.split(":").map(Number); s -= 20; if (s < 0) { s += 60; m--; } if (m < 0) m = 14;
    live.live.clock = q + " · " + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    const ls = $("#liveScore"), cl = $("#clock"); if (ls) ls.textContent = live.live.hs + " – " + live.live.as; if (cl) cl.textContent = live.live.clock;
  }, 6000);

  /* ---------- router ---------- */
  const tabFor = { home: "home", events: "events", event: "events", leagues: "leagues", league: "leagues", rewards: "rewards", me: "me", travel: "home", opps: "home", locker: "home", pulse: "home" };
  function render(keepScroll) {
    const [route, arg] = (location.hash.slice(1) || "home").split("/");
    const fn = R[route] || R.home;
    const y = view.scrollTop;
    view.innerHTML = fn(arg);
    view.scrollTop = keepScroll ? y : 0;
    document.querySelectorAll(".tabs a").forEach(t => { if (t.dataset.tab === (tabFor[route] || "home")) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current"); });
    if (!keepScroll) view.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", () => { if (!sheet.hidden) closeSheet(); render(); });
  syncTop(); render();
})();

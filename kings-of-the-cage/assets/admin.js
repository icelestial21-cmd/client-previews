/* Kings of the Cage admin page preview (iCelestial). Everything is stored in this browser only. */
(function () {
  "use strict";
  var KEY = "koc-admin-v1", INBOX = "koc-inbox", SITE = "koc-site";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var uid = function (p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var U = function (id, w) { return "https://images.unsplash.com/" + id + "?w=" + (w || 600) + "&q=65&auto=format&fit=crop"; };

  var ICON = {
    today: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    teams: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14.5 14.2c3 .1 5.5 2.4 5.5 5.8"/>',
    sponsors: '<path d="M3 18 2 7l5.5 4L12 4l4.5 7L22 7l-1 11Z"/><path d="M3 21h18"/>',
    inbox: '<path d="M4 4h16v12H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
    site: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
    editions: '<path d="M8 4h8v4a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3M12 12v4M8 20h8M10 16h4v4h-4z"/>',
    gallery: '<rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 17-5-5-8 8"/>',
    community: '<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z"/>',
    announce: '<path d="M4 10v4l11 5V5L4 10Zm11-1a4 4 0 0 1 0 6M7 15l1 5h2l-1-4"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01"/>'
  };
  var svg = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + "</svg>"; };
  var MENU = [["Season", [["today", "Today"], ["teams", "Teams"], ["sponsors", "Sponsors"], ["inbox", "Messages"]]],
              ["Website", [["editions", "Editions & results"], ["gallery", "Gallery"], ["community", "Community events"], ["announce", "Announcement bar"]]],
              ["", [["help", "Help"]]]];
  var TITLES = { today: "Today", teams: "Teams", sponsors: "Sponsors", inbox: "Messages", site: "Website", editions: "Editions & results", gallery: "Gallery", community: "Community events", announce: "Announcement bar", help: "Help" };
  var SITE_VIEWS = ["site", "editions", "gallery", "community", "announce"];

  var LINES = ["Title sponsor", "Cash prize", "Trophies & Championship Rings", "Advertising", "Entertainment, live stream, DJ & sound", "Tables, chairs & Port-A-Cool", "Support staff", "Officials", "Videographer & camera crew", "Equipment: custom balls & nets", "Presentation", "Clothing & apparel", "Transport", "Accommodation"];
  var TSTAT = { "new": ["New", "new"], confirmed: ["Confirmed", "ok"], waitlist: ["Waitlist", "warn"], withdrawn: ["Withdrawn", "bad"] };
  var SSTAT = { "new": ["New", "new"], talks: ["In talks", "warn"], proposal: ["Proposal sent", "blue"], signed: ["Signed", "ok"], declined: ["Declined", "bad"] };
  var ABOUT = { host: "Hosting an edition", queens: "Queens of the Cage", community: "Community event", press: "Press" };
  var HEARD = { ig: "Instagram", tt: "TikTok", friend: "A friend", other: "Other" };

  function d(n) { var x = new Date(); x.setDate(x.getDate() - n); return x.toISOString(); }
  function seed() {
    return {
      cap: 24,
      teams: [
        { id: "t1", team: "Sample Team A", parish: "Kingston", type: "Community team", players: ["Player One", "Player Two", "Player Three", "Player Four", "Player Five", ""], cname: "Player One", cphone: "+1 876 555 0101", cmail: "captain.a@example.com", heard: "ig", status: "new", fee: false, date: d(0), sample: true },
        { id: "t2", team: "Sample Team B", parish: "St. James", type: "Club side", players: ["Player One", "Player Two", "Player Three", "Player Four", "Player Five", "Player Six"], cname: "Player One", cphone: "+1 876 555 0102", cmail: "captain.b@example.com", heard: "tt", status: "new", fee: false, date: d(1), sample: true },
        { id: "t3", team: "Sample Team C", parish: "St. Catherine", type: "School alumni", players: ["Player One", "Player Two", "Player Three", "Player Four", "", ""], cname: "Player One", cphone: "+1 876 555 0103", cmail: "captain.c@example.com", heard: "friend", status: "confirmed", fee: true, date: d(3), sample: true },
        { id: "t4", team: "Sample Team D", parish: "Manchester", type: "Corporate team", players: ["Player One", "Player Two", "Player Three", "Player Four", "Player Five", ""], cname: "Player One", cphone: "+1 876 555 0104", cmail: "captain.d@example.com", heard: "ig", status: "confirmed", fee: false, date: d(4), sample: true },
        { id: "t5", team: "Sample Team E", parish: "St. Ann", type: "Friends", players: ["Player One", "Player Two", "Player Three", "Player Four", "", ""], cname: "Player One", cphone: "+1 876 555 0105", cmail: "captain.e@example.com", heard: "other", status: "waitlist", fee: false, date: d(6), sample: true }
      ],
      sponsors: [
        { id: "s1", name: "Contact name", co: "Sample Brand One", mail: "partners@example.com", phone: "+1 876 555 0201", lines: ["Title sponsor", "Cash prize"], msg: "Interested in the title package for the Jamaica edition. Please send the proposal.", status: "new", notes: "", date: d(0), sample: true },
        { id: "s2", name: "Contact name", co: "Sample Brand Two", mail: "marketing@example.com", phone: "+1 876 555 0202", lines: ["Entertainment, live stream, DJ & sound", "Videographer & camera crew"], msg: "We'd like to cover the live stream.", status: "talks", notes: "Call booked for Thursday.", date: d(2), sample: true },
        { id: "s3", name: "Contact name", co: "Sample Brand Three", mail: "hello@example.com", phone: "", lines: ["Clothing & apparel"], msg: "Jerseys for all teams?", status: "signed", notes: "Signed. Logo files to come.", date: d(5), sample: true }
      ],
      msgs: [
        { id: "m1", name: "Sample contact", mail: "venue@example.com", about: "host", city: "Montego Bay, Jamaica", msg: "We have an indoor court and would love to host a one-day edition.", status: "new", date: d(1), sample: true },
        { id: "m2", name: "Sample reporter", mail: "sports@example.com", about: "press", city: "Kingston, Jamaica", msg: "Looking to feature Kings of the Cage ahead of the Jamaica edition.", status: "done", date: d(4), sample: true }
      ],
      editions: [
        { id: "e1", year: "2020", name: "KOC I · The first edition", dates: "31 Jul – 30 Aug", venue: "Maloney Outdoor Court", teams: "", prize: "TTD 20K cash & prizes", winner: "No final (COVID-19)", note: "Endorsed by Kenwyne Jones, Lyrikal Voice, Bunji Garlin and Fayann Lyons-Alvarez; back page of the Sunday Newsday.", show: true },
        { id: "e2", year: "2022", name: "KOC II · The restart", dates: "", venue: "Maloney Indoor Sporting Arena", teams: "16", prize: "TTD 25K", winner: "", note: "Live stream reached America, England and Asia; five features on TTT sports.", show: true },
        { id: "e3", year: "2023", name: "KOC III · Fifty grand", dates: "14 Jul – 20 Aug", venue: "", teams: "17", prize: "TTD 50K", winner: "Jesus Youths (Jonestown, Arima)", note: "Kids' nights; stream reached four continents.", show: true },
        { id: "e4", year: "2023", name: "Kings of the Cage Tobago", dates: "16–17 Dec", venue: "Shaw Park, Tobago", teams: "4", prize: "TTD 20K", winner: "Ricochae", note: "Christmas Ball on 22 Dec: 6 teams, TTD 10K, won by 1 Law.", show: true },
        { id: "e5", year: "2024", name: "KOC IV · The Cage arrives", dates: "19 Jul – 25 Aug", venue: "", teams: "18", prize: "TTD 50K + Championship Rings", winner: "Squad Elite (Maloney Gardens)", note: "1,200+ at the finals; first rings in T&T sport.", show: true },
        { id: "e6", year: "2025", name: "KOC V · The Milestone", dates: "4 Jul – 17 Aug", venue: "", teams: "", prize: "", winner: "", note: "1,300+ at the finals; first All Star Night; 1.5M IG views in six weeks.", show: true },
        { id: "e7", year: "2025", name: "Kings of the Cage New York", dates: "29 Nov", venue: "Gary Owens Community Center, Brooklyn", teams: "8", prize: "USD 6.5K", winner: "", note: "Thanksgiving weekend, largest indoor turf in NYC.", show: true },
        { id: "e8", year: "2026", name: "KOC VI · The three-peat", dates: "10 Jul – 30 Aug", venue: "", teams: "22", prize: "", winner: "Squad Elite (3-peat)", note: "32 teams applied for 22 spots; Hennessy All Star Night, Gatorade hydration.", show: true },
        { id: "e9", year: "2026", name: "Kings of the Cage New York II", dates: "21 Nov", venue: "Gary Owens Community Center, Brooklyn", teams: "", prize: "", winner: "", note: "Add the winner and numbers after the final.", show: true }
      ],
      gallery: {
        e8: [{ src: U("photo-1710788901525-c481abf1487c"), cap: "Placeholder · Finals Night" }, { src: U("photo-1768405031181-33bb016e2fbb"), cap: "Placeholder · Walkout" }, { src: U("photo-1508782478-2164581d40cd"), cap: "Placeholder · The crowd" }],
        e5: [{ src: U("photo-1710788605559-0a16daae12b4"), cap: "Placeholder · The cage" }, { src: U("photo-1509077613385-f89402467146"), cap: "Placeholder · Court" }]
      },
      events: [
        { id: "v1", cat: "Netball · One day", title: "Queens of the Cage", text: "The netball sister event: one day, all the Kings of the Cage energy, and a TTD 10,000 prize.", show: true },
        { id: "v2", cat: "Fitness", title: "5K Walk & Run", text: "International Women's Day: a community 5K walk and run.", show: true },
        { id: "v3", cat: "Fitness", title: "5K Walk & Run", text: "Breast Cancer Awareness: walking and running together for the cause.", show: true },
        { id: "v4", cat: "Fitness", title: "Shape Up Yourself", text: "Open-air aerobics with water and paint.", show: true },
        { id: "v5", cat: "Fitness", title: "Surviving the Cage", text: "An aerobics burnout session for just $1 entry.", show: true },
        { id: "v6", cat: "Giving back", title: "Christmas party", text: "A Christmas party that catered for 600 children.", show: true },
        { id: "v7", cat: "Outdoors", title: "Hikes & trails", text: "Group hikes and trail days for the community.", show: true },
        { id: "v8", cat: "Giving back", title: "Food drive", text: "A food drive in the community of Maloney Gardens.", show: true }
      ],
      ann: { show: true, title: "Kings of the Cage Jamaica", detail: "One day · venue to be announced", date: "", when: "Mar / Apr 2027", link: "Register a team", href: "jamaica.html#register" },
      seen: []
    };
  }

  var S;
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; } if (!S || !S.teams) S = seed(); pullInbox(); }
  function save(quiet) {
    try { localStorage.setItem(KEY, JSON.stringify(S)); localStorage.setItem(SITE, JSON.stringify({ ann: S.ann })); }
    catch (e) { toast("This device is out of space. Remove a few photos and try again."); return; }
    var el = $("#saved"); el.style.opacity = .4; setTimeout(function () { el.style.opacity = 1; }, 250);
    if (!quiet) badges();
  }
  function pullInbox() {
    var box; try { box = JSON.parse(localStorage.getItem(INBOX)) || []; } catch (e) { box = []; }
    S.seen = S.seen || [];
    box.forEach(function (x) {
      if (S.seen.indexOf(x.id) > -1) return; S.seen.push(x.id);
      var f = x.f || {};
      if (x.type === "team") S.teams.unshift({ id: x.id, team: f.team || "New team", parish: f.parish || "", type: f.level || "", players: [f.p1, f.p2, f.p3, f.p4, f.p5, f.p6].map(function (p) { return p || ""; }), cname: f.cname || "", cphone: f.cphone || "", cmail: f.cmail || "", heard: f.heard || "", status: "new", fee: false, date: x.date, web: true });
      else if (x.type === "sponsor") S.sponsors.unshift({ id: x.id, name: f.sname || "", co: f.sco || "", mail: f.smail || "", phone: f.sphone || "", lines: (f.slines || "").split(", ").filter(Boolean), msg: f.smsg || "", status: "new", notes: "", date: x.date, web: true });
      else if (x.type === "host") S.msgs.unshift({ id: x.id, name: f.hname || "", mail: f.hmail || "", about: f.about || "host", city: f.hcity || "", msg: f.hmsg || "", status: "new", date: x.date, web: true });
    });
  }

  var toastT;
  function toast(t) { var el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove("on"); }, 2400); }
  function ago(iso) { var m = Math.round((Date.now() - new Date(iso)) / 6e4); if (m < 60) return m <= 1 ? "just now" : m + " min ago"; var h = Math.round(m / 60); if (h < 24) return h + "h ago"; var dd = Math.round(h / 24); return dd === 1 ? "yesterday" : dd + " days ago"; }
  function pill(map, k) { var p = map[k] || ["", ""]; return '<span class="pill ' + p[1] + '">' + p[0] + "</span>"; }
  function initials(s) { return esc((s || "?").replace(/^Sample\s+/i, "").split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase()); }
  function tag(x) { return x.sample ? '<span class="tag">Sample</span>' : x.web ? '<span class="tag">From website</span>' : ""; }
  function wa(phone, text) { var n = String(phone || "").replace(/\D/g, ""); if (n.length === 7) n = "1876" + n; if (n.length === 10) n = "1" + n; return "https://wa.me/" + n + "?text=" + encodeURIComponent(text); }
  function claimed() { var own = {}, talk = {}; S.sponsors.forEach(function (s) { s.lines.forEach(function (l) { if (s.status === "signed") own[l] = s.co; else if (s.status !== "declined" && !own[l]) talk[l] = (talk[l] || 0) + 1; }); }); return { own: own, talk: talk }; }

  /* ---------- navigation ---------- */
  function buildNav() {
    var h = "";
    MENU.forEach(function (g) {
      if (g[0]) h += '<p class="grp">' + g[0] + "</p>";
      g[1].forEach(function (it) { h += '<button data-go="' + it[0] + '" type="button">' + svg(it[0]) + "<span>" + esc(it[1]) + '</span><em class="bdg" data-badge="' + it[0] + '"></em></button>'; });
    });
    $("#menu").innerHTML = h;
    $("#tabbar").innerHTML = [["today", "Today"], ["teams", "Teams"], ["sponsors", "Sponsors"], ["site", "Website"], ["help", "Help"]].map(function (it) {
      return '<button data-go="' + it[0] + '" type="button">' + svg(it[0]) + "<span>" + it[1] + '</span><em class="bdg" data-badge="' + it[0] + '"></em></button>';
    }).join("");
    $("#quick").innerHTML = [["editions", "Editions & results", "Add the next edition and fill in winners."], ["gallery", "Gallery", "Upload photos for each edition."], ["community", "Community events", "Edit, hide or add events."], ["announce", "Announcement bar", "The gold countdown bar on every page."]].map(function (q) {
      return '<button class="qa" data-go="' + q[0] + '" type="button"><b>' + q[1] + "</b><span>" + q[2] + "</span></button>";
    }).join("");
  }
  var cur = "today";
  function go(v) {
    if (!$("#v-" + v)) v = "today";
    cur = v;
    $$(".view").forEach(function (s) { s.hidden = s.id !== "v-" + v; });
    $$(".menu [data-go]").forEach(function (b) { b.classList.toggle("on", b.dataset.go === v); });
    $$(".tabbar [data-go]").forEach(function (b) { b.classList.toggle("on", b.dataset.go === v || (b.dataset.go === "site" && SITE_VIEWS.indexOf(v) > -1) || (b.dataset.go === "today" && v === "inbox")); });
    $("#ttl").textContent = TITLES[v];
    $("#export").style.display = ["teams", "sponsors", "inbox"].indexOf(v) > -1 ? "" : "none";
    (R[v] || function () {})();
    window.scrollTo(0, 0);
    try { history.replaceState(null, "", "#" + v); } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]"); if (g) { e.preventDefault(); go(g.dataset.go); }
    if (e.target.closest("[data-close]") || e.target.id === "dr") closeDr();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDr(); });

  function badges() {
    var b = { today: 0, teams: S.teams.filter(function (t) { return t.status === "new"; }).length, sponsors: S.sponsors.filter(function (s) { return s.status === "new"; }).length, inbox: S.msgs.filter(function (m) { return m.status === "new"; }).length };
    b.today = b.teams + b.sponsors + b.inbox;
    $$("[data-badge]").forEach(function (el) { var k = el.dataset.badge; el.textContent = k === "today" ? "" : (b[k] || ""); });
  }

  /* ---------- views ---------- */
  var R = {};
  var tf = "all", sf = "all", mf = "all";
  R.today = function () {
    var h = new Date().getHours();
    $("#hello").textContent = (h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening") + ", Renaldo";
    var nNew = S.teams.filter(function (t) { return t.status === "new"; }).length;
    var conf = S.teams.filter(function (t) { return t.status === "confirmed"; }).length;
    var paid = S.teams.filter(function (t) { return t.fee && t.status !== "withdrawn"; }).length;
    var openS = S.sponsors.filter(function (s) { return ["new", "talks", "proposal"].indexOf(s.status) > -1; }).length;
    var c = claimed(), own = Object.keys(c.own).length;
    $("#today-sub").textContent = nNew ? nNew + " new team" + (nNew > 1 ? "s" : "") + " waiting for a reply. Here's where the season stands." : "You're all caught up. Here's where the season stands.";
    $("#stats").innerHTML =
      '<button class="stat" data-go="teams" type="button"><b>' + conf + " / " + S.cap + '</b><span>Teams confirmed</span><div class="bar"><i style="width:' + Math.min(100, conf / S.cap * 100) + '%"></i></div></button>' +
      '<button class="stat" data-go="teams" type="button"><b>' + paid + '</b><span>Fees paid</span></button>' +
      '<button class="stat" data-go="sponsors" type="button"><b>' + openS + '</b><span>Sponsor talks open</span></button>' +
      '<button class="stat" data-go="sponsors" type="button"><b>' + own + " / " + LINES.length + '</b><span>Budget lines claimed</span><div class="bar"><i style="width:' + (own / LINES.length * 100) + '%"></i></div></button>';
    var a = S.ann, days = a.date ? Math.round((new Date(a.date + "T00:00:00") - new Date(new Date().toDateString())) / 864e5) : null;
    $("#next").innerHTML = '<div><span class="k">Next event · announcement bar</span><h3>' + esc(a.title) + "</h3><p>" + esc([a.detail, a.when].filter(Boolean).join(" · ")) + ' · <a class="lnk" style="margin:0" data-go="announce">Change</a></p></div><div class="cd">' +
      (days == null ? "TBA<small>Date to be set</small>" : days > 0 ? days + "<small>days to go</small>" : days === 0 ? "Today<small>Game day</small>" : "Played<small>Point the bar at the next one</small>") + "</div>";
    var q = [];
    S.teams.forEach(function (t) { if (t.status === "new") q.push(['<span class="av">' + initials(t.team) + "</span>", t.team, "Team · " + t.parish + " · " + ago(t.date), "team", t.id, t.sample || t.web ? t : null]); });
    S.sponsors.forEach(function (s) { if (s.status === "new") q.push(['<span class="av s">' + initials(s.co) + "</span>", s.co, "Sponsor · " + s.lines.length + " line" + (s.lines.length === 1 ? "" : "s") + " · " + ago(s.date), "spon", s.id, s]); });
    S.msgs.forEach(function (m) { if (m.status === "new") q.push(['<span class="av m">' + initials(m.name) + "</span>", m.name, (ABOUT[m.about] || "Message") + " · " + ago(m.date), "msg", m.id, m]); });
    $("#t-queue").innerHTML = q.length ? q.map(function (r) { return '<button class="row" type="button" data-open="' + r[3] + '" data-id="' + r[4] + '">' + r[0] + '<span class="rt"><b>' + esc(r[1]) + (r[5] ? tag(r[5]) : "") + "</b><span>" + esc(r[2]) + '</span></span><span class="pill new">New</span></button>'; }).join("") : '<div class="empty">Nothing waiting. New registrations, sponsor enquiries and messages show up here.</div>';
    $("#t-lines").innerHTML = LINES.slice(0, 6).map(function (l) {
      var st = c.own[l] ? ['ok', "Claimed · " + c.own[l]] : c.talk[l] ? ["warn", c.talk[l] + " in talks"] : ["", "Open"];
      return '<div class="row" style="cursor:default"><span class="rt"><b>' + esc(l) + '</b></span><span class="pill ' + st[0] + '">' + esc(st[1]) + "</span></div>";
    }).join("");
  };

  R.teams = function () {
    var counts = { all: S.teams.length, "new": 0, confirmed: 0, paid: 0, waitlist: 0, withdrawn: 0 };
    S.teams.forEach(function (t) { counts[t.status]++; if (t.fee && t.status !== "withdrawn") counts.paid++; });
    $("#tchips").innerHTML = [["all", "All"], ["new", "New"], ["confirmed", "Confirmed"], ["paid", "Fee paid"], ["waitlist", "Waitlist"], ["withdrawn", "Withdrawn"]].map(function (c) {
      return '<button type="button" data-tf="' + c[0] + '" class="' + (tf === c[0] ? "on" : "") + '">' + c[1] + "<em>" + counts[c[0]] + "</em></button>";
    }).join("");
    var q = ($("#tq").value || "").toLowerCase();
    var list = S.teams.filter(function (t) {
      if (tf === "paid") { if (!t.fee || t.status === "withdrawn") return false; } else if (tf !== "all" && t.status !== tf) return false;
      return !q || (t.team + " " + t.cname + " " + t.parish).toLowerCase().indexOf(q) > -1;
    });
    $("#tlist").innerHTML = list.length ? list.map(function (t) {
      var n = t.players.filter(Boolean).length;
      return '<button class="row" type="button" data-open="team" data-id="' + t.id + '"><span class="av">' + initials(t.team) + '</span><span class="rt"><b>' + esc(t.team) + tag(t) + "</b><span>" + esc(t.parish) + " · " + n + " players · Captain " + esc(t.cname) + " · " + ago(t.date) + "</span></span>" + (t.fee ? '<span class="pill ok">Fee paid</span>' : "") + pill(TSTAT, t.status) + "</button>";
    }).join("") : '<div class="empty">No teams here yet.</div>';
  };
  $("#tchips").addEventListener("click", function (e) { var b = e.target.closest("[data-tf]"); if (b) { tf = b.dataset.tf; R.teams(); } });
  $("#tq").addEventListener("input", function () { R.teams(); });

  R.sponsors = function () {
    var counts = { all: S.sponsors.length }; Object.keys(SSTAT).forEach(function (k) { counts[k] = 0; }); S.sponsors.forEach(function (s) { counts[s.status]++; });
    $("#schips").innerHTML = [["all", "All"]].concat(Object.keys(SSTAT).map(function (k) { return [k, SSTAT[k][0]]; })).map(function (c) {
      return '<button type="button" data-sf="' + c[0] + '" class="' + (sf === c[0] ? "on" : "") + '">' + c[1] + "<em>" + counts[c[0]] + "</em></button>";
    }).join("");
    var list = S.sponsors.filter(function (s) { return sf === "all" || s.status === sf; });
    $("#slist").innerHTML = list.length ? list.map(function (s) {
      return '<button class="row" type="button" data-open="spon" data-id="' + s.id + '"><span class="av s">' + initials(s.co) + '</span><span class="rt"><b>' + esc(s.co) + tag(s) + "</b><span>" + esc(s.lines.join(", ") || "No lines ticked") + " · " + ago(s.date) + "</span></span>" + pill(SSTAT, s.status) + "</button>";
    }).join("") : '<div class="empty">No enquiries here yet.</div>';
    var c = claimed();
    $("#sboard").innerHTML = LINES.map(function (l) {
      var cls = c.own[l] ? "own" : c.talk[l] ? "talk" : "";
      return '<div class="ln ' + cls + '"><b>' + esc(l) + "</b><span>" + (c.own[l] ? "Claimed · " + esc(c.own[l]) : c.talk[l] ? c.talk[l] + " brand" + (c.talk[l] > 1 ? "s" : "") + " in talks" : "Open") + "</span></div>";
    }).join("");
  };
  $("#schips").addEventListener("click", function (e) { var b = e.target.closest("[data-sf]"); if (b) { sf = b.dataset.sf; R.sponsors(); } });

  R.inbox = function () {
    var n = S.msgs.filter(function (m) { return m.status === "new"; }).length;
    $("#mchips").innerHTML = [["all", "All", S.msgs.length], ["new", "To answer", n], ["done", "Answered", S.msgs.length - n]].map(function (c) {
      return '<button type="button" data-mf="' + c[0] + '" class="' + (mf === c[0] ? "on" : "") + '">' + c[1] + "<em>" + c[2] + "</em></button>";
    }).join("");
    var list = S.msgs.filter(function (m) { return mf === "all" || m.status === mf; });
    $("#mlist").innerHTML = list.length ? list.map(function (m) {
      return '<button class="row" type="button" data-open="msg" data-id="' + m.id + '"><span class="av m">' + initials(m.name) + '</span><span class="rt"><b>' + esc(m.name) + tag(m) + "</b><span>" + esc(ABOUT[m.about] || "Message") + " · " + esc(m.city) + " · " + ago(m.date) + "</span></span>" + (m.status === "new" ? '<span class="pill new">To answer</span>' : '<span class="pill ok">Answered</span>') + "</button>";
    }).join("") : '<div class="empty">No messages here.</div>';
  };
  $("#mchips").addEventListener("click", function (e) { var b = e.target.closest("[data-mf]"); if (b) { mf = b.dataset.mf; R.inbox(); } });

  R.site = function () {};
  R.editions = function () {
    $("#eds").innerHTML = S.editions.slice().reverse().map(function (e) {
      var bits = [e.dates, e.venue, e.teams ? e.teams + " teams" : "", e.prize, e.winner ? "Winner: " + e.winner : ""].filter(Boolean).join(" · ");
      return '<div class="ed ' + (e.show ? "" : "off") + '"><span class="yr">' + esc(e.year) + "</span><div><h4>" + esc(e.name) + "</h4><p>" + esc(bits || "Details to add") + '</p></div><div class="act"><label class="swl" title="Show on website"><span class="sw"><input type="checkbox" data-edshow="' + e.id + '"' + (e.show ? " checked" : "") + '><span></span></span></label><button class="btn light sm" type="button" data-open="ed" data-id="' + e.id + '">Edit</button></div></div>';
    }).join("");
  };
  $("#eds").addEventListener("change", function (e) { var id = e.target.dataset.edshow; if (!id) return; var x = find(S.editions, id); x.show = e.target.checked; save(); R.editions(); toast(x.show ? "Edition shown on The Story" : "Edition hidden from The Story"); });
  $("#add-ed").addEventListener("click", function () { var e = { id: uid("e"), year: String(new Date().getFullYear() + 1), name: "New edition", dates: "", venue: "", teams: "", prize: "", winner: "", note: "", show: false, fresh: true }; S.editions.push(e); openEd(e.id); });

  var gEd = null;
  R.gallery = function () {
    if (!gEd || !find(S.editions, gEd)) gEd = (S.editions[S.editions.length - 2] || S.editions[0]).id;
    $("#gtabs").innerHTML = S.editions.slice().reverse().map(function (e) {
      var n = (S.gallery[e.id] || []).length;
      return '<button type="button" role="tab" data-ge="' + e.id + '" class="' + (gEd === e.id ? "on" : "") + '">' + esc(e.year + " · " + e.name.split(" · ")[0]) + (n ? "<em> " + n + "</em>" : "") + "</button>";
    }).join("");
    var ed = find(S.editions, gEd), ph = S.gallery[gEd] || [];
    $("#drop-t").textContent = "Add photos to " + ed.name;
    $("#pgrid").innerHTML = ph.length ? ph.map(function (p, i) {
      return '<div class="ph">' + '<img src="' + esc(p.src) + '" alt="' + esc(p.cap) + '" loading="lazy" onerror="this.style.display=\'none\'">' + (i === 0 ? '<span class="cv pill new">Cover</span>' : "") +
        '<div class="tools">' + (i > 0 ? '<button type="button" data-pm="' + i + '" title="Move earlier" aria-label="Move earlier">←</button>' : "") + '<button type="button" data-pc="' + i + '" title="Edit caption" aria-label="Edit caption">✎</button><button type="button" data-pd="' + i + '" title="Remove" aria-label="Remove photo">✕</button></div><div class="cap">' + esc(p.cap || "No caption") + "</div></div>";
    }).join("") : '<div class="ph ph-empty">No photos for this edition yet.</div>';
  };
  $("#gtabs").addEventListener("click", function (e) { var b = e.target.closest("[data-ge]"); if (b) { gEd = b.dataset.ge; R.gallery(); } });
  $("#pgrid").addEventListener("click", function (e) {
    var arr = S.gallery[gEd] || [], b = e.target.closest("button"); if (!b) return;
    if (b.dataset.pm) { var i = +b.dataset.pm, t = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = t; }
    else if (b.dataset.pd) { if (!confirmIt("Remove this photo from the gallery?")) return; arr.splice(+b.dataset.pd, 1); toast("Photo removed"); }
    else if (b.dataset.pc) { var c = prompt("Caption", arr[+b.dataset.pc].cap || ""); if (c === null) return; arr[+b.dataset.pc].cap = c.slice(0, 60); }
    S.gallery[gEd] = arr; save(); R.gallery();
  });
  function confirmIt(msg) { return window.confirm(msg); }
  function addFiles(files) {
    files = Array.prototype.filter.call(files, function (f) { return /^image\//.test(f.type); });
    if (!files.length) return;
    var left = files.length;
    files.forEach(function (f) {
      var r = new FileReader();
      r.onload = function () {
        var im = new Image();
        im.onload = function () {
          var m = 900, w = im.width, h = im.height, k = Math.min(1, m / Math.max(w, h));
          var c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          (S.gallery[gEd] = S.gallery[gEd] || []).push({ src: c.toDataURL("image/jpeg", .72), cap: f.name.replace(/\.[^.]+$/, "").slice(0, 60) });
          if (--left === 0) { save(); R.gallery(); toast(files.length + " photo" + (files.length > 1 ? "s" : "") + " added"); }
        };
        im.src = r.result;
      };
      r.readAsDataURL(f);
    });
  }
  var drop = $("#drop");
  drop.addEventListener("click", function () { $("#file").click(); });
  drop.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#file").click(); } });
  $("#file").addEventListener("change", function () { addFiles(this.files); this.value = ""; });
  ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("over"); if (t === "drop") addFiles(e.dataTransfer.files); }); });

  R.community = function () {
    $("#evl").innerHTML = S.events.map(function (v) {
      return '<div class="sv ' + (v.show ? "" : "off") + '"><span class="rt" data-open="ev" data-id="' + v.id + '"><b>' + esc(v.title) + "</b><span>" + esc(v.cat) + " · " + esc(v.text) + '</span></span><label class="swl" title="Show on website"><span class="sw"><input type="checkbox" data-evshow="' + v.id + '"' + (v.show ? " checked" : "") + '><span></span></span></label><button class="btn light sm" type="button" data-open="ev" data-id="' + v.id + '">Edit</button></div>';
    }).join("");
  };
  $("#evl").addEventListener("change", function (e) { var id = e.target.dataset.evshow; if (!id) return; var x = find(S.events, id); x.show = e.target.checked; save(); R.community(); toast(x.show ? "Event shown on Community" : "Event hidden from Community"); });
  $("#add-ev").addEventListener("click", function () { var v = { id: uid("v"), cat: "Community", title: "New event", text: "", show: false, fresh: true }; S.events.unshift(v); openEv(v.id); });

  R.announce = function () {
    var a = S.ann;
    $("#a-show").checked = a.show; $("#a-title").value = a.title; $("#a-detail").value = a.detail; $("#a-date").value = a.date; $("#a-when").value = a.when; $("#a-link").value = a.link; $("#a-href").value = a.href;
    annPrev();
  };
  function countLabel(date) { if (!date) return "Date TBA"; var dd = Math.round((new Date(date + "T00:00:00") - new Date(new Date().toDateString())) / 864e5); return dd > 1 ? dd + " days to go" : dd === 1 ? "Tomorrow" : dd === 0 ? "Today" : "Played · results soon"; }
  function annPrev() {
    var a = S.ann;
    $("#ann-prev").innerHTML = '<div class="ann-bar ' + (a.show ? "" : "ann-off") + '"><span><b>' + esc(a.title) + "</b>" + (a.detail ? '<span class="hs"> · ' + esc(a.detail) + "</span>" : "") + (a.when ? " · " + esc(a.when) : "") + '</span><span class="c">' + esc(countLabel(a.date)) + "</span><u class=\"hs\">" + esc(a.link) + '</u></div><div class="ann-site">' + (a.show ? "Your website" : "The bar is hidden on your website") + "</div>";
  }
  ["a-title", "a-detail", "a-date", "a-when", "a-link", "a-href", "a-show"].forEach(function (id) {
    $("#" + id).addEventListener("input", function () {
      var k = id.slice(2); S.ann[k] = id === "a-show" ? this.checked : this.value; annPrev(); clearTimeout(this._t); this._t = setTimeout(function () { save(); }, 300);
    });
  });
  $$("[data-preset]").forEach(function (b) {
    b.addEventListener("click", function () {
      S.ann = b.dataset.preset === "ny" ? { show: true, title: "New York II", detail: "Gary Owens Community Center, Brooklyn", date: "2026-11-21", when: "Sat 21 Nov", link: "The story", href: "story.html" } : { show: true, title: "Kings of the Cage Jamaica", detail: "One day · venue to be announced", date: "", when: "Mar / Apr 2027", link: "Register a team", href: "jamaica.html#register" };
      save(); R.announce(); toast("Announcement bar updated");
    });
  });

  /* ---------- drawer ---------- */
  function find(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  var drClose = null;
  function openDr(title, pillHtml, body, foot, onClose) {
    $("#dr-t").textContent = title; $("#dr-pill").innerHTML = pillHtml || ""; $("#dr-body").innerHTML = body; $("#dr-foot").innerHTML = foot;
    $("#dr").hidden = false; drClose = onClose || null; document.body.style.overflow = "hidden";
    var f = $("#dr-body input, #dr-body select, #dr-body textarea"); if (f && window.innerWidth > 900) f.focus();
  }
  function closeDr() { if ($("#dr").hidden) return; $("#dr").hidden = true; document.body.style.overflow = ""; if (drClose) drClose(); drClose = null; go(cur); }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]"); if (!o) return;
    var id = o.dataset.id, t = o.dataset.open;
    if (t === "team") openTeam(id); else if (t === "spon") openSpon(id); else if (t === "msg") openMsg(id); else if (t === "ed") openEd(id); else if (t === "ev") openEv(id);
  });
  function seg(name, map, val) { return '<div class="seg">' + Object.keys(map).map(function (k) { return '<label><input type="radio" name="' + name + '" value="' + k + '"' + (k === val ? " checked" : "") + "><span>" + (map[k][0] || map[k]) + "</span></label>"; }).join("") + "</div>"; }
  function bindAll(obj, after) {
    $$("#dr-body [data-k]").forEach(function (el) {
      var ev = el.type === "checkbox" || el.type === "radio" || el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(ev, function () {
        var k = el.dataset.k, v = el.type === "checkbox" ? el.checked : el.value;
        if (/^p\d$/.test(k)) obj.players[+k[1]] = v; else obj[k] = v;
        save(true); if (after) after(k);
      });
    });
    $$('#dr-body input[type=radio]').forEach(function (el) { el.addEventListener("change", function () { obj[el.name] = el.value; save(true); if (after) after(el.name); }); });
  }

  function tmsg(t) {
    var c = (t.cname || "Captain").split(" ")[0];
    if (t.status === "confirmed") return "Hi " + c + ", " + t.team + " is confirmed for Kings of the Cage Jamaica! " + (t.fee ? "Your fee is received, thank you. " : "We'll send the registration fee details shortly. ") + "See you in the cage. - Kings of the Cage";
    if (t.status === "waitlist") return "Hi " + c + ", thanks for registering " + t.team + " for Kings of the Cage Jamaica. The field is full right now, so you're on the waitlist. We'll message you first if a spot opens. - Kings of the Cage";
    if (t.status === "withdrawn") return "Hi " + c + ", we've noted that " + t.team + " has withdrawn from Kings of the Cage Jamaica. Hope to see you at the next one. - Kings of the Cage";
    return "Hi " + c + ", thanks for registering " + t.team + " for Kings of the Cage Jamaica! We've got your roster. We'll confirm the date, venue and fee before any payment is taken. - Kings of the Cage";
  }
  function openTeam(id) {
    var t = find(S.teams, id);
    var players = t.players.map(function (p, i) { return '<div class="f" style="margin:0"><label for="tp' + i + '">' + (i === 0 ? "Player 1 (captain)" : "Player " + (i + 1)) + '</label><input id="tp' + i + '" data-k="p' + i + '" value="' + esc(p) + '" placeholder="' + (i > 3 ? "Substitute (optional)" : "Full name") + '"></div>'; }).join("");
    var body = '<div class="f"><span class="lb">Status</span>' + seg("status", TSTAT, t.status) + '</div>' +
      '<div class="f"><label class="swl"><span class="sw"><input type="checkbox" data-k="fee"' + (t.fee ? " checked" : "") + '><span></span></span>Registration fee paid</label></div>' +
      '<div class="kv"><span>Parish</span><span>' + esc(t.parish) + '</span><span>Team type</span><span>' + esc(t.type) + '</span><span>Captain</span><span>' + esc(t.cname) + '</span><span>WhatsApp</span><span>' + esc(t.cphone) + '</span><span>Email</span><span>' + esc(t.cmail) + '</span><span>Heard via</span><span>' + esc(HEARD[t.heard] || t.heard || "Not given") + '</span><span>Registered</span><span>' + new Date(t.date).toLocaleString() + "</span></div>" +
      '<h4 style="margin:0 0 8px">Roster</h4><div class="roster">' + players + '</div><p class="note">Names can change until the roster deadline.</p>' +
      '<h4 style="margin:16px 0 4px">WhatsApp message</h4><p class="note" style="margin:0">Changes with the status. Check it, then send.</p><div class="msgbox" id="tm">' + esc(tmsg(t)) + "</div>";
    openDr(t.team, pill(TSTAT, t.status), body,
      '<button class="btn danger sm" type="button" id="t-del" style="margin-right:auto">Delete</button><button class="btn light" type="button" data-close>Close</button><a class="btn" id="t-wa" target="_blank" rel="noopener" href="' + wa(t.cphone, tmsg(t)) + '">Message captain</a>');
    bindAll(t, function () { $("#dr-pill").innerHTML = pill(TSTAT, t.status); $("#tm").textContent = tmsg(t); $("#t-wa").href = wa(t.cphone, tmsg(t)); badges(); });
    $("#t-del").onclick = function () { if (!confirmIt("Delete " + t.team + "? This can't be undone.")) return; S.teams.splice(S.teams.indexOf(t), 1); save(); toast("Team deleted"); closeDr(); };
  }

  function openSpon(id) {
    var s = find(S.sponsors, id);
    var lines = '<div class="seg">' + LINES.map(function (l, i) { return '<label><input type="checkbox" data-line="' + i + '"' + (s.lines.indexOf(l) > -1 ? " checked" : "") + "><span>" + esc(l) + "</span></label>"; }).join("") + "</div>";
    var body = '<div class="f"><span class="lb">Status</span>' + seg("status", SSTAT, s.status) + '<span class="hint">When you mark it Signed, its lines show as claimed on the budget board.</span></div>' +
      '<div class="kv"><span>Company</span><span>' + esc(s.co) + '</span><span>Contact</span><span>' + esc(s.name) + '</span><span>Email</span><span>' + esc(s.mail) + '</span><span>Phone</span><span>' + esc(s.phone || "Not given") + '</span><span>Received</span><span>' + new Date(s.date).toLocaleString() + "</span></div>" +
      '<h4 style="margin:0 0 6px">Their message</h4><div class="msgbox">' + esc(s.msg || "No message") + "</div>" +
      '<div class="f"><span class="lb">Budget lines</span>' + lines + '</div><div class="f"><label for="s-notes">Your notes</label><textarea id="s-notes" data-k="notes" placeholder="Calls, amounts, next steps">' + esc(s.notes) + "</textarea></div>";
    var sub = "Kings of the Cage Jamaica: sponsorship (" + s.co + ")";
    var mail = "mailto:" + encodeURIComponent(s.mail) + "?subject=" + encodeURIComponent(sub) + "&body=" + encodeURIComponent("Hi " + (s.name || "there") + ",\n\nThank you for your interest in sponsoring Kings of the Cage Jamaica (" + s.lines.join(", ") + "). \n\n- Kings of the Cage");
    openDr(s.co, pill(SSTAT, s.status), body,
      '<button class="btn danger sm" type="button" id="s-del" style="margin-right:auto">Delete</button><button class="btn light" type="button" data-close>Close</button><a class="btn" href="' + mail + '">Reply by email</a>');
    bindAll(s, function () { $("#dr-pill").innerHTML = pill(SSTAT, s.status); badges(); });
    $$("[data-line]").forEach(function (el) { el.addEventListener("change", function () { s.lines = LINES.filter(function (l, i) { return $('[data-line="' + i + '"]').checked; }); save(true); }); });
    $("#s-del").onclick = function () { if (!confirmIt("Delete the enquiry from " + s.co + "?")) return; S.sponsors.splice(S.sponsors.indexOf(s), 1); save(); toast("Enquiry deleted"); closeDr(); };
  }

  function openMsg(id) {
    var m = find(S.msgs, id);
    var body = '<div class="kv"><span>From</span><span>' + esc(m.name) + '</span><span>Email</span><span>' + esc(m.mail) + '</span><span>About</span><span>' + esc(ABOUT[m.about] || m.about) + '</span><span>City / country</span><span>' + esc(m.city) + '</span><span>Received</span><span>' + new Date(m.date).toLocaleString() + "</span></div>" +
      '<div class="msgbox">' + esc(m.msg) + '</div><div class="f"><label class="swl"><span class="sw"><input type="checkbox" id="m-done"' + (m.status === "done" ? " checked" : "") + "><span></span></span>Answered</label></div>";
    var mail = "mailto:" + encodeURIComponent(m.mail) + "?subject=" + encodeURIComponent("Kings of the Cage: " + (ABOUT[m.about] || "your message")) + "&body=" + encodeURIComponent("Hi " + m.name.split(" ")[0] + ",\n\nThanks for getting in touch with Kings of the Cage.\n\n");
    openDr(m.name, m.status === "new" ? '<span class="pill new">To answer</span>' : '<span class="pill ok">Answered</span>', body,
      '<button class="btn danger sm" type="button" id="m-del" style="margin-right:auto">Delete</button><button class="btn light" type="button" data-close>Close</button><a class="btn" id="m-reply" href="' + mail + '">Reply by email</a>');
    $("#m-done").onchange = function () { m.status = this.checked ? "done" : "new"; save(); $("#dr-pill").innerHTML = m.status === "new" ? '<span class="pill new">To answer</span>' : '<span class="pill ok">Answered</span>'; };
    $("#m-reply").addEventListener("click", function () { m.status = "done"; save(); });
    $("#m-del").onclick = function () { if (!confirmIt("Delete this message?")) return; S.msgs.splice(S.msgs.indexOf(m), 1); save(); toast("Message deleted"); closeDr(); };
  }

  function field(id, label, k, val, opt) { opt = opt || {}; return '<div class="f"><label for="' + id + '">' + label + "</label>" + (opt.hint ? '<span class="hint">' + opt.hint + "</span>" : "") + (opt.area ? '<textarea id="' + id + '" data-k="' + k + '" maxlength="' + (opt.max || 300) + '">' + esc(val) + "</textarea>" : '<input id="' + id + '" data-k="' + k + '" value="' + esc(val) + '" maxlength="' + (opt.max || 80) + '"' + (opt.ph ? ' placeholder="' + opt.ph + '"' : "") + ">") + "</div>"; }
  function openEd(id) {
    var e = find(S.editions, id), fresh = e.fresh; delete e.fresh;
    var body = '<div class="r2">' + field("e-year", "Year", "year", e.year, { max: 4 }) + field("e-dates", "Dates", "dates", e.dates, { ph: "e.g. 10 Jul – 30 Aug" }) + "</div>" +
      field("e-name", "Edition name", "name", e.name, { max: 60 }) + field("e-venue", "Venue", "venue", e.venue) +
      '<div class="r2">' + field("e-teams", "Teams", "teams", e.teams, { max: 4 }) + field("e-prize", "Prize", "prize", e.prize, { ph: "e.g. TTD 50K" }) + "</div>" +
      field("e-winner", "Winner", "winner", e.winner, { hint: "Leave blank until Finals Night." }) + field("e-note", "Highlights", "note", e.note, { area: 1 }) +
      '<div class="f"><label class="swl"><span class="sw"><input type="checkbox" data-k="show"' + (e.show ? " checked" : "") + '><span></span></span>Show on The Story page</label></div>';
    openDr(fresh ? "New edition" : "Edit edition", "", body, '<button class="btn danger sm" type="button" id="e-del" style="margin-right:auto">Delete edition</button><button class="btn" type="button" data-close>Done</button>');
    bindAll(e);
    save(true);
    $("#e-del").onclick = function () { if (!confirmIt("Delete " + e.name + " and its photos?")) return; S.editions.splice(S.editions.indexOf(e), 1); delete S.gallery[e.id]; save(); toast("Edition deleted"); closeDr(); };
  }
  function openEv(id) {
    var v = find(S.events, id), fresh = v.fresh; delete v.fresh;
    var body = field("v-title", "Event name", "title", v.title, { max: 50 }) + field("v-cat", "Label", "cat", v.cat, { max: 30, hint: "e.g. Fitness, Giving back, Outdoors" }) + field("v-text", "Short description", "text", v.text, { area: 1, max: 160 }) +
      '<div class="f"><label class="swl"><span class="sw"><input type="checkbox" data-k="show"' + (v.show ? " checked" : "") + '><span></span></span>Show on the Community page</label></div>';
    openDr(fresh ? "New event" : "Edit event", "", body, '<button class="btn danger sm" type="button" id="v-del" style="margin-right:auto">Delete event</button><button class="btn" type="button" data-close>Done</button>');
    bindAll(v); save(true);
    $("#v-del").onclick = function () { if (!confirmIt("Delete " + v.title + "?")) return; S.events.splice(S.events.indexOf(v), 1); save(); toast("Event deleted"); closeDr(); };
  }

  /* ---------- export & reset ---------- */
  function csv(rows) { return rows.map(function (r) { return r.map(function (c) { c = String(c == null ? "" : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(","); }).join("\n"); }
  $("#export").addEventListener("click", function () {
    var rows, name;
    if (cur === "teams") { name = "koc-teams"; rows = [["Team", "Parish", "Type", "Status", "Fee paid", "Captain", "WhatsApp", "Email", "Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6", "Heard via", "Registered"]].concat(S.teams.map(function (t) { return [t.team, t.parish, t.type, TSTAT[t.status][0], t.fee ? "Yes" : "No", t.cname, t.cphone, t.cmail].concat(t.players, [HEARD[t.heard] || t.heard, t.date.slice(0, 10)]); })); }
    else if (cur === "sponsors") { name = "koc-sponsors"; rows = [["Company", "Contact", "Email", "Phone", "Lines", "Status", "Notes", "Message", "Received"]].concat(S.sponsors.map(function (s) { return [s.co, s.name, s.mail, s.phone, s.lines.join("; "), SSTAT[s.status][0], s.notes, s.msg, s.date.slice(0, 10)]; })); }
    else { name = "koc-messages"; rows = [["Name", "Email", "About", "City", "Message", "Status", "Received"]].concat(S.msgs.map(function (m) { return [m.name, m.mail, ABOUT[m.about] || m.about, m.city, m.msg, m.status === "new" ? "To answer" : "Answered", m.date.slice(0, 10)]; })); }
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv(rows)], { type: "text/csv" })); a.download = name + ".csv"; document.body.appendChild(a); a.click(); a.remove();
    toast("Exported " + (rows.length - 1) + " rows");
  });
  $("#reset").addEventListener("click", function () { if (!confirmIt("Start the demo over? Your changes on this device will be cleared.")) return; localStorage.removeItem(KEY); localStorage.removeItem(INBOX); localStorage.removeItem(SITE); S = seed(); save(); go("today"); toast("Demo reset"); });

  load(); buildNav(); badges(); save(true);
  go((location.hash || "#today").slice(1));
  window.addEventListener("hashchange", function () { var v = location.hash.slice(1); if (v && v !== cur) go(v); });
})();

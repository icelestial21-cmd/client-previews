/* iCelestial biz-engine behaviours. Pages carry data-* hooks; content comes from window.SITE (config.js). */
(function () {
  var S = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n, cur) { return (cur || S.currency || "J$") + Math.round(n).toLocaleString("en-US"); };
  window.BIZ = { money: money, $: $, $$: $$ };

  // nav
  var nav = $(".nav"), tog = $(".nav-toggle");
  if (tog) tog.addEventListener("click", function () { var o = nav.classList.toggle("open"); tog.setAttribute("aria-expanded", o); });
  $$(".nav-drawer a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); }); });

  // reveal
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.12 });
  $$(".reveal").forEach(function (el) { io.observe(el); });

  // counters
  var co = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      var el = e.target, to = parseFloat(el.dataset.count), pre = el.dataset.pre || "", suf = el.dataset.suf || "", t0 = performance.now();
      (function tick(now) { var k = Math.min(1, (now - t0) / 1400), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = pre + (to % 1 ? v.toFixed(1) : Math.round(v).toLocaleString()) + suf; if (k < 1) requestAnimationFrame(tick); })(t0);
    });
  });
  $$("[data-count]").forEach(function (el) { co.observe(el); });

  // range fill
  function fill(r) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%"); }
  $$("input[type=range]").forEach(function (r) { fill(r); r.addEventListener("input", function () { fill(r); }); });

  // segmented / chips groups: [data-group] buttons toggle .on, fire biz:<name>
  $$("[data-group]").forEach(function (g) {
    g.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || !g.contains(b) || b.disabled) return;
      $$("button", g).forEach(function (x) { x.classList.toggle("on", x === b); });
      document.dispatchEvent(new CustomEvent("biz:" + g.dataset.group, { detail: b.dataset.v }));
    });
  });

  // ---------- inventory (car marts) ----------
  var inv = S.inventory || [];
  var state = { body: "all", sort: "featured", q: "", max: Infinity };
  function vcard(v, i) {
    var sale = v.was ? '<s>' + money(v.was) + '</s>' : "";
    return '<button class="vcard reveal in" data-i="' + i + '" type="button">' +
      '<div class="vthumb"><img data-thumb="' + i + '" alt="' + v.year + ' ' + v.name + ' (3D preview render)">' + (v.tag ? '<span class="pill acc">' + v.tag + '</span>' : '') + '</div>' +
      '<div class="vbody"><div class="vtitle">' + v.year + ' ' + v.name + '</div>' +
      '<div class="vspecs"><span>' + v.km.toLocaleString() + ' km</span><span>' + v.fuel + '</span><span>' + v.trans + '</span></div>' +
      '<div class="vprice"><span>' + sale + '<b>' + money(v.price) + '</b></span><small>~' + money(monthly(v.price, 0.2, 60, S.rate || 9.5)) + '/mo</small></div></div></button>';
  }
  function monthly(price, depPct, months, rate) {
    var P = price * (1 - depPct), r = rate / 100 / 12;
    return r ? P * r / (1 - Math.pow(1 + r, -months)) : P / months;
  }
  BIZ.monthly = monthly;
  BIZ.thumbs = [];
  function paintThumbs(root) { $$("img[data-thumb]", root).forEach(function (im) { var u = BIZ.thumbs[+im.dataset.thumb]; if (u) im.src = u; }); }
  BIZ.setThumbs = function (urls) { BIZ.thumbs = urls; paintThumbs(document); };
  function renderInv() {
    var grid = $("[data-inv]"); if (!grid) return;
    var lim = +grid.dataset.limit || 999;
    var list = inv.map(function (v, i) { return [v, i]; }).filter(function (p) {
      var v = p[0];
      return (state.body === "all" || v.body === state.body || v.cat === state.body) && v.price <= state.max &&
        (!state.q || (v.year + " " + v.name + " " + v.fuel).toLowerCase().indexOf(state.q) > -1);
    });
    if (state.sort === "low") list.sort(function (a, b) { return a[0].price - b[0].price; });
    if (state.sort === "high") list.sort(function (a, b) { return b[0].price - a[0].price; });
    if (state.sort === "new") list.sort(function (a, b) { return b[0].year - a[0].year; });
    if (state.sort === "km") list.sort(function (a, b) { return a[0].km - b[0].km; });
    list = list.slice(0, lim);
    grid.innerHTML = list.length ? list.map(function (p) { return vcard(p[0], p[1]); }).join("") : '<div class="empty" style="grid-column:1/-1">No vehicles match those filters. Try widening your budget.</div>';
    var c = $("[data-inv-count]"); if (c) c.textContent = list.length + (list.length === 1 ? " vehicle" : " vehicles");
    paintThumbs(grid);
  }
  document.addEventListener("biz:body", function (e) { state.body = e.detail; renderInv(); });
  var so = $("[data-sort]"); if (so) so.addEventListener("change", function () { state.sort = so.value; renderInv(); });
  var sq = $("[data-q]"); if (sq) sq.addEventListener("input", function () { state.q = sq.value.trim().toLowerCase(); renderInv(); });
  var sm = $("[data-max]"); if (sm) { var smo = $("[data-max-out]"); var upd = function () { state.max = +sm.value >= +sm.max ? Infinity : +sm.value; if (smo) smo.textContent = state.max === Infinity ? "Any" : money(+sm.value); renderInv(); }; sm.addEventListener("input", upd); }
  renderInv();

  // detail sheet
  var sheet = $(".sheet");
  function openSheet(i) {
    var v = inv[i]; if (!sheet || !v) return;
    $("[data-sheet-body]", sheet).innerHTML =
      '<div class="vthumb" style="border-radius:18px;overflow:hidden"><img data-thumb="' + i + '" alt=""></div>' +
      '<span class="placeholder-note">Sample listing · 3D preview render</span>' +
      '<h2 class="h3" style="margin:0">' + v.year + ' ' + v.name + '</h2>' +
      '<div class="vprice" style="border:0;padding:0"><span>' + (v.was ? '<s>' + money(v.was) + '</s>' : '') + '<b style="font-size:30px">' + money(v.price) + '</b></span><small>from ' + money(monthly(v.price, 0.2, 60, S.rate || 9.5)) + '/mo*</small></div>' +
      '<div class="spec-table">' + [["Mileage", v.km.toLocaleString() + " km"], ["Fuel", v.fuel], ["Transmission", v.trans], ["Body", v.body], ["Engine", v.engine || "—"], ["Colour", v.colorName || "—"], ["Seats", v.seats || 5], ["Stock no.", "ST-" + (1040 + i)]].map(function (r) { return '<div><span>' + r[0] + '</span>' + r[1] + '</div>'; }).join("") + '</div>' +
      '<p class="muted" style="margin:0">' + (v.note || "Inspected, serviced and ready to drive. Ask about trade-in and financing.") + '</p>' +
      '<div class="btns"><a class="btn" href="' + (S.bookHref || "index.html#test-drive") + '" data-close>Book a test drive</a><a class="btn ghost" href="index.html#finance" data-close>Estimate payments</a></div>' +
      '<span class="placeholder-note">*Estimate at 20% deposit, 60 months, ' + (S.rate || 9.5) + '% p.a. Subject to lender approval.</span>';
    paintThumbs(sheet);
    sheet.classList.add("open"); document.body.style.overflow = "hidden";
    document.dispatchEvent(new CustomEvent("biz:pick", { detail: v }));
  }
  function closeSheet() { if (sheet) { sheet.classList.remove("open"); document.body.style.overflow = ""; } }
  document.addEventListener("click", function (e) {
    var c = e.target.closest(".vcard"); if (c) { openSheet(+c.dataset.i); return; }
    if (e.target.closest(".sheet-x,.sheet-bg,[data-close]")) closeSheet();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });

  // ---------- finance calculator ----------
  $$("[data-calc=finance]").forEach(function (box) {
    var get = function (n) { return $("[name=" + n + "]", box); };
    function run() {
      var price = +get("price").value, dep = +get("dep").value / 100, term = +get("term").value, rate = +get("rate").value;
      var m = monthly(price, dep, term, rate), fin = price * (1 - dep);
      $("[data-o=price]", box).textContent = money(price);
      $("[data-o=dep]", box).textContent = Math.round(dep * 100) + "%";
      $("[data-o=term]", box).textContent = term + " mo";
      $("[data-o=rate]", box).textContent = rate.toFixed(1) + "%";
      $("[data-o=monthly]", box).textContent = money(m);
      $("[data-o=down]", box).textContent = money(price * dep);
      $("[data-o=fin]", box).textContent = money(fin);
      $("[data-o=total]", box).textContent = money(m * term + price * dep);
    }
    $$("input", box).forEach(function (i) { i.addEventListener("input", run); });
    document.addEventListener("biz:pick", function (e) { var p = get("price"); p.value = Math.min(+p.max, e.detail.price); fill(p); run(); });
    run();
  });

  // ---------- estimator (construction, medical plans) ----------
  // SITE.estimator = { base:{label, rate(per unit), unit, min,max,step,value}, groups:[{name,label,options:[{v,label,sub,mult|add}]}], extras:[{v,label,add}] , spread:0.12 }
  $$("[data-calc=estimate]").forEach(function (box) {
    var E = S.estimator; if (!E) return;
    var size = $("[name=size]", box);
    function run() {
      var n = +size.value, mult = 1, add = 0;
      $$("[data-eg]", box).forEach(function (g) { var on = $(".opt.on", g); if (!on) return; mult *= +(on.dataset.mult || 1); add += +(on.dataset.add || 0); });
      $$("[data-ex].on", box).forEach(function (x) { add += +x.dataset.add; });
      var mid = n * E.base.rate * mult + add, lo = mid * (1 - (E.spread || 0.12)), hi = mid * (1 + (E.spread || 0.12));
      $("[data-o=size]", box).textContent = n.toLocaleString() + " " + E.base.unit;
      $("[data-o=range]", box).textContent = money(lo) + " – " + money(hi);
      var w = $("[data-o=weeks]", box); if (w) w.textContent = Math.max(2, Math.round(n / (E.base.pace || 120) * mult)) + "–" + Math.max(3, Math.round(n / (E.base.pace || 120) * mult * 1.3)) + " weeks";
      var d = $("[data-o=dep]", box); if (d) d.textContent = money(mid * (E.deposit || 0.3));
      document.dispatchEvent(new CustomEvent("biz:estimate", { detail: { size: n, mult: mult } }));
    }
    box.addEventListener("click", function (e) {
      var o = e.target.closest(".opt"); if (!o) return;
      if (o.hasAttribute("data-ex")) o.classList.toggle("on");
      else { $$(".opt", o.parentNode).forEach(function (x) { x.classList.toggle("on", x === o); }); }
      run();
    });
    size.addEventListener("input", run);
    run();
  });

  // ---------- stepper forms ----------
  $$("[data-stepper]").forEach(function (f) {
    var steps = $$(".step", f), bar = $(".steps-bar", f), i = 0;
    if (bar) bar.innerHTML = steps.map(function () { return "<i></i>"; }).join("");
    function show() {
      steps.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      if (bar) $$("i", bar).forEach(function (b, k) { b.classList.toggle("on", k <= i); });
      var back = $("[data-back]", f), next = $("[data-next]", f);
      back.style.visibility = i ? "visible" : "hidden";
      next.textContent = i === steps.length - 1 ? (f.dataset.submit || "Send request") : "Continue";
    }
    function valid() {
      var ok = true;
      $$("[required]", steps[i]).forEach(function (el) { if (!el.value.trim()) { ok = false; el.style.borderColor = "#e5484d"; } else el.style.borderColor = ""; });
      $$("[data-need]", steps[i]).forEach(function (g) { if (!$(".on", g)) { ok = false; g.style.outline = "2px solid #e5484d"; g.style.outlineOffset = "4px"; } else g.style.outline = ""; });
      return ok;
    }
    $("[data-next]", f).addEventListener("click", function () {
      if (!valid()) return;
      if (i < steps.length - 1) { i++; show(); }
      else { f.classList.add("done"); var s = $("[data-summary]", f); if (s) s.textContent = $$(".on[data-label]", f).map(function (x) { return x.dataset.label; }).join(" · "); }
    });
    $("[data-back]", f).addEventListener("click", function () { if (i) { i--; show(); } });
    f.addEventListener("click", function (e) {
      var o = e.target.closest(".slot,.opt,.chip"); if (!o || o.disabled || !f.contains(o)) return;
      var grp = o.parentNode; if (grp.hasAttribute("data-multi")) { o.classList.toggle("on"); return; }
      $$(".slot,.opt,.chip", grp).forEach(function (x) { x.classList.toggle("on", x === o); });
    });
    var re = $("[data-restart]", f); if (re) re.addEventListener("click", function () { f.classList.remove("done"); i = 0; show(); });
    show();
  });

  // date chips: fills [data-dates] with the next N days (skipping Sundays)
  $$("[data-dates]").forEach(function (g) {
    var n = +g.dataset.dates || 6, d = new Date(), out = [], days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], mo = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    while (out.length < n) { d.setDate(d.getDate() + 1); if (d.getDay() === 0) continue; out.push('<button type="button" class="slot" data-label="' + days[d.getDay()] + ' ' + d.getDate() + ' ' + mo[d.getMonth()] + '">' + days[d.getDay()] + '<small>' + d.getDate() + ' ' + mo[d.getMonth()] + '</small></button>'); }
    g.innerHTML = out.join("");
  });
  // time slots with a few booked
  $$("[data-times]").forEach(function (g) {
    var t = g.dataset.times.split(","), busy = (g.dataset.busy || "").split(",");
    g.innerHTML = t.map(function (x) { var b = busy.indexOf(x) > -1; return '<button type="button" class="slot"' + (b ? " disabled" : "") + ' data-label="' + x + '">' + x + (b ? "<small>Booked</small>" : "<small>Open</small>") + '</button>'; }).join("");
  });

  // live clock badge e.g. "Open now"
  $$("[data-open]").forEach(function (el) {
    var h = new Date().getHours(), d = new Date().getDay(), sp = el.dataset.open.split("-"), o = +sp[0], c = +sp[1];
    var open = d !== 0 && h >= o && h < c;
    el.textContent = open ? "Open now · until " + (c > 12 ? c - 12 + "pm" : c + "am") : "Closed · opens " + (o > 12 ? o - 12 + "pm" : o + "am");
    el.classList.toggle("acc", open);
  });
})();

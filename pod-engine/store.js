/* iCelestial print-on-demand store engine (Shopify template previews).
   Each store sets window.STORE in config.js; this file paints designs, renders mockups,
   runs the design studio, shop filters and a demo cart. */
(function () {
  var S = window.STORE || {};
  var root = document.documentElement;

  // ---------- performance tier for the 3D studio ----------
  window.__csqLite = (function () {
    try {
      if (/[?&]lite=1/.test(location.search)) return true;
      if (/[?&]lite=0/.test(location.search)) return false;
      var n = navigator, conn = n.connection || {};
      if (conn.saveData) return true;
      if ((n.hardwareConcurrency || 8) <= 4 || (n.deviceMemory || 8) <= 4) return true;
      if (window.matchMedia("(max-width: 720px)").matches) return true;
      var g = document.createElement("canvas").getContext("webgl");
      if (!g) return true;
      var e = g.getExtension("WEBGL_debug_renderer_info");
      var r = e ? String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)) : "";
      return /Radeon\(TM\) R\d|Radeon R\d|HD Graphics [2-6]\d{2}|Intel\(R\) HD|Mali-[GT][0-7]\d|Adreno \(TM\) [3-5]|PowerVR|SwiftShader|llvmpipe/i.test(r);
    } catch (err) { return true; }
  })();
  root.classList.toggle("lite", window.__csqLite);

  // ---------- garment outlines (shared by 3D and 2D mockups) ----------
  var SHAPES = {
    tee: [["M", -0.34, 1.0], ["Q", 0, 0.74, 0.34, 1.0], ["L", 0.78, 0.9], ["L", 1.28, 0.42], ["L", 0.98, 0.12], ["L", 0.74, 0.36], ["L", 0.76, -1.1], ["Q", 0, -1.16, -0.76, -1.1], ["L", -0.74, 0.36], ["L", -0.98, 0.12], ["L", -1.28, 0.42], ["L", -0.78, 0.9], ["Z"]],
    swim: [["M", -0.44, 1.16], ["L", -0.3, 1.16], ["Q", 0, 0.4, 0.3, 1.16], ["L", 0.44, 1.16], ["Q", 0.66, 0.62, 0.5, 0.2], ["Q", 0.4, -0.1, 0.58, -0.5], ["Q", 0.22, -0.62, 0.13, -1.06], ["L", -0.13, -1.06], ["Q", -0.22, -0.62, -0.58, -0.5], ["Q", -0.4, -0.1, -0.5, 0.2], ["Q", -0.66, 0.62, -0.44, 1.16], ["Z"]],
    silk: [["M", -1, 1], ["L", 1, 1], ["L", 1, -1], ["L", -1, -1], ["Z"]]
  };
  function bbox(cmds) {
    var xs = [], ys = [];
    cmds.forEach(function (c) { for (var i = 1; i < c.length; i += 2) { xs.push(c[i]); ys.push(c[i + 1]); } });
    return { x0: Math.min.apply(0, xs), x1: Math.max.apply(0, xs), y0: Math.min.apply(0, ys), y1: Math.max.apply(0, ys) };
  }
  // where artwork and text sit on each garment (fractions of the texture)
  var PLACE = { tee: { x: 0.5, y: 0.36, art: 0.3, text: 0.07 }, swim: { x: 0.5, y: 0.5, art: 0.3, text: 0.07 }, silk: { x: 0.5, y: 0.5, art: 0.36, text: 0.13 } };

  // ---------- seeded random ----------
  function rng(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { return (s = s * 16807 % 2147483647) / 2147483647; }; }

  // ---------- pattern painter ----------
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
    var f = function (v) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))); };
    return "#" + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  var PATTERNS = {
    solid: function () {},
    stripes: function (c, W, H, a) { c.fillStyle = a; var h = H / 14; for (var y = 0; y < H; y += h * 2) c.fillRect(0, y, W, h); },
    pinstripe: function (c, W, H, a) { c.fillStyle = a; for (var x = 0; x < W; x += W / 32) c.fillRect(x, 0, W / 260, H); },
    dots: function (c, W, H, a) { c.fillStyle = a; var s = W / 12; for (var y = 0, k = 0; y < H + s; y += s, k++) for (var x = (k % 2) * s / 2; x < W + s; x += s) { c.beginPath(); c.arc(x, y, s * 0.18, 0, 6.3); c.fill(); } },
    check: function (c, W, H, a) { c.fillStyle = a; c.globalAlpha = 0.5; var s = W / 14; for (var x = 0; x < W; x += s * 2) c.fillRect(x, 0, s, H); for (var y = 0; y < H; y += s * 2) c.fillRect(0, y, W, s); c.globalAlpha = 1; },
    waves: function (c, W, H, a) { c.strokeStyle = a; c.lineWidth = W / 90; for (var y = 0; y < H + 40; y += H / 12) { c.beginPath(); for (var x = 0; x <= W; x += 8) c.lineTo(x, y + Math.sin(x / W * Math.PI * 6) * H / 40); c.stroke(); } },
    palms: function (c, W, H, a, seed) {
      var r = rng(seed || 7); c.fillStyle = a;
      for (var i = 0; i < 26; i++) {
        var x = r() * W, y = r() * H, s = W * (0.05 + r() * 0.06), rot = r() * 6.3;
        c.save(); c.translate(x, y); c.rotate(rot);
        for (var k = -3; k <= 3; k++) { c.save(); c.rotate(k * 0.32); c.beginPath(); c.ellipse(0, -s, s * 0.22, s, 0, 0, 6.3); c.fill(); c.restore(); }
        c.restore();
      }
    },
    floral: function (c, W, H, a, seed, base) {
      var r = rng(seed || 11);
      for (var i = 0; i < 34; i++) {
        var x = r() * W, y = r() * H, s = W * (0.02 + r() * 0.035);
        c.save(); c.translate(x, y); c.rotate(r() * 6.3); c.fillStyle = a;
        for (var p = 0; p < 5; p++) { c.rotate(1.2566); c.beginPath(); c.ellipse(0, -s, s * 0.55, s, 0, 0, 6.3); c.fill(); }
        c.fillStyle = shade(base, 0.6); c.beginPath(); c.arc(0, 0, s * 0.4, 0, 6.3); c.fill(); c.restore();
      }
    },
    lace: function (c, W, H, a) {
      c.strokeStyle = a; c.lineWidth = W / 420; c.globalAlpha = 0.55;
      var s = W / 20;
      for (var x = -W; x < W * 2; x += s) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + H, H); c.stroke(); c.beginPath(); c.moveTo(x, 0); c.lineTo(x - H, H); c.stroke(); }
      c.globalAlpha = 1; c.lineWidth = W / 220;
      for (var y = s * 2; y < H; y += s * 4) for (var xx = 0; xx < W + s; xx += s * 2) { c.beginPath(); c.arc(xx, y, s, 0, Math.PI); c.stroke(); c.beginPath(); c.arc(xx, y, s * 0.45, 0, 6.3); c.stroke(); }
    },
    sunset: function (c, W, H, a, seed, base) { var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, base); g.addColorStop(0.55, a); g.addColorStop(1, shade(a, -0.35)); c.fillStyle = g; c.fillRect(0, 0, W, H); },
    camo: function (c, W, H, a, seed, base) {
      var r = rng(seed || 3), cols = [a, shade(base, -0.25), shade(a, 0.25)];
      for (var i = 0; i < 70; i++) { c.fillStyle = cols[i % 3]; c.beginPath(); var x = r() * W, y = r() * H, s = W * (0.04 + r() * 0.06); c.ellipse(x, y, s * (1 + r()), s, r() * 3, 0, 6.3); c.fill(); }
    }
  };
  var PATTERN_NAMES = { solid: "Solid", stripes: "Stripes", pinstripe: "Pinstripe", dots: "Polka dot", check: "Gingham", waves: "Waves", palms: "Palms", floral: "Floral", lace: "Lace", sunset: "Sunset fade", camo: "Camo" };

  function paint(canvas, d, kind) {
    var c = canvas.getContext("2d"), W = canvas.width, H = canvas.height, P = PLACE[kind] || PLACE.tee;
    c.save();
    c.fillStyle = d.base; c.fillRect(0, 0, W, H);
    (PATTERNS[d.pattern] || PATTERNS.solid)(c, W, H, d.accent, d.seed, d.base);
    if (kind === "silk") { var g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "rgba(255,255,255,.10)"); g.addColorStop(0.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,.10)"); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    var cy = P.y * H;
    if (d.art) {
      var s = P.art * W, iw = d.art.naturalWidth || d.art.width, ih = d.art.naturalHeight || d.art.height, k = Math.min(s / iw, s / ih);
      c.drawImage(d.art, P.x * W - iw * k / 2, cy - ih * k / 2, iw * k, ih * k);
      cy += ih * k / 2 + P.text * W * 0.9;
    }
    if (d.text) {
      var fs = P.text * W * (d.text.length > 14 ? 0.7 : 1);
      c.font = (d.fontWeight || "700") + " " + Math.round(fs) + "px " + (d.font || "sans-serif");
      c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = d.textColor || "#111";
      var lines = String(d.text).toUpperCase() === d.text || d.caps === false ? d.text.split("\n") : d.text.split("\n");
      lines.slice(0, 3).forEach(function (ln, i) { c.fillText(d.caps === false ? ln : ln.toUpperCase(), P.x * W, cy + i * fs * 1.1); });
    }
    c.restore();
    return canvas;
  }

  // ---------- 2D mockup (cards, cart thumbnails) ----------
  function trace(c, cmds, tx) {
    c.beginPath();
    cmds.forEach(function (k) {
      if (k[0] === "M") c.moveTo(tx.x(k[1]), tx.y(k[2]));
      else if (k[0] === "L") c.lineTo(tx.x(k[1]), tx.y(k[2]));
      else if (k[0] === "Q") c.quadraticCurveTo(tx.x(k[1]), tx.y(k[2]), tx.x(k[3]), tx.y(k[4]));
      else c.closePath();
    });
  }
  function mockup(d, kind, size) {
    size = size || 520;
    var tex = paint(Object.assign(document.createElement("canvas"), { width: 512, height: 512 }), d, kind);
    var cv = Object.assign(document.createElement("canvas"), { width: size, height: size }), c = cv.getContext("2d");
    if (kind === "silk") {
      // a draped silk square
      var m = size * 0.14, w = size - 2 * m;
      c.save(); c.translate(size / 2, size / 2); c.rotate(-0.12); c.translate(-size / 2, -size / 2);
      c.shadowColor = "rgba(0,0,0,.28)"; c.shadowBlur = size * 0.06; c.shadowOffsetY = size * 0.04;
      c.beginPath(); c.moveTo(m, m + w * 0.06);
      c.bezierCurveTo(m + w * 0.3, m - w * 0.04, m + w * 0.7, m + w * 0.12, m + w, m);
      c.bezierCurveTo(m + w * 1.04, m + w * 0.4, m + w * 0.94, m + w * 0.7, m + w, m + w);
      c.bezierCurveTo(m + w * 0.7, m + w * 0.92, m + w * 0.3, m + w * 1.06, m, m + w * 0.96);
      c.bezierCurveTo(m + w * 0.06, m + w * 0.6, m - w * 0.04, m + w * 0.3, m, m + w * 0.06);
      c.closePath(); c.fillStyle = d.base; c.fill(); c.shadowColor = "transparent";
      c.clip(); c.drawImage(tex, m, m, w, w);
      var sh = c.createLinearGradient(m, m, m + w, m + w);
      [0, 0.18, 0.32, 0.5, 0.66, 0.82, 1].forEach(function (p, i) { sh.addColorStop(p, i % 2 ? "rgba(255,255,255,.22)" : "rgba(0,0,0,.18)"); });
      c.fillStyle = sh; c.fillRect(0, 0, size, size);
      c.restore();
      return cv;
    }
    var cmds = SHAPES[kind], b = bbox(cmds), sc = size * 0.8 / Math.max(b.x1 - b.x0, b.y1 - b.y0);
    var ox = size / 2 - (b.x0 + b.x1) / 2 * sc, oy = size / 2 + (b.y0 + b.y1) / 2 * sc;
    var tx = { x: function (v) { return ox + v * sc; }, y: function (v) { return oy - v * sc; } };
    c.save();
    c.shadowColor = "rgba(0,0,0,.22)"; c.shadowBlur = size * 0.05; c.shadowOffsetY = size * 0.03;
    trace(c, cmds, tx); c.fillStyle = d.base; c.fill(); c.shadowColor = "transparent";
    c.clip();
    c.drawImage(tex, tx.x(b.x0), tx.y(b.y1), (b.x1 - b.x0) * sc, (b.y1 - b.y0) * sc);
    var g = c.createLinearGradient(tx.x(b.x0), 0, tx.x(b.x1), 0);
    g.addColorStop(0, "rgba(0,0,0,.16)"); g.addColorStop(0.25, "rgba(255,255,255,.06)"); g.addColorStop(0.5, "rgba(255,255,255,0)"); g.addColorStop(0.8, "rgba(0,0,0,.05)"); g.addColorStop(1, "rgba(0,0,0,.2)");
    c.fillStyle = g; c.fillRect(0, 0, size, size);
    c.restore();
    c.save(); trace(c, cmds, tx); c.strokeStyle = "rgba(0,0,0,.18)"; c.lineWidth = size / 260; c.stroke(); c.restore();
    if (kind === "tee") { c.save(); trace(c, cmds, tx); c.clip(); c.strokeStyle = "rgba(0,0,0,.12)"; c.lineWidth = size / 140; c.beginPath(); c.moveTo(tx.x(-0.34), tx.y(1.0)); c.quadraticCurveTo(tx.x(0), tx.y(0.74), tx.x(0.34), tx.y(1.0)); c.stroke(); c.restore(); }
    return cv;
  }

  // ---------- helpers ----------
  var products = S.products || [];
  function byId(id) { return products.filter(function (p) { return p.id === id; })[0]; }
  function money(v) { return (S.currencySymbol || "$") + Number(v).toFixed(2); }
  function design(p, over) {
    var d = { base: p.colors[0].hex, accent: p.accent || S.accent, pattern: p.pattern || "solid", text: p.text || "", font: S.printFont || "sans-serif", textColor: p.colors[0].text || p.textColor || "#111", seed: p.seed || 5, caps: S.caps !== false, fontWeight: S.printWeight };
    return Object.assign(d, over || {});
  }
  window.POD = { paint: paint, mockup: mockup, SHAPES: SHAPES, bbox: bbox, design: design, PATTERN_NAMES: PATTERN_NAMES };

  // ---------- cart (light per-browser convenience) ----------
  var KEY = "pod-cart-" + (S.short || "store");
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return mem; } }
  var mem = [];
  function save(c) { mem = c; try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} renderCart(); }
  function cartCount(c) { return c.reduce(function (n, i) { return n + i.qty; }, 0); }
  function renderCart() {
    var c = load(), n = cartCount(c);
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = n; el.classList.toggle("on", n > 0); });
    var list = document.querySelector("[data-cart-list]"); if (!list) return;
    if (!c.length) { list.innerHTML = '<div class="cart-empty">' + (S.emptyArt ? '<img src="' + S.emptyArt + '" alt="" loading="lazy">' : '') + '<p>' + (S.emptyText || "Your bag is empty. Design something you love.") + '</p><a class="btn ghost" href="shop.html">' + (S.emptyCta || "Start shopping") + '</a></div>'; }
    else list.innerHTML = c.map(function (i, k) {
      return '<div class="cart-item"><img src="' + i.thumb + '" alt=""><div><b>' + i.name + '</b><span>' + i.opts + '</span><div class="qty"><button type="button" data-q="' + k + '" data-d="-1" aria-label="Fewer">−</button><span>' + i.qty + '</span><button type="button" data-q="' + k + '" data-d="1" aria-label="More">+</button></div></div><b class="cart-price">' + money(i.price * i.qty) + '</b></div>';
    }).join("");
    var sub = c.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    var st = document.querySelector("[data-cart-sub]"); if (st) st.textContent = money(sub);
    var fr = document.querySelector("[data-free]");
    if (fr && S.freeShip) { var left = S.freeShip - sub; fr.innerHTML = left > 0 ? "You're <b>" + money(left) + "</b> from free shipping" : "<b>Free shipping</b> unlocked"; fr.style.setProperty("--p", Math.min(1, sub / S.freeShip)); }
  }
  document.addEventListener("click", function (e) {
    var q = e.target.closest("[data-q]");
    if (q) { var c = load(), k = +q.dataset.q; c[k].qty += +q.dataset.d; if (c[k].qty <= 0) c.splice(k, 1); save(c); }
    if (e.target.closest("[data-cart-open]")) { e.preventDefault(); document.body.classList.add("cart-open"); }
    if (e.target.closest("[data-cart-close]")) document.body.classList.remove("cart-open");
    var lk = e.target.closest("[data-look]");
    if (lk) {
      var c0 = load(), off = parseFloat(lk.dataset.off || "0");
      lk.dataset.look.split(",").forEach(function (id) { var lp = byId(id); if (!lp) return; c0.push({ id: lp.id, name: lp.name, price: Math.round(lp.price * (1 - off) * 100) / 100, qty: 1, thumb: mockup(design(lp), S.kind, 160).toDataURL("image/png"), opts: [lp.colors[0].name, "Size " + (S.lookSize || "M"), "The look"].join(" · ") }); });
      save(c0); document.body.classList.add("cart-open");
    }
    if (e.target.closest("[data-checkout]")) { e.preventDefault(); var m = document.querySelector(".checkout-note"); if (m) m.classList.add("on"); }
  });
  var WKEY = "pod-wish-" + (S.short || "store"), wish = [];
  try { wish = JSON.parse(localStorage.getItem(WKEY) || "[]"); } catch (e) {}
  function paintWish() { document.querySelectorAll("[data-wish]").forEach(function (b) { b.classList.toggle("on", wish.indexOf(b.dataset.wish) >= 0); }); var wc = document.querySelector("[data-wish-count]"); if (wc) { wc.textContent = wish.length; wc.classList.toggle("on", wish.length > 0); } }
  document.addEventListener("click", function (e) {
    var w = e.target.closest("[data-wish]"); if (!w) return;
    e.preventDefault(); e.stopPropagation();
    var i = wish.indexOf(w.dataset.wish); if (i >= 0) wish.splice(i, 1); else { wish.push(w.dataset.wish); w.classList.remove("pop"); void w.offsetWidth; w.classList.add("pop"); }
    try { localStorage.setItem(WKEY, JSON.stringify(wish)); } catch (er) {}
    paintWish();
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") document.body.classList.remove("cart-open"); });

  // ---------- nav ----------
  var nav = document.querySelector(".nav");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var tog = document.querySelector(".nav-toggle");
  if (tog) tog.addEventListener("click", function () { var o = document.body.classList.toggle("menu-open"); tog.setAttribute("aria-expanded", o); });

  // ---------- reveal ----------
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  } else document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });

  // ---------- product cards ----------
  function card(p) {
    var d = design(p);
    return '<a class="pcard" href="product.html?id=' + p.id + '" data-col="' + p.collection + '" data-price="' + p.price + '"' + (p.compareAt ? ' data-sale="1"' : '') + '>' +
      '<div class="pimg" style="--cb:' + (p.cardBg || "var(--card)") + '"><canvas data-mock="' + p.id + '" width="520" height="520" aria-label="' + p.name + ' mockup" role="img"></canvas>' + (p.tag ? '<span class="ptag' + (p.compareAt ? ' sale' : '') + '">' + p.tag + '</span>' : "") + (S.mode === "retail" ? '<button type="button" class="wish" aria-label="Save ' + p.name + '" data-wish="' + p.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg></button>' : '') + '<span class="pquick">' + (S.quickLabel || "Customise") + '</span></div>' +
      '<div class="pinfo"><div><b>' + p.name + '</b><span>' + (p.sub || "") + '</span></div><b class="pprice">' + (p.compareAt ? '<span class="now">' + money(p.price) + '</span> <s>' + money(p.compareAt) + '</s><em class="off">' + Math.round((1 - p.price / p.compareAt) * 100) + '% off</em>' : money(p.price)) + '</b></div>' +
      '<div class="pswatch">' + p.colors.slice(0, 5).map(function (c) { return '<i style="background:' + c.hex + '" title="' + c.name + '"></i>'; }).join("") + '</div></a>';
  }
  function drawMocks(scope) {
    (scope || document).querySelectorAll("canvas[data-mock]").forEach(function (cv) {
      var p = byId(cv.dataset.mock); if (!p) return;
      var m = mockup(design(p), S.kind, 520); cv.getContext("2d").drawImage(m, 0, 0);
    });
  }
  document.querySelectorAll("[data-grid]").forEach(function (g) {
    var list = products.slice();
    var lim = parseInt(g.dataset.limit || "0", 10);
    if (g.dataset.grid === "featured") list = list.filter(function (p) { return p.featured; });
    if (g.dataset.grid === "rest") list = list.filter(function (p) { return !p.featured; });
    if (lim) list = list.slice(0, lim);
    g.innerHTML = list.map(card).join("");
  });
  // filters + sort on the shop page
  var fbar = document.querySelector("[data-filters]");
  if (fbar) {
    var grid = document.querySelector("[data-grid='all']");
    var apply = function () {
      var f = (fbar.querySelector(".chip.on") || {}).dataset || {}, col = f.f || "all";
      var sort = (document.querySelector("[data-sort]") || {}).value || "featured";
      var cards = Array.prototype.slice.call(grid.children);
      cards.forEach(function (cd) { cd.style.display = col === "all" || cd.dataset.col === col || (col === "sale" && cd.dataset.sale) ? "" : "none"; });
      cards.sort(function (a, b) { return sort === "low" ? a.dataset.price - b.dataset.price : sort === "high" ? b.dataset.price - a.dataset.price : 0; });
      if (sort !== "featured") cards.forEach(function (cd) { grid.appendChild(cd); });
      var n = cards.filter(function (cd) { return cd.style.display !== "none"; }).length;
      var cnt = document.querySelector("[data-count]"); if (cnt) cnt.textContent = n + (S.mode === "retail" ? (n === 1 ? " product" : " products") : (n === 1 ? " design" : " designs"));
    };
    fbar.addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; fbar.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); apply(); });
    var so = document.querySelector("[data-sort]"); if (so) so.addEventListener("change", apply);
    var qs = new URLSearchParams(location.search).get("c");
    if (qs) { var b = fbar.querySelector('[data-f="' + qs + '"]'); if (b) b.click(); }
    apply();
  }

  // ---------- the design studio ----------
  var studios = document.querySelectorAll("[data-studio]");
  studios.forEach(function (el) {
    var tex = Object.assign(document.createElement("canvas"), { width: 1024, height: 1024 });
    el.podCanvas = tex; el.podKind = S.kind;
    var push = function (d) { paint(tex, d, S.kind); el.podBase = d.base; el.dispatchEvent(new Event("pod:paint")); };
    el.podPush = push;
    // fallback image (before / without WebGL)
    var fb = el.querySelector(".studio-fallback");
    el.podFallback = function (d) { if (!fb) return; fb.width = 600; fb.height = 600; fb.getContext("2d").clearRect(0, 0, 600, 600); fb.getContext("2d").drawImage(mockup(d, S.kind, 600), 0, 0); };
  });
  // home hero: cycle featured designs
  var hero = document.querySelector("[data-studio='cycle']");
  if (hero) {
    var feat = products.filter(function (p) { return p.featured; }), hi = 0;
    var show = function () { var p = feat[hi % feat.length], d = design(p); hero.podPush(d); hero.podFallback(d); var lab = document.querySelector("[data-hero-label]"); if (lab) lab.innerHTML = "<b>" + p.name + "</b>" + money(p.price); hi++; };
    show(); if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(show, 3600);
  }

  // product page customiser
  var form = document.querySelector("[data-customiser]");
  if (form) {
    var id = new URLSearchParams(location.search).get("id");
    var p = byId(id) || products[0];
    var st = design(p), art = null, size = null;
    var studio = document.querySelector("[data-studio='product']");
    document.title = p.name + " | " + S.name;
    var setText = function (sel, v) { document.querySelectorAll(sel).forEach(function (e) { e.textContent = v; }); };
    setText("[data-p-name]", p.name);
    setText("[data-p-compare]", p.compareAt ? money(p.compareAt) : "");
    var stk = document.querySelector("[data-stock]");
    if (stk && p.stock != null) { stk.textContent = p.stock <= 5 ? "Only " + p.stock + " left. Order soon." : "In stock, ready to ship"; stk.classList.toggle("low", p.stock <= 5); } setText("[data-p-sub]", p.sub || ""); setText("[data-p-desc]", p.desc || "");
    var price = function () { return p.price + (art ? (S.artFee || 0) : 0) + (st.text && st.text !== (p.text || "") ? (S.textFee || 0) : 0); };
    var refresh = function () {
      setText("[data-p-price]", money(price()));
      studio.podPush(st); studio.podFallback(st);
      var sum = document.querySelector("[data-summary]");
      if (sum) sum.textContent = [pickName("[data-colors]"), S.mode === "retail" ? null : PATTERN_NAMES[st.pattern], size ? "Size " + size : null, art ? "Your artwork" : null, S.mode !== "retail" && st.text ? '"' + st.text + '"' : null].filter(Boolean).join(" · ");
    };
    var pickName = function (sel) { var b = form.querySelector(sel + " .on"); return b ? b.getAttribute("aria-label") : ""; };
    // colours
    var cbox = form.querySelector("[data-colors]");
    cbox.innerHTML = p.colors.map(function (c, i) { return '<button type="button" class="sw' + (i ? "" : " on") + '" style="--c:' + c.hex + '" aria-label="' + c.name + '" data-hex="' + c.hex + '"' + (c.text ? ' data-tc="' + c.text + '"' : "") + '></button>'; }).join("");
    cbox.addEventListener("click", function (e) { var b = e.target.closest(".sw"); if (!b) return; cbox.querySelectorAll(".sw").forEach(function (x) { x.classList.toggle("on", x === b); }); st.base = b.dataset.hex; if (b.dataset.tc) { st.textColor = b.dataset.tc; syncInk(); } setText("[data-color-name]", b.getAttribute("aria-label")); refresh(); });
    setText("[data-color-name]", p.colors[0].name);
    // patterns / prints
    var syncInk = function () {};
    var pbox = form.querySelector("[data-patterns]");
    var pats = p.patterns || S.patterns || ["solid"];
    if (pbox) {
    if (pats.indexOf(st.pattern) < 0) pats.unshift(st.pattern);
    pbox.innerHTML = pats.map(function (k) {
      var cv = mockup(design(p, { pattern: k, text: "", base: p.colors[0].hex }), "silk", 96);
      return '<button type="button" class="pat' + (k === st.pattern ? " on" : "") + '" data-pat="' + k + '"><img src="' + cv.toDataURL() + '" alt=""><span>' + PATTERN_NAMES[k] + '</span></button>';
    }).join("");
    pbox.addEventListener("click", function (e) { var b = e.target.closest(".pat"); if (!b) return; pbox.querySelectorAll(".pat").forEach(function (x) { x.classList.toggle("on", x === b); }); st.pattern = b.dataset.pat; refresh(); });
    }
    // accent colour for prints
    var abox = form.querySelector("[data-accents]");
    if (abox) {
      abox.innerHTML = (S.accents || [S.accent]).map(function (h, i) { return '<button type="button" class="sw sm' + (h === st.accent ? " on" : "") + '" style="--c:' + h + '" aria-label="Print colour ' + (i + 1) + '" data-hex="' + h + '"></button>'; }).join("");
      abox.addEventListener("click", function (e) { var b = e.target.closest(".sw"); if (!b) return; abox.querySelectorAll(".sw").forEach(function (x) { x.classList.toggle("on", x === b); }); st.accent = b.dataset.hex; refresh(); });
    }
    // artwork upload (stays in the browser)
    var up = form.querySelector("[data-upload]"), upn = form.querySelector("[data-upload-name]"), clr = form.querySelector("[data-upload-clear]");
    if (up) {
    up.addEventListener("change", function () {
      var f = up.files && up.files[0]; if (!f) return;
      if (!/^image\//.test(f.type)) { upn.textContent = "Please choose an image (PNG, JPG or SVG)"; return; }
      var url = URL.createObjectURL(f), im = new Image();
      im.onload = function () { art = im; st.art = im; upn.textContent = f.name; clr.hidden = false; refresh(); };
      im.src = url;
    });
    clr.addEventListener("click", function () { art = null; st.art = null; up.value = ""; upn.textContent = "PNG, JPG or SVG · transparent PNG prints best"; clr.hidden = true; refresh(); });
    }
    // text
    var ti = form.querySelector("input[data-text]"), ink = form.querySelector("[data-ink]");
    if (ti) { ti.value = st.text; ti.addEventListener("input", function () { st.text = ti.value.slice(0, 40); refresh(); }); }
    syncInk = function () { if (!ink) return; ink.querySelectorAll(".sw").forEach(function (x) { x.classList.toggle("on", x.dataset.hex === st.textColor); }); };
    if (ink) {
      ink.innerHTML = (S.inks || ["#111111", "#ffffff"]).map(function (h) { return '<button type="button" class="sw sm" style="--c:' + h + '" aria-label="Text colour ' + h + '" data-hex="' + h + '"></button>'; }).join("");
      ink.addEventListener("click", function (e) { var b = e.target.closest(".sw"); if (!b) return; st.textColor = b.dataset.hex; syncInk(); refresh(); });
      syncInk();
    }
    var fsel = form.querySelector("[data-font]");
    if (fsel) { fsel.innerHTML = (S.printFonts || []).map(function (f) { return '<option value="' + f.css + '"' + (f.css === st.font ? " selected" : "") + ">" + f.name + "</option>"; }).join(""); fsel.addEventListener("change", function () { st.font = fsel.value; refresh(); }); }
    // sizes
    var sbox = form.querySelector("[data-sizes]");
    sbox.innerHTML = (p.sizes || S.sizes).map(function (s) { return '<button type="button" class="size">' + s + "</button>"; }).join("");
    sbox.addEventListener("click", function (e) { var b = e.target.closest(".size"); if (!b) return; sbox.querySelectorAll(".size").forEach(function (x) { x.classList.toggle("on", x === b); }); size = b.textContent; sbox.classList.remove("need"); refresh(); });
    // fonts may load late: repaint once they're ready
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    // add to bag
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!size) { sbox.classList.add("need"); sbox.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      var thumb = mockup(Object.assign({}, st), S.kind, 160).toDataURL("image/png");
      var c = load();
      var qn = parseInt((form.querySelector("[data-qty-val]") || {}).textContent || "1", 10) || 1;
      c.push({ id: p.id, name: p.name, price: price(), qty: qn, thumb: thumb, opts: [pickName("[data-colors]"), S.mode === "retail" ? null : PATTERN_NAMES[st.pattern], size, art ? "Custom art" : null, S.mode !== "retail" && st.text ? '"' + st.text + '"' : null].filter(Boolean).join(" · ") });
      save(c);
      var sb = form.querySelector("button[type=submit]"), old = sb.innerHTML;
      sb.classList.add("added"); sb.innerHTML = "Added to bag \u2713";
      setTimeout(function () { sb.classList.remove("added"); sb.innerHTML = old; }, 1600);
      setTimeout(function () { document.body.classList.add("cart-open"); }, 450);
    });
    var qv = form.querySelector("[data-qty-val]");
    form.querySelectorAll("[data-qty]").forEach(function (b) { b.addEventListener("click", function () { qv.textContent = Math.max(1, Math.min(9, (+qv.textContent || 1) + +b.dataset.qty)); }); });
    var stick = document.querySelector(".sticky-buy"), mainBtn = form.querySelector("button[type=submit]");
    if (stick && mainBtn) {
      stick.querySelector("[data-sticky-name]").textContent = p.name;
      var chk = function () { stick.classList.toggle("on", mainBtn.getBoundingClientRect().bottom < 0); };
      window.addEventListener("scroll", chk, { passive: true }); chk();
      stick.querySelector("button").addEventListener("click", function () { mainBtn.click(); });
    }
    var RKEY = "pod-recent-" + (S.short || "store"), recent = [];
    try { recent = JSON.parse(localStorage.getItem(RKEY) || "[]"); } catch (e) {}
    var rgrid = document.querySelector("[data-recent]");
    if (rgrid) {
      var rl = recent.filter(function (x) { return x !== p.id; }).map(byId).filter(Boolean).slice(0, 4);
      if (rl.length) { rgrid.innerHTML = rl.map(card).join(""); rgrid.closest("section").hidden = false; }
    }
    recent = [p.id].concat(recent.filter(function (x) { return x !== p.id; })).slice(0, 8);
    try { localStorage.setItem(RKEY, JSON.stringify(recent)); } catch (e) {}
    refresh();
    // related
    var rel = document.querySelector("[data-related]");
    if (rel) rel.innerHTML = products.filter(function (x) { return x.id !== p.id; }).slice(0, 4).map(card).join("");
  }

  drawMocks(); paintWish();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawMocks(); });
  renderCart();

  // ---------- ThreeUI liquid metal CTA: the page drives the iframe's hover/press ----------
  document.querySelectorAll(".lm-cta").forEach(function (a) {
    var f = a.querySelector("iframe"); if (!f) return;
    var call = function (fn, v) { try { var w = f.contentWindow; if (w && w[fn]) w[fn](v); } catch (e) {} };
    a.addEventListener("pointerenter", function () { call("__hover", true); });
    a.addEventListener("pointerleave", function () { call("__hover", false); call("__press", false); });
    a.addEventListener("pointerdown", function () { call("__press", true); });
    a.addEventListener("pointerup", function () { call("__press", false); });
    a.addEventListener("focus", function () { call("__hover", true); });
    a.addEventListener("blur", function () { call("__hover", false); });
  });

  // ---------- newsletter + FAQ demo ----------
  document.querySelectorAll("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) { e.preventDefault(); f.classList.add("sent"); var m = f.querySelector("[data-done]"); if (m) m.hidden = false; });
  });

  // ---------- preview chrome ----------
  var badge = document.createElement("span");
  badge.className = "preview-tag";
  badge.innerHTML = "<b>" + (S.badge || "Shopify template preview") + "</b> · sample brand · iCelestial";
  document.body.appendChild(badge);
  var fb = document.createElement("a");
  fb.className = "feedback"; fb.target = "_blank"; fb.rel = "noopener";
  fb.href = "https://wa.me/18764876913?text=" + encodeURIComponent("Hi iCelestial, feedback on the " + (S.template || S.name) + " Shopify store template preview: ");
  fb.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>Send feedback';
  document.body.appendChild(fb);
})();

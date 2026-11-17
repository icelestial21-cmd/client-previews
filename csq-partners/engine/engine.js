/* CSQ Partner Websites: shared template engine by iCelestial
   Every partner site loads its own config.js (window.SITE) before this file.
   One engine, three templates (media, travel, concierge), three tiers each. */
(function () {
  "use strict";
  var S = window.SITE || {};
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 0. Performance tier: weaker GPUs, low memory/cores, small screens or data-saver get "lite" 3D
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

  // 1. Brand tokens from config → CSS variables
  var c = S.colors || {};
  Object.keys(c).forEach(function (k) { root.style.setProperty("--" + k, c[k]); });
  if (S.fonts) {
    if (S.fonts.display) root.style.setProperty("--font-display", S.fonts.display);
    if (S.fonts.body) root.style.setProperty("--font-body", S.fonts.body);
  }

  // 2. Text and link bindings: <span data-site="name"></span>, <a data-href="whatsapp">
  function get(path) { return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, S); }
  document.querySelectorAll("[data-site]").forEach(function (el) {
    var v = get(el.getAttribute("data-site"));
    if (v != null) el.textContent = v;
  });
  var wa = (S.contact && S.contact.whatsapp || "").replace(/\D/g, "");
  var links = {
    whatsapp: wa ? "https://wa.me/" + wa : "#",
    email: S.contact && S.contact.email ? "mailto:" + S.contact.email : "#",
    phone: S.contact && S.contact.phone ? "tel:" + S.contact.phone.replace(/[^\d+]/g, "") : "#"
  };
  document.querySelectorAll("[data-href]").forEach(function (el) {
    var k = el.getAttribute("data-href");
    if (links[k]) el.setAttribute("href", links[k]);
  });
  if (S.name) document.title = document.title.replace("{name}", S.name);

  // 3. Tier gating. Elements marked data-tier="2" or "3" only show on that package or above.
  var tiers = S.tiers || ["Tier 1", "Tier 2", "Tier 3"];
  var KEY = "csq-tier-" + (S.template || "site");
  var tier = S.tier || 3;
  try { var saved = parseInt(localStorage.getItem(KEY), 10); if (saved >= 1 && saved <= 3) tier = saved; } catch (e) {}
  document.querySelectorAll("[data-tier]").forEach(function (el) {
    var t = parseInt(el.getAttribute("data-tier"), 10);
    if (t > 1 && !el.querySelector(":scope > .tier-flag") && !el.hasAttribute("data-noflag")) {
      var f = document.createElement("span");
      f.className = "tier-flag";
      f.textContent = tiers[t - 1] + " package";
      el.insertBefore(f, el.firstChild);
    }
  });
  function applyTier(t) {
    tier = t;
    root.setAttribute("data-active-tier", t);
    document.querySelectorAll("[data-tier]").forEach(function (el) {
      el.hidden = parseInt(el.getAttribute("data-tier"), 10) > t;
    });
    document.querySelectorAll(".tier-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(parseInt(b.value, 10) === t));
    });
    var price = document.querySelector(".tier-switch .tier-price");
    if (price && S.prices) price.textContent = S.prices[t - 1];
    try { localStorage.setItem(KEY, String(t)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("tierchange", { detail: t }));
  }

  // Preview-only package switcher (removed on real partner builds via S.preview = false)
  if (S.preview !== false) {
    var bar = document.createElement("div");
    bar.className = "tier-switch";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Preview package");
    bar.innerHTML = '<span class="tier-label">Package</span>' +
      tiers.map(function (n, i) { return '<button type="button" value="' + (i + 1) + '">' + n + "</button>"; }).join("") +
      '<span class="tier-price"></span>';
    document.body.appendChild(bar);
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) applyTier(parseInt(b.value, 10));
    });
    var badge = document.createElement("span");
    badge.className = "preview-tag";
    badge.innerHTML = "<b>Template preview</b> · sample brand &amp; content · iCelestial";
    document.body.appendChild(badge);
    var fb = document.createElement("a");
    fb.className = "feedback";
    fb.target = "_blank"; fb.rel = "noopener";
    fb.href = "https://wa.me/18764876913?text=" + encodeURIComponent("Hi iCelestial, feedback on the " + (S.template || "partner") + " website template preview: ");
    fb.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>Send feedback';
    document.body.appendChild(fb);
  }
  applyTier(tier);

  // 4. Nav: solid on scroll + mobile drawer
  var nav = document.querySelector(".nav");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 20); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var tog = document.querySelector(".nav-toggle");
  if (nav && tog) tog.addEventListener("click", function () {
    var o = nav.classList.toggle("open"); tog.setAttribute("aria-expanded", String(o));
  });

  // 5. Tickers / marquees loop
  document.querySelectorAll("[data-loop]").forEach(function (t) { t.innerHTML += t.innerHTML; });

  // 6. Reveal on scroll
  var rv = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });

  // 7. Filters: <div data-filter-group="x"><button data-filter="all">…  items: [data-filter-item="x"][data-cats]
  document.querySelectorAll("[data-filter-group]").forEach(function (g) {
    var name = g.getAttribute("data-filter-group");
    g.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filter]"); if (!b) return;
      g.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      var f = b.getAttribute("data-filter");
      document.querySelectorAll('[data-filter-item="' + name + '"]').forEach(function (it) {
        it.classList.toggle("is-hidden", !(f === "all" || (" " + it.getAttribute("data-cats") + " ").indexOf(" " + f + " ") > -1));
      });
    });
  });

  // 8. Multi-step forms: <form data-steps> with <fieldset class="step">
  document.querySelectorAll("form[data-steps]").forEach(function (f) {
    var steps = f.querySelectorAll(".step"), i = 0;
    var dots = f.querySelectorAll(".step-dot");
    function show(n) {
      i = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      dots.forEach(function (d, k) { d.classList.toggle("on", k <= i); });
      var prev = f.querySelector("[data-prev]"), next = f.querySelector("[data-next]"), sub = f.querySelector("[type=submit]");
      if (prev) prev.hidden = i === 0;
      if (next) next.hidden = i === steps.length - 1;
      if (sub) sub.hidden = i !== steps.length - 1;
    }
    f.addEventListener("click", function (e) {
      if (e.target.closest("[data-next]")) { e.preventDefault(); show(i + 1); }
      if (e.target.closest("[data-prev]")) { e.preventDefault(); show(i - 1); }
    });
    show(0);
  });

  // 9. Demo forms never send anything in the preview
  document.querySelectorAll("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = f.querySelector(".form-done"); if (d) d.hidden = false;
      var s = f.querySelector("[type=submit]"); if (s) s.disabled = true;
    });
  });

  // 10. Live countdowns: <span data-countdown="2026-12-05T19:00:00-05:00"><b></b><b></b><b></b><b></b></span>
  document.querySelectorAll("[data-countdown]").forEach(function (el) {
    var t = new Date(el.getAttribute("data-countdown")).getTime(), b = el.querySelectorAll("b");
    function tick() {
      var d = Math.max(0, t - Date.now());
      [Math.floor(d / 864e5), Math.floor(d % 864e5 / 36e5), Math.floor(d % 36e5 / 6e4), Math.floor(d % 6e4 / 1e3)]
        .forEach(function (v, k) { if (b[k]) b[k].textContent = String(v).padStart(2, "0"); });
    }
    tick(); setInterval(tick, 1000);
  });

  // 11. Seat bars: <div class="seats" data-seats="6" data-total="24">
  document.querySelectorAll("[data-seats]").forEach(function (el) {
    var s = +el.getAttribute("data-seats"), tt = +el.getAttribute("data-total") || 20;
    el.style.setProperty("--fill", ((tt - s) / tt * 100).toFixed(1) + "%");
  });

  // 12. Tilt cards (subtle 3D on hover) — [data-tilt]
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateZ(0)";
        el.style.setProperty("--mx", ((x + 0.5) * 100).toFixed(1) + "%");
        el.style.setProperty("--my", ((y + 0.5) * 100).toFixed(1) + "%");
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }
})();

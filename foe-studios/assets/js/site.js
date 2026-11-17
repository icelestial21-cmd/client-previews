/* FOE Studios preview — interactions (no dependencies) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Nav: solid on scroll + mobile drawer
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Marquee: duplicate for seamless loop
  document.querySelectorAll(".marquee-track").forEach(function (t) { t.innerHTML += t.innerHTML; });

  // Reveal on scroll
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  function fit(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, r.width * dpr);
    canvas.height = Math.max(1, r.height * dpr);
    return dpr;
  }
  function loop(canvas, draw) {
    var running = false, raf = 0, t0 = performance.now();
    function frame(now) { draw((now - t0) / 1000); raf = requestAnimationFrame(frame); }
    if (reduce) { draw(2); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(frame); }
        else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
      });
    }).observe(canvas);
  }

  // Hero: dotted globe inside a lens ring — echoes the FOE globe/lens mark
  document.querySelectorAll("canvas[data-globe]").forEach(function (c) {
    var ctx = c.getContext("2d"), dpr = fit(c);
    var pts = [], N = 1400, golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    var mx = 0, my = 0;
    window.addEventListener("pointermove", function (e) {
      mx = (e.clientX / window.innerWidth - 0.5); my = (e.clientY / window.innerHeight - 0.5);
    });
    window.addEventListener("resize", function () { dpr = fit(c); });
    loop(c, function (t) {
      var w = c.width, h = c.height, cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.34;
      ctx.clearRect(0, 0, w, h);
      // glow
      var g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.6);
      g.addColorStop(0, "rgba(22,112,197,0.28)"); g.addColorStop(1, "rgba(6,22,48,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // lens rings
      var tilt = 0.32 + my * 0.15;
      for (var k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * (1.22 + k * 0.16), R * (1.22 + k * 0.16) * (0.28 + k * 0.05), -0.42 + mx * 0.2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(33,134,208," + (0.5 - k * 0.14) + ")";
        ctx.lineWidth = (k === 0 ? 1.6 : 1) * dpr;
        ctx.stroke();
      }
      // orbiting node
      var a = t * 0.6;
      var ox = Math.cos(a) * R * 1.22, oy = Math.sin(a) * R * 1.22 * 0.28;
      var rot = -0.42 + mx * 0.2;
      var nx = cx + ox * Math.cos(rot) - oy * Math.sin(rot), ny = cy + ox * Math.sin(rot) + oy * Math.cos(rot);
      ctx.beginPath(); ctx.arc(nx, ny, 4 * dpr, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
      // globe points
      var ry = t * 0.12 + mx * 0.6, cr = Math.cos(ry), sr = Math.sin(ry), ct = Math.cos(tilt), st = Math.sin(tilt);
      for (var i = 0; i < N; i++) {
        var p = pts[i];
        var x = p[0] * cr + p[2] * sr, z = -p[0] * sr + p[2] * cr, y = p[1];
        var y2 = y * ct - z * st, z2 = y * st + z * ct;
        var depth = (z2 + 1) / 2;
        if (z2 < -0.15) continue;
        ctx.globalAlpha = 0.2 + depth * 0.8;
        ctx.fillStyle = depth > 0.82 ? "#ffffff" : "#5aa8e6";
        var s = (0.6 + depth * 1.5) * dpr;
        ctx.fillRect(cx + x * R - s / 2, cy + y2 * R - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    });
  });

  // CTA: flowing contour lines
  document.querySelectorAll("canvas[data-lines]").forEach(function (c) {
    var ctx = c.getContext("2d"), dpr = fit(c);
    window.addEventListener("resize", function () { dpr = fit(c); });
    loop(c, function (t) {
      var w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      var rows = 22;
      for (var i = 0; i < rows; i++) {
        var p = i / (rows - 1);
        ctx.beginPath();
        for (var x = 0; x <= w; x += 8 * dpr) {
          var nx = x / w;
          var y = h * (0.15 + p * 0.7)
            + Math.sin(nx * 5 + t * 0.5 + i * 0.4) * 22 * dpr
            + Math.sin(nx * 11 - t * 0.35 + i * 0.15) * 8 * dpr;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        var edge = Math.abs(p - 0.5) * 2;
        ctx.strokeStyle = "rgba(33,134,208," + (0.05 + edge * 0.22).toFixed(3) + ")";
        ctx.lineWidth = dpr;
        ctx.stroke();
      }
    });
  });

  // Portfolio filters
  var filters = document.querySelectorAll(".filters button");
  filters.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      filters.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      document.querySelectorAll("[data-cats]").forEach(function (item) {
        var show = f === "all" || item.getAttribute("data-cats").split(" ").indexOf(f) > -1;
        item.classList.toggle("hide", !show);
      });
    });
  });

  // Demo-only forms
  document.querySelectorAll("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var done = f.querySelector(".form-done");
      if (done) done.classList.add("show");
      var btn = f.querySelector("[type=submit]");
      if (btn) btn.disabled = true;
    });
  });
})();

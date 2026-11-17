/* Manchester FA preview — interactions (no dependencies) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile nav
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Ticker: duplicate track for a seamless loop
  document.querySelectorAll(".ticker-track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  // Countdown
  document.querySelectorAll("[data-countdown]").forEach(function (el) {
    var target = new Date(el.getAttribute("data-countdown")).getTime();
    var parts = el.querySelectorAll("b");
    function tick() {
      var d = Math.max(0, target - Date.now());
      var vals = [
        Math.floor(d / 864e5),
        Math.floor((d % 864e5) / 36e5),
        Math.floor((d % 36e5) / 6e4),
        Math.floor((d % 6e4) / 1e3)
      ];
      vals.forEach(function (v, i) { if (parts[i]) parts[i].textContent = String(v).padStart(2, "0"); });
    }
    tick();
    setInterval(tick, 1000);
  });

  // Reveal on scroll
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // Canvas helpers
  function fit(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, r.width * dpr);
    canvas.height = Math.max(1, r.height * dpr);
    return dpr;
  }
  function visibleLoop(canvas, draw) {
    var running = false, raf = 0, t0 = performance.now();
    function frame(now) { draw((now - t0) / 1000); raf = requestAnimationFrame(frame); }
    if (reduce) { fit(canvas); draw(0); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(frame); }
        else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
      });
    });
    io.observe(canvas);
  }

  // 3D wave-line mesh (next-match card)
  document.querySelectorAll("canvas[data-mesh]").forEach(function (c) {
    var ctx = c.getContext("2d"), dpr = fit(c);
    window.addEventListener("resize", function () { dpr = fit(c); });
    visibleLoop(c, function (t) {
      var w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      var rows = 26;
      for (var i = 0; i < rows; i++) {
        var p = i / (rows - 1);
        var depth = 0.35 + p * 0.65;
        var baseY = h * (0.28 + p * 0.75);
        ctx.beginPath();
        for (var x = 0; x <= w; x += 6 * dpr) {
          var nx = x / w;
          var y = baseY
            + Math.sin(nx * 7 + t * 0.9 + i * 0.35) * 18 * dpr * depth
            + Math.sin(nx * 13 - t * 0.6 + i * 0.2) * 9 * dpr * depth
            - Math.exp(-Math.pow((nx - 0.5) * 3.2, 2)) * 70 * dpr * depth;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(58,97,212," + (0.12 + depth * 0.5).toFixed(3) + ")";
        ctx.lineWidth = (0.6 + depth * 1.1) * dpr;
        ctx.stroke();
      }
    });
  });

  // Particle starfield (closing CTA)
  document.querySelectorAll("canvas[data-particles]").forEach(function (c) {
    var ctx = c.getContext("2d"), dpr = fit(c), stars = [];
    function seed() {
      stars = [];
      var n = Math.round((c.width * c.height) / (9000 * dpr * dpr));
      for (var i = 0; i < n; i++) stars.push({ x: Math.random(), y: Math.random(), z: Math.random(), s: Math.random() });
    }
    seed();
    window.addEventListener("resize", function () { dpr = fit(c); seed(); });
    visibleLoop(c, function (t) {
      var w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      var g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
      g.addColorStop(0, "rgba(31,69,194,0.25)"); g.addColorStop(1, "rgba(5,7,15,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      stars.forEach(function (st) {
        var y = (st.y + t * 0.01 * (0.3 + st.z)) % 1;
        var r = (0.4 + st.z * 1.6) * dpr;
        var a = 0.25 + 0.6 * Math.abs(Math.sin(t * (0.5 + st.s) + st.s * 10));
        ctx.beginPath();
        ctx.arc(st.x * w, y * h, r, 0, Math.PI * 2);
        ctx.fillStyle = st.s > 0.85 ? "rgba(236,94,105," + a.toFixed(2) + ")" : "rgba(160,185,255," + a.toFixed(2) + ")";
        ctx.fill();
      });
    });
  });

  // Demo-only forms: show a friendly confirmation instead of submitting
  document.querySelectorAll("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = f.querySelector("[type=submit]");
      if (btn) btn.textContent = "Thanks — this is a preview, nothing was sent";
    });
  });
})();

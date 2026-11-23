/* Kings of the Cage: website preview behaviour (iCelestial) */
(function () {
  var root = document.documentElement;

  // Performance tier for the 3D crown: weaker GPUs, low memory, small screens or data-saver get "lite"
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

  // Nav: solid on scroll + mobile menu
  var nav = document.querySelector(".nav");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var tog = document.querySelector(".nav-toggle");
  if (nav && tog) {
    tog.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      tog.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); tog.setAttribute("aria-expanded", "false"); });
    });
  }

  // Reveal on scroll
  var rv = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });

  // Count-up numbers
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count")), dec = (el.getAttribute("data-count").split(".")[1] || "").length;
    var fmt = function (v) { return v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    var done = false;
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || done) return; done = true;
      var t0 = performance.now(), dur = 1400;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(end * k);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
    o.observe(el);
  });

  // Announcement bar set from the admin page preview (this device only)
  try {
    var siteCfg = JSON.parse(localStorage.getItem("koc-site") || "null"), bar = document.querySelector(".announce");
    if (siteCfg && siteCfg.ann && bar) {
      var a = siteCfg.ann, w = bar.querySelector(".wrap");
      if (!a.show) bar.style.display = "none";
      else if (w) {
        var e = function (t) { var x = document.createElement("span"); x.textContent = t || ""; return x.innerHTML; };
        w.innerHTML = "<span><b>" + e(a.title) + "</b>" + (a.detail ? '<span class="hide-s"> · ' + e(a.detail) + "</span>" : "") + (a.when ? " · " + e(a.when) : "") + "</span>" +
          '<span class="count"' + (a.date ? ' data-countdown="' + e(a.date) + 'T00:00:00-05:00"' : "") + ">" + (a.date ? "" : "Date TBA") + "</span>" +
          (a.link ? '<a href="' + e(a.href) + '" class="hide-s">' + e(a.link) + "</a>" : "");
      }
    }
  } catch (err) {}

  // New York II countdown (Saturday 21 November 2026, Brooklyn)
  var cd = document.querySelectorAll("[data-countdown]");
  if (cd.length) {
    var target = new Date(cd[0].getAttribute("data-countdown"));
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var t = new Date(target); t.setHours(0, 0, 0, 0);
    var days = Math.round((t - today) / 864e5);
    var label = days > 1 ? days + " days to go" : days === 1 ? "Tomorrow" : days === 0 ? "Today" : "Played · results soon";
    cd.forEach(function (el) { el.textContent = label; });
  }

  // Ticker: duplicate content for a seamless loop
  document.querySelectorAll(".ticker-track").forEach(function (tr) { tr.innerHTML += tr.innerHTML; });

  // Multi-step forms
  document.querySelectorAll("form[data-steps]").forEach(function (f) {
    var steps = f.querySelectorAll(".step"), bars = f.querySelectorAll(".steps span"), i = 0;
    var prev = f.querySelector("[data-prev]"), next = f.querySelector("[data-next]"), nextHTML = next ? next.innerHTML : "";
    function show(n) {
      i = n;
      steps.forEach(function (s, k) { s.classList.toggle("on", k === n); });
      bars.forEach(function (b, k) { b.classList.toggle("on", k <= n); });
      if (prev) prev.style.visibility = n === 0 ? "hidden" : "visible";
      if (next) {
        var last = n === steps.length - 1;
        next.innerHTML = last ? (next.getAttribute("data-final") || "Submit") : nextHTML;
        next.type = last ? "submit" : "button";
      }
    }
    f.addEventListener("click", function (e) {
      var b = e.target.closest("[data-next],[data-prev]");
      if (!b) return;
      if (b.type === "submit") {
        var badL = Array.prototype.find.call(steps[i].querySelectorAll("input,select,textarea"), function (x) { return !x.checkValidity(); });
        if (badL) { e.preventDefault(); badL.reportValidity(); }
        return;
      }
      e.preventDefault();
      if (b.hasAttribute("data-next")) {
        var bad = Array.prototype.find.call(steps[i].querySelectorAll("input,select,textarea"), function (x) { return !x.checkValidity(); });
        if (bad) { bad.reportValidity(); return; }
        show(Math.min(i + 1, steps.length - 1));
      } else show(Math.max(i - 1, 0));
      f.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    show(0);
  });

  // Demo submit: nothing is sent from the preview
  document.querySelectorAll("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      // Preview only: keep a copy on this device so it shows up in the admin page preview
      try {
        var data = {}; Array.prototype.forEach.call(f.elements, function (el) {
          var k = el.name || el.id; if (!k || el.type === "button" || el.type === "submit") return;
          if ((el.type === "radio" || el.type === "checkbox") && !el.checked) return;
          data[k] = data[k] && el.type === "checkbox" ? data[k] + ", " + el.value : el.value;
        });
        var type = data.team ? "team" : data.sname || data.sco ? "sponsor" : data.hname ? "host" : "";
        if (type) {
          var box = JSON.parse(localStorage.getItem("koc-inbox") || "[]");
          box.push({ id: "w" + Date.now().toString(36), type: type, date: new Date().toISOString(), f: data });
          localStorage.setItem("koc-inbox", JSON.stringify(box.slice(-50)));
        }
      } catch (err) {}
      var name = f.querySelector("[data-echo]");
      var done = f.querySelector(".done");
      f.querySelectorAll(".step,.steps,.form-body,.form-nav").forEach(function (x) { x.style.display = "none"; });
      if (done) {
        var slot = done.querySelector("[data-echo-slot]");
        if (slot && name && name.value) slot.textContent = name.value;
        done.classList.add("on");
      }
    });
  });

  // Sponsor line picker summary
  var pick = document.querySelector("[data-picker]");
  if (pick) {
    var out = document.querySelector("[data-picked]"), field = document.querySelector("[data-picked-field]");
    var update = function () {
      var on = Array.prototype.map.call(pick.querySelectorAll("input:checked"), function (x) { return x.value; });
      out.innerHTML = on.length ? "Selected: <b>" + on.join(", ") + "</b>" : "Tick the lines your brand would like to own. The title package covers the cash prize and headline costs.";
      if (field) field.value = on.join(", ");
    };
    pick.addEventListener("change", update); update();
  }

  // Preview chrome: badge + WhatsApp feedback to iCelestial
  var badge = document.createElement("span");
  badge.className = "preview-tag";
  badge.innerHTML = "<b>Website preview</b> · placeholder photos · iCelestial";
  document.body.appendChild(badge);
  var fb = document.createElement("a");
  fb.className = "feedback"; fb.target = "_blank"; fb.rel = "noopener";
  fb.href = "https://wa.me/18764876913?text=" + encodeURIComponent("Hi iCelestial, feedback on the Kings of the Cage website preview (" + (document.title.split(" | ")[0]) + "): ");
  fb.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>Send feedback';
  document.body.appendChild(fb);
})();

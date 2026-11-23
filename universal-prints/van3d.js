// Universal Prints: live 3D wrap van. Procedural Three.js van (side profile extruded, clearcoat paint, glass, wheels);
// the wrap is a canvas texture redrawn from the wrap studio (colour, style, business name, tagline).
// Uses the shared stage helper (DPR cap, off-screen pause, reduced motion, WebGL fallback to the SVG van).
import { stage } from "../partner-engine/3d/core.js";
import { RoomEnvironment } from "../partner-engine/vendor/RoomEnvironment.js";

var STATE = { c: "#e3121b", s: "full", name: "YOUR BRAND", line: "876 000 0000 · MONTEGO BAY" };
var vans = [];
window.addEventListener("upwrap", function (e) { Object.assign(STATE, e.detail || {}); vans.forEach(function (v) { v.redraw(); }); });

// side profile, same outline as the SVG van (viewBox units), van faces +x
var P = [[40, 70], [470, 70], [530, 130], [570, 150], [570, 220], [556, 234], [40, 234], [26, 220], [26, 84]];
var MINX = 26, MAXX = 570, MINY = 70, MAXY = 234, CX = 298, CY = 152, S = 100;
var X = function (x) { return (x - CX) / S; }, Y = function (y) { return (CY - y) / S; };

function drawWrap(cv) {
  var g = cv.getContext("2d"), W = cv.width, H = cv.height, st = STATE;
  var light = st.c === "#f5f5f0" || st.c === "#f5c400";
  var cx = function (x) { return (x - MINX) / (MAXX - MINX) * W; }, cy = function (y) { return (y - MINY) / (MAXY - MINY) * H; };
  g.fillStyle = st.s === "full" ? st.c : "#f5f5f0"; g.fillRect(0, 0, W, H);
  if (st.s === "half") {
    g.fillStyle = st.c; g.beginPath(); g.moveTo(0, cy(160));
    g.bezierCurveTo(cx(180), cy(120), cx(360), cy(230), W, cy(150)); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  }
  if (st.s === "decal") {
    g.fillStyle = st.c; g.fillRect(0, cy(214), W, cy(226) - cy(214));
    g.beginPath(); g.moveTo(cx(330), H); g.lineTo(cx(420), cy(150)); g.lineTo(cx(450), cy(150)); g.lineTo(cx(360), H); g.fill();
  }
  // halftone dots
  g.fillStyle = "rgba(0,0,0,.13)";
  var step = W / 70;
  for (var yy = step / 2; yy < H; yy += step) for (var xx = step / 2; xx < W; xx += step) {
    var r = step * 0.16 * (0.5 + 0.9 * (xx / W)); g.beginPath(); g.arc(xx, yy, r, 0, 6.283); g.fill();
  }
  // gloss sweep
  g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.moveTo(0, cy(210));
  g.bezierCurveTo(cx(200), cy(170), cx(380), cy(250), W, cy(196)); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  var ink = st.s === "half" ? "#0b0b0b" : st.s === "decal" ? (light ? "#0b0b0b" : st.c) : (light ? "#0b0b0b" : "#ffffff");
  var name = (st.name || "YOUR BRAND").toUpperCase(), line = (st.line || "").toUpperCase();
  g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "alphabetic";
  var fs = H * (name.length > 12 ? 0.2 : 0.27);
  g.font = "400 " + fs + "px Anton, Impact, sans-serif";
  while (g.measureText(name).width > cx(300) - cx(36) && fs > 20) { fs -= 4; g.font = "400 " + fs + "px Anton, Impact, sans-serif"; }
  g.fillText(name, cx(168), cy(170));
  g.font = "700 " + (H * 0.085) + "px 'JetBrains Mono', monospace";
  var lf = H * 0.085; while (g.measureText(line).width > cx(300) - cx(36) && lf > 10) { lf -= 1; g.font = "700 " + lf + "px 'JetBrains Mono', monospace"; }
  g.fillText(line, cx(168), cy(202));
  g.fillStyle = "rgba(0,0,0,.55)"; g.font = "700 " + (H * 0.05) + "px 'JetBrains Mono', monospace"; g.textAlign = "right";
  if (st.s !== "full" || light) g.fillText("UNIVERSAL PRINTS JA", cx(455), cy(226));
}

function shapeOf(THREE, pts) {
  var s = new THREE.Shape(); pts.forEach(function (p, i) { i ? s.lineTo(X(p[0]), Y(p[1])) : s.moveTo(X(p[0]), Y(p[1])); }); s.closePath(); return s;
}

document.querySelectorAll("[data-van3d]").forEach(function (host) {
  var interactive = host.hasAttribute("data-drag");
  var api = stage(host, function (o) {
    var THREE = o.THREE, scene = o.scene, camera = o.camera, renderer = o.renderer, lite = o.lite;
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.75;
    renderer.toneMapping = THREE.NeutralToneMapping;
    var key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 6, 5); scene.add(key);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.5));

    var DEPTH = 1.55, BEV = 0.08;
    var van = new THREE.Group(); scene.add(van);
    var cv = document.createElement("canvas"); cv.width = lite ? 1024 : 2048; cv.height = Math.round(cv.width * (MAXY - MINY) / (MAXX - MINX));
    drawWrap(cv);
    var tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = lite ? 1 : 8;
    var w = (MAXX - MINX) / S, h = (MAXY - MINY) / S;
    tex.repeat.set(1 / w, 1 / h); tex.offset.set(-X(MINX) / w, -Y(MAXY) / h);
    var geo = new THREE.ExtrudeGeometry(shapeOf(THREE, P), { depth: DEPTH, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: lite ? 2 : 5, curveSegments: 8 });
    geo.translate(0, 0, -DEPTH / 2);
    // mirror the far side's UVs so the lettering reads left to right from both sides
    var nrm = geo.attributes.normal, uv = geo.attributes.uv, sum = X(MINX) + X(MAXX);
    for (var i = 0; i < uv.count; i++) if (nrm.getZ(i) < -0.5) uv.setX(i, sum - uv.getX(i));
    var paint = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12 });
    var shell = new THREE.MeshPhysicalMaterial({ color: STATE.c, roughness: 0.3, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.15 });
    var body = new THREE.Mesh(geo, [paint, shell]); van.add(body);

    var glass = new THREE.MeshPhysicalMaterial({ color: 0x1b2a36, roughness: 0.05, metalness: 0.6, clearcoat: 1 });
    var zf = DEPTH / 2 + BEV + 0.004;
    [[[420, 80], [464, 80], [516, 132], [420, 132]], [[300, 84], [396, 84], [396, 132], [300, 132]]].forEach(function (pts) {
      var sg = new THREE.ShapeGeometry(shapeOf(THREE, pts));
      var a = new THREE.Mesh(sg, glass); a.position.z = zf; van.add(a);
      var b = new THREE.Mesh(sg, glass); b.position.z = -zf; b.rotation.y = Math.PI; b.scale.x = -1; b.position.x = 0; van.add(b);
    });
    // windscreen on the sloped nose
    var ws = new THREE.Mesh(new THREE.PlaneGeometry(DEPTH * 0.86, Math.hypot(0.6, 0.6) * 0.8), glass);
    ws.position.set(X(500) + 0.055, Y(100) + 0.055, 0); ws.rotation.set(0, Math.PI / 2, 0); ws.rotateX(-Math.PI / 4); van.add(ws);
    // lights
    var hl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.34), new THREE.MeshStandardMaterial({ color: 0xffe2a0, emissive: 0xffc860, emissiveIntensity: 0.9 }));
    [-1, 1].forEach(function (s) { var m = hl.clone(); m.position.set(X(570) + BEV, Y(192), s * 0.5); van.add(m); });
    var tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.16), new THREE.MeshStandardMaterial({ color: 0x8a0a0a, emissive: 0xc0101a, emissiveIntensity: 0.6 }));
    [-1, 1].forEach(function (s) { var m = tl.clone(); m.position.set(X(26) - BEV, Y(120), s * 0.62); van.add(m); });
    // wheels
    var tyre = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 }), hub = new THREE.MeshStandardMaterial({ color: 0xb8b8b8, metalness: 0.9, roughness: 0.25 });
    var tg = new THREE.CylinderGeometry(0.34, 0.34, 0.28, lite ? 20 : 40); tg.rotateX(Math.PI / 2);
    var hg = new THREE.CylinderGeometry(0.15, 0.15, 0.3, lite ? 14 : 28); hg.rotateX(Math.PI / 2);
    var wheels = [];
    [X(130), X(500)].forEach(function (x) { [-1, 1].forEach(function (s) {
      var wgrp = new THREE.Group(); wgrp.add(new THREE.Mesh(tg, tyre)); wgrp.add(new THREE.Mesh(hg, hub));
      wgrp.position.set(x, Y(236), s * (DEPTH / 2 - 0.02)); van.add(wgrp); wheels.push(wgrp);
    }); });
    // soft ground shadow
    var sc = document.createElement("canvas"); sc.width = sc.height = 128; var sg2 = sc.getContext("2d");
    var gr = sg2.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, "rgba(0,0,0,.55)"); gr.addColorStop(1, "rgba(0,0,0,0)"); sg2.fillStyle = gr; sg2.fillRect(0, 0, 128, 128);
    var shadow = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 2.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = Y(236) - 0.34 + 0.005; scene.add(shadow);
    van.position.y = 0.15; shadow.position.y += 0.15;

    var v = { redraw: function () { drawWrap(cv); tex.needsUpdate = true; shell.color.set(STATE.s === "full" ? STATE.c : "#f5f5f0"); } };
    vans.push(v);
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("400 40px Anton"), document.fonts.load("700 20px 'JetBrains Mono'")]).then(v.redraw, v.redraw);

    // drag to spin (studio), slow showcase turn (hero)
    var yaw = interactive ? -0.55 : -0.5, vel = 0, dragging = false, lx = 0, idle = 0;
    if (interactive) {
      host.addEventListener("pointerdown", function (e) { dragging = true; lx = e.clientX; host.setPointerCapture(e.pointerId); host.classList.add("grab"); });
      host.addEventListener("pointermove", function (e) { if (!dragging) return; var dx = e.clientX - lx; lx = e.clientX; yaw += dx * 0.01; vel = dx * 0.01; idle = 0; });
      var up = function () { dragging = false; host.classList.remove("grab"); };
      host.addEventListener("pointerup", up); host.addEventListener("pointercancel", up);
    }
    var lastT = 0;
    return {
      resize: function (W, H) { var a = W / H; camera.fov = 30; camera.position.set(0, 1.3, interactive ? Math.max(6, 9.5 / a + 2.2) : Math.max(6.4, 11 / a + 2)); camera.lookAt(0, -0.15, 0); camera.updateProjectionMatrix(); },
      update: function (t, p) {
        var dt = Math.min(0.05, t - lastT); lastT = t;
        if (!dragging) { vel *= 0.94; yaw += vel; idle += dt; if (idle > 2.5 || !interactive) yaw += dt * (interactive ? 0.18 : 0.22); }
        van.rotation.y = yaw + (interactive ? 0 : p.x * 0.12);
        van.rotation.x = interactive ? 0 : p.y * 0.04;
        van.position.y = 0.15 + Math.sin(t * 1.6) * 0.015;
        wheels.forEach(function (w) { w.rotation.z = -t * (interactive ? 0.6 : 2.2); });
        shadow.rotation.z = -van.rotation.y;
      }
    };
  });
});

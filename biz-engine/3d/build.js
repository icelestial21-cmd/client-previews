// 3D hero scenes for the construction templates: a tower rising floor by floor with a crane, a bridge assembling, a house going from slab to finish.
import { stage, THREE } from "../../partner-engine/3d/core.js";
import { RoomEnvironment } from "../../partner-engine/vendor/RoomEnvironment.js";

function C(c) { return new THREE.Color(c); }
function env(ctx, k) {
  var T = ctx.THREE, r = ctx.renderer, s = ctx.scene;
  r.toneMapping = T.NeutralToneMapping;
  s.environment = new T.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture; s.environmentIntensity = k || 0.9;
  var key = new T.DirectionalLight(0xffffff, 2.1); key.position.set(6, 9, 5); s.add(key);
  var fill = new T.DirectionalLight(0xffffff, 0.6); fill.position.set(-5, 3, -2); s.add(fill);
  s.add(new T.AmbientLight(0xffffff, 0.3));
}
function box(w, h, d, m) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); }
function ease(x) { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 3); }
function orbit(el, ctx, base) {
  var s = { yaw: base || 0, vel: 0, drag: false, lx: 0 };
  el.addEventListener("pointerdown", function (e) { s.drag = true; s.lx = e.clientX; });
  el.addEventListener("pointermove", function (e) { if (!s.drag) return; s.vel = (e.clientX - s.lx) * 0.005; s.yaw += s.vel; s.lx = e.clientX; });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) { el.addEventListener(n, function () { s.drag = false; }); });
  s.step = function (auto) { if (!s.drag) { s.vel *= 0.93; s.yaw += s.vel + auto; } return s.yaw; };
  return s;
}
function windowTex(glass, frame, lit) {
  var c = document.createElement("canvas"); c.width = 256; c.height = 64; var x = c.getContext("2d");
  x.fillStyle = frame; x.fillRect(0, 0, 256, 64);
  for (var i = 0; i < 8; i++) { x.fillStyle = (i * 37 % 5 === 0) ? lit : glass; x.fillRect(i * 32 + 3, 6, 26, 50); }
  var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function cam(ctx, w, h, d, y, ly) {
  var n = w / h < 1, c = ctx.camera;
  c.fov = n ? 44 : 32; c.position.set(0, y * (n ? 1.15 : 1), d * (n ? 1.35 : 1)); c.lookAt(0, ly, 0); c.updateProjectionMatrix();
}

// ---------- tower + crane ----------
export function mountTower(el, o) {
  o = o || {};
  var api = {};
  stage(el, function (ctx) {
    var T = ctx.THREE; env(ctx, o.env);
    var pivot = new T.Group(); ctx.scene.add(pivot);
    var ground = new T.Mesh(new T.CylinderGeometry(5.2, 5.2, 0.12, 80), new T.MeshStandardMaterial({ color: C(o.ground || "#1a1d24"), roughness: 0.9 }));
    ground.position.y = -0.06; pivot.add(ground);
    var grid = new T.GridHelper(10, 20, C(o.grid || "#2b3242"), C(o.grid || "#2b3242")); grid.position.y = 0.002; pivot.add(grid);
    var slabM = new T.MeshStandardMaterial({ color: C(o.slab || "#c9ced6"), roughness: 0.7 });
    var steel = new T.MeshStandardMaterial({ color: C(o.steel || "#8a93a3"), metalness: 0.7, roughness: 0.35 });
    var glassM = new T.MeshStandardMaterial({ map: windowTex(o.glass || "#28405e", o.frame || "#11141c", o.lit || "#ffd27a"), metalness: 0.3, roughness: 0.25, emissive: C("#ffffff"), emissiveIntensity: 0.08 });
    var amber = new T.MeshStandardMaterial({ color: C(o.accent || "#ffb800"), roughness: 0.45, metalness: 0.2 });
    var base = box(3.2, 0.25, 2.4, slabM); base.position.set(-0.4, 0.125, 0); pivot.add(base);
    var floors = [], N = o.floors || 9, FH = 0.42;
    for (var i = 0; i < N; i++) {
      var f = new T.Group(); f.position.set(-0.4, 0.25 + i * FH, 0);
      var s = box(3.0, 0.07, 2.2, slabM); s.position.y = FH; f.add(s);
      var g = box(2.86, FH - 0.07, 2.06, glassM); g.position.y = (FH - 0.07) / 2 + 0.0; f.add(g);
      [[-1.45, -1.05], [1.45, -1.05], [-1.45, 1.05], [1.45, 1.05]].forEach(function (q) { var c = box(0.08, FH, 0.08, steel); c.position.set(q[0], FH / 2, q[1]); f.add(c); });
      f.scale.y = 0.001; f.visible = false; pivot.add(f); floors.push(f);
    }
    // crane
    var crane = new T.Group(); crane.position.set(2.3, 0, -0.9); pivot.add(crane);
    var mastH = 0.25 + N * FH + 1.0;
    for (var k = 0; k < 4; k++) { var leg = box(0.05, mastH, 0.05, amber); leg.position.set(k < 2 ? -0.14 : 0.14, mastH / 2, k % 2 ? -0.14 : 0.14); crane.add(leg); }
    for (var y = 0.3; y < mastH; y += 0.3) { var r1 = box(0.3, 0.03, 0.03, amber); r1.position.set(0, y, 0.14); r1.rotation.z = 0.7; crane.add(r1); var r2 = box(0.03, 0.03, 0.3, amber); r2.position.set(0.14, y + 0.15, 0); r2.rotation.x = 0.7; crane.add(r2); }
    var top = new T.Group(); top.position.y = mastH; crane.add(top);
    var jib = box(4.6, 0.12, 0.12, amber); jib.position.set(-1.6, 0.1, 0); top.add(jib);
    var cj = box(1.4, 0.12, 0.12, amber); cj.position.set(0.9, 0.1, 0); top.add(cj);
    var cw = box(0.4, 0.35, 0.35, new T.MeshStandardMaterial({ color: 0x444a55, roughness: 0.8 })); cw.position.set(1.45, -0.1, 0); top.add(cw);
    var cab = box(0.35, 0.3, 0.3, new T.MeshStandardMaterial({ color: 0xf2f2f2 })); cab.position.set(0.1, -0.16, 0.25); top.add(cab);
    var apex = box(0.06, 0.8, 0.06, amber); apex.position.set(0, 0.5, 0); top.add(apex);
    var trolley = new T.Group(); top.add(trolley);
    var cable = box(0.015, 1, 0.015, new T.MeshStandardMaterial({ color: 0x222222 })); trolley.add(cable);
    var load = box(0.9, 0.12, 0.5, steel); trolley.add(load);
    var orb = orbit(el, ctx, -0.5);
    api.setFloors = function (n) { N = Math.max(3, Math.min(floors.length, n)); };
    var cycle = o.cycle || 11;
    return {
      resize: function (w, h) { cam(ctx, w, h, 12.2, 4.6, 1.9); },
      update: function (t) {
        pivot.rotation.y = orb.step(0.0022);
        var p = (t % cycle) / cycle, built = p < 0.8 ? p / 0.8 * N : N, fade = p > 0.92 ? 1 - (p - 0.92) / 0.08 : 1;
        floors.forEach(function (f, i) { var k = ease(built - i); f.visible = k > 0.001 && i < N; f.scale.y = Math.max(0.001, k * fade); });
        top.rotation.y = Math.sin(t * 0.5) * 0.9 - 0.4;
        var tx = -1.0 - 2.0 * (0.5 + 0.5 * Math.sin(t * 0.9));
        var hookY = -0.6 - 1.2 * (0.5 + 0.5 * Math.sin(t * 1.3));
        trolley.position.set(tx, 0, 0); cable.scale.y = -hookY; cable.position.y = hookY / 2; load.position.y = hookY;
      }
    };
  });
  return api;
}

// ---------- bridge ----------
export function mountBridge(el, o) {
  o = o || {};
  stage(el, function (ctx) {
    var T = ctx.THREE; env(ctx, o.env || 1);
    var pivot = new T.Group(); ctx.scene.add(pivot);
    var earth = new T.MeshStandardMaterial({ color: C(o.earth || "#cfc6b4"), roughness: 0.95 });
    var conc = new T.MeshStandardMaterial({ color: C(o.concrete || "#e7e3da"), roughness: 0.8 });
    var dark = new T.MeshStandardMaterial({ color: C(o.asphalt || "#2b2a28"), roughness: 0.9 });
    var acc = new T.MeshStandardMaterial({ color: C(o.accent || "#0072ce"), roughness: 0.35, metalness: 0.4 });
    var water = new T.Mesh(new T.BoxGeometry(3.2, 0.1, 4), new T.MeshPhysicalMaterial({ color: C(o.water || "#7fa8c9"), roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.85 }));
    water.position.y = -0.55; pivot.add(water);
    [-1, 1].forEach(function (s) {
      var bank = box(2.6, 1.0, 4, earth); bank.position.set(s * 2.9, -0.5, 0); pivot.add(bank);
      var road = box(2.6, 0.04, 1.3, dark); road.position.set(s * 2.9, 0.02, 0); pivot.add(road);
      var ab = box(0.5, 1.2, 1.6, conc); ab.position.set(s * 1.75, -0.4, 0); pivot.add(ab);
    });
    var segs = [], NS = 8, L = 3.5 / NS;
    for (var i = 0; i < NS; i++) {
      var g = new T.Group();
      var d = box(L - 0.02, 0.16, 1.5, conc); g.add(d);
      var a = box(L - 0.02, 0.02, 1.3, dark); a.position.y = 0.09; g.add(a);
      var dash = box(L * 0.5, 0.005, 0.05, new T.MeshBasicMaterial({ color: 0xffffff })); dash.position.y = 0.105; g.add(dash);
      g.userData.x = -1.75 + L / 2 + i * L; g.position.set(g.userData.x, 0, 0); pivot.add(g); segs.push(g);
    }
    var arches = [];
    [-0.72, 0.72].forEach(function (z) {
      var pts = []; for (var k = 0; k <= 40; k++) { var x = -1.75 + 3.5 * k / 40; pts.push(new T.Vector3(x, 0.08 + 1.35 * (1 - Math.pow(x / 1.75, 2)), z)); }
      var tube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 80, 0.06, 12), acc); pivot.add(tube); arches.push(tube);
    });
    var hangers = [];
    for (var j = 1; j < 10; j++) {
      var x = -1.75 + 3.5 * j / 10, hgt = 1.35 * (1 - Math.pow(x / 1.75, 2));
      [-0.72, 0.72].forEach(function (z) { var hg = box(0.015, hgt, 0.015, acc); hg.position.set(x, 0.08 + hgt / 2, z); hg.userData.h = hgt; pivot.add(hg); hangers.push(hg); });
    }
    // little survey markers / cones
    for (var c = 0; c < 6; c++) { var cone = new T.Mesh(new T.ConeGeometry(0.06, 0.16, 16), new T.MeshStandardMaterial({ color: C(o.cone || "#ff6a00") })); cone.position.set(2.2 + (c % 3) * 0.5, 0.1, c < 3 ? 0.8 : -0.8); pivot.add(cone); }
    var orb = orbit(el, ctx, 0.55);
    var cycle = o.cycle || 10;
    return {
      resize: function (w, h) { cam(ctx, w, h, 8.6, 3.6, 0.2); },
      update: function (t) {
        pivot.rotation.y = orb.step(0.0018) + Math.sin(t * 0.2) * 0.1;
        var p = (t % cycle) / cycle, fade = p > 0.93 ? 1 - (p - 0.93) / 0.07 : 1;
        segs.forEach(function (g, i) { var k = ease(p * 10 - i * 0.45); g.position.y = (1 - k) * 2.2; g.visible = k > 0.01 && fade > 0.02; g.scale.setScalar(Math.max(0.01, fade)); });
        var ak = ease(p * 10 - 4.4) * fade; arches.forEach(function (a) { a.scale.set(1, Math.max(0.001, ak), 1); a.visible = ak > 0.01; });
        hangers.forEach(function (h, i) { var k = ease(p * 10 - 5.6 - (i % 9) * 0.12) * fade; h.visible = k > 0.01; h.scale.y = Math.max(0.001, k); h.position.y = 0.08 + h.userData.h * k / 2; });
        water.position.y = -0.55 + Math.sin(t * 1.5) * 0.01;
      }
    };
  });
}

// ---------- house: slab -> frame -> roof -> finish ----------
export function mountHouse(el, o) {
  o = o || {};
  var api = {};
  stage(el, function (ctx) {
    var T = ctx.THREE; env(ctx, o.env || 1);
    var pivot = new T.Group(); ctx.scene.add(pivot);
    var lawn = new T.Mesh(new T.CylinderGeometry(4.6, 4.6, 0.1, 80), new T.MeshStandardMaterial({ color: C(o.lawn || "#f2f2f2"), roughness: 0.95 }));
    lawn.position.y = -0.05; pivot.add(lawn);
    var slab = box(4.2, 0.2, 3.0, new T.MeshStandardMaterial({ color: C(o.slab || "#bfc3c9"), roughness: 0.8 })); slab.position.y = 0.1; pivot.add(slab);
    var wood = new T.MeshStandardMaterial({ color: C(o.frame || "#d9a066"), roughness: 0.75 });
    var frame = new T.Group(); pivot.add(frame);
    var W = 4.0, D = 2.8, Hh = 1.5, y0 = 0.2;
    for (var x = -W / 2; x <= W / 2 + 0.01; x += 0.4) [-D / 2, D / 2].forEach(function (z) { var s = box(0.06, Hh, 0.06, wood); s.position.set(x, y0 + Hh / 2, z); frame.add(s); });
    for (var z = -D / 2 + 0.4; z < D / 2; z += 0.4) [-W / 2, W / 2].forEach(function (xx) { var s = box(0.06, Hh, 0.06, wood); s.position.set(xx, y0 + Hh / 2, z); frame.add(s); });
    [y0 + 0.03, y0 + Hh].forEach(function (yy) { [-D / 2, D / 2].forEach(function (zz) { var p = box(W, 0.06, 0.08, wood); p.position.set(0, yy, zz); frame.add(p); }); [-W / 2, W / 2].forEach(function (xx) { var p = box(0.08, 0.06, D, wood); p.position.set(xx, yy, 0); frame.add(p); }); });
    var trusses = new T.Group(); pivot.add(trusses);
    var RH = 1.1;
    for (var tx = -W / 2; tx <= W / 2 + 0.01; tx += 0.5) {
      var l = Math.hypot(D / 2 + 0.2, RH), ang = Math.atan2(RH, D / 2 + 0.2);
      [-1, 1].forEach(function (s) { var r = box(0.06, 0.06, l, wood); r.position.set(tx, y0 + Hh + RH / 2, s * (D / 4 + 0.05)); r.rotation.x = s * ang; trusses.add(r); });
      var tie = box(0.05, 0.05, D + 0.3, wood); tie.position.set(tx, y0 + Hh + 0.05, 0); trusses.add(tie);
    }
    var finish = new T.Group(); pivot.add(finish);
    var wallM = new T.MeshStandardMaterial({ color: C(o.wall || "#ffffff"), roughness: 0.6, transparent: true });
    var walls = box(W + 0.08, Hh, D + 0.08, wallM); walls.position.y = y0 + Hh / 2; finish.add(walls);
    var roofM = new T.MeshStandardMaterial({ color: C(o.roof || "#0f26ed"), roughness: 0.5, transparent: true });
    var rl = Math.hypot(D / 2 + 0.35, RH + 0.1), ra = Math.atan2(RH + 0.1, D / 2 + 0.35);
    [-1, 1].forEach(function (s) { var r = box(W + 0.5, 0.08, rl, roofM); r.position.set(0, y0 + Hh + RH / 2 + 0.05, s * (D / 4 + 0.1)); r.rotation.x = s * ra; finish.add(r); });
    var gab = new T.Shape(); gab.moveTo(-D / 2, 0); gab.lineTo(D / 2, 0); gab.lineTo(0, RH); gab.closePath();
    [-1, 1].forEach(function (s) { var g = new T.Mesh(new T.ShapeGeometry(gab), wallM); g.rotation.y = Math.PI / 2; g.position.set(s * (W / 2 + 0.04), y0 + Hh, 0); finish.add(g); var g2 = g.clone(); g2.rotation.y = -Math.PI / 2; finish.add(g2); });
    var winM = new T.MeshPhysicalMaterial({ color: C("#9fc4ff"), roughness: 0.05, clearcoat: 1, transparent: true });
    var accM = new T.MeshStandardMaterial({ color: C(o.door || "#ff0000"), transparent: true });
    [[-1.3, 0.75], [1.3, 0.75]].forEach(function (q) { var wdw = box(0.7, 0.55, 0.02, winM); wdw.position.set(q[0], y0 + 0.9, D / 2 + 0.06); finish.add(wdw); });
    var door = box(0.55, 1.0, 0.03, accM); door.position.set(0, y0 + 0.5, D / 2 + 0.06); finish.add(door);
    var stage_ = -1; // -1 = auto
    var labels = ["Foundation", "Frame", "Roof", "Finish"];
    api.setStage = function (i) { stage_ = i; };
    var orb = orbit(el, ctx, -0.65), cycle = o.cycle || 10;
    function setAlpha(g, a) { g.traverse(function (m) { if (m.material) { m.material.opacity = a; } }); g.visible = a > 0.02; }
    return {
      resize: function (w, h) { cam(ctx, w, h, 11, 5.6, 0.8); },
      update: function (t) {
        pivot.rotation.y = orb.step(0.0025);
        var p = stage_ >= 0 ? (stage_ + 0.99) / 4 : (t % cycle) / cycle * 1.15;
        var fk = ease((p - 0.25) * 6), rk = ease((p - 0.5) * 6), sk = ease((p - 0.75) * 6);
        frame.visible = fk > 0.01; frame.scale.y = Math.max(0.001, fk); frame.position.y = 0;
        trusses.visible = rk > 0.01; trusses.position.y = (1 - rk) * 2; trusses.scale.setScalar(Math.max(0.01, rk));
        setAlpha(finish, sk);
        var lab = el.querySelector("[data-stage-label]"); if (lab) lab.textContent = labels[Math.min(3, Math.floor(p * 4))];
        el.dispatchEvent(new CustomEvent("stage", { detail: Math.min(3, Math.floor(p * 4)) }));
      }
    };
  });
  return api;
}

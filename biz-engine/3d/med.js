// 3D hero objects for the medical templates: a glossy molar (dental), a stethoscope (private doctor), a medical cross with orbiting capsules (clinic).
import { stage, THREE } from "../../partner-engine/3d/core.js";
import { RoomEnvironment } from "../../partner-engine/vendor/RoomEnvironment.js";

function env(ctx, intensity) {
  var T = ctx.THREE, r = ctx.renderer, scene = ctx.scene;
  r.toneMapping = T.NeutralToneMapping;
  scene.environment = new T.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = intensity || 1;
  var key = new T.DirectionalLight(0xffffff, 2); key.position.set(3, 5, 4); scene.add(key);
  var fill = new T.DirectionalLight(0xffffff, 0.7); fill.position.set(-4, 1, 2); scene.add(fill);
  scene.add(new T.AmbientLight(0xffffff, 0.35));
}
function col(c) { return new THREE.Color(c); }
function dragSpin(el) {
  var s = { yaw: 0, vel: 0, drag: false, lx: 0 };
  el.addEventListener("pointerdown", function (e) { s.drag = true; s.lx = e.clientX; });
  el.addEventListener("pointermove", function (e) { if (!s.drag) return; s.vel = (e.clientX - s.lx) * 0.006; s.yaw += s.vel; s.lx = e.clientX; });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) { el.addEventListener(n, function () { s.drag = false; }); });
  s.step = function (auto) { if (!s.drag) { s.vel *= 0.94; s.yaw += s.vel + auto; } return s.yaw; };
  return s;
}
function bubbles(T, group, n, colors, spread, seed) {
  var out = [], rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (var i = 0; i < n; i++) {
    var m = new T.Mesh(new T.SphereGeometry(0.06 + rnd() * 0.14, 32, 24), new T.MeshPhysicalMaterial({ color: col(colors[i % colors.length]), roughness: 0.15, clearcoat: 1, metalness: 0.05 }));
    m.position.set((rnd() - 0.5) * spread, (rnd() - 0.5) * spread * 0.8, (rnd() - 0.5) * spread * 0.5);
    m.userData.o = m.position.clone(); m.userData.p = rnd() * 6.28;
    group.add(m); out.push(m);
  }
  return out;
}
function frame(cam, w, h, dist, y) {
  var narrow = w / h < 1;
  cam.fov = narrow ? 42 : 32; cam.position.set(0, y || 0, (dist || 7) * (narrow ? 1.25 : 1)); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
}

// ---------- tooth ----------
export function mountTooth(el, o) {
  o = o || {};
  stage(el, function (ctx) {
    var T = ctx.THREE; env(ctx, o.env || 1.1);
    var root = new T.Group(); ctx.scene.add(root);
    var enamel = new T.MeshPhysicalMaterial({ color: col(o.tooth || "#f6f1e6"), roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.4, sheenColor: col("#ffffff") });
    var sh = new T.Shape();
    sh.moveTo(0, 0.95);
    sh.bezierCurveTo(0.35, 1.18, 1.08, 1.22, 1.08, 0.45);
    sh.bezierCurveTo(1.08, 0.0, 0.86, -0.3, 0.76, -0.9);
    sh.bezierCurveTo(0.68, -1.5, 0.4, -1.58, 0.34, -1.0);
    sh.bezierCurveTo(0.28, -0.55, 0.15, -0.42, 0, -0.42);
    sh.bezierCurveTo(-0.15, -0.42, -0.28, -0.55, -0.34, -1.0);
    sh.bezierCurveTo(-0.4, -1.58, -0.68, -1.5, -0.76, -0.9);
    sh.bezierCurveTo(-0.86, -0.3, -1.08, 0.0, -1.08, 0.45);
    sh.bezierCurveTo(-1.08, 1.22, -0.35, 1.18, 0, 0.95);
    var g = new T.ExtrudeGeometry(sh, { depth: 0.42, bevelEnabled: true, bevelThickness: 0.32, bevelSize: 0.24, bevelSegments: 14, curveSegments: 64 });
    g.center();
    var crown = new T.Mesh(g, enamel); root.add(crown);
    root.position.y = 0.2; root.scale.setScalar(1.0);
    var deco = new T.Group(); ctx.scene.add(deco);
    var bs = bubbles(T, deco, 9, o.bubbles || ["#9ec6ff", "#ffd7a8", "#d9c7f0"], 5.2, 7);
    var ring = new T.Mesh(new T.TorusGeometry(1.75, 0.025, 12, 160), new T.MeshStandardMaterial({ color: col(o.ring || "#9ec6ff"), emissive: col(o.ring || "#9ec6ff"), emissiveIntensity: 0.6 }));
    ring.rotation.x = Math.PI / 2.6; ring.position.y = -0.2; ctx.scene.add(ring);
    // sparkle
    var sc = document.createElement("canvas"); sc.width = sc.height = 64; var sx = sc.getContext("2d");
    var gr = sx.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.25, "rgba(255,255,255,.6)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    sx.fillStyle = gr; sx.fillRect(0, 0, 64, 64);
    var spark = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false })); spark.scale.set(0.9, 0.9, 1); ctx.scene.add(spark);
    var d = dragSpin(el);
    return {
      resize: function (w, h) { frame(ctx.camera, w, h, 7.4, 0.6); },
      update: function (t) {
        root.rotation.y = d.step(0.004); root.rotation.x = 0.18 + Math.sin(t * 0.7) * 0.06;
        root.position.y = 0.2 + Math.sin(t * 1.1) * 0.08;
        ring.rotation.z = t * 0.2;
        bs.forEach(function (b) { b.position.y = b.userData.o.y + Math.sin(t * 0.9 + b.userData.p) * 0.18; });
        var k = (t * 0.6) % 1; spark.position.set(0.75, 1.0 + 0.05 * Math.sin(t), 0.8); spark.material.opacity = Math.sin(k * Math.PI); spark.scale.setScalar(0.4 + 0.7 * Math.sin(k * Math.PI));
      }
    };
  });
}

// ---------- stethoscope ----------
export function mountSteth(el, o) {
  o = o || {};
  stage(el, function (ctx) {
    var T = ctx.THREE; env(ctx, o.env || 1);
    var root = new T.Group(); ctx.scene.add(root);
    var chrome = new T.MeshStandardMaterial({ color: 0xe8ebef, metalness: 1, roughness: 0.14 });
    var rubber = new T.MeshPhysicalMaterial({ color: col(o.tube || "#1d2b4f"), roughness: 0.38, clearcoat: 0.6 });
    function tube(pts, r, mat) { return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(function (q) { return new T.Vector3(q[0], q[1], q[2]); })), 120, r, 20, false), mat); }
    // binaurals (metal) from earpieces to the Y
    root.add(tube([[-0.75, 2.1, 0.1], [-0.82, 1.6, 0], [-0.7, 1.0, 0], [-0.32, 0.55, 0]], 0.05, chrome));
    root.add(tube([[0.75, 2.1, 0.1], [0.82, 1.6, 0], [0.7, 1.0, 0], [0.32, 0.55, 0]], 0.05, chrome));
    var spring = tube([[-0.8, 1.55, 0], [0, 1.45, -0.05], [0.8, 1.55, 0]], 0.025, chrome); root.add(spring);
    [-1, 1].forEach(function (s) { var tip = new T.Mesh(new T.SphereGeometry(0.11, 32, 24), new T.MeshPhysicalMaterial({ color: 0x1a1a1a, roughness: 0.4 })); tip.position.set(s * 0.74, 2.17, 0.12); root.add(tip); });
    // rubber Y + main tube
    root.add(tube([[-0.32, 0.55, 0], [-0.1, 0.25, 0], [0, 0.05, 0]], 0.075, rubber));
    root.add(tube([[0.32, 0.55, 0], [0.1, 0.25, 0], [0, 0.05, 0]], 0.075, rubber));
    root.add(tube([[0, 0.05, 0], [0, -0.5, 0.1], [0.4, -1.2, 0.3], [1.2, -1.5, 0.2], [1.6, -0.9, 0], [1.3, -0.3, -0.2], [0.9, -0.55, -0.1]], 0.075, rubber));
    // chest piece
    var cp = new T.Group(); cp.position.set(0.9, -0.62, -0.1);
    var bell = new T.Mesh(new T.CylinderGeometry(0.42, 0.46, 0.18, 64), chrome); cp.add(bell);
    var dia = new T.Mesh(new T.CylinderGeometry(0.4, 0.4, 0.02, 64), new T.MeshPhysicalMaterial({ color: 0x20242a, roughness: 0.3, clearcoat: 1 })); dia.position.y = -0.1; cp.add(dia);
    var stem = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.3, 24), chrome); stem.position.y = 0.22; cp.add(stem);
    cp.rotation.set(1.2, 0, 0.4); root.add(cp);
    root.position.y = -0.2; root.scale.setScalar(1.05);
    var deco = new T.Group(); ctx.scene.add(deco);
    var bs = bubbles(T, deco, 7, o.bubbles || ["#cfd8e3", "#0095ff", "#f1efe9"], 5.6, 3);
    // pulse ring
    var pr = new T.Mesh(new T.RingGeometry(0.5, 0.53, 96), new T.MeshBasicMaterial({ color: col(o.pulse || "#0095ff"), transparent: true, side: T.DoubleSide }));
    ctx.scene.add(pr);
    var d = dragSpin(el);
    return {
      resize: function (w, h) { frame(ctx.camera, w, h, 7.8, 0.3); },
      update: function (t) {
        root.rotation.y = -0.45 + Math.sin(d.step(0.0) + t * 0.35) * 0.55; root.rotation.z = Math.sin(t * 0.6) * 0.04;
        root.position.y = -0.2 + Math.sin(t * 1.0) * 0.07;
        bs.forEach(function (b) { b.position.y = b.userData.o.y + Math.sin(t * 0.8 + b.userData.p) * 0.2; });
        var k = (t * 0.8) % 1; var wp = new T.Vector3(); cp.getWorldPosition(wp);
        pr.position.copy(wp); pr.lookAt(ctx.camera.position); pr.scale.setScalar(1 + k * 2.4); pr.material.opacity = (1 - k) * 0.8;
      }
    };
  });
}

// ---------- clinic cross + capsules ----------
function roundedCross(T, a, b, r) {
  var s = new T.Shape(), pts = [[-a, b], [-b, b], [-b, a], [b, a], [b, b], [a, b], [a, -b], [b, -b], [b, -a], [-b, -a], [-b, -b], [-a, -b]];
  s.moveTo(pts[0][0], pts[0][1]); pts.forEach(function (q) { s.lineTo(q[0], q[1]); }); s.closePath();
  return new T.ExtrudeGeometry(s, { depth: 0.36, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 8, curveSegments: 12 });
}
function capsule(T, c1, c2) {
  var g = new T.Group(), m1 = new T.MeshPhysicalMaterial({ color: col(c1), roughness: 0.2, clearcoat: 1 }), m2 = new T.MeshPhysicalMaterial({ color: col(c2), roughness: 0.2, clearcoat: 1 });
  var a = new T.Mesh(new T.CapsuleGeometry(0.16, 0.28, 12, 32), m1); a.position.y = 0.14;
  var b = new T.Mesh(new T.CapsuleGeometry(0.155, 0.28, 12, 32), m2); b.position.y = -0.14;
  g.add(a); g.add(b); return g;
}
export function mountClinic(el, o) {
  o = o || {};
  stage(el, function (ctx) {
    var T = ctx.THREE; env(ctx, o.env || 1);
    var root = new T.Group(); ctx.scene.add(root);
    var cg = roundedCross(T, 1.05, 0.36, 0.14); cg.center();
    var cross = new T.Mesh(cg, new T.MeshPhysicalMaterial({ color: col(o.cross || "#0f3e17"), roughness: 0.22, clearcoat: 1, metalness: 0.1 }));
    root.add(cross);
    var halo = new T.Mesh(new T.TorusGeometry(1.75, 0.02, 12, 160), new T.MeshStandardMaterial({ color: col(o.ring || "#b1dbb8"), emissive: col(o.ring || "#b1dbb8"), emissiveIntensity: 0.5 }));
    root.add(halo);
    var caps = [], cols = o.caps || [["#ffffff", "#b1dbb8"], ["#ffffff", "#f2b48c"], ["#e1f4df", "#0f3e17"], ["#ffffff", "#b6ced5"], ["#ffffff", "#0f3e17"], ["#f6e3a1", "#ffffff"]];
    for (var i = 0; i < 6; i++) {
      var c = capsule(T, cols[i][0], cols[i][1]); c.userData = { a: i / 6 * Math.PI * 2, r: 2.05 + (i % 2) * 0.35, tilt: (i % 3 - 1) * 0.5, spin: 0.6 + i * 0.13 };
      ctx.scene.add(c); caps.push(c);
    }
    var deco = new T.Group(); ctx.scene.add(deco);
    var bs = bubbles(T, deco, 8, o.bubbles || ["#b1dbb8", "#b6ced5", "#e1f4df"], 6, 11);
    var d = dragSpin(el);
    return {
      resize: function (w, h) { frame(ctx.camera, w, h, 8.6, 0.6); },
      update: function (t) {
        var y = d.step(0.006);
        root.rotation.y = y; root.rotation.x = 0.12 + Math.sin(t * 0.5) * 0.08; root.position.y = Math.sin(t) * 0.08;
        halo.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.3;
        caps.forEach(function (c) { var u = c.userData, a = u.a + t * 0.35; c.position.set(Math.cos(a) * u.r, Math.sin(a * 1.3) * 0.5 + u.tilt * Math.sin(a), Math.sin(a) * u.r * 0.6); c.rotation.set(t * u.spin, t * 0.4, a); });
        bs.forEach(function (b) { b.position.y = b.userData.o.y + Math.sin(t * 0.8 + b.userData.p) * 0.2; });
      }
    };
  });
}

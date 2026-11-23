// LED Innovation: live 3D "light lab". Procedural Three.js MPV (side profile extruded, pearl clearcoat),
// with headlights + beams, foglights (incl. strobe), bonnet strip, underglow and interior ambient light,
// all driven by the configurator ("ledcfg" event). Shared stage helper: DPR cap, off-screen pause, SVG fallback.
import { stage } from "../partner-engine/3d/core.js";
import { RoomEnvironment } from "../partner-engine/vendor/RoomEnvironment.js";

var CFG = { head: "#eaf2ff", fog: "#ffb020", strobe: false, under: "#3655ff", amb: "#ff3ea5", bonnet: "" };
var cars = [];
window.addEventListener("ledcfg", function (e) { Object.assign(CFG, e.detail || {}); cars.forEach(function (c) { c.apply(); }); });

var P = [[35, 38], [395, 30], [470, 70], [505, 100], [578, 118], [598, 136], [600, 180], [588, 200], [30, 200], [18, 186], [20, 60]];
var CX = 310, CY = 120, S = 100;
var X = function (x) { return (x - CX) / S; }, Y = function (y) { return (CY - y) / S; };
function shapeOf(THREE, pts) { var s = new THREE.Shape(); pts.forEach(function (p, i) { i ? s.lineTo(X(p[0]), Y(p[1])) : s.moveTo(X(p[0]), Y(p[1])); }); s.closePath(); return s; }
function glowTex(THREE) {
  var c = document.createElement("canvas"); c.width = c.height = 256; var g = c.getContext("2d");
  var r = g.createRadialGradient(128, 128, 8, 128, 128, 128); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.35, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 256, 256); var t = new THREE.CanvasTexture(c); return t;
}

document.querySelectorAll("[data-car3d]").forEach(function (host) {
  var interactive = host.hasAttribute("data-drag"), showcase = host.hasAttribute("data-showcase");
  stage(host, function (o) {
    var THREE = o.THREE, scene = o.scene, camera = o.camera, renderer = o.renderer, lite = o.lite;
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.35;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    scene.add(new THREE.HemisphereLight(0x8899ff, 0x000000, 0.25));
    var rim = new THREE.DirectionalLight(0xffffff, 0.9); rim.position.set(-4, 5, -3); scene.add(rim);

    var fade = document.createElement("canvas"); fade.width = fade.height = 256; var fg = fade.getContext("2d");
    var fr = fg.createRadialGradient(128, 128, 30, 128, 128, 128); fr.addColorStop(0, "#fff"); fr.addColorStop(0.55, "#999"); fr.addColorStop(1, "#000"); fg.fillStyle = fr; fg.fillRect(0, 0, 256, 256);
    var ground = new THREE.Mesh(new THREE.CircleGeometry(7, 64), new THREE.MeshStandardMaterial({ color: 0x10131a, roughness: 0.78, metalness: 0.05, transparent: true, alphaMap: new THREE.CanvasTexture(fade), depthWrite: false }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = Y(200) - 0.38; scene.add(ground);

    var car = new THREE.Group(); scene.add(car);
    var DEPTH = 1.6, BEV = 0.1;
    var geo = new THREE.ExtrudeGeometry(shapeOf(THREE, P), { depth: DEPTH, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: lite ? 2 : 6, curveSegments: 6 });
    geo.translate(0, 0, -DEPTH / 2);
    var paint = new THREE.MeshPhysicalMaterial({ color: 0xf1f1ee, roughness: 0.25, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08 });
    car.add(new THREE.Mesh(geo, paint));
    // lower trim + grille
    var trim = new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.5, metalness: 0.3 });
    var sill = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.12, DEPTH + 2 * BEV + 0.02), trim); sill.position.set(X(310), Y(192), 0); car.add(sill);
    var grille = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 1.0), trim); grille.position.set(X(600) + BEV, Y(158), 0); car.add(grille);

    // glass (slightly see-through so the interior ambient light shows)
    var glass = new THREE.MeshPhysicalMaterial({ color: 0x0c1220, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.72, clearcoat: 1 });
    var zf = DEPTH / 2 + BEV + 0.004, win = [[60, 50], [390, 42], [462, 90], [60, 98]];
    var wg = new THREE.ShapeGeometry(shapeOf(THREE, win));
    var w1 = new THREE.Mesh(wg, glass); w1.position.z = zf; car.add(w1);
    var w2 = new THREE.Mesh(wg, glass); w2.position.z = -zf; w2.rotation.y = Math.PI; w2.scale.x = -1; car.add(w2);
    var pillar = new THREE.MeshStandardMaterial({ color: 0x0d0f14, roughness: 0.4 });
    [[170, 46], [300, 44]].forEach(function (pp) { [-1, 1].forEach(function (s) { var b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.54, 0.01), pillar); b.position.set(X(pp[0]), Y(72), s * (zf + 0.002)); car.add(b); }); });
    var ws = new THREE.Mesh(new THREE.PlaneGeometry(DEPTH * 0.9, Math.hypot(1.05, 0.66) * 0.86), glass);
    ws.position.set(X(452) + 0.06, Y(66) + 0.09, 0); ws.rotation.set(0, Math.PI / 2, 0); ws.rotateX(-Math.atan2(0.66, 1.05)); car.add(ws);

    // interior ambient strip (seen through the glass) + light
    var ambMat = new THREE.MeshBasicMaterial({ color: CFG.amb || 0x000000 });
    var amb = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.03, DEPTH * 0.9), ambMat); amb.position.set(X(250), Y(96), 0); car.add(amb);
    var ambL = new THREE.PointLight(CFG.amb || 0x000000, 2.5, 4, 1.5); ambL.position.set(X(260), Y(70), 0); car.add(ambL);

    var glow = glowTex(THREE);
    function emissive(col) { return new THREE.MeshStandardMaterial({ color: 0x111111, emissive: col, emissiveIntensity: 2.4 }); }
    // headlights + beams
    var headMat = emissive(CFG.head), heads = [], beams = [];
    var beamMat = new THREE.MeshBasicMaterial({ color: CFG.head, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    [-1, 1].forEach(function (s) {
      var h = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.13, 0.42), headMat); h.position.set(X(596) + BEV - 0.02, Y(133), s * 0.56); car.add(h); heads.push(h);
      var cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.6, 24, 1, true), beamMat); cone.rotation.z = Math.PI / 2; cone.position.set(X(600) + 1.4, Y(140), s * 0.56); car.add(cone); beams.push(cone);
    });
    var headSpot = new THREE.SpotLight(CFG.head, 60, 12, 0.55, 0.6, 1.6); headSpot.position.set(X(600), Y(135), 0); headSpot.target.position.set(X(600) + 5, ground.position.y, 0); car.add(headSpot); car.add(headSpot.target);
    // foglights
    var fogMat = emissive(CFG.fog || 0x000000), fogs = [];
    [-1, 1].forEach(function (s) { var f = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 20), fogMat); f.rotation.z = Math.PI / 2; f.position.set(X(600) + BEV, Y(178), s * 0.62); car.add(f); fogs.push(f); });
    var fogL = new THREE.PointLight(CFG.fog || 0x000000, 5, 4.5, 1.4); fogL.position.set(X(600) + 0.6, Y(185), 0); car.add(fogL);
    var fogPool = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.4), new THREE.MeshBasicMaterial({ map: glow, color: CFG.fog || 0x000000, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    fogPool.rotation.x = -Math.PI / 2; fogPool.position.set(X(600) + 1.5, ground.position.y + 0.01, 0); car.add(fogPool);
    // bonnet strip
    var bonMat = emissive(CFG.bonnet || 0x000000);
    var bon = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 1.5), bonMat); bon.position.set(X(586) + BEV, Y(122), 0); car.add(bon);
    // tail lights
    var tailMat = emissive("#ff1530"); tailMat.emissiveIntensity = 1.4;
    [-1, 1].forEach(function (s) { var t = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.14), tailMat); t.position.set(X(19) - BEV, Y(110), s * 0.78); car.add(t); });
    // underglow
    var under = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 3.6), new THREE.MeshBasicMaterial({ map: glow, color: CFG.under || 0x000000, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    under.rotation.x = -Math.PI / 2; under.position.set(0, ground.position.y + 0.012, 0); car.add(under);
    var underL = new THREE.PointLight(CFG.under || 0x000000, 3, 4, 1.4); underL.position.set(0, ground.position.y + 0.15, 0); car.add(underL);
    // wheels
    var tyre = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.85 }), rimM = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 1, roughness: 0.22 });
    var tg = new THREE.CylinderGeometry(0.38, 0.38, 0.3, lite ? 22 : 44); tg.rotateX(Math.PI / 2);
    var rg = new THREE.CylinderGeometry(0.24, 0.24, 0.32, lite ? 18 : 36); rg.rotateX(Math.PI / 2);
    var wheels = [];
    [X(125), X(485)].forEach(function (x) { [-1, 1].forEach(function (s) { var g = new THREE.Group(); g.add(new THREE.Mesh(tg, tyre)); var r = new THREE.Mesh(rg, rimM); g.add(r);
      for (var k = 0; k < 5; k++) { var sp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.04), rimM); sp.rotation.z = k * Math.PI * 2 / 5; sp.position.z = s * 0.16; g.add(sp); }
      g.position.set(x, Y(200), s * (DEPTH / 2 + 0.02)); car.add(g); wheels.push(g); }); });
    car.position.y = 0.1;

    var c = { apply: function () {
      var on = function (m, col, k) { m.color ? null : null; };
      headMat.emissive.set(CFG.head); beamMat.color.set(CFG.head); headSpot.color.set(CFG.head);
      var f = CFG.fog || "#000000"; fogMat.emissive.set(f); fogL.color.set(f); fogPool.material.color.set(f); fogL.intensity = CFG.fog ? 5 : 0;
      var u = CFG.under || "#000000"; under.material.color.set(u); underL.color.set(u); underL.intensity = CFG.under ? 3 : 0;
      var a = CFG.amb || "#000000"; ambMat.color.set(a); ambL.color.set(a); ambL.intensity = CFG.amb ? 2.5 : 0;
      bonMat.emissive.set(CFG.bonnet || "#000000");
    } };
    c.apply(); cars.push(c);

    var PRESETS = [{ head: "#eaf2ff", fog: "#ffb020", under: "#3655ff", amb: "#ff3ea5", bonnet: "" }, { head: "#ffd27a", fog: "#ffb020", under: "#ff3ea5", amb: "#3ef0ff", bonnet: "#3ef0ff" }, { head: "#cfe6ff", fog: "#eaf2ff", under: "#22e07a", amb: "#7a5cff", bonnet: "" }];
    var yaw = -0.75, vel = 0, dragging = false, lx = 0, idle = 0, lastT = 0, pi = -1;
    if (interactive) {
      host.addEventListener("pointerdown", function (e) { dragging = true; lx = e.clientX; host.setPointerCapture(e.pointerId); host.classList.add("grab"); });
      host.addEventListener("pointermove", function (e) { if (!dragging) return; var dx = e.clientX - lx; lx = e.clientX; yaw += dx * 0.01; vel = dx * 0.01; idle = 0; });
      var up = function () { dragging = false; host.classList.remove("grab"); }; host.addEventListener("pointerup", up); host.addEventListener("pointercancel", up);
    }
    return {
      resize: function (W, H) { var a = W / H; camera.fov = 30; camera.position.set(0, 1.9, Math.max(7.4, 12.5 / a + 3)); camera.lookAt(0, -0.25, 0); camera.updateProjectionMatrix(); },
      update: function (t, p) {
        var dt = Math.min(0.05, t - lastT); lastT = t;
        if (showcase) { var k = Math.floor(t / 3.2) % PRESETS.length; if (k !== pi) { pi = k; Object.assign(CFG, PRESETS[k]); c.apply(); } }
        if (!dragging) { vel *= 0.93; yaw += vel; idle += dt; if (!interactive) yaw = -0.75 + Math.sin(t * 0.25) * 0.55 + p.x * 0.15; else if (idle > 3) yaw += dt * 0.15; }
        car.rotation.y = yaw;
        if (CFG.strobe && CFG.fog) { var on = (Math.floor(t * 7) % 2) === 0; fogMat.emissiveIntensity = on ? 2.6 : 0.05; fogL.intensity = on ? 5 : 0; fogPool.visible = on; }
        else { fogMat.emissiveIntensity = 2.4; fogPool.visible = !!CFG.fog; }
        under.material.opacity = 0.85 + Math.sin(t * 2.2) * 0.1;
      }
    };
  });
});

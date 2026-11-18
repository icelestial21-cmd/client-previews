// Procedural 3D car for the car mart templates. No external models: body, cabin and wheels are built from extruded profiles.
import { stage, THREE } from "../../partner-engine/3d/core.js";
import { RoomEnvironment } from "../../partner-engine/vendor/RoomEnvironment.js";

// Side profiles (x along length, y up). Wheel arches are cut at x=±AX.
var PROFILES = {
  sedan: { ax: 1.38, body: [[2.3,0.5],[2.32,0.7],[2.05,0.86],[1.1,0.98],[-1.3,1.0],[-2.08,0.96],[-2.3,0.8],[-2.32,0.52]],
           cabin: [[1.12,0.98],[0.25,1.44],[-0.7,1.46],[-1.42,1.0]], w: 1.82 },
  suv:   { ax: 1.42, body: [[2.25,0.55],[2.3,0.9],[2.1,1.08],[1.25,1.14],[-1.95,1.16],[-2.28,1.1],[-2.32,0.6]],
           cabin: [[1.26,1.14],[0.62,1.74],[-1.82,1.76],[-2.02,1.16]], w: 1.92, ride: 0.08 },
  coupe: { ax: 1.36, body: [[2.32,0.46],[2.34,0.62],[2.0,0.78],[1.0,0.9],[-1.6,0.92],[-2.2,0.86],[-2.32,0.5]],
           cabin: [[1.02,0.9],[0.1,1.3],[-0.55,1.3],[-1.9,0.92]], w: 1.86, ride: -0.04 }
};
var WR = 0.38;

function bodyShape(p) {
  var s = new THREE.Shape(), b = p.body, ax = p.ax, by = 0.34;
  s.moveTo(b[0][0], by);
  b.forEach(function (pt) { s.lineTo(pt[0], pt[1]); });
  s.lineTo(b[b.length - 1][0], by);
  s.lineTo(-ax - 0.47, by); s.absarc(-ax, WR, 0.47, Math.PI, 0, true);
  s.lineTo(ax - 0.47, by); s.absarc(ax, WR, 0.47, Math.PI, 0, true);
  s.lineTo(b[0][0], by);
  return s;
}
function polyShape(pts, close) {
  var s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  return s;
}
function extrude(shape, depth, bevel) {
  var g = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 5, curveSegments: 28 });
  g.translate(0, 0, -depth / 2);
  return g;
}

function wheel(mats) {
  var g = new THREE.Group();
  var tyre = new THREE.Mesh(new THREE.CylinderGeometry(WR, WR, 0.3, 40), mats.tyre);
  tyre.rotation.x = Math.PI / 2; g.add(tyre);
  var wall = new THREE.Mesh(new THREE.TorusGeometry(WR - 0.07, 0.07, 12, 40), mats.tyre);
  wall.position.z = 0.15; g.add(wall);
  var rim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.31, 32), mats.rim);
  rim.rotation.x = Math.PI / 2; g.add(rim);
  var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.34, 16), mats.chrome);
  hub.rotation.x = Math.PI / 2; g.add(hub);
  for (var i = 0; i < 5; i++) {
    var sp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.04), mats.chrome);
    sp.position.z = 0.16; sp.rotation.z = i * Math.PI * 2 / 5; g.add(sp);
  }
  return g;
}

export function buildCar(type, color, mats) {
  var p = PROFILES[type] || PROFILES.sedan, w = p.w, car = new THREE.Group();
  mats.paint.color.set(color);
  var body = new THREE.Mesh(extrude(bodyShape(p), w - 0.24, 0.12), mats.paint); car.add(body);
  var cab = p.cabin, belt = cab[0][1];
  var glass = new THREE.Mesh(extrude(polyShape([[cab[0][0], belt - 0.02]].concat(cab).concat([[cab[cab.length - 1][0], belt - 0.02]])), w - 0.62, 0.1), mats.glass);
  car.add(glass);
  // painted roof cap and B-pillar
  var r1 = cab[1], r2 = cab[2];
  var roof = new THREE.Mesh(extrude(polyShape([[r1[0] + 0.04, r1[1] - 0.05], [r1[0], r1[1] + 0.03], [r2[0], r2[1] + 0.03], [r2[0] - 0.04, r2[1] - 0.05]]), w - 0.56, 0.06), mats.paint);
  car.add(roof);
  var bp = new THREE.Mesh(new THREE.BoxGeometry(0.1, r1[1] - belt, w - 0.5), mats.paint);
  bp.position.set((r1[0] + r2[0]) / 2 - 0.15, belt + (r1[1] - belt) / 2, 0); car.add(bp);
  var f = p.body[0][0], rr = p.body[p.body.length - 1][0], ly = p.body[1][1] - 0.08;
  [1, -1].forEach(function (side) {
    var hl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.11, 0.5), mats.head);
    hl.position.set(f + 0.14, ly, side * (w / 2 - 0.36)); car.add(hl);
    var tl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.11, 0.56), mats.tail);
    tl.position.set(rr - 0.14, ly + 0.08, side * (w / 2 - 0.4)); car.add(tl);
    var mir = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.12), mats.paint);
    mir.position.set(cab[0][0] - 0.12, belt + 0.06, side * (w / 2 + 0.02)); car.add(mir);
  });
  var grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, w - 0.8), mats.trim);
  grille.position.set(f + 0.13, 0.5, 0); car.add(grille);
  var sill = new THREE.Mesh(new THREE.BoxGeometry(p.ax * 2 - 1.0, 0.08, w + 0.02), mats.trim);
  sill.position.set(0, 0.38, 0); car.add(sill);
  car.userData.wheels = [];
  [[p.ax, 1], [p.ax, -1], [-p.ax, 1], [-p.ax, -1]].forEach(function (q) {
    var wh = wheel(mats); wh.position.set(q[0], WR, q[1] * (w / 2 - 0.16));
    if (q[1] < 0) wh.rotation.y = Math.PI;
    car.add(wh); car.userData.wheels.push(wh);
  });
  car.position.y = p.ride || 0;
  return car;
}

export function materials(T) {
  return {
    paint: new T.MeshPhysicalMaterial({ color: 0xc0c0c0, metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.06 }),
    glass: new T.MeshPhysicalMaterial({ color: 0x05070b, metalness: 0.4, roughness: 0.04, clearcoat: 1 }),
    tyre: new T.MeshStandardMaterial({ color: 0x141414, roughness: 0.85 }),
    rim: new T.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 0.9, roughness: 0.25 }),
    chrome: new T.MeshStandardMaterial({ color: 0xdfe3e8, metalness: 1, roughness: 0.12 }),
    trim: new T.MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.5, metalness: 0.3 }),
    head: new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6dc, emissiveIntensity: 2.2 }),
    tail: new T.MeshStandardMaterial({ color: 0x500000, emissive: 0xff1a1a, emissiveIntensity: 1.6 })
  };
}

function blob(T, strength) {
  var c = document.createElement("canvas"); c.width = c.height = 128;
  var x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0," + strength + ")"); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  var m = new T.Mesh(new T.PlaneGeometry(6.4, 3.4), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.005; return m;
}

// opts: { type, color, floor:'#111', ring:'#ffc000', env:0.9, angle, drag:true }
export function mountCar(el, opts) {
  opts = opts || {};
  var api = {};
  stage(el, function (ctx) {
    var T = ctx.THREE, scene = ctx.scene, cam = ctx.camera, r = ctx.renderer;
    r.toneMapping = T.NeutralToneMapping;
    var pm = new T.PMREMGenerator(r);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = opts.env || 0.9;
    var key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(4, 7, 5); scene.add(key);
    var rim = new T.DirectionalLight(new T.Color(opts.rimColor || "#ffffff"), 1.4); rim.position.set(-6, 3, -4); scene.add(rim);
    scene.add(new T.AmbientLight(0xffffff, 0.25));
    var mats = materials(T), pivot = new T.Group(); scene.add(pivot);
    var deck = new T.Mesh(new T.CylinderGeometry(3.3, 3.3, 0.08, 96), new T.MeshStandardMaterial({ color: new T.Color(opts.floor || "#141416"), metalness: 0.6, roughness: 0.35 }));
    deck.position.y = -0.04; pivot.add(deck);
    var ring = new T.Mesh(new T.TorusGeometry(3.32, 0.025, 8, 128), new T.MeshStandardMaterial({ color: new T.Color(opts.ring || "#ffc000"), emissive: new T.Color(opts.ring || "#ffc000"), emissiveIntensity: 1.2 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.001; pivot.add(ring);
    pivot.add(blob(T, 0.75));
    var car = null, type = opts.type || "sedan", color = opts.color || "#c0c0c0";
    function rebuild() { if (car) pivot.remove(car); car = buildCar(type, color, mats); pivot.add(car); }
    rebuild();
    api.setColor = function (c) { color = c; mats.paint.color.set(c); };
    api.setBody = function (t) { type = t; rebuild(); };
    var yaw = opts.angle != null ? opts.angle : -0.6, vel = 0, drag = false, lx = 0, spin = 0;
    el.addEventListener("pointerdown", function (e) { drag = true; lx = e.clientX; el.setPointerCapture && el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", function (e) { if (!drag) return; vel = (e.clientX - lx) * 0.006; yaw += vel; lx = e.clientX; });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) { el.addEventListener(n, function () { drag = false; }); });
    api.spinTo = function (a) { yaw = a; };
    return {
      resize: function (w, h) {
        var narrow = w / h < 1;
        cam.fov = narrow ? 40 : 28; cam.position.set(0, narrow ? 3.4 : 2.1, narrow ? 12.8 : 8.4);
        cam.lookAt(0, 0.7, 0); cam.updateProjectionMatrix();
      },
      update: function (t) {
        if (!drag) { vel *= 0.94; yaw += vel + (opts.still ? 0 : 0.0032); }
        pivot.rotation.y = yaw;
        spin += 0.02;
      }
    };
  });
  return api;
}

// Renders still images of cars for inventory cards using one shared offscreen renderer.
export function carThumbs(list, w, h, opts) {
  opts = opts || {};
  var r;
  try { r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return []; }
  r.setSize(w, h); r.setPixelRatio(1);
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.NeutralToneMapping;
  var scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = opts.env || 0.95;
  var key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 7, 5); scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  scene.add(blob(THREE, opts.shadow || 0.55));
  var cam = new THREE.PerspectiveCamera(26, w / h, 0.1, 100);
  cam.position.set(6.2, 2.4, 7.6); cam.lookAt(0, 0.62, 0);
  var mats = materials(THREE), out = [];
  list.forEach(function (it) {
    var car = buildCar(it.body, it.color, mats);
    car.rotation.y = it.yaw != null ? it.yaw : 0.2;
    scene.add(car); r.render(scene, cam); out.push(r.domElement.toDataURL("image/png")); scene.remove(car);
  });
  r.dispose();
  return out;
}

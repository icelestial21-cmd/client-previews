// Jay's Warehouse: floating 3D pantry for the hero (Peter Tarka / Recess "floating objects", rebuilt in Jay's tokens).
// Procedural Three.js jars, bitters bottle, dropper, tea pouch, two-tone capsules and gummies, with canvas labels.
// Shared stage helper handles DPR cap, off-screen pause, reduced motion and the SVG shelf fallback.
import { stage } from "../partner-engine/3d/core.js";
import { RoomEnvironment } from "../partner-engine/vendor/RoomEnvironment.js";

var OLIVE = "#2f3a1e", CREAM = "#fffaf0", LIME = "#d6e23a";

function label(THREE, body, name, sub, w, h, wrapText) {
  var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  var draw = function () {
    var g = cv.getContext("2d");
    g.fillStyle = body; g.fillRect(0, 0, w, h);
    var bx = wrapText ? w * 0.3 : w * 0.1, bw = wrapText ? w * 0.4 : w * 0.8, by = h * 0.3, bh = h * 0.4;
    g.fillStyle = CREAM; g.beginPath(); g.roundRect ? g.roundRect(bx, by, bw, bh, h * 0.04) : g.rect(bx, by, bw, bh); g.fill();
    g.fillStyle = OLIVE; g.textAlign = "center"; g.textBaseline = "middle";
    var fs = bh * 0.34; g.font = "700 " + fs + "px Fraunces, Georgia, serif";
    while (g.measureText(name).width > bw * 0.86 && fs > 8) { fs -= 2; g.font = "700 " + fs + "px Fraunces, Georgia, serif"; }
    g.fillText(name, bx + bw / 2, by + bh * 0.42);
    g.font = "700 " + (bh * 0.13) + "px 'JetBrains Mono', monospace"; g.fillText(sub, bx + bw / 2, by + bh * 0.74);
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(0, h * 0.06, w, h * 0.05);
  };
  draw();
  var tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  tex.redraw = function () { draw(); tex.needsUpdate = true; };
  return tex;
}

function gloss(THREE, opts) { return new THREE.MeshPhysicalMaterial(Object.assign({ roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.18 }, opts)); }

document.querySelectorAll("[data-pantry3d]").forEach(function (host) {
  stage(host, function (o) {
    var THREE = o.THREE, scene = o.scene, camera = o.camera, renderer = o.renderer, lite = o.lite;
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.9; renderer.toneMapping = THREE.NeutralToneMapping;
    var key = new THREE.DirectionalLight(0xfff4e0, 1.4); key.position.set(-3, 5, 6); scene.add(key);
    camera.position.set(0, 0, 9.5);
    var seg = lite ? 28 : 56, texes = [], items = [];
    var root = new THREE.Group(); scene.add(root);

    function jar(col, name, sub) {
      var g = new THREE.Group(), t = label(THREE, col, name, sub, 1024, 512, true); texes.push(t);
      var bodyGeo = new THREE.CylinderGeometry(0.62, 0.62, 1.3, seg, 1, false);
      var body = new THREE.Mesh(bodyGeo, [gloss(THREE, { map: t }), gloss(THREE, { color: col }), gloss(THREE, { color: col })]);
      body.rotation.y = Math.PI; g.add(body);
      var lid = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.32, seg), gloss(THREE, { color: OLIVE, roughness: 0.45 }));
      lid.position.y = 0.81; g.add(lid);
      return g;
    }
    function bitters(col, name, sub) {
      var g = new THREE.Group(), pts = [];
      [[0, -0.95], [0.5, -0.95], [0.55, -0.88], [0.55, 0.25], [0.42, 0.5], [0.2, 0.68], [0.17, 1.0], [0, 1.0]].forEach(function (p) { pts.push(new THREE.Vector2(p[0], p[1])); });
      g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, seg), gloss(THREE, { color: col, roughness: 0.15 })));
      var t = label(THREE, col, name, sub, 1024, 512, true); texes.push(t);
      var lab = new THREE.Mesh(new THREE.CylinderGeometry(0.565, 0.565, 0.75, seg, 1, true), gloss(THREE, { map: t, roughness: 0.6, clearcoat: 0 }));
      lab.position.y = -0.35; lab.rotation.y = Math.PI; g.add(lab);
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.28, seg), gloss(THREE, { color: "#c49a3a", metalness: 0.7, roughness: 0.3 }));
      cap.position.y = 1.1; g.add(cap);
      return g;
    }
    function dropper(col, name, sub) {
      var g = new THREE.Group(), t = label(THREE, col, name, sub, 1024, 512, true); texes.push(t);
      var b = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.1, seg), [gloss(THREE, { map: t, roughness: 0.12 }), gloss(THREE, { color: col }), gloss(THREE, { color: col })]);
      b.rotation.y = Math.PI; g.add(b);
      var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.26, seg), gloss(THREE, { color: OLIVE })); neck.position.y = 0.68; g.add(neck);
      var bulb = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.32, 8, seg / 2), gloss(THREE, { color: OLIVE, roughness: 0.5 })); bulb.position.y = 1.05; g.add(bulb);
      return g;
    }
    function pouch(col, name, sub) {
      var g = new THREE.Group(), t = label(THREE, col, name, sub, 512, 640, false); texes.push(t);
      var m = gloss(THREE, { color: col, roughness: 0.55, clearcoat: 0.3 });
      var box = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.45, 0.34, 1, 1, 1), [m, m, m, m, gloss(THREE, { map: t, roughness: 0.55, clearcoat: 0.3 }), m]);
      g.add(box);
      var seal = new THREE.Mesh(new THREE.BoxGeometry(1.19, 0.12, 0.36), gloss(THREE, { color: CREAM, roughness: 0.6 })); seal.position.y = 0.66; g.add(seal);
      return g;
    }
    function capsule(a, b) {
      var geo = new THREE.CapsuleGeometry(0.11, 0.26, 6, 14), cols = [], ca = new THREE.Color(a), cb = new THREE.Color(b), p = geo.attributes.position;
      for (var i = 0; i < p.count; i++) { var c = p.getY(i) > 0 ? ca : cb; cols.push(c.r, c.g, c.b); }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
      return new THREE.Mesh(geo, gloss(THREE, { vertexColors: true, roughness: 0.2 }));
    }
    function gummy(col) {
      var m = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 14), gloss(THREE, { color: col, roughness: 0.25, transparent: true, opacity: 0.92, sheen: 0.6, sheenColor: new THREE.Color("#ffffff") }));
      m.scale.set(1, 0.72, 1); return m;
    }

    function add(obj, x, y, z, s, ry, rz, amp, spin) {
      obj.position.set(x, y, z); obj.scale.multiplyScalar(s); obj.rotation.set(0, ry, rz);
      root.add(obj); items.push({ o: obj, x: x, y: y, ry: ry, rz: rz, ph: Math.random() * 6.28, amp: amp, spin: spin || 0 });
    }
    add(jar("#d94b3d", "ACV", "GUMMIES"), -1.55, 0.55, 0.2, 1.05, -0.35, 0.08, 0.12);
    add(bitters("#3a5a2a", "SOURSOP", "BITTERS"), 0.15, 0.9, -0.6, 1.05, 0.25, -0.06, 0.1);
    add(pouch("#7a9a3a", "COLON", "HERBAL TEA"), 1.75, 0.35, 0.3, 1.0, -0.45, -0.1, 0.14);
    add(dropper("#256b33", "CHLORO", "LIQUID"), -0.6, -1.35, 0.9, 1.0, 0.3, 0.12, 0.11);
    add(jar("#5b7bd5", "ASHWA", "GUMMIES"), 1.2, -1.45, 0.6, 0.85, -0.2, -0.14, 0.13);
    var GC = ["#e8504a", "#ff9ec8", "#f2a33a", "#d6e23a", "#e05a9a", "#ffd166"];
    for (var i = 0; i < (lite ? 9 : 16); i++) {
      var a = i * 2.399, r = 1.6 + (i % 4) * 0.55;
      add(gummy(GC[i % GC.length]), Math.cos(a) * r * 1.15, Math.sin(a) * r * 0.95, -1.2 + (i % 3) * 0.9, 1, a, a * 0.5, 0.18, 0.6);
    }
    for (var j = 0; j < (lite ? 4 : 7); j++) {
      var b2 = j * 1.9 + 0.7, r2 = 2.3 + (j % 2) * 0.6;
      add(capsule(["#1f7a6a", "#3b2a20", "#2f8a3e", "#e0a020"][j % 4], CREAM), Math.cos(b2) * r2, Math.sin(b2) * r2 * 0.9, -0.4 + (j % 3) * 0.5, 1.2, b2, b2, 0.2, 0.9);
    }
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("700 40px Fraunces"), document.fonts.load("700 16px 'JetBrains Mono'")]).then(function () { texes.forEach(function (t) { t.redraw(); }); });

    return {
      resize: function (W, H) { var a = W / H; camera.position.z = Math.max(8.2, 9.6 / Math.min(a, 1.15)); camera.updateProjectionMatrix(); },
      update: function (t, p) {
        root.rotation.y += ((p.x * 0.28) - root.rotation.y) * 0.05;
        root.rotation.x += ((-p.y * 0.14) - root.rotation.x) * 0.05;
        items.forEach(function (it) {
          it.o.position.y = it.y + Math.sin(t * 0.9 + it.ph) * it.amp;
          it.o.rotation.z = it.rz + Math.sin(t * 0.6 + it.ph) * 0.06;
          it.o.rotation.y = it.ry + (it.spin ? t * it.spin : Math.sin(t * 0.5 + it.ph) * 0.25);
        });
      }
    };
  });
});

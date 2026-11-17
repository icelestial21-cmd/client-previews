// Concierge template: floating metallic arrival passes with printed details.
import { THREE, stage, cssColor } from "./core.js";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";

function rounded(w, h, r) {
  var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function faceTexture(opts) {
  var W = 1024, H = 640, c = document.createElement("canvas"); c.width = W; c.height = H;
  var g = c.getContext("2d");
  var ink = opts.ink, sub = opts.sub;
  g.clearRect(0, 0, W, H);
  g.fillStyle = ink;
  g.font = "600 30px Inter, sans-serif"; g.letterSpacing = "6px";
  g.fillText((opts.kicker || "ARRIVAL PASS").toUpperCase(), 64, 92);
  g.font = "500 64px 'Bodoni Moda', Georgia, serif"; g.letterSpacing = "0px";
  g.fillText(opts.title, 64, 190);
  g.fillStyle = sub; g.font = "400 26px Inter, sans-serif";
  g.fillText(opts.subtitle, 64, 236);
  // rows
  var rows = opts.rows || [];
  rows.forEach(function (r, i) {
    var x = 64 + (i % 3) * 300, y = 360 + Math.floor(i / 3) * 110;
    g.fillStyle = sub; g.font = "500 20px Inter, sans-serif"; g.letterSpacing = "3px"; g.fillText(r[0].toUpperCase(), x, y);
    g.fillStyle = ink; g.font = "600 34px Inter, sans-serif"; g.letterSpacing = "0px"; g.fillText(r[1], x, y + 44);
  });
  // chip
  g.strokeStyle = sub; g.lineWidth = 3; g.strokeRect(W - 200, 56, 120, 88);
  for (var k = 1; k < 4; k++) { g.beginPath(); g.moveTo(W - 200, 56 + k * 22); g.lineTo(W - 80, 56 + k * 22); g.stroke(); }
  // barcode
  for (var b = 0; b < 46; b++) { var bw = (b * 7) % 5 + 2; g.fillStyle = ink; g.globalAlpha = 0.85; g.fillRect(W - 360 + b * 6.3, H - 118, bw, 60); }
  g.globalAlpha = 1;
  var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function mountPass(el, opts) {
  opts = opts || {};
  return stage(el, function (ctx) {
    var scene = ctx.scene, camera = ctx.camera, renderer = ctx.renderer;
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;
    camera.position.set(0, 0, 7);
    var gold = cssColor("--accent", "#c9a96e");
    var W = 3.2, H = 2.0, D = 0.06;
    var geo = new THREE.ExtrudeGeometry(rounded(W, H, 0.16), { depth: D, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 6, curveSegments: 24 });
    geo.center();

    function card(material, face, z) {
      var g = new THREE.Group();
      g.add(new THREE.Mesh(geo, material));
      if (face) {
        var plane = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.02, H - 0.02), new THREE.MeshBasicMaterial({ map: face, transparent: true }));
        plane.position.z = D / 2 + 0.027; g.add(plane);
      }
      g.position.z = z || 0;
      return g;
    }
    var goldMat = new THREE.MeshPhysicalMaterial({ color: gold, metalness: 1, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 });
    var blackMat = new THREE.MeshPhysicalMaterial({ color: 0x0c0c0e, metalness: 0.6, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08 });
    var front = card(goldMat, faceTexture({ ink: "#1a1408", sub: "rgba(26,20,8,0.62)", kicker: opts.kicker, title: opts.title || "Welcome, Guest", subtitle: opts.subtitle || "", rows: opts.rows }), 0.35);
    var back = card(blackMat, faceTexture({ ink: "#e9d8b4", sub: "rgba(233,216,180,0.55)", kicker: opts.backKicker || "VIP ACCESS", title: opts.backTitle || "Event Day", subtitle: opts.backSubtitle || "", rows: opts.backRows }), -0.35);
    var rig = new THREE.Group();
    back.position.set(0.55, 0.42, -0.4); back.rotation.z = 0.08;
    front.position.set(-0.25, -0.2, 0.3); front.rotation.z = -0.06;
    rig.add(back, front);
    scene.add(rig);

    // Gold dust
    var n = 220, arr = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) { arr[i * 3] = (Math.random() - 0.5) * 9; arr[i * 3 + 1] = (Math.random() - 0.5) * 6; arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1; }
    var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    var dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: gold, size: 0.03, transparent: true, opacity: 0.7 }));
    scene.add(dust);

    var key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(2, 3, 5); scene.add(key);
    var spot = new THREE.PointLight(gold, 30, 12); spot.position.set(-3, 2, 3); scene.add(spot);

    return {
      resize: function (w, h) { var s = Math.min(1, w / h / 1.15); rig.scale.setScalar(Math.max(0.62, s)); },
      update: function (t, ptr) {
        rig.rotation.y = -0.38 + Math.sin(t * 0.5) * 0.12 + ptr.x * 0.35;
        rig.rotation.x = 0.18 + Math.cos(t * 0.4) * 0.06 - ptr.y * 0.22;
        front.position.y = -0.2 + Math.sin(t * 1.1) * 0.06;
        back.position.y = 0.42 + Math.sin(t * 1.1 + 1.5) * 0.06;
        spot.position.x = Math.sin(t * 0.6) * 4;
        dust.rotation.y = t * 0.02; dust.position.y = Math.sin(t * 0.3) * 0.15;
      }
    };
  });
}

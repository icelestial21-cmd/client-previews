// Kings of the Cage hero: a procedural gold crown turning inside a chain-link cage, with rising sparks.
import { stage } from "../../partner-engine/3d/core.js";
import { RoomEnvironment } from "../../partner-engine/vendor/RoomEnvironment.js";

var el = document.querySelector("[data-crown]");
if (el) stage(el, function (o) {
  var THREE = o.THREE, scene = o.scene, camera = o.camera, renderer = o.renderer, lite = o.lite;
  var pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  renderer.toneMappingExposure = 1.05;
  camera.position.set(0, 0.95, 6.4);
  camera.lookAt(0, 0.3, 0);

  var gold = new THREE.MeshStandardMaterial({ color: 0xf1c35a, metalness: 1, roughness: 0.22, side: THREE.DoubleSide });
  var goldDeep = new THREE.MeshStandardMaterial({ color: 0xc8901f, metalness: 1, roughness: 0.3 });
  var gem = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.15, roughness: 0.02, envMapIntensity: 2.4 });

  // ---- crown band: a flared cylinder whose top edge rises into five points ----
  var N = 5, S = lite ? 150 : 300, V = lite ? 10 : 18, R = 1, HB = 0.5, HP = 0.82;
  function topH(a) {
    var u = (a * N / (Math.PI * 2)) % 1, tri = 1 - Math.abs(2 * u - 1);
    return HB + HP * Math.pow(tri, 1.7);
  }
  function band(rScale) {
    var pos = [], idx = [];
    for (var i = 0; i <= S; i++) {
      var a = i / S * Math.PI * 2 + Math.PI / N, h = topH(a - Math.PI / N);
      for (var j = 0; j <= V; j++) {
        var y = j / V * h, r = R * rScale * (1 + 0.13 * y);
        pos.push(Math.cos(a) * r, y, Math.sin(a) * r);
      }
    }
    for (i = 0; i < S; i++) for (j = 0; j < V; j++) {
      var p = i * (V + 1) + j, q = (i + 1) * (V + 1) + j;
      idx.push(p, q, p + 1, q, q + 1, p + 1);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  var crown = new THREE.Group();
  crown.add(new THREE.Mesh(band(1), gold));
  var inner = new THREE.Mesh(band(0.955), goldDeep); crown.add(inner);
  // rims
  var tSeg = lite ? 90 : 180;
  var rimB = new THREE.Mesh(new THREE.TorusGeometry(R * 1.005, 0.06, 16, tSeg), gold); rimB.rotation.x = Math.PI / 2; rimB.position.y = 0.02; crown.add(rimB);
  var rimM = new THREE.Mesh(new THREE.TorusGeometry(R * 1.06, 0.035, 12, tSeg), gold); rimM.rotation.x = Math.PI / 2; rimM.position.y = 0.42; crown.add(rimM);
  // pearls on each point, jewels on the band
  var pearlG = new THREE.SphereGeometry(0.085, 24, 16), jewelG = new THREE.OctahedronGeometry(0.11, 0), stud = new THREE.SphereGeometry(0.04, 12, 8);
  for (var k = 0; k < N; k++) {
    var a = k / N * Math.PI * 2 + Math.PI / N * 2;
    var h = HB + HP, r = R * (1 + 0.13 * h);
    var pearl = new THREE.Mesh(pearlG, gold); pearl.position.set(Math.cos(a) * r, h + 0.06, Math.sin(a) * r); crown.add(pearl);
    var jr = R * 1.075, jw = new THREE.Mesh(jewelG, gem);
    jw.position.set(Math.cos(a) * jr, 0.24, Math.sin(a) * jr); jw.scale.set(1, 1.35, 0.55); jw.lookAt(0, 0.24, 0); crown.add(jw);
    for (var s = 1; s < 4; s++) {
      var b = a + (s - 2) * 0.22 + Math.PI / N, sb = new THREE.Mesh(stud, gold);
      if (s === 2) continue;
      sb.position.set(Math.cos(b) * R * 1.06, 0.24, Math.sin(b) * R * 1.06); crown.add(sb);
    }
  }
  crown.rotation.z = -0.12; crown.rotation.x = 0.28;
  var holder = new THREE.Group(); holder.add(crown); holder.position.y = 0.05; scene.add(holder);

  // ---- the cage: chain-link lattice on a cylinder ----
  var cage = new THREE.Group(), lines = [], CR = 2.55, CH = 4.2, K = lite ? 30 : 46, tw = Math.PI * 0.9;
  for (k = 0; k < K; k++) {
    var a0 = k / K * Math.PI * 2;
    for (var dir = -1; dir <= 1; dir += 2) {
      var steps = 24;
      for (s = 0; s < steps; s++) {
        var t0 = s / steps, t1 = (s + 1) / steps;
        var b0 = a0 + dir * tw * t0, b1 = a0 + dir * tw * t1;
        lines.push(Math.cos(b0) * CR, -1.3 + CH * t0, Math.sin(b0) * CR, Math.cos(b1) * CR, -1.3 + CH * t1, Math.sin(b1) * CR);
      }
    }
  }
  var lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
  var lm = new THREE.LineBasicMaterial({ color: 0x8c8678, transparent: true, opacity: 0.22, depthWrite: false });
  cage.add(new THREE.LineSegments(lg, lm));
  // posts + top/bottom rails
  var railM = new THREE.MeshStandardMaterial({ color: 0x3a3832, metalness: 0.9, roughness: 0.45 });
  [-1.3, 2.9].forEach(function (y) { var rl = new THREE.Mesh(new THREE.TorusGeometry(CR, 0.025, 8, 120), railM); rl.rotation.x = Math.PI / 2; rl.position.y = y; cage.add(rl); });
  scene.add(cage);

  // floor glow ring
  var ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.9, 96), new THREE.MeshBasicMaterial({ color: 0xe3b23c, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = -1.0; scene.add(ring);
  var ring2 = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.27, 128), new THREE.MeshBasicMaterial({ color: 0xf6d06b, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  ring2.rotation.x = -Math.PI / 2; ring2.position.y = -0.99; scene.add(ring2);

  // rising sparks
  var P = lite ? 110 : 280, sp = new Float32Array(P * 3), sv = new Float32Array(P);
  for (k = 0; k < P; k++) {
    var ra = Math.random() * Math.PI * 2, rr = 0.4 + Math.random() * 2;
    sp[k * 3] = Math.cos(ra) * rr; sp[k * 3 + 1] = -1 + Math.random() * 4; sp[k * 3 + 2] = Math.sin(ra) * rr;
    sv[k] = 0.15 + Math.random() * 0.45;
  }
  var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  var dot = document.createElement("canvas"); dot.width = dot.height = 64;
  var cx = dot.getContext("2d"), grd = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,236,170,1)"); grd.addColorStop(0.35, "rgba(240,190,80,.6)"); grd.addColorStop(1, "rgba(240,190,80,0)");
  cx.fillStyle = grd; cx.fillRect(0, 0, 64, 64);
  var sparks = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.075, map: new THREE.CanvasTexture(dot), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(sparks);

  // lights
  var key = new THREE.DirectionalLight(0xffe2a8, 2.4); key.position.set(3, 5, 4); scene.add(key);
  var rim = new THREE.DirectionalLight(0xffb84d, 2.0); rim.position.set(-4, 2, -3); scene.add(rim);
  var spot = new THREE.PointLight(0xffd27a, 6, 8, 2); spot.position.set(0, 3.2, 1.2); scene.add(spot);

  var tx = 0, ty = 0;
  return {
    resize: function (w, h) { camera.position.z = w / h < 0.9 ? 7.6 : 6.4; },
    update: function (t, p) {
      tx += (p.x * 0.35 - tx) * 0.05; ty += (p.y * 0.2 - ty) * 0.05;
      crown.rotation.y = t * 0.45;
      holder.position.y = 0.05 + Math.sin(t * 1.3) * 0.08;
      holder.rotation.x = -ty; holder.rotation.z = -tx * 0.5;
      cage.rotation.y = -t * 0.06 + tx * 0.4;
      ring2.scale.setScalar(1 + Math.sin(t * 2) * 0.04);
      var a = pg.attributes.position.array;
      for (var i = 0; i < P; i++) {
        a[i * 3 + 1] += sv[i] * 0.012;
        if (a[i * 3 + 1] > 3) a[i * 3 + 1] = -1;
      }
      pg.attributes.position.needsUpdate = true;
    }
  };
});

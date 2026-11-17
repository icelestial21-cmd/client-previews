// 3D design studio: the shopper's design printed live onto a 3D garment (tee, swimsuit) or a flowing silk panel.
import { stage } from "../partner-engine/3d/core.js";
import { RoomEnvironment } from "../partner-engine/vendor/RoomEnvironment.js";

document.querySelectorAll("[data-studio]").forEach(function (el) {
  var host = el.querySelector(".studio-stage") || el;
  stage(host, function (o) {
    var THREE = o.THREE, scene = o.scene, camera = o.camera, renderer = o.renderer, lite = o.lite;
    var kind = el.podKind || "tee";
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
    scene.environmentIntensity = 0.55;
    camera.position.set(0, 0, kind === "silk" ? 6.4 : 6.2);

    var tex = new THREE.CanvasTexture(el.podCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = lite ? 1 : 4;
    var group = new THREE.Group(); scene.add(group);
    var mesh, sideMat, cloth, base;

    if (kind === "silk") {
      // flowing silk panel with a satin sheen
      var seg = lite ? 40 : 80;
      var geo = new THREE.PlaneGeometry(2.9, 2.9, seg, seg);
      base = geo.attributes.position.array.slice();
      var mat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.38, metalness: 0.0, sheen: 0.55, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xffffff), side: THREE.DoubleSide, clearcoat: 0.08, clearcoatRoughness: 0.5 });
      cloth = new THREE.Mesh(geo, mat);
      cloth.rotation.x = -0.25; cloth.rotation.z = 0.12;
      group.add(cloth); mesh = cloth;
    } else {
      var cmds = window.POD.SHAPES[kind], b = window.POD.bbox(cmds);
      var shape = new THREE.Shape();
      cmds.forEach(function (k) {
        if (k[0] === "M") shape.moveTo(k[1], k[2]);
        else if (k[0] === "L") shape.lineTo(k[1], k[2]);
        else if (k[0] === "Q") shape.quadraticCurveTo(k[1], k[2], k[3], k[4]);
      });
      var g = new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.045, bevelSegments: lite ? 3 : 6, curveSegments: lite ? 16 : 36, steps: 1 });
      g.translate(0, 0, -0.035);
      // mirror the back so prints read correctly from behind
      var uv = g.attributes.uv, pz = g.attributes.position;
      for (var u = 0; u < uv.count; u++) if (pz.getZ(u) < -0.01) uv.setX(u, b.x0 + b.x1 - uv.getX(u));
      // body curvature so it reads as a garment, not a cut-out
      var pos = g.attributes.position;
      for (var i = 0; i < pos.count; i++) {
        var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        var bulge = kind === "tee" ? 0.34 * Math.exp(-x * x * 1.1) * (1 - Math.pow(Math.max(0, (y - 0.2) / 1.1), 2) * 0.3) : 0.3 * Math.exp(-x * x * 2.4);
        pos.setZ(i, z * (z > 0 ? 1 : 1) + (z > 0 ? bulge : bulge * 0.85));
      }
      g.computeVertexNormals();
      tex.repeat.set(1 / (b.x1 - b.x0), 1 / (b.y1 - b.y0));
      tex.offset.set(-b.x0 / (b.x1 - b.x0), -b.y0 / (b.y1 - b.y0));
      var face = new THREE.MeshPhysicalMaterial({ map: tex, roughness: kind === "swim" ? 0.42 : 0.86, sheen: kind === "swim" ? 0.2 : 0.25, sheenRoughness: 0.8, sheenColor: new THREE.Color(0xffffff), clearcoat: kind === "swim" ? 0.35 : 0, clearcoatRoughness: 0.5 });
      sideMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
      mesh = new THREE.Mesh(g, [face, sideMat]);
      mesh.scale.setScalar(kind === "tee" ? 1.18 : 1.08); if (kind === "swim") mesh.position.y = -0.18;
      group.add(mesh);
      if (kind === "swim") {
        // straps hint: two thin tubes over the shoulders
        var strapM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        [-0.37, 0.37].forEach(function (sx) {
          var curve = new THREE.CatmullRomCurve3([new THREE.Vector3(sx, 1.16, 0.12), new THREE.Vector3(sx * 0.95, 1.42, 0), new THREE.Vector3(sx * 0.9, 1.16, -0.16)]);
          var s = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.035, 8), strapM); s.userData.strap = true; mesh.add(s);
        });
        mesh.userData.strapM = strapM;
      }
    }

    // soft contact shadow
    var sc = document.createElement("canvas"); sc.width = sc.height = 128;
    var cx = sc.getContext("2d"), gr = cx.createRadialGradient(64, 64, 4, 64, 64, 64);
    gr.addColorStop(0, "rgba(0,0,0,.35)"); gr.addColorStop(1, "rgba(0,0,0,0)"); cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128);
    var shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.85; scene.add(shadow);

    var key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(2.5, 3, 4); scene.add(key);
    var fill = new THREE.DirectionalLight(0xffffff, 0.6); fill.position.set(-3, 1, 2); scene.add(fill);

    function onPaint() {
      tex.needsUpdate = true;
      if (sideMat && el.podBase) { sideMat.color.set(el.podBase).multiplyScalar(0.82); }
      if (mesh && mesh.userData.strapM && el.podBase) mesh.userData.strapM.color.set(el.podBase);
      if (cloth && el.podBase) cloth.material.sheenColor.set(el.podBase).lerp(new THREE.Color(0xffffff), 0.35);
    }
    el.addEventListener("pod:paint", onPaint); onPaint();

    // drag to turn
    var drag = false, lastX = 0, spin = 0, target = 0, idle = 0;
    host.addEventListener("pointerdown", function (e) { drag = true; lastX = e.clientX; host.setPointerCapture && host.setPointerCapture(e.pointerId); });
    host.addEventListener("pointermove", function (e) { if (!drag) return; target += (e.clientX - lastX) * 0.012; lastX = e.clientX; idle = 0; });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) { host.addEventListener(ev, function () { drag = false; }); });
    el.querySelectorAll("[data-view]").forEach(function (b) { b.addEventListener("click", function () { target = b.dataset.view === "back" ? Math.PI : 0; idle = -3; }); });

    var t0 = 0;
    return {
      resize: function (w, h) { camera.position.z = (kind === "silk" ? 6.4 : 6.2) * (w / h < 0.8 ? 1.25 : 1); },
      update: function (t, p) {
        var dt = Math.min(0.05, t - t0); t0 = t; idle += dt;
        if (!drag && idle > 2.5 && !el.hasAttribute("data-still")) target += dt * 0.35;
        spin += (target - spin) * 0.08;
        group.rotation.y = spin + p.x * 0.12;
        group.rotation.x = -p.y * 0.08 + Math.sin(t * 0.8) * 0.03;
        group.position.y = Math.sin(t * 1.1) * 0.05;
        if (cloth) {
          var a = cloth.geometry.attributes.position.array;
          for (var i = 0; i < a.length; i += 3) {
            var x = base[i], y = base[i + 1];
            a[i + 2] = Math.sin(x * 1.6 + t * 1.3) * 0.16 + Math.sin(y * 2.1 + t * 0.9) * 0.1 + Math.sin((x + y) * 1.2 + t * 1.7) * 0.06;
          }
          cloth.geometry.attributes.position.needsUpdate = true;
          cloth.geometry.computeVertexNormals();
        }
      }
    };
  });
});

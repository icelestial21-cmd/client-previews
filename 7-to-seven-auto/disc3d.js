// 7 to Seven Auto: 3D brake set for the hero. Procedural Three.js drilled + slotted rotor (extruded shape with holes),
// hat with lug studs, painted caliper with the shop name, and a floating spark plug. Drag to spin.
// Shared stage helper handles DPR cap, off-screen pause, reduced motion and the SVG fallback.
import { stage } from "../partner-engine/3d/core.js";
import { RoomEnvironment } from "../partner-engine/vendor/RoomEnvironment.js";

function circle(THREE, r, x, y, seg, hole) { var p = hole ? new THREE.Path() : new THREE.Shape(); p.absarc(x || 0, y || 0, r, 0, Math.PI * 2, !!hole); return p; }

document.querySelectorAll("[data-disc3d]").forEach(function (host) {
  stage(host, function (o) {
    var THREE = o.THREE, scene = o.scene, camera = o.camera, renderer = o.renderer, lite = o.lite;
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 1.7;
    renderer.toneMapping = THREE.NeutralToneMapping;
    var key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(3, 4, 6); scene.add(key);
    var root = new THREE.Group(); scene.add(root);

    // rotor: outer disc with centre bore, drilled holes and curved slots
    var R = 1.6, rIn = 0.78, seg = lite ? 64 : 128;
    var sh = circle(THREE, R); sh.holes.push(circle(THREE, rIn, 0, 0, seg, true));
    for (var ring = 0; ring < 3; ring++) for (var k = 0; k < 10; k++) {
      var a = k / 10 * Math.PI * 2 + ring * 0.21, rr = 1.02 + ring * 0.2;
      sh.holes.push(circle(THREE, 0.045, Math.cos(a) * rr, Math.sin(a) * rr, 16, true));
    }
    var rotorGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: lite ? 24 : 48 });
    rotorGeo.translate(0, 0, -0.11);
    var steel = new THREE.MeshPhysicalMaterial({ color: 0xe2e5ea, metalness: 0.85, roughness: 0.32, clearcoat: 0.4 });
    var rotor = new THREE.Mesh(rotorGeo, steel);
    // machined grooves (thin dark rings) on the face
    var grooveMat = new THREE.MeshStandardMaterial({ color: 0x5c6068, metalness: 1, roughness: 0.5 });
    [1.25, 1.48].forEach(function (r) { var g = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.01, seg), grooveMat); g.position.z = 0.132; rotor.add(g); var g2 = g.clone(); g2.position.z = -0.132; g2.rotation.y = Math.PI; rotor.add(g2); });
    // hat with lug stud holes
    var hs = circle(THREE, 0.82); hs.holes.push(circle(THREE, 0.24, 0, 0, 32, true));
    for (var l = 0; l < 5; l++) { var la = l / 5 * Math.PI * 2; hs.holes.push(circle(THREE, 0.06, Math.cos(la) * 0.5, Math.sin(la) * 0.5, 16, true)); }
    var hat = new THREE.Mesh(new THREE.ExtrudeGeometry(hs, { depth: 0.42, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 48 }), new THREE.MeshPhysicalMaterial({ color: 0x8d929a, metalness: 0.8, roughness: 0.4 }));
    hat.position.z = 0.02; rotor.add(hat);
    var studMat = new THREE.MeshPhysicalMaterial({ color: 0xe8c45a, metalness: 1, roughness: 0.25 });
    for (var m = 0; m < 5; m++) { var ma = m / 5 * Math.PI * 2; var st = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 14), studMat); st.rotation.x = Math.PI / 2; st.position.set(Math.cos(ma) * 0.5, Math.sin(ma) * 0.5, 0.55); rotor.add(st); }
    var spin = new THREE.Group(); spin.add(rotor); root.add(spin);

    // caliper: rounded C-shape, painted, with the shop name on it
    var cs = new THREE.Shape(); var co = 1.78, ci = 1.12, a0 = 0.95, a1 = 2.2;
    cs.absarc(0, 0, co, a0, a1, false); cs.absarc(0, 0, ci, a1, a0, true); cs.closePath();
    var calGeo = new THREE.ExtrudeGeometry(cs, { depth: 0.62, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: lite ? 3 : 6, curveSegments: 32 });
    calGeo.translate(0, 0, -0.31);
    var cv = document.createElement("canvas"); cv.width = 1024; cv.height = 512; var g = cv.getContext("2d");
    var drawCal = function () { g.fillStyle = "#e3241b"; g.fillRect(0, 0, 1024, 512); g.fillStyle = "#ffdb00"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "400 150px 'Archivo Black', Impact, sans-serif"; g.save(); g.translate(512, 256); g.rotate(-0.05); g.fillText("7-TO-7", 0, 0); g.restore(); };
    drawCal();
    var calTex = new THREE.CanvasTexture(cv); calTex.colorSpace = THREE.SRGBColorSpace;
    // map the label across the caliper face: shape coords x in [-1.6,0.9], y in [0.6,1.8]
    calTex.repeat.set(1 / 2.1, 1 / 1.13); calTex.offset.set(1.05 / 2.1, -0.65 / 1.13);
    var calPaint = new THREE.MeshPhysicalMaterial({ map: calTex, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
    var calSide = new THREE.MeshPhysicalMaterial({ color: 0xe3241b, roughness: 0.3, clearcoat: 1 });
    var caliper = new THREE.Mesh(calGeo, [calPaint, calSide]); root.add(caliper);
    if (document.fonts && document.fonts.load) document.fonts.load("400 60px 'Archivo Black'").then(function () { drawCal(); calTex.needsUpdate = true; });

    // floating spark plug
    var plug = new THREE.Group();
    var pts = [[0, -0.95], [0.035, -0.95], [0.05, -0.7], [0.1, -0.68], [0.1, -0.3], [0.17, -0.28], [0.17, -0.05], [0.12, 0], [0.12, 0.45], [0.06, 0.6], [0.06, 0.8], [0, 0.8]].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    var ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf4f2ee, roughness: 0.15, clearcoat: 1 });
    var lathe = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), ceramic); plug.add(lathe);
    var hex = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 6), new THREE.MeshPhysicalMaterial({ color: 0xbfc3c9, metalness: 1, roughness: 0.25 })); hex.position.y = -0.18; plug.add(hex);
    var thread = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.36, 24), new THREE.MeshPhysicalMaterial({ color: 0x9a9ea5, metalness: 1, roughness: 0.4 })); thread.position.y = -0.5; plug.add(thread);
    plug.scale.setScalar(0.9); plug.position.set(2.2, 0.6, 0.6); plug.rotation.z = -0.7; root.add(plug);

    var yaw = -0.55, vel = 0, drag = false, lx = 0, lastT = 0;
    host.addEventListener("pointerdown", function (e) { drag = true; lx = e.clientX; host.setPointerCapture(e.pointerId); });
    host.addEventListener("pointermove", function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; yaw += dx * 0.01; vel = dx * 0.01; });
    var up = function () { drag = false; }; host.addEventListener("pointerup", up); host.addEventListener("pointercancel", up);
    return {
      resize: function (W, H) { var a = W / H; camera.fov = 32; camera.position.set(0, 0.4, Math.max(7, 8.5 / Math.min(a, 1.2))); camera.lookAt(0.2, 0, 0); camera.updateProjectionMatrix(); },
      update: function (t, p) {
        var dt = Math.min(0.05, t - lastT); lastT = t;
        if (!drag) { vel *= 0.94; yaw += vel; }
        root.rotation.y = yaw + p.x * 0.15 + Math.sin(t * 0.4) * 0.12; root.rotation.x = -0.12 + p.y * 0.08;
        spin.rotation.z = -t * 0.6;
        plug.position.y = 0.6 + Math.sin(t * 1.3) * 0.08; plug.rotation.y = t * 0.8;
      }
    };
  });
});

// Media template: spinning match ball with orbiting broadcast rings.
import { THREE, stage, cssColor } from "./core.js";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";

export function mountFootball(el) {
  return stage(el, function (ctx) {
    var scene = ctx.scene, camera = ctx.camera, renderer = ctx.renderer;
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    camera.position.set(0, 0.2, 6.2);

    var accent = cssColor("--accent", "#c6ff00");
    var accent2 = cssColor("--accent-2", "#ff3d3d");

    // Ball: icosphere faces coloured by distance to the 12 icosahedron vertices → pentagon panels
    var geo = new THREE.IcosahedronGeometry(1, 3); if (geo.index) geo = geo.toNonIndexed();
    var ico = new THREE.IcosahedronGeometry(1, 0);
    var pos = ico.getAttribute("position"), centres = [];
    for (var i = 0; i < pos.count; i++) {
      var v = new THREE.Vector3().fromBufferAttribute(pos, i).normalize();
      if (!centres.some(function (c) { return c.distanceTo(v) < 0.01; })) centres.push(v);
    }
    var p = geo.getAttribute("position"), colors = [], a = new THREE.Vector3(), b = new THREE.Vector3(), cc = new THREE.Vector3();
    var dark = new THREE.Color("#0d0f14"), light = new THREE.Color("#f3f4f6");
    for (var f = 0; f < p.count; f += 3) {
      a.fromBufferAttribute(p, f); b.fromBufferAttribute(p, f + 1); cc.fromBufferAttribute(p, f + 2);
      var mid = a.clone().add(b).add(cc).normalize();
      var near = Math.max.apply(null, centres.map(function (c) { return mid.dot(c); }));
      var col = near > 0.935 ? dark : (near > 0.905 ? accent : light);
      for (var k = 0; k < 3; k++) colors.push(col.r, col.g, col.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    var ball = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.38, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.25, flatShading: true }));
    var group = new THREE.Group();
    group.add(ball);
    scene.add(group);

    // Orbiting rings
    function ring(r, color, tilt, op) {
      var m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 8, 160), new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: op }));
      m.rotation.x = tilt; return m;
    }
    var r1 = ring(1.55, accent, 1.25, 0.9), r2 = ring(1.85, 0xffffff, 1.05, 0.25), r3 = ring(2.2, accent2, 1.4, 0.35);
    scene.add(r1, r2, r3);
    var sat = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({ color: accent }));
    scene.add(sat);
    var sat2 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), new THREE.MeshBasicMaterial({ color: accent2 }));
    scene.add(sat2);

    // Stadium light specks
    var n = 260, sp = new Float32Array(n * 3);
    for (var s = 0; s < n; s++) {
      var th = Math.random() * Math.PI * 2, rr = 2.6 + Math.random() * 3.5;
      sp[s * 3] = Math.cos(th) * rr; sp[s * 3 + 1] = (Math.random() - 0.5) * 4; sp[s * 3 + 2] = Math.sin(th) * rr - 2;
    }
    var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    var specks = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.6 }));
    scene.add(specks);

    // Soft ground shadow
    var sh = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = -1.55; sh.scale.set(1.2, 1.2, 1);
    scene.add(sh);

    var key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
    var rim = new THREE.DirectionalLight(accent, 2.5); rim.position.set(-4, 1, -3); scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    return {
      update: function (t, ptr) {
        ball.rotation.y = t * 0.9; ball.rotation.x = t * 0.35;
        var bob = Math.sin(t * 1.6) * 0.08;
        group.position.y = bob;
        group.rotation.z = ptr.x * 0.15; group.rotation.x = -ptr.y * 0.15;
        sh.scale.setScalar(1.2 - bob * 0.8); sh.material.opacity = 0.3 - bob;
        r1.rotation.z = t * 0.4; r2.rotation.z = -t * 0.25; r3.rotation.z = t * 0.18;
        var a1 = t * 0.9; sat.position.set(Math.cos(a1) * 1.55, Math.sin(a1) * 1.55 * Math.cos(1.25), Math.sin(a1) * 1.55 * Math.sin(1.25));
        var a2 = -t * 0.6; sat2.position.set(Math.cos(a2) * 2.2, Math.sin(a2) * 2.2 * Math.cos(1.4), Math.sin(a2) * 2.2 * Math.sin(1.4));
        specks.rotation.y = t * 0.03;
        camera.position.x = ptr.x * 0.3; camera.lookAt(0, 0, 0);
      }
    };
  });
}

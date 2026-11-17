// Travel template: globe with animated flight routes into the Caribbean.
import { THREE, stage, cssColor } from "./core.js";

var CITIES = {
  "New York": [40.71, -74.0], "Toronto": [43.65, -79.38], "Miami": [25.76, -80.19], "London": [51.5, -0.12],
  "Fort Lauderdale": [26.12, -80.14], "Kingston": [17.99, -76.79], "Montego Bay": [18.47, -77.92],
  "Bridgetown": [13.1, -59.6], "Port of Spain": [10.65, -61.5], "Nassau": [25.05, -77.35]
};

function ll(lat, lon, r) {
  var phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}

export function mountGlobe(el, opts) {
  opts = opts || {};
  var routes = opts.routes || [["New York", "Kingston"], ["Toronto", "Montego Bay"], ["Miami", "Kingston"], ["London", "Bridgetown"], ["Fort Lauderdale", "Port of Spain"], ["Kingston", "Nassau"], ["Miami", "Bridgetown"]];
  return stage(el, function (ctx) {
    var scene = ctx.scene, camera = ctx.camera;
    camera.position.set(0, 0, 5.9);
    var accent = cssColor("--accent", "#2dd4bf"), accent2 = cssColor("--accent-2", "#fb7185");
    var R = 1.6;
    var globe = new THREE.Group();
    scene.add(globe);

    // Ocean sphere
    var ocean = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 64), new THREE.MeshStandardMaterial({ color: cssColor("--globe", "#0b3b4a"), roughness: 0.85, metalness: 0.1 }));
    globe.add(ocean);

    // Dot field over the sphere (Fibonacci), denser near the Americas to hint at land
    var N = 5200, dots = [], golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = golden * i;
      var v = new THREE.Vector3(Math.cos(th) * rr, y, Math.sin(th) * rr);
      var lat = Math.asin(v.y) * 180 / Math.PI, lon = Math.atan2(v.z, -v.x) * 180 / Math.PI - 180;
      if (lon < -180) lon += 360;
      if (isLand(lat, lon)) dots.push(v.multiplyScalar(R * 1.004));
    }
    var dg = new THREE.BufferGeometry().setFromPoints(dots);
    globe.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.024, transparent: true, opacity: 0.85 })));

    // Graticule
    var gm = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 });
    for (var la = -60; la <= 60; la += 30) {
      var pts = []; for (var lo = -180; lo <= 180; lo += 5) pts.push(ll(la, lo, R * 1.002));
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gm));
    }
    for (var lo2 = -180; lo2 < 180; lo2 += 30) {
      var pts2 = []; for (var la2 = -90; la2 <= 90; la2 += 5) pts2.push(ll(la2, lo2, R * 1.002));
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2), gm));
    }

    // Atmosphere glow (fresnel)
    var atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 64, 64), new THREE.ShaderMaterial({
      uniforms: { c: { value: accent } }, transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
      vertexShader: "varying vec3 n; void main(){ n = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }",
      fragmentShader: "uniform vec3 c; varying vec3 n; void main(){ float i = pow(max(0.0, 0.62 - dot(n, vec3(0.,0.,1.))), 2.4); gl_FragColor = vec4(c, 1.0) * i * 0.9; }"
    }));
    scene.add(atm);

    // Cities + routes
    var cityMat = new THREE.MeshBasicMaterial({ color: accent2 });
    Object.keys(CITIES).forEach(function (k) {
      var m = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), cityMat);
      m.position.copy(ll(CITIES[k][0], CITIES[k][1], R * 1.01)); globe.add(m);
      var halo = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.045, 32), new THREE.MeshBasicMaterial({ color: accent2, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
      halo.position.copy(m.position); halo.lookAt(m.position.clone().multiplyScalar(2)); globe.add(halo);
    });
    var flights = routes.map(function (r, idx) {
      var a = ll(CITIES[r[0]][0], CITIES[r[0]][1], R * 1.01), b = ll(CITIES[r[1]][0], CITIES[r[1]][1], R * 1.01);
      var mid = a.clone().add(b).multiplyScalar(0.5); var dist = a.distanceTo(b);
      mid.normalize().multiplyScalar(R * (1.05 + dist * 0.28));
      var curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      var pts = curve.getPoints(120);
      var g = new THREE.BufferGeometry().setFromPoints(pts);
      globe.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.28 })));
      var trailG = new THREE.BufferGeometry().setFromPoints(pts);
      var trail = new THREE.Line(trailG, new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 1 }));
      globe.add(trail);
      var plane = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.07, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      globe.add(plane);
      return { curve: curve, trail: trail, plane: plane, offset: idx * 0.37, speed: 0.12 + (idx % 3) * 0.03 };
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    var sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(-3, 2, 4); scene.add(sun);
    var warm = new THREE.DirectionalLight(accent2, 1.2); warm.position.set(4, -1, 2); scene.add(warm);

    // Face the Caribbean
    var baseY = -0.3, baseX = 0.34;
    globe.rotation.set(baseX, baseY, 0);
    var tmp = new THREE.Vector3(), up = new THREE.Vector3();
    return {
      update: function (t, ptr) {
        globe.rotation.y = baseY + Math.sin(t * 0.15) * 0.22 + ptr.x * 0.2;
        globe.rotation.x = baseX + ptr.y * -0.12;
        flights.forEach(function (f) {
          var u = ((t * f.speed + f.offset) % 1.25);
          var head = Math.min(u, 1), tail = Math.max(0, head - 0.28);
          var n = 120;
          f.trail.geometry.setDrawRange(Math.floor(tail * n), Math.max(2, Math.floor((head - tail) * n)));
          f.trail.material.opacity = u > 1 ? 1 - (u - 1) * 4 : 1;
          f.plane.visible = u <= 1;
          f.curve.getPoint(head, f.plane.position);
          f.curve.getTangent(Math.min(head, 0.999), tmp);
          up.copy(f.plane.position).normalize();
          f.plane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tmp.normalize());
        });
      }
    };
  });
}

// Very coarse land mask (enough to read as the Americas, Caribbean, Europe and West Africa)
function isLand(lat, lon) {
  function box(a, b, c, d) { return lat >= a && lat <= b && lon >= c && lon <= d; }
  // North America
  if (box(49, 70, -168, -55) && !(box(52, 64, -95, -78))) return true; // Canada minus Hudson Bay
  if (box(31, 49, -125, -67) && !(lat < 41 && lon > -70)) return true;   // USA
  if (box(25, 31, -100, -80) && !(box(25, 30, -97, -84))) return true;  // Gulf coast / Florida
  if (box(24.5, 31, -82.5, -80)) return true;                            // Florida peninsula
  if (box(15, 32, -117, -97) && !(box(20, 31, -112, -108))) return true;  // Mexico
  if (box(8, 18, -92, -77)) return lon < -83 || lat < 10;               // Central America
  // Caribbean islands
  if (box(20, 23.2, -85, -74)) return true;                              // Cuba
  if (box(17.7, 18.5, -78.4, -76.2)) return true;                         // Jamaica
  if (box(17.6, 20, -74.5, -68.3)) return true;                           // Hispaniola
  if (box(17.9, 18.5, -67.3, -65.6)) return true;                         // Puerto Rico
  if (box(23, 27, -79, -74) && ((lat * 7 + lon * 3) % 3 > 1.6)) return true; // Bahamas
  if (box(12, 17, -62, -59.4) && ((lat * 11 + lon * 5) % 2 > 1.2)) return true; // Lesser Antilles
  if (box(10, 11, -61.9, -60.9)) return true;                             // Trinidad
  // South America
  if (box(-55, 12, -81, -35)) {
    var w = -81 + (12 - lat) * 0.18, e = -35 - Math.max(0, (-5 - lat)) * 0.55;
    if (lat > -5) e = -50 + (12 - lat) * 0.6; if (lat < -38) w = -75;
    return lon > w && lon < e;
  }
  // Greenland, Europe, Africa
  if (box(60, 83, -55, -20)) return true;
  if (box(36, 71, -10, 40)) return !box(54, 58, 3, 8) && !box(38, 45, 4, 15);
  if (box(-35, 36, -17, 51)) { var we = lat > 5 ? -17 : 8 + (5 - lat) * 0.15; return lon > we && lon < 51 - Math.max(0, (lat - 12)) * 0.6; }
  return false;
}

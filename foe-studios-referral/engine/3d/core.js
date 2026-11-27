// Shared Three.js stage helper: sizing, DPR cap, pause when off-screen, reduced motion, WebGL fallback.
import * as THREE from "three";
export { THREE };

export function cssColor(name, fallback) {
  var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  try { return new THREE.Color(v || fallback); } catch (e) { return new THREE.Color(fallback); }
}

export function stage(el, setup) {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !window.__csqLite, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.__csqLite ? 1 : 2));
  var lite = !!window.__csqLite;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  el.appendChild(renderer.domElement);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  var pointer = { x: 0, y: 0 };
  window.addEventListener("pointermove", function (e) {
    pointer.x = e.clientX / window.innerWidth * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight * 2 - 1);
  }, { passive: true });
  var api = setup({ lite: lite, THREE: THREE, scene: scene, camera: camera, renderer: renderer, pointer: pointer, el: el });
  function size() {
    var w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (api && api.resize) api.resize(w, h);
  }
  size();
  new ResizeObserver(size).observe(el);
  var clock = new THREE.Clock(), running = false, raf = 0;
  var last = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (lite && now - last < 33) return;
    last = now;
    var t = clock.getElapsedTime();
    if (api && api.update) api.update(t, pointer);
    renderer.render(scene, camera);
  }
  el.classList.add("ready");
  if (reduce) { if (api && api.update) api.update(1.2, pointer); renderer.render(scene, camera); return api; }
  new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting && !running) { running = true; clock.start(); raf = requestAnimationFrame(frame); }
      else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    });
  }).observe(el);
  return api;
}

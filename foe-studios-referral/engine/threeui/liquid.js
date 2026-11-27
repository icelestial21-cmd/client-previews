// ThreeUI Community liquid shader (MIT, Meng To), trimmed to mountLiquid only.
import { VELOX_FRAGMENT_SHADER, VELOX_VERTEX_SHADER } from "./liquidShaders.js";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function loop(host, renderOnce, fpsCap) {
  let frame = 0, visible = true, last = 0;
  const minGap = fpsCap ? 1000 / fpsCap : 0;
  const tick = (t) => { if (t - last >= minGap) { last = t; renderOnce(t); } frame = visible && !document.hidden ? requestAnimationFrame(tick) : 0; };
  if (reduce) { renderOnce(performance.now()); return; }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !frame) frame = requestAnimationFrame(tick);
    if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
  }).observe(host);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && visible && !frame) frame = requestAnimationFrame(tick); });
}

function compile(gl, type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }

export function mountLiquid(host, opts = {}) {
  const o = { tint: null, bg: null, speed: 0.7, morph: 1, noiseScale: 1, mouseAmount: 0.18, metal: 1, camera: 5.5, ...opts };
  const canvas = document.createElement("canvas");
  if (o.filter) canvas.style.filter = o.filter;
  host.appendChild(canvas);
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "high-performance" });
  if (!gl) return;
  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VELOX_VERTEX_SHADER));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, VELOX_FRAGMENT_SHADER));
    gl.linkProgram(program); gl.useProgram(program);
  } catch (e) { return; }
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(program, "a_pos"); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(program, n);
  const u = { tint: U("u_tint"), bg: U("u_bg"), res: U("u_res"), time: U("u_time"), mouse: U("u_mouse"), morph: U("u_morph"), ns: U("u_noise_scale"), ma: U("u_mouse_amount"), metal: U("u_metal"), cam: U("u_camera") };
  let tx = 0, ty = 0, mx = 0, my = 0; const t0 = performance.now();
  window.addEventListener("pointermove", e => { tx = e.clientX / innerWidth * 2 - 1; ty = -(e.clientY / innerHeight * 2 - 1); }, { passive: true });
  const size = () => { const b = host.getBoundingClientRect(), pr = window.__csqLite ? 0.4 : Math.min(devicePixelRatio || 1, 1) * 0.7; canvas.width = Math.max(1, Math.round(b.width * pr)); canvas.height = Math.max(1, Math.round(b.height * pr)); gl.viewport(0, 0, canvas.width, canvas.height); };
  new ResizeObserver(size).observe(host); size();
  host.classList.add("ready");
  loop(host, (now) => {
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    gl.uniform2f(u.res, canvas.width, canvas.height); gl.uniform1f(u.time, (now - t0) * 0.001 * o.speed); gl.uniform2f(u.mouse, mx, my);
    gl.uniform1f(u.morph, o.morph); gl.uniform1f(u.ns, o.noiseScale); gl.uniform1f(u.ma, o.mouseAmount); gl.uniform1f(u.metal, o.metal); gl.uniform1f(u.cam, o.camera); gl.uniform3fv(u.tint, o.tint || [1, 1, 1]); gl.uniform3fv(u.bg, o.bg || [0.02, 0.02, 0.025]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, window.__csqLite ? 24 : 45);
}


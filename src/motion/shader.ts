/**
 * Liquid light — a small raw-WebGL renderer used for every "media" surface
 * (hero, story backdrop, contact). Large, slow domain-warped flows in the
 * design.md iridescent palette, seen through a glass lens with a refracted
 * core and an iridescent rim (inspired by monopo's glass sphere).
 * Renders either on obsidian (dark theme) or on paper (light theme).
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uC1;      // dominant
uniform vec3 uC2;      // secondary
uniform vec3 uC3;      // depth accent
uniform vec3 uLens;    // x, y (0..1, aspect corrected on x), radius (fraction of height)
uniform float uLight;  // 0 = obsidian base, 1 = paper base
uniform float uScale;
uniform float uQuality; // 1 = chromatic split through the glass, 0 = single sample (phones)

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = r * p * 2.03; a *= 0.5; }
  return v;
}

// Liquid field -> colour (on black)
vec3 liquid(vec2 p, float t) {
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, 9.2) + t * 1.3), fbm(p + 2.6 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p + 2.4 * r);
  float bands = smoothstep(0.35, 0.75, f);
  vec3 col = mix(vec3(0.0), uC3, smoothstep(0.30, 0.62, f) * 0.85);
  col = mix(col, uC1, smoothstep(0.45, 0.85, f + 0.25 * (q.x - 0.5)));
  col = mix(col, uC2, smoothstep(0.50, 0.9, r.y * 1.25) * bands);
  // soft sheen following the flow
  col += pow(abs(sin((f + r.x) * 6.0 + t * 2.0)), 18.0) * 0.12 * bands;
  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime * 0.035;
  vec2 drift = (uMouse - 0.5) * 0.08;

  vec2 base = (p + drift) * uScale;
  vec3 col = liquid(base, t);

  // ----- glass lens -----
  vec2 lc = vec2(uLens.x * aspect, uLens.y) + drift * 0.6;
  vec2 d = p - lc;
  float dist = length(d) / uLens.z;
  if (dist < 1.0) {
    float z = sqrt(1.0 - dist * dist);           // sphere height
    vec2 n = d / uLens.z;                        // normal (xy)
    vec2 refr = base - n * (0.55 * (1.0 - z)) * uScale + vec2(0.3, -0.2);
    // slight chromatic split through the glass
    vec3 g = liquid(refr, t);
    if (uQuality > 0.5) {
      g.r = liquid(refr + n * 0.025, t).r;
      g.b = liquid(refr - n * 0.025, t).b;
    }
    g *= 1.12;
    float fres = pow(1.0 - z, 3.0);
    vec3 rim = mix(uC1, uC2, 0.5 + 0.5 * sin(atan(n.y, n.x) * 2.0 + uTime * 0.3));
    g += rim * fres * 0.9;
    g += vec3(1.0) * pow(max(0.0, dot(normalize(vec3(n, z)), normalize(vec3(-0.5, 0.6, 0.6)))), 40.0) * 0.6;
    float edge = smoothstep(1.0, 0.985, dist);
    col = mix(col, g, edge);
  }
  // thin outline of the sphere
  col += mix(uC1, uC2, 0.5) * smoothstep(0.012, 0.0, abs(dist - 1.0)) * 0.35;

  // vignette
  float vig = smoothstep(1.35, 0.25, length((uv - 0.5) * vec2(1.25, 1.1)));
  col *= mix(0.35, 1.0, vig);

  // grain
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.03;

  // Light theme: paint the light onto paper instead of obsidian
  float lum = max(col.r, max(col.g, col.b));
  vec3 paper = vec3(0.985);
  vec3 tint = mix(paper, col / max(lum, 0.001) * 0.92, clamp(lum * 0.85, 0.0, 0.85));
  col = mix(col, tint, uLight);

  gl_FragColor = vec4(col, 1.0);
}
`;

export type RGB = [number, number, number];

export interface LiquidOptions {
  palette: [RGB, RGB, RGB];
  lens: [number, number, number];
  scale?: number;
  reduced: boolean;
}

export interface Liquid {
  canvas: HTMLCanvasElement;
  setActive(active: boolean): void;
  setPalette(palette: [RGB, RGB, RGB]): void;
  redraw(): void;
  /** Live values GSAP can tween (palette channels, lens, light). */
  state: { c: number[]; lens: number[]; light: number };
}

/** design.md iridescent stops */
export const SAGE: RGB = [160, 224, 171];
export const AMBER: RGB = [255, 172, 46];
export const OXBLOOD: RGB = [165, 45, 37];
export const TAN: RGB = [196, 146, 88];

const norm = (c: RGB) => c.map((v) => v / 255);

export function createLiquid(opts: LiquidOptions): Liquid {
  const canvas = document.createElement('canvas');
  canvas.className = 'liquid';
  const state = { c: opts.palette.flatMap(norm), lens: [...opts.lens], light: 0 };
  const noop: Liquid = {
    canvas,
    state,
    setActive() {},
    setPalette(p) { state.c = p.flatMap(norm); },
    redraw() {},
  };

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return noop;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return noop;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return noop;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = u('uRes'), uTime = u('uTime'), uMouse = u('uMouse');
  const uC1 = u('uC1'), uC2 = u('uC2'), uC3 = u('uC3'), uLens = u('uLens'), uLight = u('uLight'), uScale = u('uScale');
  gl.uniform1f(uScale, opts.scale ?? 1.6);

  // Soft by nature: render below native resolution. Phones and tablets get a
  // lighter version (smaller buffer, single glass sample, 30 fps).
  const lowPower = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 800;
  const SCALE = lowPower ? 0.34 : 0.5;
  gl.uniform1f(u('uQuality'), lowPower ? 0 : 1);
  const resize = () => {
    const w = Math.max(1, Math.floor(canvas.clientWidth * SCALE));
    const h = Math.max(1, Math.floor(canvas.clientHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  };
  new ResizeObserver(resize).observe(canvas);

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = 1 - e.clientY / window.innerHeight;
  });

  const start = performance.now();
  const draw = () => {
    resize();
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    const c = state.c;
    gl.uniform3f(uC1, c[0], c[1], c[2]);
    gl.uniform3f(uC2, c[3], c[4], c[5]);
    gl.uniform3f(uC3, c[6], c[7], c[8]);
    gl.uniform3f(uLens, state.lens[0], state.lens[1], state.lens[2]);
    gl.uniform1f(uLight, state.light);
    gl.uniform1f(uTime, 20 + (performance.now() - start) / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let active = false;
  let raf = 0;
  let frame = 0;
  const loop = () => {
    if (!lowPower || frame++ % 2 === 0) draw();
    if (active) raf = requestAnimationFrame(loop);
  };

  return {
    canvas,
    state,
    setPalette(p) { state.c = p.flatMap(norm); if (!active) draw(); },
    redraw() { if (!active) draw(); },
    setActive(next) {
      if (opts.reduced) { draw(); return; }
      if (next === active) return;
      active = next;
      cancelAnimationFrame(raf);
      if (active) loop();
    },
  };
}

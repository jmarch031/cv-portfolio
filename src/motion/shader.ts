/**
 * Iridescent hero backdrop — a small raw-WebGL fragment shader.
 * Domain-warped noise mapped to the design.md palette:
 * sage (160,224,171) → amber (255,172,46) → oxblood (165,45,37) on obsidian.
 * Falls back to the CSS radial gradients on the canvas if WebGL is unavailable.
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

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;
  float t = uTime * 0.06;

  p += (uMouse - 0.5) * 0.22;
  p *= 1.35;

  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.6 * q + vec2(1.7, 9.2) + t * 1.4),
                fbm(p + 3.6 * q + vec2(8.3, 2.8) - t * 1.1));
  float f = fbm(p + 3.4 * r);

  vec3 obsidian = vec3(0.0);
  vec3 oxblood  = vec3(165.0, 45.0, 37.0) / 255.0;
  vec3 amber    = vec3(255.0, 172.0, 46.0) / 255.0;
  vec3 sage     = vec3(160.0, 224.0, 171.0) / 255.0;

  vec3 col = mix(obsidian, oxblood, smoothstep(0.28, 0.62, f));
  col = mix(col, amber, smoothstep(0.42, 0.78, f * length(q) * 1.45));
  col = mix(col, sage,  smoothstep(0.30, 0.62, r.y * r.y * 1.6) * smoothstep(0.35, 0.7, f));

  // Liquid sheen: thin bright bands following the flow
  float sheen = pow(abs(sin((f + r.x) * 9.0 + uTime * 0.15)), 24.0);
  col += sheen * 0.18 * smoothstep(0.35, 0.8, f);

  // Calmer edges, brighter core behind the headline
  float shade = smoothstep(1.2, 0.1, length((uv - vec2(0.5 + (uMouse.x - 0.5) * 0.25, 0.55)) * vec2(1.0, 1.35)));
  col *= mix(0.3, 1.0, shade);

  // Film grain
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.035;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface HeroShader {
  setActive(active: boolean): void;
}

export function initHeroShader(canvas: HTMLCanvasElement, reducedMotion: boolean): HeroShader {
  // A soft CSS gradient stays as fallback until (or if) WebGL takes over
  const noop: HeroShader = { setActive() {} };
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return noop;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
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

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');

  // Render below native resolution: the texture is soft by nature
  const scale = 0.55;
  const resize = () => {
    const w = Math.max(1, Math.floor(canvas.clientWidth * scale));
    const h = Math.max(1, Math.floor(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  };
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = 1 - e.clientY / window.innerHeight;
  });

  let active = true;
  let raf = 0;
  const start = performance.now();
  const draw = () => {
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    gl.uniform1f(uTime, 12.0 + (performance.now() - start) / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = () => {
    draw();
    if (active) raf = requestAnimationFrame(loop);
  };

  canvas.style.background = '#000';
  if (reducedMotion) {
    draw();
    return noop;
  }
  loop();

  return {
    setActive(next: boolean) {
      if (next === active) return;
      active = next;
      cancelAnimationFrame(raf);
      if (active) loop();
    },
  };
}

/**
 * Liquid-gold WebGL renderer used by the cinematic intro.
 *
 * Two flowing sheets of molten gold sweep up the screen:
 *   - sheet 1 (progress p1) reveals the DIGITAL STUDIO title in its wake
 *   - sheet 2 (progress p2) washes the title away and leaves the canvas
 *     transparent, revealing the site underneath.
 * Surface detail comes from domain-warped simplex noise; lighting uses a
 * normal-mapped metallic model with fake studio-softbox reflections.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform float uP1;
uniform float uP2;
uniform sampler2D uText;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    s += a * snoise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.45;
  }
  return s;
}

// Wavy leading / trailing edge of a sheet
float edgeLine(float x, float base, float t, float seed) {
  return base
    + 0.045 * sin(x * 4.2 + t * 2.0 + seed)
    + 0.020 * sin(x * 9.1 - t * 2.7 + seed * 2.1)
    + 0.025 * snoise(vec2(x * 2.2 + seed, t * 0.6));
}

// Molten surface: broad, slow, horizontally-stretched folds (domain warped)
float surface(vec2 p, float t) {
  vec2 s = p * vec2(0.9, 1.7);
  vec2 q = vec2(snoise(s * 0.8 + vec2(0.0, t * 0.35)), snoise(s * 0.8 + vec2(4.1, 2.3) - vec2(t * 0.25, 0.0)));
  return fbm(s * 1.25 + q * 1.1 + vec2(t * 0.18, -t * 0.42));
}

vec3 shadeGold(vec2 p, float t, float lead) {
  float e = 0.006;
  float h = surface(p, t);
  float hx = surface(p + vec2(e, 0.0), t) - h;
  float hy = surface(p + vec2(0.0, e), t) - h;
  vec3 n = normalize(vec3(-hx / e * 0.27, -hy / e * 0.27, 1.0));

  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 R = reflect(-V, n);
  vec3 L = normalize(vec3(-0.35, 0.55, 0.76));

  // Studio environment reflected by polished metal
  float sky = smoothstep(-0.6, 0.9, R.y * 0.85 + R.x * 0.25);
  float box1 = smoothstep(0.30, 0.40, R.y) * (1.0 - smoothstep(0.55, 0.68, R.y));
  float box2 = smoothstep(-0.55, -0.45, R.x) * (1.0 - smoothstep(-0.30, -0.18, R.x)) * smoothstep(-0.4, 0.2, R.y);
  float floorBounce = smoothstep(0.2, -0.7, R.y) * 0.18;
  float env = 0.05 + 0.42 * sky + 1.25 * box1 + 0.7 * box2 + floorBounce;

  vec3 tint = vec3(0.96, 0.77, 0.48);
  vec3 col = tint * env;

  float spec = pow(max(dot(reflect(-L, n), V), 0.0), 90.0);
  col += vec3(1.0, 0.95, 0.84) * spec * 1.4;

  // Deep creases and soft occlusion
  float crease = smoothstep(-0.55, 0.35, h);
  col *= 0.35 + 0.65 * crease;

  // Bright meniscus at the leading edge
  col += vec3(1.0, 0.86, 0.6) * lead * 0.45;
  return col;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime;
  float aa = 2.0 / uRes.y;

  const float THICK = 0.62;

  // Sheet 1 — reveals the title
  float top1 = edgeLine(uv.x, mix(-0.12, 1.0 + THICK + 0.14, uP1), t, 0.0);
  float bot1 = edgeLine(uv.x, mix(-0.12, 1.0 + THICK + 0.14, uP1) - THICK, t, 3.7);
  // Sheet 2 — washes everything away
  float top2 = edgeLine(uv.x, mix(-0.12, 1.0 + THICK + 0.14, uP2), t, 7.3);
  float bot2 = edgeLine(uv.x, mix(-0.12, 1.0 + THICK + 0.14, uP2) - THICK, t, 11.1);

  float under1 = 1.0 - smoothstep(top1 - aa, top1 + aa, uv.y);   // below top edge of sheet 1
  float passed1 = 1.0 - smoothstep(bot1 - aa, bot1 + aa, uv.y);  // sheet 1 has passed
  float in1 = under1 * (1.0 - passed1);

  float under2 = 1.0 - smoothstep(top2 - aa, top2 + aa, uv.y);
  float passed2 = 1.0 - smoothstep(bot2 - aa, bot2 + aa, uv.y);
  float in2 = under2 * (1.0 - passed2);

  // Base: obsidian
  vec3 col = vec3(0.035);

  // Title (revealed behind sheet 1)
  vec2 tuv = uv;
  // subtle liquid refraction of the title right after the sheet passes
  float wet = exp(-max(bot1 - uv.y, 0.0) * 9.0) * passed1;
  tuv += vec2(snoise(p * 6.0 + t), snoise(p * 6.0 - t)) * 0.004 * wet;
  float textMask = texture2D(uText, tuv).a;
  float sheen = 0.5 + 0.5 * sin((uv.x * 3.0 - uv.y * 1.5) * 3.14159 + t * 1.6);
  vec3 ivory = vec3(0.957, 0.945, 0.918);
  vec3 goldTone = vec3(0.86, 0.74, 0.52);
  vec3 textCol = mix(ivory, goldTone, 0.25 + 0.35 * sheen + wet * 0.4);
  col = mix(col, textCol, textMask * passed1);

  // Gold sheets
  if (in1 > 0.001 || in2 > 0.001) {
    float lead1 = exp(-max(top1 - uv.y, 0.0) * 70.0);
    float lead2 = exp(-max(top2 - uv.y, 0.0) * 70.0);
    float lead = max(lead1 * in1, lead2 * in2);
    vec3 gold = shadeGold(p, t, lead);
    // darker underside near the trailing edge for depth
    float trail1 = exp(-max(uv.y - bot1, 0.0) * 30.0);
    float trail2 = exp(-max(uv.y - bot2, 0.0) * 30.0);
    gold *= 1.0 - 0.35 * max(trail1 * in1, trail2 * in2);
    col = mix(col, gold, clamp(in1 + in2, 0.0, 1.0));
  }

  // Everything below sheet 2's trailing edge becomes transparent
  float alpha = 1.0 - passed2 * (1.0 - in2);
  alpha = clamp(max(alpha, in2), 0.0, 1.0);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

export type LiquidGoldState = { time: number; p1: number; p2: number };

export type LiquidGold = {
  render: (state: LiquidGoldState) => void;
  /** Redraw the title texture with a new tagline (e.g. after a language change). */
  setTagline: (tagline: string) => void;
  resize: () => void;
  destroy: () => void;
};

type TextOptions = { title: string; tagline: string; fontFamily: string };

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

/** Draws the title into an offscreen canvas that is uploaded as a texture. */
function drawTitle(width: number, height: number, dpr: number, opts: TextOptions) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const narrow = width / height < 0.85;
  const words = narrow ? opts.title.split(" ") : [opts.title];
  const maxWidth = width * (narrow ? 0.82 : 0.84);

  let size = narrow ? width * 0.2 : Math.min(width * 0.105, height * 0.22);
  const tracking = 0.06;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";

  const measure = (s: number) => {
    ctx.font = `300 ${s}px ${opts.fontFamily}`;
    return Math.max(...words.map((w) => ctx.measureText(w).width + w.length * s * tracking));
  };
  while (measure(size) > maxWidth && size > 12) size *= 0.95;

  ctx.font = `300 ${size}px ${opts.fontFamily}`;
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${size * tracking}px`;
  }
  const lineH = size * 1.0;
  const blockH = lineH * words.length;
  const startY = height / 2 - blockH / 2 + lineH / 2 - size * 0.06;
  words.forEach((w, i) => ctx.fillText(w, width / 2, startY + i * lineH));

  // gold hairline + tagline
  const tagY = startY + (words.length - 1) * lineH + size * 0.78;
  const ruleW = Math.min(width * 0.12, 160 * dpr);
  ctx.fillRect(width / 2 - ruleW / 2, tagY - size * 0.18, ruleW, Math.max(1, dpr));
  const tagSize = Math.max(10 * dpr, size * 0.11);
  ctx.font = `400 ${tagSize}px ${opts.fontFamily}`;
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${tagSize * 0.38}px`;
  }
  ctx.fillText(opts.tagline.toUpperCase(), width / 2, tagY + tagSize * 0.6);
  return canvas;
}

export function createLiquidGold(canvas: HTMLCanvasElement, initialText: TextOptions): LiquidGold | null {
  const text = { ...initialText };
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false }) as WebGLRenderingContext | null;
  if (!gl) return null;

  let program: WebGLProgram;
  try {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Program link failed");
  } catch (err) {
    console.warn("[intro] WebGL unavailable, using fallback.", err);
    return null;
  }

  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, "uRes");
  const uTime = gl.getUniformLocation(program, "uTime");
  const uP1 = gl.getUniformLocation(program, "uP1");
  const uP2 = gl.getUniformLocation(program, "uP2");
  const uText = gl.getUniformLocation(program, "uText");

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(uText, 0);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
    const titleCanvas = drawTitle(w, h, dpr, text);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, titleCanvas);
  };

  resize();

  return {
    render({ time, p1, p2 }) {
      gl.uniform1f(uTime, time);
      gl.uniform1f(uP1, p1);
      gl.uniform1f(uP2, p2);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    resize,
    setTagline(tagline: string) {
      if (tagline === text.tagline) return;
      text.tagline = tagline;
      resize();
    },
    destroy() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

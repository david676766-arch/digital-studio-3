/**
 * Hero background: flowing liquid-gold silk with floating particles and a
 * sweeping light reflection, rendered in a single WebGL fragment shader.
 * The pointer gently swirls the folds and moves the key light.
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
uniform vec2 uMouse;     // pointer in silk space
uniform float uMouseAmt; // 0..1 influence

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float silk(vec2 p, float t, out float mask) {
  vec2 q = p;
  // Pointer: a soft, gentle bulge that the folds flow around
  vec2 d = p - uMouse;
  float infl = exp(-dot(d, d) * 2.2) * uMouseAmt;
  q -= d * infl * 0.22;

  float a = dot(q, vec2(0.86, 0.50));
  float b = dot(q, vec2(-0.42, 0.91));
  // Long draped folds running along one direction, gently meandering
  float h = 0.70 * sin(a * 2.4 + 1.35 * sin(b * 1.05 + t * 0.20) + t * 0.28)
          + 0.28 * sin(a * 4.9 + 0.95 * sin(b * 1.6 - t * 0.24) - t * 0.21 + 1.3)
          + 0.12 * sin(b * 1.9 + t * 0.14 + 0.5)
          + 0.04 * sin(a * 9.5 + b * 1.2 - t * 0.45);
  h += infl * 0.18;
  mask = 0.5 + 0.5 * sin(a * 0.9 - b * 0.6 + t * 0.16 + 0.9);
  return h;
}

vec3 particles(vec2 uv, float t, float aspect) {
  vec3 acc = vec3(0.0);
  for (int L = 0; L < 3; L++) {
    float fl = float(L);
    float scale = 5.0 + fl * 4.0;
    vec2 g = vec2(uv.x * aspect, uv.y) * scale;
    g.y -= t * (0.06 + fl * 0.035) * scale * 0.3;
    g.x += sin(t * 0.12 + fl * 2.0) * 0.5;
    g += uMouse * (fl + 1.0) * 0.18;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    vec2 rnd = hash2(id + fl * 13.1);
    vec2 o = (rnd - 0.5) * 0.45;
    float dist = length(f - o);
    float near = 1.0 - fl / 2.0; // layer 0 = near, larger & softer
    float size = mix(0.022, 0.05, hash(id + 3.3)) * (1.0 + near * 0.6);
    float tw = 0.4 + 0.6 * sin(t * (0.6 + rnd.y * 1.2) + rnd.x * 6.283);
    float on = step(0.86 - fl * 0.04, hash(id + fl * 7.7));
    float core = smoothstep(size, size * 0.2, dist);
    float halo = smoothstep(min(size * 3.5, 0.26), 0.0, dist) * 0.2;
    acc += vec3(1.0, 0.84, 0.58) * (core * (0.55 - near * 0.2) + halo) * tw * on;
  }
  return acc;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 1.6;
  float t = uTime;

  float mask;
  float h = silk(p, t, mask);
  float e = 0.004;
  float m2;
  float hx = silk(p + vec2(e, 0.0), t, m2) - h;
  float hy = silk(p + vec2(0.0, e), t, m2) - h;
  vec3 n = normalize(vec3(-hx / e * 0.55, -hy / e * 0.55, 1.0));

  vec3 L = normalize(vec3(-0.40 + uMouse.x * 0.22, -0.50 + uMouse.y * 0.22, 0.75));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 R = reflect(-V, n);

  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), V), 0.0), 40.0);
  float rim = pow(1.0 - max(n.z, 0.0), 2.0);                 // glowing fold edges
  float env = pow(clamp(0.5 + 0.5 * sin(n.x * 6.5 + n.y * 3.0 + 0.6), 0.0, 1.0), 3.0); // studio reflections
  float satin = pow(max(dot(normalize(L + V), n), 0.0), 8.0);

  vec3 deep = vec3(0.30, 0.18, 0.05);
  vec3 gold = vec3(0.86, 0.62, 0.26);
  vec3 champ = vec3(1.0, 0.93, 0.78);

  vec3 col = deep * diff * 0.9 + gold * (env * 0.75 + rim * 1.1) + gold * satin * 0.12 + champ * min(spec, 0.8) * 1.2;

  // Slow sweeping reflection of light across the silk
  float sweepPos = fract(t * 0.03) * 5.0 - 2.5;
  float band = exp(-pow((p.x * 0.75 + p.y * 0.45) - sweepPos, 2.0) * 3.0);
  col += champ * band * (spec * 1.2 + rim * 0.5);

  // Darker, readable composition: low-frequency mask, vignette, quieter bottom-left
  float vig = clamp(1.2 - 0.9 * dot((uv - 0.55) * vec2(1.1, 1.4), (uv - 0.55) * vec2(1.1, 1.4)) * 2.2, 0.0, 1.0);
  float textZone = mix(0.42, 1.0, smoothstep(0.05, 0.9, uv.x * 0.85 + uv.y * 0.5));
  col *= (0.22 + 0.78 * pow(mask, 1.4)) * vig * textZone;

  col += particles(uv, t, aspect) * (0.55 + 0.45 * vig);

  col = col / (1.0 + col * 0.32); // soft tone mapping
  col = mix(vec3(0.035), col, 0.96);
  gl_FragColor = vec4(col, 1.0);
}
`;

export type GoldSilk = {
  render: (time: number, mouse: [number, number], amount: number) => void;
  resize: () => void;
  /** Converts client coordinates into the shader's silk space. */
  toSilkSpace: (clientX: number, clientY: number) => [number, number];
  destroy: () => void;
};

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

export function createGoldSilk(canvas: HTMLCanvasElement, quality = 0.75): GoldSilk | null {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" }) as WebGLRenderingContext | null;
  if (!gl) return null;

  let program: WebGLProgram;
  try {
    program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Program link failed");
  } catch (err) {
    console.warn("[hero] WebGL unavailable, using video fallback.", err);
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
  const uMouse = gl.getUniformLocation(program, "uMouse");
  const uMouseAmt = gl.getUniformLocation(program, "uMouseAmt");

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * quality;
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  };
  resize();

  return {
    render(time, mouse, amount) {
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.uniform1f(uMouseAmt, amount);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    resize,
    toSilkSpace(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      const aspect = r.width / Math.max(1, r.height);
      const u = (clientX - r.left) / Math.max(1, r.width);
      const v = 1 - (clientY - r.top) / Math.max(1, r.height);
      return [(u - 0.5) * aspect * 1.6, (v - 0.5) * 1.6];
    },
    destroy() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

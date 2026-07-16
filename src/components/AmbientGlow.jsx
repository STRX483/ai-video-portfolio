import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   Anamorphic liquid glow behind a plate.
   A live shader, not a texture — the edge is mathematically
   guaranteed to fade to zero (no visible border ever), and it
   slowly flows/wobbles like glowing liquid.
   The glow margin is IDENTICAL for every plate, whatever its aspect.
   Knobs:
   - GLOW_MARGIN: how far the glow extends past the plate edges
   - WOBBLE: how liquid/organic the edge is (0 = perfect ellipse)
   - FLOW_SPEED: how fast the liquid edge moves
   - MAX_OPACITY: glow intensity when hovered
   ───────────────────────────────────────────── */
const GLOW_MARGIN = 1.3;
const WOBBLE = 0.24;
const FLOW_SPEED = 0.3;
const MAX_OPACITY = 0.85;

const FALLBACK = [
  [0.43, 0.47, 0.67],
  [0.37, 0.49, 0.63],
  [0.31, 0.51, 0.59],
];

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uWobble;
  uniform vec3 uColorL;
  uniform vec3 uColorM;
  uniform vec3 uColorR;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vUv - 0.5;
    // Anamorphic: squashed vertically → a wide, cinematic ellipse
    float d = length(p * vec2(1.35, 2.4));
    // Liquid edge: slowly flowing noise distorts the ellipse outline
    float n = fbm(vUv * 2.6 + vec2(uTime, -uTime * 0.7));
    d += (n - 0.5) * uWobble;
    // Fade fully out well before the plane edge — no border possible
    float a = smoothstep(0.62, 0.06, d);

    // Horizontal gradient from the thumbnail's own colors
    vec3 col = vUv.x < 0.5
      ? mix(uColorL, uColorM, smoothstep(0.0, 0.5, vUv.x))
      : mix(uColorM, uColorR, smoothstep(0.5, 1.0, vUv.x));

    gl_FragColor = vec4(col * a * uOpacity, a * uOpacity);
  }
`;

export default function AmbientGlow({ colors, hovered, w, h }) {
  const mat = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uWobble: { value: WOBBLE },
      uColorL: { value: new THREE.Color(...FALLBACK[0]) },
      uColorM: { value: new THREE.Color(...FALLBACK[1]) },
      uColorR: { value: new THREE.Color(...FALLBACK[2]) },
    }),
    [],
  );

  // Update gradient colors when the thumbnail is sampled
  useEffect(() => {
    const c = colors || FALLBACK;
    uniforms.uColorL.value.setRGB(...c[0]);
    uniforms.uColorM.value.setRGB(...c[1]);
    uniforms.uColorR.value.setRGB(...c[2]);
  }, [colors, uniforms]);

  useFrame(({ clock }, delta) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = clock.elapsedTime * FLOW_SPEED;
    const u = mat.current.uniforms.uOpacity;
    u.value = THREE.MathUtils.lerp(
      u.value,
      hovered ? MAX_OPACITY : 0,
      1 - Math.pow(0.001, delta),
    );
  });

  return (
    <mesh position={[0, 0, -0.5]}>
      {/* Same margin around EVERY plate — 16:9 and 21:9 glow identically */}
      <planeGeometry args={[w + GLOW_MARGIN * 2, h + GLOW_MARGIN * 2]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

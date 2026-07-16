import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   Flowing liquid background that follows the cursor.
   Tuning knobs:
   - SPEED: base flow speed of the liquid
   - BRIGHTNESS: overall glow level (0.5 subtle → 1.2 bold)
   - MOUSE_GLOW: strength of the glowing pool under the cursor
   ───────────────────────────────────────────── */
const SPEED = 0.04;
const BRIGHTNESS = 0.7;
const MOUSE_GLOW = 0.75;

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
  uniform float uBrightness;
  uniform float uMouseGlow;
  uniform vec2 uMouse;

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
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv * vec2(1.75, 1.0);
    float t = uTime;

    // Cursor position in the same space, and a soft falloff around it
    vec2 m = uMouse * vec2(1.75, 1.0);
    float md = length(uv - m);
    float mg = smoothstep(0.6, 0.0, md);

    // Domain-warped fbm = liquid-paint folding motion
    vec2 q = vec2(fbm(uv * 1.6 + t), fbm(uv * 1.6 - t * 0.6));
    vec2 r = vec2(fbm(uv * 2.4 + q * 1.6 + t * 0.4), fbm(uv * 2.4 - q * 1.4 - t * 0.3));
    r += mg * 0.35; // the cursor stirs the liquid around it
    float f = fbm(uv * 2.0 + r * 1.7);

    // Muted palette — indigo / deep teal / faint ember
    vec3 indigo = vec3(0.13, 0.16, 0.34);
    vec3 teal   = vec3(0.07, 0.24, 0.27);
    vec3 ember  = vec3(0.34, 0.19, 0.11);

    vec3 col = mix(indigo, teal, smoothstep(0.3, 0.7, f));
    col = mix(col, ember, smoothstep(0.72, 0.95, fbm(uv * 1.3 - r + t * 0.5)) * 0.6);

    float glow = smoothstep(0.25, 0.9, f);
    col *= 0.35 + glow * 0.75;

    // Glowing pool of liquid light under the cursor,
    // modulated by the fluid so it feels submerged, not like a flashlight
    col += mix(teal, indigo, 0.5) * mg * uMouseGlow * (0.4 + 0.8 * f);

    // Vignette so the liquid melts into black at the edges
    float vig = smoothstep(1.05, 0.3, length(vUv - 0.5) * 1.35);
    col *= vig;

    gl_FragColor = vec4(col * uBrightness, 1.0);
  }
`;

export default function LiquidBackground() {
  const mat = useRef();
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5)).current;
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBrightness: { value: BRIGHTNESS },
      uMouseGlow: { value: MOUSE_GLOW },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    [],
  );
  useFrame(({ clock, pointer }, delta) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = clock.elapsedTime * SPEED;
    // Smoothly trail the cursor (pointer is -1..1 → uv 0..1)
    mouseTarget.set(0.5 + pointer.x * 0.5, 0.5 + pointer.y * 0.5);
    mat.current.uniforms.uMouse.value.lerp(
      mouseTarget,
      1 - Math.pow(0.02, delta),
    );
  });
  return (
    <mesh position={[0, 0.5, -16]}>
      <planeGeometry args={[52, 30]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
      />
    </mesh>
  );
}

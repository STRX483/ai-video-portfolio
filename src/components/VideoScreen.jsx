import { useState, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Float } from "@react-three/drei";
import * as THREE from "three";
import { BASE_H, GRAIN, posterCandidates, previewSrc } from "../config/videos";
import { extractGlowColors } from "../lib/three-utils";
import AmbientGlow from "./AmbientGlow";

/* Thumbnail with automatic quality fallback.
   YouTube sometimes hasn't generated a given size (that's the gray
   play-button placeholder you saw) — this tries the next size down. */
function Poster({ video, hovered, onImage }) {
  const candidates = useMemo(() => posterCandidates(video), [video]);
  const [idx, setIdx] = useState(0);
  const src = idx < candidates.length ? candidates[idx] : null;

  const common = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    filter: hovered
      ? "blur(0px) brightness(1)"
      : "blur(12px) brightness(0.9) saturate(0.9)",
    transform: hovered ? "scale(1)" : "scale(1.1)",
    opacity: hovered ? 0 : 1,
    transition: "filter 0.7s ease, opacity 0.8s ease 0.4s, transform 0.7s ease",
  };

  if (!src) {
    // No thumbnail available (e.g. Kinescope without a poster set)
    return (
      <div
        style={{
          ...common,
          background:
            "linear-gradient(135deg, #141a2a 0%, #232c44 45%, #0d1119 100%)",
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      crossOrigin="anonymous"
      onError={() => setIdx((i) => i + 1)}
      onLoad={(e) => {
        // ytimg serves a tiny gray placeholder instead of a 404 for some
        // missing sizes — detect it by its 120px width and skip to the next
        if (e.currentTarget.naturalWidth <= 120) setIdx((i) => i + 1);
        else onImage?.(e.currentTarget);
      }}
      style={{ ...common, objectFit: "cover" }}
    />
  );
}

export default function VideoScreen({ video, baseX, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const group = useRef();
  const worldPos = useRef(new THREE.Vector3()).current;
  // Thumbnail colors for the ambient glow (fallback until the poster loads)
  const [glowColors, setGlowColors] = useState(null);

  // All plates share the same HEIGHT; width follows the aspect ratio.
  const is219 = video.aspect === "21:9";
  const pxH = 480; // bigger plates (was 444/339)
  const pxW = is219 ? 1120 : 853;
  const H = BASE_H;
  const W = H * (pxW / pxH);

  // Dynamic curtain curve + hover zoom + hover halo
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    g.getWorldPosition(worldPos);
    const x = worldPos.x;
    const k = 1 - Math.pow(0.001, delta);
    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      THREE.MathUtils.clamp(-x * 0.055, -0.45, 0.45),
      k,
    );
    g.position.z = THREE.MathUtils.lerp(g.position.z, -Math.abs(x) * 0.16, k);
    const s = THREE.MathUtils.lerp(g.scale.x, hovered ? 1.07 : 1, k);
    g.scale.setScalar(s);
  });

  return (
    <Float speed={1} rotationIntensity={0.04} floatIntensity={0.22}>
      <group ref={group} position={[baseX, 0, 0]} rotation={[-0.05, 0, 0]}>
        {/* Anamorphic liquid glow behind the plate — fades in on hover */}
        <AmbientGlow colors={glowColors} hovered={hovered} w={W} h={H} />

        <Html
          transform
          distanceFactor={1.5}
          position={[0, 0, 0.01]}
          zIndexRange={[10, 0]}
        >
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onOpen(video)}
            style={{
              width: `${pxW}px`,
              height: `${pxH}px`,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              borderRadius: "22px",
              background: "#000",
              transform: "perspective(1100px) rotateX(4.5deg)",
              boxShadow: hovered
                ? "0 30px 70px rgba(0,0,0,0.9), 0 0 140px 20px rgba(130,140,170,0.07)"
                : "0 30px 70px rgba(0,0,0,0.9)",
              transition: "box-shadow 0.7s ease",
            }}
          >
            {/* Muted autoplay preview — mounts only while hovering */}
            {hovered && (
              <iframe
                src={previewSrc(video)}
                title={video.title}
                width={pxW}
                height={pxH}
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                style={{
                  position: "absolute",
                  inset: 0,
                  border: "none",
                  pointerEvents: "none",
                  background: "#000",
                }}
              />
            )}

            {/* Blurred thumbnail (with automatic quality fallback) */}
            <Poster
              video={video}
              hovered={hovered}
              onImage={(img) => {
                const colors = extractGlowColors(img);
                if (colors) setGlowColors(colors);
              }}
            />

            {/* Frosted-glass micrograin — tight, fine roughness */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: GRAIN,
                backgroundSize: "64px 64px",
                mixBlendMode: "overlay",
                opacity: hovered ? 0 : 0.42,
                transition: "opacity 0.6s ease",
                pointerEvents: "none",
              }}
            />

            {/* Border + top sheen */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "22px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: hovered
                  ? "none"
                  : "linear-gradient(165deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 35%)",
                transition: "background 0.6s ease",
                pointerEvents: "none",
              }}
            />

            {/* Title */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: "20px",
                textAlign: "center",
                fontFamily: "ui-monospace, monospace",
                fontSize: "20px",
                letterSpacing: "0.55em",
                color: hovered
                  ? "rgba(255,255,255,0)"
                  : "rgba(215,220,232,0.85)",
                textShadow: "0 2px 22px rgba(0,0,0,0.95)",
                transition: "color 0.4s ease",
                pointerEvents: "none",
              }}
            >
              {video.title}
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

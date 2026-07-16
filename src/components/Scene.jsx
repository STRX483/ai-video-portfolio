import { Sparkles } from "@react-three/drei";
import LiquidBackground from "./LiquidBackground";
import Gallery from "./Gallery";
import CameraRig from "./CameraRig";

export default function Scene({ scrollRef, onOpen }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 12, 34]} />

      <ambientLight intensity={0.35} />
      <spotLight
        position={[0, 9, 7]}
        angle={0.6}
        penumbra={1}
        intensity={0.85}
        color="#e8e6e0"
      />
      <directionalLight
        position={[-6, 3, -4]}
        intensity={0.12}
        color="#aab4cc"
      />

      {/* Slow glowing liquid behind everything */}
      <LiquidBackground />

      <Sparkles
        count={100}
        scale={[28, 12, 14]}
        size={1.3}
        speed={0.16}
        opacity={0.28}
        color="#7c8494"
      />
      <Sparkles
        count={160}
        scale={[46, 22, 8]}
        position={[0, 0, -10]}
        size={0.9}
        speed={0.08}
        opacity={0.18}
        color="#9aa4b8"
      />

      <Gallery scrollRef={scrollRef} onOpen={onOpen} />
      <CameraRig />
    </>
  );
}

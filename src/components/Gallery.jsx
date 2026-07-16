import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VIDEOS, X_POSITIONS } from "../config/videos";
import VideoScreen from "./VideoScreen";

/* Horizontal curtain-scrolling row of screens.
   Positions come precomputed from videos.js (edge-to-edge spacing),
   and every plate sits on the same y — one clean aligned line. */
export default function Gallery({ scrollRef, onOpen }) {
  const group = useRef();
  useFrame((_, delta) => {
    const s = scrollRef.current;
    s.current = THREE.MathUtils.lerp(
      s.current,
      s.target,
      1 - Math.pow(0.004, delta),
    );
    if (group.current) group.current.position.x = -s.current;
  });
  return (
    <group ref={group}>
      {VIDEOS.map((video, i) => (
        <VideoScreen
          key={video.id}
          video={video}
          baseX={X_POSITIONS[i]}
          onOpen={onOpen}
        />
      ))}
    </group>
  );
}

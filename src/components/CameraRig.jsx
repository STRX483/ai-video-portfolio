import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* Gentle mouse-parallax camera sway */
export default function CameraRig() {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3()).current;
  useFrame((_, delta) => {
    target.set(pointer.x * 0.9, 0.1 + pointer.y * 0.45, 8.4);
    camera.position.lerp(target, 1 - Math.pow(0.001, delta));
    camera.lookAt(0, 0, 0);
  });
  return null;
}

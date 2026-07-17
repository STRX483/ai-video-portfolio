import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { MAX_SCROLL } from "./config/videos";
import { IS_TOUCH } from "./lib/device";
import Scene from "./components/Scene";
import Splash from "./components/Splash";
import Overlay from "./components/Overlay";
import ProjectModal from "./components/ProjectModal";

// Drag/swipe speed: one full screen-width of travel ≈ the whole gallery.
// Scales with viewport width, so a finger swipe on a phone moves as far
// as a mouse drag on a big monitor.
const DRAG_SPEED = 18;

export default function App() {
  const [booted, setBooted] = useState(false);
  const [active, setActive] = useState(null);
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef({ target: 0, current: 0 });
  const activeRef = useRef(false);
  activeRef.current = !!active;

  // Splash: 3 seconds, then fade
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Wheel → curtain scroll
  useEffect(() => {
    const onWheel = (e) => {
      if (activeRef.current) return; // don't scroll behind the modal
      const s = scrollRef.current;
      s.target = THREE.MathUtils.clamp(
        s.target + e.deltaY * 0.005,
        0,
        MAX_SCROLL,
      );
      setProgress(MAX_SCROLL ? s.target / MAX_SCROLL : 0);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // Left-button drag / touch swipe → curtain scroll
  useEffect(() => {
    let dragging = false;
    let lastX = 0;
    let moved = 0;
    const onDown = (e) => {
      if (activeRef.current) return;
      if (e.pointerType === "mouse" && e.button !== 0) return; // left button only
      dragging = true;
      moved = 0;
      lastX = e.clientX;
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      const s = scrollRef.current;
      const k = DRAG_SPEED / Math.max(window.innerWidth, 320);
      s.target = THREE.MathUtils.clamp(s.target - dx * k, 0, MAX_SCROLL);
      setProgress(MAX_SCROLL ? s.target / MAX_SCROLL : 0);
    };
    const onUp = () => {
      dragging = false;
    };
    // If the pointer travelled, swallow the click so a drag never opens a video
    const onClickCapture = (e) => {
      if (moved > 8) {
        e.stopPropagation();
        e.preventDefault();
        moved = 0;
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  const requestClose = () => {
    setClosing(true);
    setTimeout(() => {
      setActive(null);
      setClosing(false);
    }, 600);
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-black"
      style={{ touchAction: "none" }}
    >
      <Splash done={booted} />
      <Overlay progress={progress} />

      {/* The 3D world blurs & recedes when a project opens */}
      <div
        className="h-full w-full transition-all duration-700 ease-out"
        style={{
          filter: active && !closing ? "blur(10px) brightness(0.5)" : "none",
          transform: active && !closing ? "scale(1.04)" : "scale(1)",
        }}
      >
        <Canvas
          camera={{ position: [0, 0.1, 8.4], fov: 44 }}
          gl={{ antialias: !IS_TOUCH, powerPreference: "high-performance" }}
          dpr={IS_TOUCH ? [1, 1.5] : [1, 2]}
          /* Freeze the whole 3D render loop while a project is open — the
             world is blurred behind the modal anyway, so the last frame is
             kept as a static image and the GPU is left to the video player.
             Resumes as soon as the modal starts closing. */
          frameloop={active && !closing ? "never" : "always"}
        >
          <Scene
            scrollRef={scrollRef}
            onOpen={(v) => setActive(v)}
            paused={!!active}
          />
        </Canvas>
      </div>

      {active && (
        <ProjectModal video={active} closing={closing} onClose={requestClose} />
      )}
    </div>
  );
}

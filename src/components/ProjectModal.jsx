import { useState, useEffect } from "react";
import { fullSrc } from "../config/videos";

/* Cinematic project popup — video with sound + title + description */
export default function ProjectModal({ video, closing, onClose }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const visible = entered && !closing;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 md:p-10 ${
        visible ? "bg-black/85 backdrop-blur-md" : "bg-black/0"
      }`}
      onClick={onClose}
    >
      {/* Letterbox bars */}
      <div
        className="absolute left-0 right-0 top-0 bg-black transition-all duration-700 ease-out"
        style={{ height: visible ? "8vh" : "0vh" }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 bg-black transition-all duration-700 ease-out"
        style={{ height: visible ? "8vh" : "0vh" }}
      />

      <div
        className="w-full max-w-4xl transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.94)",
          filter: visible ? "blur(0px)" : "blur(10px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm font-bold tracking-[0.45em] text-white md:text-base">
            {video.title}
          </h2>
          <button
            onClick={onClose}
            className="font-mono text-[11px] tracking-[0.3em] text-neutral-500 transition-colors hover:text-white"
          >
            ESC / CLOSE ✕
          </button>
        </div>
        <div
          className="w-full overflow-hidden rounded-md border border-white/10 shadow-2xl shadow-black"
          style={{ aspectRatio: video.aspect === "21:9" ? "21/9" : "16/9" }}
        >
          <iframe
            src={fullSrc(video)}
            title={video.title}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            style={{ display: "block", border: "none", background: "#000" }}
          />
        </div>
        <p className="mt-5 max-w-2xl font-mono text-[11px] leading-relaxed tracking-wider text-neutral-400">
          {video.description}
        </p>
      </div>
    </div>
  );
}

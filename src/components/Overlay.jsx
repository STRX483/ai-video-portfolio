import { GRAIN } from "../config/videos";

/* Fixed UI: header, footer, contact, scroll progress, vignette + grain */
export default function Overlay({ progress }) {
  return (
    <>
      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* Film grain */}
      <div
        className="pointer-events-none fixed inset-0 z-10 opacity-[0.05]"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-6 md:p-10">
        <header className="flex items-start justify-between">
          <div className="pointer-events-auto">
            <h1 className="font-mono text-sm font-bold tracking-[0.45em] text-white">
              SAINT RANDOM
            </h1>
            <p className="mt-1 font-mono text-[10px] tracking-[0.3em] text-neutral-500">
              AI FILMS · MOTION · WORLDS
            </p>
          </div>
          <p className="hidden font-mono text-[10px] tracking-[0.3em] text-neutral-600 md:block">
            SCROLL TO EXPLORE — CLICK TO WATCH
          </p>
        </header>

        <div className="flex flex-col items-start gap-6 md:items-center">
          {/* Scroll progress line */}
          <div className="h-px w-40 bg-white/10">
            <div
              className="h-px bg-white/60 transition-all duration-300"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          {/* Mobile: stacked & left-aligned (© line first, CONTACT below).
              Desktop (md+): one row, corners — unchanged. */}
          <footer className="flex w-full flex-col items-start gap-3 text-left md:flex-row md:items-end md:justify-between">
            <p className="font-mono text-[10px] tracking-[0.3em] text-neutral-600">
              © 2026 — ALL WORK GENERATED &amp; DIRECTED BY SAINT RANDOM
            </p>
            <a
              href="https://t.me/xaunatic"
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto font-mono text-[10px] tracking-[0.3em] text-neutral-400 transition-colors hover:text-white"
            >
              CONTACT ↗
            </a>
          </footer>
        </div>
      </div>
    </>
  );
}
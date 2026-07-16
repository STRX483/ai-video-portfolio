/* Splash screen shown for ~3 seconds at load.
   🔁 Replace the <svg> below with your real logo whenever ready. */
export default function Splash({ done }) {
  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* 🔁 PLACEHOLDER LOGO — swap this <svg> for your own */}
      <svg width="96" height="96" viewBox="0 0 96 96" className="animate-pulse">
        <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <circle cx="48" cy="48" r="34" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="6 10" />
        <text
          x="48"
          y="56"
          textAnchor="middle"
          fontFamily="ui-monospace, monospace"
          fontSize="24"
          letterSpacing="4"
          fill="#fff"
        >
          SR
        </text>
      </svg>
      <p className="mt-6 font-mono text-[10px] tracking-[0.5em] text-neutral-500">
        SAINT RANDOM
      </p>
    </div>
  );
}

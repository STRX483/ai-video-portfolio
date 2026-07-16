export default function Splash({ done }) {
  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative h-24 w-24 animate-pulse">
        <svg width="96" height="96" viewBox="0 0 96 96" className="absolute inset-0">
          <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <circle cx="48" cy="48" r="34" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="6 10" />
        </svg>
        <img
          src="/saint-random-logo.svg"
          alt="Saint Random"
          className="absolute inset-0 m-auto h-11 w-11 object-contain"
        />
      </div>
      <p className="mt-6 font-mono text-[10px] tracking-[0.5em] text-neutral-500">
        SAINT RANDOM
      </p>
    </div>
  );
}

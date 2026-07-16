/* ═══════════════════════════════════════════════════════════
   🎬 YOUR PROJECTS — this is the ONLY file you normally edit.
   aspect: "16:9" or "21:9"
   poster: optional thumbnail URL. Recommended for Kinescope videos
           (Kinescope has no public auto-thumbnail).
   ═══════════════════════════════════════════════════════════ */
export const VIDEOS = [
  {
    id: 1, // 🔗 https://youtu.be/bruN55lISFg
    type: "youtube",
    videoId: "bruN55lISFg",
    aspect: "16:9",
    title: "PROJECT 01",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: 2, // 🔗 https://youtu.be/3Mmd3jWJJ6Q
    type: "youtube",
    videoId: "3Mmd3jWJJ6Q",
    aspect: "21:9",
    title: "PROJECT 02",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.",
  },
  {
    id: 3, // 🔗 https://youtu.be/QeriQ3iNwM0
    type: "youtube",
    videoId: "QeriQ3iNwM0",
    aspect: "21:9",
    title: "PROJECT 03",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.",
  },
  {
    id: 4, // 🔗 https://youtu.be/QrXgJOJOpBE
    // (spare kinescope: https://kinescope.io/xt8Q6U54DmUnyNQ4dMYnuJ — if you
    //  bring it back, add a poster: "https://..." for its glass preview)
    type: "youtube",
    videoId: "QrXgJOJOpBE",
    aspect: "16:9",
    title: "PROJECT 04",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis sem at nibh elementum imperdiet.",
  },
  {
    id: 5, // 🔗 https://youtu.be/rduMk3esRo4
    type: "youtube",
    videoId: "rduMk3esRo4",
    aspect: "16:9",
    title: "PROJECT 05",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mattis. Sed convallis tristique sem.",
  },
  {
    id: 6, // 🔗 https://youtu.be/pcF3lqV2nQE (swapped with old #4)
    type: "youtube",
    videoId: "pcF3lqV2nQE",
    aspect: "16:9",
    title: "PROJECT 06",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ut ligula vel nunc egestas porttitor.",
  },
];

/* ── Layout constants ───────────────────── */
export const BASE_H = 2.0; // shared plate HEIGHT in world units — raise to scale ALL plates up
export const GAP = 1.15; // empty space between plate EDGES (constant, whatever the aspect)

// Plate width in world units, derived from its aspect ratio
export const widthOf = (v) =>
  BASE_H * (v.aspect === "21:9" ? 21 / 9 : 16 / 9);

/* Cumulative x positions: each plate is placed after the previous one's
   edge + GAP, so plates can NEVER overlap — even when 21:9 and 16:9 mix.
   The row is offset so plate #2 sits at x = 0 (first three centered on load). */
export const X_POSITIONS = (() => {
  let cursor = 0;
  const centers = VIDEOS.map((v) => {
    const w = widthOf(v);
    const center = cursor + w / 2;
    cursor += w + GAP;
    return center;
  });
  const offset = centers[1] ?? 0;
  return centers.map((c) => c - offset);
})();

// Scroll distance so the LAST plate can land exactly in the center
export const MAX_SCROLL = Math.max(0, X_POSITIONS[VIDEOS.length - 1] ?? 0);

/* ── Embed URL builders ─────────────────── */
export const previewSrc = (v) =>
  v.type === "youtube"
    ? "https://www.youtube.com/embed/" +
      v.videoId +
      "?autoplay=1&mute=1&controls=0&loop=1&playlist=" +
      v.videoId +
      "&rel=0&playsinline=1&modestbranding=1"
    : "https://kinescope.io/embed/" +
      v.videoId +
      "?autoplay=true&muted=true&loop=true";

export const fullSrc = (v) =>
  v.type === "youtube"
    ? "https://www.youtube.com/embed/" + v.videoId + "?autoplay=1&rel=0"
    : "https://kinescope.io/embed/" + v.videoId + "?autoplay=true";

/* Thumbnail candidates, best quality first.
   The Poster component automatically falls back down this list,
   so videos where YouTube hasn't generated some sizes still work. */
export const posterCandidates = (v) => {
  if (v.poster) return [v.poster];
  if (v.type !== "youtube") return [];
  return ["maxresdefault", "hq720", "sddefault", "hqdefault", "mqdefault"].map(
    (n) => "https://i.ytimg.com/vi/" + v.videoId + "/" + n + ".jpg",
  );
};

/* ── Grain texture ──────────────────────── */
// Fine film grain (frosted-glass micrograin + UI film grain)
export const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.7'/%3E%3C/svg%3E\")";

/* ═══════════════════════════════════════════════════════════
   🎬 YOUR PROJECTS — this is the ONLY file you normally edit.
   aspect: "16:9" or "21:9"
   poster: optional thumbnail URL. Recommended for Kinescope videos
           (Kinescope has no public auto-thumbnail).
   ═══════════════════════════════════════════════════════════ */
import { IS_TOUCH } from "../lib/device";

export const VIDEOS = [
  {
    id: 1, // 🔗 https://youtu.be/bruN55lISFg
    type: "youtube",
    videoId: "bruN55lISFg",
    aspect: "16:9",
    title: "PROJECT 01",
    description:
      "An opening visual sequence created for the HSE University × Samokat collaborative fashion show. The project reimagines the Russian capital as a fluid, living dreamscape. Drawing inspiration from the reality-bending, kaleidoscopic geometry of Doctor Strange, the visuals capture a neural metropolis where architecture folds, shifts, and breathes in sync with the runway.",
  },
  {
    id: 2, // 🔗 https://youtu.be/3Mmd3jWJJ6Q
    type: "youtube",
    videoId: "3Mmd3jWJJ6Q",
    aspect: "21:9",
    title: "PROJECT 02",
    description:
      "Grounded in archival reality, this video uses media archaeology to trace the invisible lines connecting yesterday's covert history to today's consequences. It’s part political thriller, part dark satire: a trio of hazy, misguided protagonists decide to spark a revolution in West Africa. But as the plot spirals out of control, the visuals reveal a deeper truth—that the ghosts of old conflicts never truly stay buried, and some games are far too big to play.",
  },
  {
    id: 3, // 🔗 https://youtu.be/QeriQ3iNwM0
    type: "youtube",
    videoId: "QeriQ3iNwM0",
    aspect: "21:9",
    title: "PROJECT 03",
    description:
      "Digital resistance transformed into a fierce, stylized battle. This aggressive protest music video visualizes the fight for an open web through a literal, chaotic showdown between a punk protagonist and an omnipresent, state-backed censorship entity. Pure, unfiltered counter-culture energy targeting the forces that try to disconnect us.",
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
      "Real-world nostalgia meets deep-sea cyberpunk. This remastered visual sequence fuses the gritty, high-stakes action of RoboCop with a luminous, physics-defying underwater universe.It’s a vivid collision of 80s action cinema grit and deep-sea sci-fi aesthetics.",
  },
  {
    id: 5, // 🔗 https://youtu.be/rduMk3esRo4
    type: "youtube",
    videoId: "rduMk3esRo4",
    aspect: "16:9",
    title: "PROJECT 05",
    description:
      "An AI-driven visual transformation developed at Mago Studio for Elena Kiper’s project Po Klassike 2.0. For this piece, my role went far beyond the digital canvas. Alongside developing the core neural restyling, I designed and animated the dynamic intro and outro sequences, and embedded with the production crew on set during live filming. A true hybrid project blending advanced post-production pipelines with hands-on filmmaking.",
  },
  {
    id: 6, // 🔗 https://youtu.be/pcF3lqV2nQE (swapped with old #4)
    type: "youtube",
    videoId: "pcF3lqV2nQE",
    aspect: "16:9",
    title: "PROJECT 06",
    description:
      "A monumental 3D projection mapping concept that transforms the historic Pavilion of Venus into a living canvas for St. Petersburg’s 'Night of Light' festival. The piece explores the friction between classical stone heritage and hyper-modern digital fluidity. To achieve this, the workflow merges generative neural video with intricate, procedural Houdini simulations, wrapping the physical architecture in a shifting skin of simulated physics and liquid light",
  },
];

/* ── Layout constants ───────────────────── */
export const BASE_H = 2.0; // shared plate HEIGHT in world units — raise to scale ALL plates up
export const GAP = 1.15; // empty space between plate EDGES (constant, whatever the aspect)

// Plate width in world units, derived from its aspect ratio
export const widthOf = (v) => BASE_H * (v.aspect === "21:9" ? 21 / 9 : 16 / 9);

/* Cumulative x positions: each plate is placed after the previous one's
   edge + GAP, so plates can NEVER overlap — even when 21:9 and 16:9 mix.
   Desktop: the row is offset so plate #2 sits at x = 0 (first three centered
   on load). Mobile (touch): only ~one plate fits the narrow screen, so plate
   #1 is centered instead — otherwise the site opens on PROJECT 02 and
   PROJECT 01 is unreachable (scroll is clamped at 0). */
export const X_POSITIONS = (() => {
  let cursor = 0;
  const centers = VIDEOS.map((v) => {
    const w = widthOf(v);
    const center = cursor + w / 2;
    cursor += w + GAP;
    return center;
  });
  const offset = (IS_TOUCH ? centers[0] : centers[1]) ?? 0;
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

/* Device detection — shared across components.
   "coarse pointer" = finger/touch device (phones, tablets).
   Desktop with a mouse is never matched, so nothing changes there. */
export const IS_TOUCH =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

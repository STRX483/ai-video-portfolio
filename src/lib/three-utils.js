/* Thumbnail color sampling for the ambient glow */

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d > 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)];
}

/* Average color of an image slice, boosted so it glows on black
   (like YouTube's ambient mode — saturated, never muddy).
   Returns [r, g, b] in 0..1. */
function sliceColor(ctx, x0, w, h) {
  const data = ctx.getImageData(x0, 0, w, h).data;
  let r = 0;
  let g = 0;
  let b = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  const [hue, sat, lum] = rgbToHsl(r / n, g / n, b / n);
  const s = Math.min(1, sat * 1.6 + 0.2);
  const l = Math.min(0.62, lum * 1.2 + 0.2);
  return hslToRgb(hue, s, l);
}

/* Extract [left, middle, right] glow colors from a loaded thumbnail <img>.
   Returns null if the image can't be sampled (CORS etc.) —
   the caller then keeps the neutral fallback colors. */
export function extractGlowColors(img) {
  try {
    const w = 36;
    const h = 18;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const third = w / 3;
    return [
      sliceColor(ctx, 0, third, h),
      sliceColor(ctx, third, third, h),
      sliceColor(ctx, third * 2, third, h),
    ];
  } catch {
    return null;
  }
}

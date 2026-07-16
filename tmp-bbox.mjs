import fs from "fs";

const svg = fs.readFileSync("public/saint-random-logo.svg", "utf8");
const pathMatch = svg.match(/<path[^>]*\sd="([^"]+)"/);
if (!pathMatch) {
  console.error("no path found");
  process.exit(1);
}
const d = pathMatch[1];

const tokenize = (s) => {
  const tokens = [];
  const re = /[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
  let m;
  while ((m = re.exec(s))) tokens.push(m[0]);
  return tokens;
};

let minX = Infinity,
  minY = Infinity,
  maxX = -Infinity,
  maxY = -Infinity;
let x = 0,
  y = 0;

const add = (px, py) => {
  minX = Math.min(minX, px);
  minY = Math.min(minY, py);
  maxX = Math.max(maxX, px);
  maxY = Math.max(maxY, py);
};

const tokens = tokenize(d);
for (let i = 0; i < tokens.length; i++) {
  const type = tokens[i];
  if (!/[MmLlHhVvCcSsQqTtAaZz]/.test(type)) continue;
  const rel = type === type.toLowerCase();
  const t = type.toUpperCase();
  i++;

  const read = () => Number(tokens[i++]);

  if (t === "M" || t === "L") {
    do {
      const px = read();
      const py = read();
      x = rel ? x + px : px;
      y = rel ? y + py : py;
      add(x, y);
    } while (i < tokens.length && !/[MmLlHhVvCcSsQqTtAaZz]/.test(tokens[i]));
    i--;
  } else if (t === "H") {
    do {
      const px = read();
      x = rel ? x + px : px;
      add(x, y);
    } while (i < tokens.length && !/[MmLlHhVvCcSsQqTtAaZz]/.test(tokens[i]));
    i--;
  } else if (t === "V") {
    do {
      const py = read();
      y = rel ? y + py : py;
      add(x, y);
    } while (i < tokens.length && !/[MmLlHhVvCcSsQqTtAaZz]/.test(tokens[i]));
    i--;
  } else if (t === "C") {
    do {
      const x1 = rel ? x + read() : read();
      const y1 = rel ? y + read() : read();
      const x2 = rel ? x + read() : read();
      const y2 = rel ? y + read() : read();
      const x3 = rel ? x + read() : read();
      const y3 = rel ? y + read() : read();
      add(x1, y1);
      add(x2, y2);
      add(x3, y3);
      x = x3;
      y = y3;
    } while (i < tokens.length && !/[MmLlHhVvCcSsQqTtAaZz]/.test(tokens[i]));
    i--;
  } else if (t === "Z") {
    // close path
  }
}

const pad = Math.max(maxX - minX, maxY - minY) * 0.06;
const viewBox = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
console.log(JSON.stringify({ minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY, viewBox }));

const pathEl = svg.match(/<path[^>]*\/>/)?.[0] ?? svg.match(/<path[\s\S]*?<\/path>/)?.[0];
const pathD = pathMatch[1];

const favicon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <rect width="100%" height="100%" fill="#000"/>
  <path fill="#f2f8ff" d="${pathD}"/>
</svg>
`;

fs.writeFileSync("public/favicon.svg", favicon);
console.log("wrote public/favicon.svg");

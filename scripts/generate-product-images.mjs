// Generates a dummy product image (SVG) for every product in the catalog.
// Output: public/products/{productSlug}.svg — swap in real photos later by
// replacing the file (or updating ProductImage to point at the new asset).
// Run with: node scripts/generate-product-images.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = readFileSync(path.join(root, "src", "lib", "products.ts"), "utf8");

// Tailwind gradient tokens used in products.ts -> actual hex pairs.
const HUE_MAP = {
  "from-emerald-400 to-teal-600": ["#34d399", "#0d9488"],
  "from-sky-400 to-blue-600": ["#38bdf8", "#2563eb"],
  "from-orange-400 to-red-600": ["#fb923c", "#dc2626"],
  "from-violet-400 to-purple-600": ["#a78bfa", "#9333ea"],
  "from-pink-400 to-fuchsia-600": ["#f472b6", "#c026d3"],
  "from-indigo-400 to-violet-600": ["#818cf8", "#7c3aed"],
  "from-amber-400 to-yellow-600": ["#fbbf24", "#ca8a04"],
  "from-slate-400 to-gray-600": ["#94a3b8", "#475569"],
  "from-teal-400 to-emerald-600": ["#2dd4bf", "#059669"],
  "from-rose-400 to-pink-600": ["#fb7185", "#db2777"],
};

// String contents may contain escaped quotes (e.g. 0.96\" SSD1306 OLED).
const str = '((?:[^"\\\\]|\\\\.)*)';
const productRe = new RegExp(
  `\\{\\s*id:\\s*"${str}",\\s*slug:\\s*"${str}",\\s*name:\\s*"${str}",[\\s\\S]*?imageHue:\\s*"${str}",\\s*emoji:\\s*"${str}",\\s*\\}`,
  "g"
);

const colors = (hue) => HUE_MAP[hue] || ["#94a3b8", "#475569"];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Decode the TS-string escapes that survive regex capture (e.g. 0.96\" ...).
function decodeTs(value) {
  return value.replaceAll('\\"', '"').replaceAll("\\\\", "\\").replaceAll("\\n", "\n");
}

function svgFor({ name, emoji, from, to }) {
  const label = escapeXml(name);
  const emojiChar = escapeXml(emoji);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <title>${label}</title>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glowA" cx="20%" cy="20%" r="45%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.9)"/>
      <stop offset="45%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <radialGradient id="glowB" cx="80%" cy="80%" r="40%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.6)"/>
      <stop offset="40%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <rect width="800" height="800" fill="url(#glowA)"/>
  <rect width="800" height="800" fill="url(#glowB)"/>
  <text x="400" y="385" text-anchor="middle" dominant-baseline="central" font-size="230">${emojiChar}</text>
  <text x="400" y="728" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="34" font-weight="600" fill="rgba(255,255,255,0.9)">${label}</text>
</svg>
`;
}

const outDir = path.join(root, "public", "products");
mkdirSync(outDir, { recursive: true });

let count = 0;
let match;
while ((match = productRe.exec(src)) !== null) {
  const [, , slug, name, hue, emoji] = match;
  const [from, to] = colors(hue);
  const svg = svgFor({ name: decodeTs(name), emoji, from, to });
  writeFileSync(path.join(outDir, `${slug}.svg`), svg, "utf8");
  count++;
}

console.log(`Generated ${count} dummy product images in public/products/`);
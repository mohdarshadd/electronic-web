// Pure, fs-free helpers for product images. Client-safe (imported by admin form).
import type { Product } from "./types";

// Tailwind gradient tokens used across the catalog -> actual hex pairs for the SVG.
export const HUE_MAP: Record<string, [string, string]> = {
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

export const HUE_OPTIONS = Object.keys(HUE_MAP);

export const EMOJI_OPTIONS = [
  "📡", "🔌", "⚙️", "🔬", "🖥️", "📶", "🔋", "🛠️",
  "📦", "🗜️", "🧲", "💡", "🎛️", "⏱️", "🌡️", "💧",
  "🔧", "⚡", "🕹️", "📷", "🤖", "🧩", "💻", "📱",
  "🔦", "🧵", "🔭", "🎙️", "🖱️", "🎤",
];

export function hueColors(hue: string): [string, string] {
  return HUE_MAP[hue] ?? ["#94a3b8", "#475569"];
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function svgForProduct(product: Product): string {
  const [from, to] = hueColors(product.imageHue);
  const label = escapeXml(product.name);
  const emojiChar = escapeXml(product.emoji || "📦");
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
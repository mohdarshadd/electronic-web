// Fetches temporary dummy product photos from the internet and normalizes them
// to public/products/{slug}.webp. Sources are recorded in public/products/SOURCES.md.
//
// Usage:
//   node scripts/fetch-product-images.mjs
//   node scripts/fetch-product-images.mjs --force
//   node scripts/fetch-product-images.mjs --only=slug-a,slug-b --force
//   node scripts/fetch-product-images.mjs --contact
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "products");
const MANIFEST_PATH = path.join(ROOT, "scripts", "product-image-sources.json");
const LOCK_PATH = path.join(OUT_DIR, "image-sources.lock.json");
const SOURCES_PATH = path.join(OUT_DIR, "SOURCES.md");
const CREAM = "#faf5ea";
const UA = "VoltCoreDummyImageFetcher/1.0 (https://github.com/mohdarshadd/electronic-web)";
const BAD_TITLE = /(diagram|schematic|pinout|pin ?out|drawing|logo|icon|symbol|map|chart|graph|wiring|breadboard|soldering|person|people|hand|portrait|screenshot|render)/i;

function compact(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Model numbers must actually appear in the file title, otherwise Commons often
// returns the previous revision of a board (e.g. Raspberry Pi 2 for a Pi 4).
const GENERIC_MODEL_TOKENS = new Set(["3d", "2d", "4k", "8k", "5g", "4g", "3g"]);

function modelTokens(search) {
  const matches = search.match(/[a-z]*\d+[a-z0-9]*(?:[-.][a-z0-9]+)*/gi) ?? [];
  return [...new Set(matches.map(compact).filter((token) => token && !GENERIC_MODEL_TOKENS.has(token)))];
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const contactOnly = args.includes("--contact");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean)) : null;

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const entries = Object.entries(manifest).filter(([slug]) => !only || only.has(slug));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mdCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

async function download(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": UA, Accept: "image/*" },
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const length = Number(res.headers.get("content-length") ?? 0);
  if (length > 20_000_000) throw new Error(`image too large (${length} bytes)`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 2_000) throw new Error(`image too small (${buffer.length} bytes)`);
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height || meta.width < 400 || meta.height < 200) {
    throw new Error(`unusable dimensions ${meta.width ?? "?"}x${meta.height ?? "?"}`);
  }
  return { buffer, meta, finalUrl: res.url };
}

async function commonsCandidates(search) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrsearch: `${search} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "15",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1000",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`);
  const data = await res.json();
  const pages = data?.query?.pages ?? [];
  const tokens = search
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter((token) => token.length > 2);
  const requiredModels = modelTokens(search);

  return pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const title = page.title ?? "";
      if (!/^image\/(jpeg|png|webp)$/i.test(info.mime ?? "")) return null;
      if ((info.width ?? 0) < 500 || (info.height ?? 0) < 250) return null;
      if (BAD_TITLE.test(title)) return null;
      const compactTitle = compact(title);
      const titleWords = title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const modelHits = requiredModels.filter((token) =>
        token.length === 1 ? titleWords.includes(token) : compactTitle.includes(token)
      );
      if (requiredModels.length > 0 && modelHits.length === 0) return null;
      let score = 0;
      const lower = title.toLowerCase();
      for (const token of tokens) if (lower.includes(token)) score += 3;
      score += modelHits.length * 4;
      score += Math.min(info.width ?? 0, 1600) / 1600;
      if (info.mime === "image/jpeg") score += 0.2;
      return { page, info, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

async function fromCommonsFile(fileTitle) {
  const title = fileTitle.startsWith("File:") ? fileTitle : `File:${fileTitle}`;
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1000",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`);
  const data = await res.json();
  const page = data?.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  if (!page || page.missing !== undefined || !info) return null;
  if (!/^image\/(jpeg|png|webp|gif)$/i.test(info.mime ?? "")) return null;
  const url = info.thumburl || info.url;
  if (!url) return null;
  const downloaded = await download(url);
  const meta = info.extmetadata ?? {};
  return {
    ...downloaded,
    source: "Wikimedia Commons",
    sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
    imageUrl: info.url || url,
    author: stripHtml(meta.Artist?.value) || "Unknown",
    license: stripHtml(meta.LicenseShortName?.value) || "See source",
    licenseUrl: stripHtml(meta.LicenseUrl?.value),
    note: stripHtml(meta.ImageDescription?.value).slice(0, 160),
  };
}

async function fromCommons(entry) {
  const candidates = await commonsCandidates(entry.search);
  for (const candidate of candidates) {
    const { info } = candidate;
    const url = info.thumburl || info.url;
    if (!url) continue;
    try {
      const downloaded = await download(url);
      const meta = info.extmetadata ?? {};
      return {
        ...downloaded,
        source: "Wikimedia Commons",
        sourceUrl: info.descriptionurl || candidate.page.title,
        imageUrl: info.url || url,
        author: stripHtml(meta.Artist?.value) || "Unknown",
        license: stripHtml(meta.LicenseShortName?.value) || "See source",
        licenseUrl: stripHtml(meta.LicenseUrl?.value),
        note: stripHtml(meta.ImageDescription?.value).slice(0, 160),
      };
    } catch (error) {
      console.warn(`    Commons candidate failed: ${error.message}`);
    }
  }
  return null;
}

async function fromLocal(file) {
  const full = path.join(ROOT, file);
  if (!existsSync(full)) return null;
  const buffer = readFileSync(full);
  const meta = await sharp(buffer).metadata();
  return {
    buffer,
    meta,
    finalUrl: file,
    source: "Local source file",
    sourceUrl: file,
    imageUrl: file,
    author: "Unknown",
    license: "Temporary local placeholder",
    licenseUrl: "",
    note: "Untracked local source; only the processed WebP is referenced.",
  };
}

async function fromLoremFlickr(entry, index) {
  const url = `https://loremflickr.com/1000/1000/${encodeURIComponent(entry.tags)}?lock=${index + 1}`;
  const downloaded = await download(url);
  return {
    ...downloaded,
    source: "LoremFlickr (tag-based stock)",
    sourceUrl: `https://loremflickr.com/1000/1000/${entry.tags}`,
    imageUrl: downloaded.finalUrl,
    author: "Unknown",
    license: "Temporary dummy stock image",
    licenseUrl: "",
    note: `Tag search: ${entry.tags}`,
  };
}

async function fromPicsum(slug) {
  const url = `https://picsum.photos/seed/${encodeURIComponent(slug)}/1000/1000`;
  const downloaded = await download(url);
  return {
    ...downloaded,
    source: "Picsum Photos (random stock)",
    sourceUrl: url,
    imageUrl: downloaded.finalUrl,
    author: "Unknown",
    license: "Temporary dummy stock image",
    licenseUrl: "",
    note: "Last-resort random placeholder.",
  };
}

async function processImage(slug, result) {
  const out = path.join(OUT_DIR, `${slug}.webp`);
  const tmp = `${out}.tmp`;
  await sharp(result.buffer)
    .rotate()
    .resize(800, 800, { fit: "contain", background: CREAM })
    .flatten({ background: CREAM })
    .toColourspace("srgb")
    .webp({ quality: 82, effort: 5 })
    .toFile(tmp);
  renameSync(tmp, out);
  return {
    slug,
    file: `/products/${slug}.webp`,
    bytes: statSync(out).size,
    source: result.source,
    sourceUrl: result.sourceUrl,
    imageUrl: result.imageUrl,
    author: result.author,
    license: result.license,
    licenseUrl: result.licenseUrl,
    note: result.note,
    original: `${result.meta.width}x${result.meta.height}`,
  };
}

async function fetchOne(slug, entry, index) {
  const attempts = [];
  if (entry.file) {
    const local = await fromLocal(entry.file).catch((error) => {
      attempts.push(`local: ${error.message}`);
      return null;
    });
    if (local) return processImage(slug, local);
  }
  if (entry.url) {
    try {
      const direct = await download(entry.url);
      return processImage(slug, {
        ...direct,
        source: "Direct URL override",
        sourceUrl: entry.url,
        imageUrl: direct.finalUrl,
        author: entry.author || "Unknown",
        license: entry.license || "Temporary dummy image",
        licenseUrl: entry.licenseUrl || "",
        note: entry.note || "",
      });
    } catch (error) {
      attempts.push(`direct: ${error.message}`);
    }
  }
  if (entry.commons) {
    try {
      const curated = await fromCommonsFile(entry.commons);
      if (curated) return processImage(slug, curated);
      attempts.push(`commons file: ${entry.commons} not found`);
    } catch (error) {
      attempts.push(`commons file: ${error.message}`);
    }
  }
  try {
    const commons = await fromCommons(entry);
    if (commons) return processImage(slug, commons);
    attempts.push("commons: no usable result");
  } catch (error) {
    attempts.push(`commons: ${error.message}`);
  }
  try {
    return processImage(slug, await fromLoremFlickr(entry, index));
  } catch (error) {
    attempts.push(`loremflickr: ${error.message}`);
  }
  console.warn(`  Falling back to random stock for ${slug}: ${attempts.join("; ")}`);
  return processImage(slug, await fromPicsum(slug));
}

function sourcesMarkdown(rows) {
  const lines = [
    "# Product Image Sources",
    "",
    "Temporary dummy images used as placeholders. Replace with licensed product photography before production.",
    "Images are normalized to 800x800 WebP with a cream background.",
    "",
    "| Product | File | Source | Author | License | Original |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const row of rows) {
    const source =
      row.sourceUrl && /^https?:/i.test(row.sourceUrl)
        ? `[${row.source}](${row.sourceUrl})`
        : row.source;
    const license = row.licenseUrl ? `[${row.license}](${row.licenseUrl})` : row.license;
    lines.push(
      `| ${mdCell(row.slug)} | ${mdCell(row.file)} | ${mdCell(source)} | ${mdCell(row.author)} | ${mdCell(license)} | ${mdCell(row.original)} |`
    );
  }
  lines.push("");
  return lines.join("\n");
}

async function contactSheet(rows) {
  const cols = 5;
  const cellW = 240;
  const cellH = 260;
  const rowsCount = Math.ceil(rows.length / cols);
  const composites = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const file = path.join(OUT_DIR, `${row.slug}.webp`);
    if (!existsSync(file)) continue;
    const col = i % cols;
    const gridRow = Math.floor(i / cols);
    const left = col * cellW;
    const top = gridRow * cellH;
    const thumb = await sharp(file)
      .resize(210, 210, { fit: "contain", background: CREAM })
      .toBuffer();
    composites.push({ input: thumb, left: left + 15, top: top + 10 });
    const label = row.slug.length > 32 ? `${row.slug.slice(0, 31)}…` : row.slug;
    const svg = Buffer.from(
      `<svg width="${cellW}" height="30" xmlns="http://www.w3.org/2000/svg"><text x="${cellW / 2}" y="20" text-anchor="middle" font-family="Consolas,monospace" font-size="10" fill="#1e293b">${label.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`
    );
    composites.push({ input: svg, left, top: top + 220 });
  }
  const outDir = path.join(os.tmpdir(), "opencode");
  mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, "product-contact-sheet.jpg");
  await sharp({
    create: { width: cols * cellW, height: rowsCount * cellH, channels: 3, background: CREAM },
  })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toFile(out);
  console.log(`\nContact sheet: ${out}`);
}

mkdirSync(OUT_DIR, { recursive: true });
const lock = existsSync(LOCK_PATH) ? JSON.parse(readFileSync(LOCK_PATH, "utf8")) : {};
const results = [];
let failed = 0;

if (!contactOnly) {
  for (let i = 0; i < entries.length; i++) {
    const [slug, entry] = entries[i];
    const out = path.join(OUT_DIR, `${slug}.webp`);
    if (!force && existsSync(out)) {
      console.log(`[${i + 1}/${entries.length}] skip ${slug} (exists)`);
      if (lock[slug]) results.push(lock[slug]);
      continue;
    }
    console.log(`[${i + 1}/${entries.length}] ${slug} <- ${entry.search || entry.tags}`);
    try {
      const result = await fetchOne(slug, entry, i);
      lock[slug] = result;
      results.push(result);
      console.log(
        `    ${result.source} | ${result.original} -> 800x800 | ${(result.bytes / 1024).toFixed(1)} KB | ${result.license}`
      );
    } catch (error) {
      failed++;
      console.error(`    FAILED: ${error.message}`);
    }
    await sleep(250);
  }
  writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 2), "utf8");
}

const allRows = Object.entries(lock).map(([slug, row]) => ({ slug, ...row }));
writeFileSync(SOURCES_PATH, sourcesMarkdown(allRows), "utf8");

if (contactOnly || entries.length > 1) {
  await contactSheet(allRows);
}

const missing = Object.keys(manifest).filter((slug) => !existsSync(path.join(OUT_DIR, `${slug}.webp`)));
console.log(`\nDone: ${Object.keys(manifest).length - missing.length}/${Object.keys(manifest).length} images.`);
if (missing.length) {
  console.log(`Missing: ${missing.join(", ")}`);
}
if (failed) process.exitCode = 1;

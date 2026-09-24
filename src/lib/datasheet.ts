import fs from "node:fs";
import path from "node:path";

// Uploaded datasheet PDFs live under the (git-ignored) .data dir and are streamed
// by a public route — keeps user uploads out of the tracked public/ folder.
function datasheetPath(slug: string): string {
  return path.join(process.cwd(), ".data", "datasheets", `${slug}.pdf`);
}

export function writeDatasheet(slug: string, buffer: Buffer): void {
  const file = datasheetPath(slug);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buffer);
}

export function deleteDatasheet(slug: string): void {
  try {
    fs.unlinkSync(datasheetPath(slug));
  } catch {
    // ignore
  }
}

export function readDatasheet(slug: string): Buffer | null {
  try {
    if (!fs.existsSync(datasheetPath(slug))) return null;
    return fs.readFileSync(datasheetPath(slug));
  } catch {
    return null;
  }
}

// Moves an uploaded datasheet when a product's slug changes (no-op if none exists).
export function renameDatasheet(fromSlug: string, toSlug: string): void {
  try {
    fs.renameSync(datasheetPath(fromSlug), datasheetPath(toSlug));
  } catch {
    // ignore
  }
}
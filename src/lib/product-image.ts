import fs from "node:fs";
import path from "node:path";
import type { Product } from "./types";
import { svgForProduct } from "./product-visual";

function productSvgPath(slug: string): string {
  return path.join(process.cwd(), "public", "products", `${slug}.svg`);
}

// Writes (or overwrites) the generated advertisement-style SVG for a product.
export function writeProductSvg(product: Product): void {
  fs.mkdirSync(path.dirname(productSvgPath(product.slug)), { recursive: true });
  fs.writeFileSync(productSvgPath(product.slug), svgForProduct(product), "utf-8");
}

// Removes the generated image for a deleted or renamed product (swallow errors).
export function deleteProductSvg(slug: string): void {
  try {
    fs.unlinkSync(productSvgPath(slug));
  } catch {
    // ignore
  }
}

// Uploaded JPG photos live under the (git-ignored) .data dir and are streamed by a
// public route — keeps user uploads out of the tracked public/ folder.
function productJpgPath(slug: string): string {
  return path.join(process.cwd(), ".data", "product-images", `${slug}.jpg`);
}

export function writeProductJpg(slug: string, buffer: Buffer): void {
  const file = productJpgPath(slug);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buffer);
}

export function deleteProductJpg(slug: string): void {
  try {
    fs.unlinkSync(productJpgPath(slug));
  } catch {
    // ignore
  }
}

export function readProductJpg(slug: string): Buffer | null {
  try {
    if (!fs.existsSync(productJpgPath(slug))) return null;
    return fs.readFileSync(productJpgPath(slug));
  } catch {
    return null;
  }
}

// Moves an uploaded photo when a product's slug changes (no-op if none exists).
export function renameProductJpg(fromSlug: string, toSlug: string): void {
  try {
    fs.renameSync(productJpgPath(fromSlug), productJpgPath(toSlug));
  } catch {
    // ignore
  }
}
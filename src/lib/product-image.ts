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
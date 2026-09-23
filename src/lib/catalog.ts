import type { Product } from "./types";
import { getLiveProducts } from "./inventory";
import { loadCustomProducts } from "./custom-products";

// Unified view of the storefront catalog: live (base + overrides) products
// followed by admin-added products. Server-only (fs-backed).
// getLiveProducts() already contains custom products, so guard against doubles by id.
export function getCatalog(): Product[] {
  const seen = new Set<string>();
  const catalog: Product[] = [];
  for (const p of [...getLiveProducts(), ...loadCustomProducts()]) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      catalog.push(p);
    }
  }
  return catalog;
}

export function getCatalogProductBySlug(slug: string): Product | undefined {
  return getCatalog().find((p) => p.slug === slug);
}

export function getCatalogProductById(id: string): Product | undefined {
  return getCatalog().find((p) => p.id === id);
}

export function getCatalogProductsByCategory(slug: string): Product[] {
  return getCatalog().filter((p) => p.categorySlug === slug);
}

export function getCatalogFeatured(): Product[] {
  return getCatalog().filter((p) => p.featured);
}

export function getCatalogNew(): Product[] {
  return getCatalog().filter((p) => p.isNew);
}

export function getCatalogRelated(product: Product, limit = 4): Product[] {
  return getCatalog()
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, limit);
}

export function getCatalogBrands(): string[] {
  return Array.from(new Set(getCatalog().map((p) => p.brand))).sort();
}

export function searchCatalog(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getCatalog().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
  );
}
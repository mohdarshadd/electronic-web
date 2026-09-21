import fs from "node:fs";
import path from "node:path";
import type { Product, Spec } from "./types";
import { categories, products } from "./products";

export interface CustomProductInput {
  name: string;
  slug?: string;
  sku: string;
  brand: string;
  categorySlug: string;
  price: number;
  mrp: number;
  stock: number;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  isNew?: boolean;
  webOnly?: boolean;
  onlineOnly?: boolean;
  description: string;
  highlights: string[];
  specs: Spec[];
  tags: string[];
  imageHue: string;
  emoji: string;
  image?: "jpg";
}

function filePath(): string {
  return `${process.cwd()}/.data/products.json`;
}

export function loadCustomProducts(): Product[] {
  try {
    if (fs.existsSync(filePath())) {
      const parsed = JSON.parse(fs.readFileSync(filePath(), "utf-8"));
      if (Array.isArray(parsed)) return parsed as Product[];
      if (parsed && typeof parsed === "object") {
        const wrapped = (parsed as { products?: unknown }).products;
        if (Array.isArray(wrapped)) return wrapped as Product[];
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function saveCustomProducts(list: Product[]): void {
  try {
    fs.mkdirSync(path.dirname(filePath()), { recursive: true });
    fs.writeFileSync(filePath(), JSON.stringify({ products: list }, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

// Unique against BOTH catalog slugs (base + custom) since they share /product/[slug].
export function uniqueSlug(base: string): string {
  const taken = new Set([...products.map((p) => p.slug), ...loadCustomProducts().map((p) => p.slug)]);
  const root = slugify(base) || "product";
  let slug = root;
  let i = 2;
  while (taken.has(slug)) {
    slug = `${root}-${i}`;
    i += 1;
  }
  return slug;
}

export function getCustomProduct(slugOrId: string): Product | undefined {
  return loadCustomProducts().find((p) => p.slug === slugOrId || p.id === slugOrId);
}

function requireNonEmpty(value: unknown, message: string): void {
  if (typeof value !== "string" || !value.trim()) throw new Error(message);
}

// Accept numbers or numeric strings (form fields arrive as strings).
function num(value: unknown): number {
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.NaN;
}

function validate(input: CustomProductInput): void {
  requireNonEmpty(input.name, "Product name is required");
  requireNonEmpty(input.sku, "SKU is required");
  requireNonEmpty(input.brand, "Brand is required");
  requireNonEmpty(input.emoji, "Emoji is required");
  requireNonEmpty(input.imageHue, "Image colours are required");
  requireNonEmpty(input.description, "Description is required");
  if (!categories.some((c) => c.slug === input.categorySlug)) {
    throw new Error("Category is required and must be a known category");
  }
  if (!Number.isFinite(num(input.price)) || num(input.price) < 0) {
    throw new Error("Price must be a positive number");
  }
  if (!Number.isFinite(num(input.mrp)) || num(input.mrp) < 0) {
    throw new Error("MRP must be a positive number");
  }
  if (num(input.mrp) < num(input.price)) {
    throw new Error("MRP must be at least the selling price");
  }
  if (!Number.isInteger(num(input.stock)) || num(input.stock) < 0) {
    throw new Error("Stock must be a whole number");
  }
  if (input.rating !== undefined && (!Number.isFinite(num(input.rating)) || num(input.rating) < 0 || num(input.rating) > 5)) {
    throw new Error("Rating must be between 0 and 5");
  }
  if (input.reviewCount !== undefined && (!Number.isInteger(num(input.reviewCount)) || num(input.reviewCount) < 0)) {
    throw new Error("Review count must be a whole number");
  }
}

function toProduct(input: CustomProductInput, id: string, slug: string): Product {
  return {
    id,
    slug,
    name: input.name.trim(),
    sku: input.sku.trim(),
    brand: input.brand.trim(),
    categorySlug: input.categorySlug,
    price: Math.round(num(input.price)),
    mrp: Math.round(num(input.mrp)),
    inStock: num(input.stock) > 0,
    stock: num(input.stock),
    rating: input.rating === undefined || input.rating === null ? 4.5 : num(input.rating),
    reviewCount: input.reviewCount === undefined || input.reviewCount === null ? 0 : num(input.reviewCount),
    featured: Boolean(input.featured),
    isNew: Boolean(input.isNew),
    webOnly: Boolean(input.webOnly),
    onlineOnly: Boolean(input.onlineOnly),
    description: input.description.trim(),
    highlights: input.highlights.map((h) => h.trim()).filter(Boolean),
    specs: input.specs
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label && s.value),
    tags: input.tags.map((t) => t.trim()).filter(Boolean),
    imageHue: input.imageHue,
    emoji: input.emoji,
    image: input.image,
  };
}

export function createCustomProduct(input: CustomProductInput): Product {
  validate(input);
  const list = loadCustomProducts();
  const slug = input.slug && slugify(input.slug) ? uniqueSlug(input.slug) : uniqueSlug(input.name);
  const id = `p-cst-${Date.now().toString(36)}${list.length.toString(36)}`;
  const product = toProduct(input, id, slug);
  saveCustomProducts([...list, product]);
  return product;
}

export type CustomProductPatch = Partial<CustomProductInput>;

export function updateCustomProduct(id: string, patch: CustomProductPatch): Product | undefined {
  const list = loadCustomProducts();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;

  const current = list[idx];
  const merged: Product = {
    ...current,
    ...patch,
    price: patch.price !== undefined ? num(patch.price) : current.price,
    mrp: patch.mrp !== undefined ? num(patch.mrp) : current.mrp,
    stock: patch.stock !== undefined ? num(patch.stock) : current.stock,
    rating: patch.rating !== undefined ? num(patch.rating) : current.rating,
    reviewCount: patch.reviewCount !== undefined ? num(patch.reviewCount) : current.reviewCount,
    image: patch.image !== undefined ? patch.image : current.image,
  } as Product;

  if (patch.name !== undefined) requireNonEmpty(patch.name, "Product name is required");
  if (patch.sku !== undefined) requireNonEmpty(patch.sku, "SKU is required");
  if (patch.brand !== undefined) requireNonEmpty(patch.brand, "Brand is required");
  if (patch.emoji !== undefined) requireNonEmpty(patch.emoji, "Emoji is required");
  if (patch.imageHue !== undefined) requireNonEmpty(patch.imageHue, "Image colours are required");
  if (patch.description !== undefined) requireNonEmpty(patch.description, "Description is required");
  if (patch.categorySlug !== undefined && !categories.some((c) => c.slug === patch.categorySlug)) {
    throw new Error("Category is required and must be a known category");
  }
  if (patch.price !== undefined && (!Number.isFinite(merged.price) || merged.price < 0)) {
    throw new Error("Price must be a positive number");
  }
  if (patch.mrp !== undefined && (!Number.isFinite(merged.mrp) || merged.mrp < 0)) {
    throw new Error("MRP must be a positive number");
  }
  if (merged.mrp < merged.price) {
    throw new Error("MRP must be at least the selling price");
  }
  if (patch.stock !== undefined && (!Number.isInteger(merged.stock) || merged.stock < 0)) {
    throw new Error("Stock must be a whole number");
  }
  if (patch.rating !== undefined && (!Number.isFinite(merged.rating) || merged.rating < 0 || merged.rating > 5)) {
    throw new Error("Rating must be between 0 and 5");
  }

  let slug = merged.slug;
  if (patch.slug !== undefined && slugify(patch.slug) !== slug) {
    const wanted = slugify(patch.slug) || slug;
    const taken = new Set(
      [...products.map((p) => p.slug), ...list.filter((p) => p.id !== id).map((p) => p.slug)]
    );
    slug = wanted;
    let i = 2;
    while (taken.has(slug)) {
      slug = `${wanted}-${i}`;
      i += 1;
    }
  }

  const updated = toProduct(
    {
      name: merged.name,
      slug,
      sku: merged.sku,
      brand: merged.brand,
      categorySlug: merged.categorySlug,
      price: merged.price,
      mrp: merged.mrp,
      stock: merged.stock,
      rating: merged.rating,
      reviewCount: merged.reviewCount,
      featured: merged.featured,
      isNew: merged.isNew,
      webOnly: merged.webOnly,
      onlineOnly: merged.onlineOnly,
      description: merged.description,
      highlights: merged.highlights,
      specs: merged.specs,
      tags: merged.tags,
      imageHue: merged.imageHue,
      emoji: merged.emoji,
      image: merged.image,
    },
    id,
    slug
  );

  const next = [...list];
  next[idx] = updated;
  saveCustomProducts(next);
  return updated;
}

export function deleteCustomProduct(id: string): boolean {
  const list = loadCustomProducts();
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  saveCustomProducts(next);
  return true;
}

// Sets (or clears) the uploaded-JPG marker used by the storefront renderer.
export function setProductImage(id: string, image: "jpg" | undefined): Product | undefined {
  const list = loadCustomProducts();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  const updated: Product = { ...list[idx], ...(image ? { image } : { image: undefined }) };
  list[idx] = updated;
  saveCustomProducts(list);
  return updated;
}
import fs from "node:fs";
import path from "node:path";
import type { Product } from "./types";
import { products } from "./products";

export interface StockOverride {
  price?: number;
  mrp?: number;
  stock?: number;
  inStock?: boolean;
  updatedAt?: string;
}

type OverrideMap = Record<string, StockOverride>;

function filePath(): string {
  return `${process.cwd()}/.data/inventory.json`;
}

export function loadOverrides(): OverrideMap {
  try {
    if (fs.existsSync(filePath())) {
      const parsed = JSON.parse(fs.readFileSync(filePath(), "utf-8"));
      if (parsed && typeof parsed === "object") return parsed as OverrideMap;
    }
  } catch {
    // ignore
  }
  return {};
}

function saveOverrides(map: OverrideMap): void {
  try {
    fs.mkdirSync(path.dirname(filePath()), { recursive: true });
    fs.writeFileSync(filePath(), JSON.stringify(map, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

export function mergeProduct(base: Product, ov: StockOverride | undefined): Product {
  if (!ov) return base;
  return {
    ...base,
    price: ov.price ?? base.price,
    mrp: ov.mrp ?? base.mrp,
    stock: ov.stock ?? base.stock,
    inStock: ov.inStock ?? base.inStock,
  };
}

export function getLiveProduct(id: string): Product | undefined {
  const base = products.find((p) => p.id === id);
  if (!base) return undefined;
  return mergeProduct(base, loadOverrides()[id]);
}

export function getLiveProducts(): Product[] {
  const overrides = loadOverrides();
  return products.map((p) => mergeProduct(p, overrides[p.id]));
}

export function listInventory(overridesOnly = false): Product[] {
  const live = getLiveProducts();
  return overridesOnly ? live.filter((p) => loadOverrides()[p.id]) : live;
}

export function applyOverride(id: string, patch: StockOverride): Product | undefined {
  const base = products.find((p) => p.id === id);
  if (!base) return undefined;

  const clean: StockOverride = {};
  if (patch.price !== undefined) {
    if (!Number.isFinite(patch.price) || patch.price < 0) throw new Error("Price must be a positive number");
    clean.price = Math.round(patch.price);
  }
  if (patch.mrp !== undefined) {
    if (!Number.isFinite(patch.mrp) || patch.mrp < 0) throw new Error("MRP must be a positive number");
    clean.mrp = Math.round(patch.mrp);
  }
  if (patch.stock !== undefined) {
    if (!Number.isInteger(patch.stock) || patch.stock < 0) throw new Error("Stock must be a whole number");
    clean.stock = patch.stock;
    if (patch.stock === 0) clean.inStock = false;
  }
  if (patch.inStock !== undefined) {
    clean.inStock = Boolean(patch.inStock);
  }
  if (Object.keys(clean).length === 0) return mergeProduct(base, undefined);
  clean.updatedAt = new Date().toISOString();

  const map = loadOverrides();
  map[id] = { ...(map[id] ?? {}), ...clean };
  saveOverrides(map);
  return mergeProduct(base, map[id]);
}
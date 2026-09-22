import type { NextRequest } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { categories } from "@/lib/products";

const MAX_PRODUCTS = 6;
const MAX_BRANDS = 3;
const MAX_CATEGORIES = 2;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q) {
    return Response.json({ query: "", products: [], categories: [], brands: [] });
  }

  const catalog = getCatalog();

  const products = catalog
    .filter((p) => {
      const text = `${p.name} ${p.brand} ${p.sku} ${p.tags.join(" ")}`.toLowerCase();
      return text.includes(q);
    })
    .sort((a, b) => {
      const score = (p: (typeof catalog)[number]) => {
        const name = p.name.toLowerCase();
        const brand = p.brand.toLowerCase();
        if (name === q) return 0;
        if (name.startsWith(q)) return 1;
        if (brand.startsWith(q) || brand === q) return 2;
        if (name.includes(q)) return 3;
        if (brand.includes(q)) return 4;
        return 5;
      };
      return score(a) - score(b);
    })
    .slice(0, MAX_PRODUCTS)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      price: p.price,
      inStock: p.inStock,
      emoji: p.emoji,
      imageHue: p.imageHue,
      image: p.image ?? null,
      categorySlug: p.categorySlug,
    }));

  const brands = Array.from(new Set(catalog.map((p) => p.brand)))
    .filter((b) => b.toLowerCase().includes(q))
    .slice(0, MAX_BRANDS);

  const cats = categories
    .filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q))
    .slice(0, MAX_CATEGORIES)
    .map((c) => ({ slug: c.slug, name: c.name, emoji: c.emoji }));

  return Response.json({ query: q, products, categories: cats, brands });
}
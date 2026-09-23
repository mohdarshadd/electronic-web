import Link from "next/link";
import type { ReactNode } from "react";
import { categories } from "@/lib/products";
import { getCatalog, getCatalogBrands, getCatalogProductsByCategory } from "@/lib/catalog";
import type { Category } from "@/lib/types";
import ProductCard from "./ProductCard";
import ProductGridSkeleton from "./ProductGridSkeleton";

export type ShopParams = {
  category?: string;
  brand?: string;
  sort?: string;
  min?: string;
  max?: string;
  instock?: string;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function normalize(raw: RawSearchParams): ShopParams {
  const pick = (k: string): string | undefined => (typeof raw[k] === "string" ? (raw[k] as string) : undefined);
  return {
    category: pick("category"),
    brand: pick("brand"),
    sort: pick("sort"),
    min: pick("min"),
    max: pick("max"),
    instock: pick("instock"),
  };
}

export function filterProducts(params: ShopParams) {
  let list = Array.from(new Map(getCatalog().map((p) => [p.id, p] as const)).values());
  if (params.category) list = list.filter((p) => p.categorySlug === params.category);
  if (params.brand) list = list.filter((p) => p.brand === params.brand);
  const min = Number(params.min) || 0;
  const max = Number(params.max) || Number.MAX_SAFE_INTEGER;
  list = list.filter((p) => p.price >= min * 100 && p.price <= max * 100);
  if (params.instock === "1") list = list.filter((p) => p.inStock);

  switch (params.sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      list.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
      break;
    case "popular":
    default:
      list.sort((a, b) => b.reviewCount - a.reviewCount);
  }
  return list;
}

export const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Highest rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
];

export function buildQuery(params: ShopParams): string {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.brand) sp.set("brand", params.brand);
  if (params.sort) sp.set("sort", params.sort);
  if (params.min) sp.set("min", params.min);
  if (params.max) sp.set("max", params.max);
  if (params.instock) sp.set("instock", params.instock);
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:text-indigo-700"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function ShopContent({
  title,
  subtitle,
  params,
  category,
}: {
  title: string;
  subtitle?: string;
  params: Promise<RawSearchParams>;
  category?: Category;
}) {
  const sp = normalize(await params);
  const activeCat = sp.category;
  const result = filterProducts(sp);
  const sorted = (sp.sort as string) || "popular";
  const brands = getCatalogBrands();

  function withParam(key: string, value: string | undefined) {
    const next = { ...sp, [key]: value !== undefined ? value : undefined };
    return buildQuery(next);
  }

  return (
    <>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-indigo-600">Home</Link>
            <span>/</span>
            <span className="text-gray-600">{title}</span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            {category?.emoji ? `${category.emoji} ` : ""}{title}
          </h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-gray-500">{subtitle}</p>}

          {/* Sort + count */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">{result.length}</span> product{result.length === 1 ? "" : "s"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Sort by</span>
              {SORT_OPTIONS.map((o) => (
                <Chip key={o.value} href={buildQuery({ ...sp, sort: o.value })} active={sorted === o.value}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Category</h3>
              <div className="mt-3 space-y-1">
                {categories.map((c) => {
                  const count = category ? getCatalogProductsByCategory(c.slug).length : filterProducts({ category: c.slug }).length;
                  const active = activeCat === c.slug;
                  return (
                    <Link
                      key={c.slug}
                      href={withParam("category", active ? undefined : c.slug)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                        active ? "bg-indigo-50 font-semibold text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-gray-400">{count}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">Brand</h3>
              <div className="mt-3 space-y-1">
                {brands.map((b) => {
                  const active = sp.brand === b;
                  return (
                    <label key={b} className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-gray-600 transition hover:text-gray-900">
                      <input
                        type="checkbox"
                        checked={active}
                        readOnly
                        className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
                      />
                      <a href={buildQuery({ ...sp, brand: active ? undefined : b })} className="flex-1">{b}</a>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">Price range</h3>
              <form action={buildQuery({ ...sp, min: undefined, max: undefined })} className="mt-3 flex items-center gap-2">
                <input name="min" type="number" placeholder="Min ₹" defaultValue={sp.min || ""} className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-400" />
                <span className="text-gray-400">–</span>
                <input name="max" type="number" placeholder="Max ₹" defaultValue={sp.max || ""} className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-400" />
                <button type="submit" className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700">Go</button>
              </form>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={sp.instock === "1"}
                readOnly
                className="h-4 w-4 rounded border-gray-300 accent-emerald-600"
              />
              <a href={buildQuery({ ...sp, instock: sp.instock === "1" ? undefined : "1" })}>In stock only</a>
            </label>
          </aside>

          {/* Products */}
          <div>
            {result.length === 0 ? (
              <div className="grid place-items-center rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
                <span className="text-5xl">🔍</span>
                <p className="mt-4 text-lg font-bold text-gray-900">No products match those filters</p>
                <p className="mt-1 text-sm text-gray-500">Try removing a filter or two.</p>
                <Link href="/shop" className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {result.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function ShopSuspense() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductGridSkeleton />
    </div>
  );
}
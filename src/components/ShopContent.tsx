import Link from "next/link";
import type { ReactNode } from "react";
import { categories } from "@/lib/products";
import { getCatalog, getCatalogBrands } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { buildCategoryHref, normalizeShopParams, shopHref, withoutCategory, type RawSearchParams, type ShopParams } from "@/lib/shop-query";
import type { Category } from "@/lib/types";
import { categoryIcon } from "@/lib/icons";
import { Icon } from "./Icon";
import ProductCard from "./ProductCard";
import ProductGridSkeleton from "./ProductGridSkeleton";
import { FilterCheck } from "./FilterCheck";
import { ShopLink } from "./ShopLink";
import { ShopPriceFilter } from "./ShopPriceFilter";

export type { RawSearchParams, ShopParams };

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
    <ShopLink
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-navy-900 bg-navy-900 text-cream-100 shadow-sm shadow-navy-900/25"
          : "border-navy-200 bg-white text-navy-600 hover:border-navy-300 hover:text-navy-900"
      }`}
    >
      {children}
    </ShopLink>
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
  const sp = normalizeShopParams(await params);
  const activeCat = category?.slug ?? sp.category;
  const basePath = category ? `/category/${category.slug}` : "/shop";
  const queryParams = category ? withoutCategory(sp) : sp;
  const result = filterProducts({ ...sp, category: activeCat });
  const sorted = (sp.sort as string) || "popular";
  const brands = getCatalogBrands();

  function hrefFor(next: ShopParams) {
    return shopHref(basePath, category ? withoutCategory(next) : next);
  }

  function categoryLink(slug: string) {
    if (activeCat === slug) return shopHref("/shop", withoutCategory(sp));
    return buildCategoryHref(slug, sp);
  }

  const activeFilters: { key: string; label: string; href: string }[] = [];
  if (activeCat) {
    const name = categories.find((c) => c.slug === activeCat)?.name ?? activeCat;
    activeFilters.push({ key: "category", label: name, href: shopHref("/shop", withoutCategory(sp)) });
  }
  if (sp.brand) {
    activeFilters.push({ key: "brand", label: sp.brand, href: hrefFor({ ...sp, brand: undefined }) });
  }
  if (sp.min || sp.max) {
    const low = Number(sp.min) || 0;
    const high = Number(sp.max) || 0;
    const label = low && high
      ? `${formatINR(low * 100)} – ${formatINR(high * 100)}`
      : low
        ? `From ${formatINR(low * 100)}`
        : `Under ${formatINR(high * 100)}`;
    activeFilters.push({ key: "price", label, href: hrefFor({ ...sp, min: undefined, max: undefined }) });
  }
  if (sp.instock === "1") {
    activeFilters.push({ key: "instock", label: "In stock", href: hrefFor({ ...sp, instock: undefined }) });
  }
  const clearAllHref = shopHref("/shop", { sort: sp.sort });

  return (
    <>
      {/* Header */}
      <div className="border-b border-navy-900/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-navy-400">
            <Link href="/" className="hover:text-coral-700">Home</Link>
            <span>/</span>
            <span className="text-navy-600">{title}</span>
          </div>
          <p className="eyebrow mt-4">{category ? "Category" : "Catalog"}</p>
          <h1 className="mt-2 flex items-center gap-3 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
            {category && (
              <span className="text-coral-600" aria-hidden>
                <Icon name={categoryIcon(category.slug)} size={30} strokeWidth={1.7} />
              </span>
            )}
            {title}
          </h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-navy-500">{subtitle}</p>}

          {/* Sort + count */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-navy-600">
              <span className="font-bold text-navy-900">{result.length}</span> product{result.length === 1 ? "" : "s"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-400">Sort by</span>
              {SORT_OPTIONS.map((o) => (
                <Chip key={o.value} href={hrefFor({ ...sp, sort: o.value })} active={sorted === o.value}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="border-b border-navy-900/10 bg-cream-50">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-400">Active filters</span>
            {activeFilters.map((filter) => (
              <ShopLink
                key={filter.key}
                href={filter.href}
                aria-label={`Remove ${filter.label} filter`}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:border-navy-300 hover:text-navy-900"
              >
                {filter.label}
                <span aria-hidden className="text-navy-400">×</span>
              </ShopLink>
            ))}
            <ShopLink
              href={clearAllHref}
              className="ml-1 rounded-full px-2 py-1.5 text-xs font-semibold text-coral-700 underline-offset-4 transition hover:underline"
            >
              Clear all
            </ShopLink>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-8">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-400">Category</h3>
              <div className="mt-3 space-y-1">
                {categories.map((c) => {
                  const count = filterProducts({ ...sp, category: c.slug }).length;
                  const active = activeCat === c.slug;
                  return (
                    <Link
                      key={c.slug}
                      href={categoryLink(c.slug)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                        active ? "bg-coral-50 font-semibold text-coral-700" : "text-navy-600 hover:bg-cream-100"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-navy-400">{count}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-400">Brand</h3>
              <div className="mt-3 space-y-1">
                {brands.map((b) => {
                  const active = sp.brand === b;
                  return (
                    <FilterCheck
                      key={b}
                      href={hrefFor({ ...sp, brand: active ? undefined : b })}
                      checked={active}
                    >
                      {b}
                    </FilterCheck>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-400">Price range</h3>
              <ShopPriceFilter basePath={basePath} params={queryParams} />
            </div>

            <FilterCheck
              href={hrefFor({ ...sp, instock: sp.instock === "1" ? undefined : "1" })}
              checked={sp.instock === "1"}
            >
              In stock only
            </FilterCheck>
          </aside>

          {/* Products */}
          <div>
            {result.length === 0 ? (
              <div className="grid place-items-center rounded-3xl border border-dashed border-navy-200 bg-white px-6 py-20 text-center shadow-soft">
                <span className="inline-flex text-navy-300">
                  <Icon name="search" size={48} strokeWidth={1.4} />
                </span>
                <p className="mt-4 text-lg font-bold text-navy-900">No products match those filters</p>
                <p className="mt-1 text-sm text-navy-500">Try removing a filter or two.</p>
                <Link href="/shop" className="mt-6 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-cream-100 hover:bg-navy-800">
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
    <>
      <div className="border-b border-navy-900/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-3 w-28 animate-pulse rounded bg-cream-200" />
          <div className="mt-4 h-3 w-20 animate-pulse rounded bg-cream-200" />
          <div className="mt-3 h-7 w-56 animate-pulse rounded bg-cream-200" />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="h-4 w-24 animate-pulse rounded bg-cream-200" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-7 w-24 animate-pulse rounded-full bg-cream-200" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-cream-200" />
                {Array.from({ length: 4 }).map((__, j) => (
                  <div key={j} className="h-7 w-full animate-pulse rounded-lg bg-cream-200" />
                ))}
              </div>
            ))}
          </div>
          <div>
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    </>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products, getRelatedProducts } from "@/lib/products";
import { formatINR, calcDiscount } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { StarRating } from "@/components/StarRating";
import BuyBox from "@/components/BuyBox";
import ProductCard from "@/components/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} – ₹${(product.price / 100).toLocaleString("en-IN")} | VoltCart`,
    description: product.description,
    keywords: product.tags,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 4);
  const discount = calcDiscount(product.price, product.mrp);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-indigo-600">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-indigo-600">All Products</Link>
            <span>/</span>
            <span className="font-medium text-gray-700">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-4">
            <ProductImage product={product} className="aspect-square w-full rounded-3xl shadow-lg" />
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
                In Stock
              </span>
              <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-medium">SKU: {product.sku}</span>
              <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-medium">Brand: {product.brand}</span>
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">{product.brand}</p>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900">{formatINR(product.price)}</span>
                <span className="text-base text-gray-400 line-through">{formatINR(product.mrp)}</span>
                {discount > 0 && (
                  <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-sm font-bold text-emerald-700">
                    {discount}% off
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-600">
                <span className="font-bold">MRP includes GST</span> · Try code <code className="rounded bg-emerald-50 px-1 font-mono">STUDENT10</code> for 10% off
              </p>

              <div className="mt-6">
                <BuyBox product={product} />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {[
                { icon: "🚚", text: "Dispatched from Mumbai — 1–3 day delivery across India" },
                { icon: "💳", text: "Pay via UPI, Cards, NetBanking or Cash on Delivery" },
                { icon: "↩️", text: "7-day no-questions returns & warranty support" },
                { icon: "🎓", text: "Students save 10% — verify ID at checkout" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description + Highlights */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900">Description</h2>
            <p className="mt-3 leading-7 text-gray-600">{product.description}</p>
            <h3 className="mt-6 text-base font-bold text-gray-900">Highlights</h3>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900">Specifications</h2>
            <dl className="mt-4 divide-y divide-gray-100">
              {product.specs.map((s) => (
                <div key={s.label} className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
                  <dt className="font-medium text-gray-400">{s.label}</dt>
                  <dd className="font-semibold text-gray-800">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">You may also need</h2>
              <Link href={`/category/${product.categorySlug}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                View category →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
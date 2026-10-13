import type { Product } from "@/lib/types";

const IMAGE_DIR = "/products";

export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  const src =
    product.image === "jpg"
      ? `/api/product-images/${product.slug}`
      : `${IMAGE_DIR}/${product.slug}.svg`;
  return (
    <div className={`relative overflow-hidden bg-cream-100 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- local SVGs + streamed uploads; the optimizer refuses SVGs without dangerouslyAllowSVG. Swap for <Image> when real photos land. */}
      <img
        src={src}
        alt={product.name}
        className="h-full w-full select-none object-cover"
        loading="lazy"
        draggable={false}
      />
      {product.isNew && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-coral-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-coral-700 shadow-sm ring-1 ring-coral-500/25 backdrop-blur">
          New
        </span>
      )}
      {!product.inStock && (
        <span className="absolute inset-0 z-10 grid place-items-center bg-cream-100/60 backdrop-blur-[1px]">
          <span className="rounded-full bg-navy-950/80 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-cream-100 backdrop-blur">
            Out of stock
          </span>
        </span>
      )}
    </div>
  );
}
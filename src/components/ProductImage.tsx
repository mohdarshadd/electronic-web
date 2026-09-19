import type { Product } from "@/lib/types";

const IMAGE_DIR = "/products";

export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  const src = `${IMAGE_DIR}/${product.slug}.svg`;
  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- dummy local SVGs; the Next Image optimizer refuses SVGs without dangerouslyAllowSVG. Swap for <Image> when real photos land. */}
      <img
        src={src}
        alt={product.name}
        className="h-full w-full object-cover"
        loading="lazy"
        draggable={false}
      />
      {product.isNew && (
        <span className="absolute left-2 top-2 z-10 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          New
        </span>
      )}
      {!product.inStock && (
        <span className="absolute inset-0 z-10 grid place-items-center bg-white/60 backdrop-blur-[1px]">
          <span className="rounded-md bg-gray-900/80 px-2 py-1 text-xs font-semibold text-white">Out of stock</span>
        </span>
      )}
    </div>
  );
}
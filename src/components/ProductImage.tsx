import type { Product } from "@/lib/types";

export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-br ${product.imageHue} ${className}`}
      role="img"
      aria-label={product.name}
    >
      <span className="text-[38px] drop-shadow-sm" aria-hidden>
        {product.emoji}
      </span>
      <span
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9) 0, transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.6) 0, transparent 40%)",
        }}
      />
      {product.isNew && (
        <span className="absolute left-2 top-2 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          New
        </span>
      )}
      {!product.inStock && (
        <span className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-[1px]">
          <span className="rounded-md bg-gray-900/80 px-2 py-1 text-xs font-semibold text-white">Out of stock</span>
        </span>
      )}
    </div>
  );
}
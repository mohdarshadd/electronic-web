import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";
import { Price } from "./Price";
import { StarRating } from "./StarRating";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="block">
        <ProductImage product={product} className="aspect-square w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{product.brand}</span>
          <StarRating rating={product.rating} />
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition hover:text-indigo-600"
        >
          {product.name}
        </Link>
        <div className="mt-1">
          <Price price={product.price} mrp={product.mrp} />
        </div>
        <div className="mt-auto pt-2">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
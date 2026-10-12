import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";
import { Price } from "./Price";
import { StarRating } from "./StarRating";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-gray-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden">
        <ProductImage
          product={product}
          className="aspect-square w-full [&_img]:transition [&_img]:duration-500 [&_img]:ease-out group-hover:[&_img]:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{product.brand}</span>
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
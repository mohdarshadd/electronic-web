"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product, qty = 1 }: { product: Product; qty?: number }) {
  const { add, openCart } = useCart();
  if (!product.inStock) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-xl bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-400"
      >
        Out of stock — notify me
      </button>
    );
  }
  return (
    <button
      onClick={() => {
        add(product.id, qty);
        openCart();
      }}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1.6" />
        <circle cx="19" cy="21" r="1.6" />
        <path d="M2.5 3h2l2.4 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L22 7H6" />
      </svg>
      Add to cart
    </button>
  );
}
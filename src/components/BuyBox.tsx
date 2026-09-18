"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

export default function BuyBox({ product }: { product: Product }) {
  const { add, openCart } = useCart();
  const [qty, setQty] = useState(1);

  if (!product.inStock) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Currently out of stock — back in 1–2 weeks.
        </div>
        <button className="w-full rounded-xl border-2 border-indigo-600 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">
          Email me when available
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-gray-300 px-2 py-1.5">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-8 w-8 place-items-center rounded-lg text-gray-600 transition hover:bg-gray-100"
            aria-label="Decrease quantity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /></svg>
          </button>
          <span className="w-10 text-center text-base font-bold text-gray-900">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="grid h-8 w-8 place-items-center rounded-lg text-gray-600 transition hover:bg-gray-100"
            aria-label="Increase quantity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-emerald-600">{product.stock}+ in stock</span>
          <br />Ships in 24 hours
        </div>
      </div>

      <button
        onClick={() => {
          add(product.id, qty);
          openCart();
        }}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99]"
      >
        Add to cart
      </button>
      <button
        onClick={() => {
          add(product.id, qty);
        }}
        className="w-full rounded-xl border-2 border-emerald-600 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
      >
        Buy now
      </button>

      <div className="grid grid-cols-2 gap-3 pt-1 text-center text-xs text-gray-500">
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-2.5">
          <span className="block text-base">🚚</span>Free shipping over ₹499
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-2.5">
          <span className="block text-base">↩️</span>7-day easy returns
        </div>
      </div>
    </div>
  );
}
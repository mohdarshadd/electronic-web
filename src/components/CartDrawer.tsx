"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { ProductImage } from "./ProductImage";

function QtyButton({ on, disabled, label, children }: { on: () => void; disabled?: boolean; label: string; children: ReactNode }) {
  return (
    <button
      onClick={on}
      disabled={disabled}
      aria-label={label}
      className="grid h-6 w-6 place-items-center rounded-md border border-gray-200 text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export default function CartDrawer() {
  const { isOpen, closeCart, lines, setQty, remove, subtotal, shipping, total, count, clear, catalog } = useCart();

  if (!isOpen) return null;

  function checkoutUrl() {
    const p = new URLSearchParams();
    return `/checkout${p.size ? `?${p.toString()}` : ""}`;
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeCart} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            Your Cart{" "}
            <span className="ml-1 text-sm font-medium text-gray-400">
              {count > 0 ? `(${count} item${count > 1 ? "s" : ""})` : ""}
            </span>
          </h2>
          <button onClick={closeCart} aria-label="Close cart" className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-5xl">🛒</span>
            <p className="text-lg font-semibold text-gray-900">Your cart is empty</p>
            <p className="text-sm text-gray-500">Add some sensors, boards or kits to get started.</p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {lines.map((line) => {
                const p = catalog.find((x) => x.id === line.productId);
                if (!p) return null;
                return (
                  <div key={line.productId} className="flex gap-3">
                    <Link href={`/product/${p.slug}`} className="shrink-0" onClick={closeCart}>
                      <ProductImage product={p} className="h-20 w-20 rounded-xl" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/product/${p.slug}`} onClick={closeCart} className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-indigo-600">
                          {p.name}
                        </Link>
                        <button onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`} className="p-1 text-gray-300 transition hover:text-red-500">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 9 13H8L7 7" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <QtyButton on={() => setQty(p.id, line.qty - 1)} label="Decrease quantity">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /></svg>
                          </QtyButton>
                          <span className="w-7 text-center text-sm font-semibold text-gray-900">{line.qty}</span>
                          <QtyButton on={() => setQty(p.id, line.qty + 1)} disabled={line.qty >= p.stock} label="Increase quantity">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                          </QtyButton>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{formatINR(p.price * line.qty)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button onClick={clear} className="text-xs font-medium text-gray-400 transition hover:text-red-500">
                Clear cart
              </button>
            </div>

            <div className="border-t border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatINR(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? "font-semibold text-emerald-600" : "font-semibold text-gray-900"}>
                  {shipping === 0 ? "Free" : formatINR(shipping)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-200 pt-3 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
              <Link
                href={checkoutUrl()}
                onClick={closeCart}
                className="mt-4 block w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Proceed to checkout
              </Link>
              <p className="mt-3 text-center text-xs text-gray-400">
                UPI · Cards · NetBanking · COD available
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
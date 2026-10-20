"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { ProductImage } from "./ProductImage";
import { Icon } from "./Icon";

function QtyButton({ on, disabled, label, children }: { on: () => void; disabled?: boolean; label: string; children: ReactNode }) {
  return (
    <button
      onClick={on}
      disabled={disabled}
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-full border border-navy-200 bg-white text-navy-500 transition hover:border-coral-300 hover:text-coral-600 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export default function CartDrawer() {
  const { isOpen, closeCart, lines, setQty, remove, subtotal, shipping, total, count, clear, catalog } = useCart();

  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Deferred a frame so the close transition visually plays before the drawer unmounts.
      const raf = requestAnimationFrame(() => setVisible(false));
      const t = setTimeout(() => setRendered(false), 300);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(t);
      };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- drawer mount is animation state (same approved pattern as CartContext)
    setRendered(true);
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    return () => cancelAnimationFrame(raf2);
  }, [isOpen]);

  useEffect(() => {
    if (!rendered) return;
    const release = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      release();
      window.removeEventListener("keydown", onKey);
    };
  }, [rendered, closeCart]);

  if (!rendered) return null;

  function checkoutUrl() {
    const p = new URLSearchParams();
    return `/checkout${p.size ? `?${p.toString()}` : ""}`;
  }

  return (
    <div className={`fixed inset-0 z-50 ${visible ? "" : "pointer-events-none"}`} role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div
        className={`absolute inset-0 bg-navy-950/45 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={closeCart}
        aria-hidden
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white shadow-2xl transition-transform duration-300 ease-out will-change-transform sm:rounded-l-3xl ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-navy-900/10 px-5 py-4">
          <h2 className="text-lg font-extrabold tracking-tight text-navy-900">
            Your Cart{" "}
            <span className="ml-1 text-sm font-medium text-navy-400">
              {count > 0 ? `(${count} item${count > 1 ? "s" : ""})` : ""}
            </span>
          </h2>
          <button onClick={closeCart} aria-label="Close cart" className="rounded-full p-2 text-navy-500 transition hover:bg-cream-100 hover:text-navy-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-cream-100 text-navy-300 ring-1 ring-navy-900/5">
              <Icon name="cart" size={30} strokeWidth={1.5} />
            </span>
            <p className="text-lg font-bold text-navy-900">Your cart is empty</p>
            <p className="max-w-[16rem] text-sm text-navy-500">Add some sensors, boards or kits to get started.</p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-cream-100 shadow-glow transition hover:bg-navy-800"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-4">
              {lines.map((line) => {
                const p = catalog.find((x) => x.id === line.productId);
                if (!p) return null;
                return (
                  <div key={line.productId} className="flex gap-3 rounded-2xl bg-cream-100/70 p-2.5 ring-1 ring-navy-900/5">
                    <Link href={`/product/${p.slug}`} className="shrink-0" onClick={closeCart}>
                      <ProductImage product={p} className="h-20 w-20 rounded-xl" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/product/${p.slug}`} onClick={closeCart} className="line-clamp-2 text-sm font-semibold text-navy-900 transition hover:text-coral-700">
                          {p.name}
                        </Link>
                        <button onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`} className="-mr-1 -mt-1 rounded-full p-1.5 text-navy-300 transition hover:bg-red-50 hover:text-red-500">
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
                          <span className="w-7 text-center text-sm font-semibold text-navy-900">{line.qty}</span>
                          <QtyButton on={() => setQty(p.id, line.qty + 1)} disabled={line.qty >= p.stock} label="Increase quantity">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                          </QtyButton>
                        </div>
                        <span className="text-sm font-bold text-navy-900">{formatINR(p.price * line.qty)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button onClick={clear} className="text-xs font-medium text-navy-400 transition hover:text-red-500">
                Clear cart
              </button>
            </div>

            <div className="border-t border-navy-900/10 px-5 py-4">
              <div className="rounded-2xl bg-cream-100/80 p-4 ring-1 ring-navy-900/5">
                <div className="flex items-center justify-between text-sm text-navy-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-navy-900">{formatINR(subtotal)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-navy-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "font-semibold text-emerald-600" : "font-semibold text-navy-900"}>
                    {shipping === 0 ? "Free" : formatINR(shipping)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-dashed border-navy-200 pt-3 text-base font-bold text-navy-900">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>
              <Link
                href={checkoutUrl()}
                onClick={closeCart}
                className="mt-4 block w-full rounded-xl bg-navy-900 px-4 py-3.5 text-center text-sm font-bold text-cream-100 shadow-glow transition hover:bg-navy-800"
              >
                Proceed to checkout
              </Link>
              <p className="mt-3 text-center text-xs text-navy-400">
                UPI · Cards · NetBanking · COD available
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
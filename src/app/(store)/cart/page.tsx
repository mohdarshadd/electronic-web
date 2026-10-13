"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { FREE_SHIPPING_THRESHOLD, STUDENT_DISCOUNT_CODE } from "@/lib/products";

export default function CartPage() {
  const {
    lines,
    coupon,
    applyCoupon,
    removeCoupon,
    setQty,
    remove,
    subtotal,
    discount,
    shipping,
    total,
    clear,
    catalog,
  } = useCart();
  const [codeInput, setCodeInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const detailed = useMemo(
    () =>
      lines
        .map((l) => ({ line: l, product: catalog.find((p) => p.id === l.productId) }))
        .filter((x): x is { line: { productId: string; qty: number }; product: (typeof catalog)[number] } => Boolean(x.product)),
    [lines, catalog]
  );

  const remainingForFree = FREE_SHIPPING_THRESHOLD - subtotal;

  function submitCoupon() {
    const ok = applyCoupon(codeInput);
    setCouponMsg(
      ok
        ? { ok: true, text: "Coupon applied — enjoy the savings! 🎉" }
        : { ok: false, text: `That code isn't valid. Try ${STUDENT_DISCOUNT_CODE}.` }
    );
    if (ok) setCodeInput("");
  }

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="text-6xl">🛒</span>
        <h1 className="mt-6 text-2xl font-extrabold text-navy-900">Your cart is empty</h1>
        <p className="mt-2 text-navy-500">Let&apos;s fix that — the perfect sensor for your next build is waiting.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-cream-100 shadow-glow hover:bg-navy-800">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-navy-400">
        <Link href="/" className="hover:text-coral-700">Home</Link>
        <span>/</span>
        <span className="text-navy-600">Cart</span>
      </nav>
      <div className="mt-3 flex items-end justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">Shopping cart</h1>
        <button onClick={clear} className="text-sm font-medium text-navy-400 transition hover:text-red-500">Clear all</button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          {detailed.map(({ line, product }) => (
            <div key={line.productId} className="flex gap-4 rounded-2xl border border-navy-900/10 bg-white p-4 shadow-soft">
              <Link href={`/product/${product.slug}`}>
                <ProductImage product={product} className="h-28 w-28 rounded-xl" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">{product.brand}</p>
                    <Link href={`/product/${product.slug}`} className="mt-0.5 line-clamp-2 text-sm font-bold text-navy-900 hover:text-coral-700">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-navy-400">SKU · {product.sku}</p>
                  </div>
                  <button onClick={() => remove(product.id)} aria-label={`Remove ${product.name}`} className="rounded-lg p-2 text-navy-300 transition hover:bg-red-50 hover:text-red-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 9 13H8L7 7" /></svg>
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(product.id, line.qty - 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-navy-200 text-navy-600 transition hover:border-coral-300 hover:text-coral-600" aria-label="Decrease">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /></svg>
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-navy-900">{line.qty}</span>
                    <button onClick={() => setQty(product.id, line.qty + 1)} disabled={line.qty >= product.stock} className="grid h-8 w-8 place-items-center rounded-lg border border-navy-200 text-navy-600 transition hover:border-coral-300 hover:text-coral-600 disabled:opacity-50" aria-label="Increase">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-navy-900">{formatINR(product.price * line.qty)}</p>
                    <p className="text-xs text-navy-400 line-through">{formatINR(product.mrp * line.qty)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {remainingForFree > 0 && (
            <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              🚚 You&apos;re {formatINR(remainingForFree)} away from free shipping!
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-4 rounded-2xl border border-navy-900/10 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-bold text-navy-900">Order summary</h2>

          <div>
            <label className="text-sm font-semibold text-navy-700">Have a coupon?</label>
            <div className="mt-2 flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. STUDENT10"
                className="w-full rounded-xl border border-navy-200 px-3 py-2 text-sm font-bold uppercase tracking-wide outline-none transition focus:border-coral-400 focus:ring-4 focus:ring-coral-500/10"
              />
              <button onClick={submitCoupon} className="shrink-0 rounded-xl bg-navy-900 px-4 py-2 text-sm font-bold text-cream-100 transition hover:bg-navy-800">
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className={`mt-1.5 text-xs font-medium ${couponMsg.ok ? "text-emerald-600" : "text-red-500"}`}>{couponMsg.text}</p>
            )}
            {coupon && (
              <button onClick={removeCoupon} className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                {coupon} ✓ <span aria-hidden>×</span>
              </button>
            )}
          </div>

          <div className="space-y-2 border-t border-dashed border-navy-200 pt-4 text-sm">
            <div className="flex justify-between text-navy-600">
              <span>Subtotal</span>
              <span className="font-semibold text-navy-900">{formatINR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-semibold">− {formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-navy-600">
              <span>Shipping</span>
              <span className={`font-semibold ${shipping === 0 ? "text-emerald-600" : "text-navy-900"}`}>
                {shipping === 0 ? "FREE" : formatINR(shipping)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-navy-200 pt-4">
            <span className="text-base font-bold text-navy-900">Total</span>
            <span className="text-2xl font-extrabold text-navy-900">{formatINR(total)}</span>
          </div>
          <p className="text-[11px] text-navy-400">Inclusive of all taxes · Shipping & COD charges may apply</p>

          <Link href="/checkout" className="block w-full rounded-xl bg-navy-900 px-4 py-3.5 text-center text-sm font-bold text-cream-100 shadow-glow transition hover:bg-navy-800">
            Proceed to checkout
          </Link>
          <Link href="/shop" className="block w-full text-center text-sm font-semibold text-coral-700 hover:text-coral-800">
            ← Continue shopping
          </Link>

          <div className="flex flex-wrap items-center gap-2 border-t border-navy-100 pt-4">
            {["UPI", "Cards", "NetBanking", "COD"].map((m) => (
              <span key={m} className="rounded-md border border-navy-200 bg-cream-100 px-2 py-1 text-[11px] font-semibold text-navy-600">{m}</span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
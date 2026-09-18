"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { products } from "@/lib/products";
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
  } = useCart();
  const [codeInput, setCodeInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const detailed = useMemo(
    () =>
      lines
        .map((l) => ({ line: l, product: products.find((p) => p.id === l.productId) }))
        .filter((x): x is { line: { productId: string; qty: number }; product: (typeof products)[number] } => Boolean(x.product)),
    [lines]
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
        <h1 className="mt-6 text-2xl font-extrabold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Let&apos;s fix that — the perfect sensor for your next build is waiting.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Cart</span>
      </nav>
      <div className="mt-3 flex items-end justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Shopping cart</h1>
        <button onClick={clear} className="text-sm font-medium text-gray-400 transition hover:text-red-500">Clear all</button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          {detailed.map(({ line, product }) => (
            <div key={line.productId} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4">
              <Link href={`/product/${product.slug}`}>
                <ProductImage product={product} className="h-28 w-28 rounded-xl" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{product.brand}</p>
                    <Link href={`/product/${product.slug}`} className="mt-0.5 line-clamp-2 text-sm font-bold text-gray-900 hover:text-indigo-600">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-gray-400">SKU · {product.sku}</p>
                  </div>
                  <button onClick={() => remove(product.id)} aria-label={`Remove ${product.name}`} className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 9 13H8L7 7" /></svg>
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(product.id, line.qty - 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600" aria-label="Decrease">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /></svg>
                    </button>
                    <span className="w-10 text-center text-sm font-bold">{line.qty}</span>
                    <button onClick={() => setQty(product.id, line.qty + 1)} disabled={line.qty >= product.stock} className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50" aria-label="Increase">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-gray-900">{formatINR(product.price * line.qty)}</p>
                    <p className="text-xs text-gray-400 line-through">{formatINR(product.mrp * line.qty)}</p>
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
        <aside className="h-fit space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Order summary</h2>

          <div>
            <label className="text-sm font-semibold text-gray-700">Have a coupon?</label>
            <div className="mt-2 flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. STUDENT10"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold uppercase tracking-wide outline-none focus:border-indigo-400"
              />
              <button onClick={submitCoupon} className="shrink-0 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-700">
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

          <div className="space-y-2 border-t border-dashed border-gray-200 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatINR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-semibold">− {formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className={`font-semibold ${shipping === 0 ? "text-emerald-600" : "text-gray-900"}`}>
                {shipping === 0 ? "FREE" : formatINR(shipping)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-2xl font-extrabold text-gray-900">{formatINR(total)}</span>
          </div>
          <p className="text-[11px] text-gray-400">Inclusive of all taxes · Shipping & COD charges may apply</p>

          <Link href="/checkout" className="block w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">
            Proceed to checkout
          </Link>
          <Link href="/shop" className="block w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            ← Continue shopping
          </Link>

          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
            {["UPI", "Cards", "NetBanking", "COD"].map((m) => (
              <span key={m} className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-600">{m}</span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
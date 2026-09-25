"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

export default function BuyBox({ product }: { product: Product }) {
  const { add, openCart } = useCart();
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function subscribe() {
    setState("saving");
    setMsg(null);
    try {
      const res = await fetch("/api/restock/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), productId: product.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || "Could not save your request");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setMsg("Could not reach the server");
      setState("error");
    }
  }

  if (!product.inStock) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Currently out of stock — expected back in 1–2 weeks.
        </div>
        {state === "done" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            You’re on the list — we’ll email you when it’s back in stock.
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="restock-email" className="block text-xs font-semibold text-gray-600">
              Notify me when it’s back
            </label>
            <div className="flex gap-2">
              <input
                id="restock-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                onClick={subscribe}
                disabled={state === "saving" || !email.trim()}
                className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {state === "saving" ? "Saving…" : "Notify me"}
              </button>
            </div>
            {state === "error" && msg && <p className="text-xs font-medium text-red-600">{msg}</p>}
          </div>
        )}
      </div>
    );
  }

  const lowStock = product.stock > 0 && product.stock <= 10;

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
          <span className={`font-semibold ${lowStock ? "text-amber-600" : "text-emerald-600"}`}>
            {lowStock ? `Only ${product.stock} left` : `${product.stock} in stock`}
          </span>
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
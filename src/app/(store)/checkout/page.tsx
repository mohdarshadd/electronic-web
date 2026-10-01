"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";

type PaymentMethod = "cashfree" | "cod";

const WALLET_KEY = "voltcart.address.v1";

function loadAddress() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WALLET_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, coupon, discount, subtotal, shipping, total, clear, catalog } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("cashfree");
  const [address, setAddress] = useState(() => loadAddress() || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "processing">("idle");
  const [demoMode, setDemoMode] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const detailed = useMemo(
    () =>
      lines
        .map((l) => ({ line: l, product: catalog.find((p) => p.id === l.productId) }))
        .filter((x): x is { line: { productId: string; qty: number }; product: (typeof catalog)[number] } => Boolean(x.product)),
    [lines, catalog]
  );

  function setField(k: string, v: string) {
    const next = { ...address, [k]: v };
    setAddress(next);
    try {
      window.localStorage.setItem(WALLET_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function validate(): boolean {
    const required = ["fullName", "phone", "email", "line1", "city", "state", "pincode"] as const;
    const e: Record<string, string> = {};
    for (const k of required) {
      if (!String(address[k] || "").trim()) e[k] = "Required";
    }
    if (address.phone && !/^[6-9]\d{9}$/.test(String(address.phone).trim())) e.phone = "10-digit mobile number";
    if (address.email && !/^\S+@\S+\.\S+$/.test(String(address.email).trim())) e.email = "Valid email needed";
    if (address.pincode && !/^\d{6}$/.test(String(address.pincode).trim())) e.pincode = "6-digit PIN";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function placeOrder() {
    if (!validate()) {
      setNotice("Please fix the highlighted fields.");
      return;
    }
    setNotice(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          coupon: coupon || undefined,
          paymentMethod: method,
          address,
          returnUrl: `${window.location.origin}/order`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (data.demo) {
        setStatus("processing");
        setDemoMode(true);
        setTimeout(() => {
          clear();
          router.push(data.redirectUrl);
        }, 1500);
        return;
      }

      if (data.mode === "cod") {
        clear();
        router.push(data.redirectUrl);
        return;
      }

      // Cashfree — render hosted checkout
      setStatus("processing");
      const { renderCashfreeCheckout } = await import("@/lib/cashfree-checkout");
      await renderCashfreeCheckout(data.mode === "PROD" ? "production" : "sandbox", {
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Payment could not be started.");
      setStatus("idle");
    }
  }

  const inputCls = (key: string) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-4 ${
      errors[key]
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Checkout</span>
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Checkout</h1>

      {detailed.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <span className="text-5xl">🛒</span>
          <p className="mt-4 text-lg font-bold text-gray-900">Nothing to checkout yet</p>
          <Link href="/shop" className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Address */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
                Delivery address
              </h2>
              <p className="mt-1 text-xs text-gray-400">Share with students — we love college hostels & labs.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Full name</label>
                  <input value={address.fullName || ""} onChange={(e) => setField("fullName", e.target.value)} placeholder="e.g. Aarav Sharma" className={`${inputCls("fullName")} mt-1.5`} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Mobile number</label>
                  <input value={address.phone || ""} onChange={(e) => setField("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))} placeholder="10-digit mobile" className={`${inputCls("phone")} mt-1.5`} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input value={address.email || ""} onChange={(e) => setField("email", e.target.value)} placeholder="you@college.edu.in" className={`${inputCls("email")} mt-1.5`} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Flat, building, street</label>
                  <input value={address.line1 || ""} onChange={(e) => setField("line1", e.target.value)} placeholder="Hostel block, room no, building" className={`${inputCls("line1")} mt-1.5`} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Area / landmark (optional)</label>
                  <input value={address.line2 || ""} onChange={(e) => setField("line2", e.target.value)} className={`${inputCls("line2")} mt-1.5`} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">City</label>
                  <input value={address.city || ""} onChange={(e) => setField("city", e.target.value)} className={`${inputCls("city")} mt-1.5`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">State</label>
                    <input value={address.state || ""} onChange={(e) => setField("state", e.target.value)} className={`${inputCls("state")} mt-1.5`} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">PIN code</label>
                    <input value={address.pincode || ""} onChange={(e) => setField("pincode", e.target.value.replace(/[^\d]/g, "").slice(0, 6))} className={`${inputCls("pincode")} mt-1.5`} />
                  </div>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">2</span>
                Payment method
              </h2>
              <div className="mt-5 grid gap-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                    method === "cashfree" ? "border-indigo-600 bg-indigo-50/50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input type="radio" name="pm" checked={method === "cashfree"} onChange={() => setMethod("cashfree")} className="h-4 w-4 accent-indigo-600" />
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-lg">💳</span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-gray-900">Pay online — UPI, Cards, NetBanking</span>
                    <span className="block text-xs text-gray-500">securely via Cashfree Payments Gateway</span>
                  </span>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">Instant</span>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                    method === "cod" ? "border-indigo-600 bg-indigo-50/50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input type="radio" name="pm" checked={method === "cod"} onChange={() => setMethod("cod")} className="h-4 w-4 accent-indigo-600" />
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-lg">💵</span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-gray-900">Cash on Delivery</span>
                    <span className="block text-xs text-gray-500">Pay in cash when your order arrives</span>
                  </span>
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">COD</span>
                </label>
              </div>

              <div className="mt-5 rounded-xl bg-gray-50 p-4 text-xs leading-6 text-gray-500">
                🎓 <span className="font-semibold text-gray-700">Student discount:</span> you can use code{" "}
                <code className="rounded bg-white px-1 font-mono font-bold">STUDENT10</code> on the cart page (10% off). It shows in your summary.
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="h-fit space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">Order summary</h2>
            <div className="space-y-3 border-b border-dashed border-gray-200 pb-4">
              {detailed.map(({ line, product }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <ProductImage product={product} className="h-14 w-14 rounded-lg" />
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">Qty {line.qty}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatINR(product.price * line.qty)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-semibold">{formatINR(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Coupon {coupon}</span><span className="font-semibold">− {formatINR(discount)}</span></div>
              )}
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={`font-semibold ${shipping === 0 ? "text-emerald-600" : ""}`}>{shipping === 0 ? "FREE" : formatINR(shipping)}</span></div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="font-bold text-gray-900">To pay</span>
              <span className="text-2xl font-extrabold text-gray-900">{formatINR(total)}</span>
            </div>

            {notice && (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{notice}</p>
            )}

            {demoMode ? (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                ⚡ Demo mode — simulating a successful UPI payment…
              </div>
            ) : null}

            <button
              onClick={placeOrder}
              disabled={status !== "idle"}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? "Creating order…" : status === "processing" ? "Redirecting…" : `Place order · ${formatINR(total)}`}
            </button>
            <p className="text-center text-[11px] text-gray-400">By placing an order you agree to our Terms & Privacy Policy.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
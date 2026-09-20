"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_CLASS, PAYMENT_STATUSES, PAYMENT_STATUS_CLASS } from "./status";
import OrderTimeline from "./OrderTimeline";

export default function AdminOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/orders/${orderId}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.refresh();
          return;
        }
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled) setOrder(data.order);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load order");
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  async function update(patch: { orderStatus?: (typeof ORDER_STATUSES)[number]; paymentStatus?: (typeof PAYMENT_STATUSES)[number] }) {
    if (busy || !order) return;
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) throw new Error("update failed");
      const data = await res.json();
      setOrder(data.order);
      const key = Object.keys(patch)[0];
      setNotice(`${key === "orderStatus" ? patch.orderStatus : patch.paymentStatus} updated`);
    } catch {
      setError("Could not update the order");
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <Link href="/admin" className="mt-3 inline-block text-sm font-bold text-indigo-600 hover:text-indigo-700">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!order) {
    return <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-white" />;
  }

  const lineTotal = (price: number, qty: number) => formatINR(price * qty);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/orders" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
          ← Orders
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/orders/${order.orderId}/invoice`}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
          >
            View invoice
          </Link>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ORDER_STATUS_CLASS[order.orderStatus]}`}>
            {order.orderStatus}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${PAYMENT_STATUS_CLASS[order.paymentStatus]}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <OrderTimeline order={order} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="font-mono text-lg font-extrabold text-gray-900">{order.orderId}</p>
        <p className="mt-1 text-sm text-gray-500">
          Placed {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Cashfree)"}
          {order.coupon ? ` · Coupon ${order.coupon}` : ""}
          {order.cashfree?.referenceId ? ` · Ref ${order.cashfree.referenceId}` : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">Customer</h3>
          <p className="mt-2 font-bold text-gray-900">{order.customer.fullName}</p>
          <p className="text-sm text-gray-600">{order.customer.phone}</p>
          <p className="text-sm text-gray-600">{order.customer.email}</p>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {order.customer.line1}
            {order.customer.line2 ? `, ${order.customer.line2}` : ""}
            <br />
            {order.customer.city}, {order.customer.state} {order.customer.pincode}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">Items</h3>
          <ul className="mt-3 divide-y divide-gray-100">
            {order.lines.map((l) => (
              <li key={l.productId} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Link
                    href={`/product/${l.slug}`}
                    className="text-sm font-semibold text-gray-900 hover:text-indigo-600"
                  >
                    {l.name}
                  </Link>
                  <p className="text-xs text-gray-400">{l.productId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{lineTotal(l.price, l.qty)}</p>
                  <p className="text-xs text-gray-400">
                    {l.qty} × {formatINR(l.price)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{order.coupon ? `Coupon ${order.coupon}` : "Discount"}</span>
                <span>− {formatINR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "FREE" : formatINR(order.shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-extrabold text-gray-900">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">Order status</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {ORDER_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => update({ orderStatus: s })}
                disabled={busy || order.orderStatus === s}
                className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition disabled:cursor-not-allowed ${
                  order.orderStatus === s
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">Payment status</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {PAYMENT_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => update({ paymentStatus: s })}
                disabled={busy || order.paymentStatus === s}
                className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition disabled:cursor-not-allowed ${
                  order.paymentStatus === s
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {notice && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</p>
      )}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
    </div>
  );
}
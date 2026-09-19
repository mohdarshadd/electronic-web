"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { ORDER_STATUS_CLASS, PAYMENT_STATUS_CLASS } from "./status";

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/orders")
      .then(async (res) => {
        if (res.status === 401) {
          router.refresh();
          return;
        }
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled) setOrders(data.orders);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load orders");
      });
    return () => {
      cancelled = true;
    };
  }, [router, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  const summary = !orders
    ? null
    : {
        total: orders.length,
        revenue: orders.filter((o) => o.paymentStatus === "PAID").reduce((s, o) => s + o.total, 0),
        pendingPayment: orders.filter((o) => o.paymentStatus === "PENDING").length,
        inTransit: orders.filter((o) => o.orderStatus === "SHIPPED").length,
        delivered: orders.filter((o) => o.orderStatus === "DELIVERED").length,
      };

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button onClick={reload} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">
          {summary?.total} order{summary && summary.total === 1 ? "" : "s"}
        </p>
        <div className="flex gap-2">
          <button
            onClick={reload}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={logout}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Total orders</p>
          <p className="mt-2 text-2xl font-extrabold text-gray-900">{summary?.total ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Revenue (paid)</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">{formatINR(summary?.revenue ?? 0)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Awaiting payment</p>
          <p className="mt-2 text-2xl font-extrabold text-amber-600">{summary?.pendingPayment ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Delivered</p>
          <p className="mt-2 text-2xl font-extrabold text-gray-900">
            {summary?.delivered ?? 0}
            <span className="ml-1 text-sm font-semibold text-gray-400">/ {summary?.inTransit ?? 0} shipped</span>
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3">Order</th>
              <th className="hidden px-4 py-3 sm:table-cell">Customer</th>
              <th className="hidden px-4 py-3 md:table-cell">Placed</th>
              <th className="hidden px-4 py-3 lg:table-cell">Payment</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.orderId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.orderId}`} className="font-bold text-indigo-600 hover:text-indigo-700">
                    {o.orderId}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <p className="font-semibold text-gray-900">{o.customer.fullName}</p>
                  <p className="text-xs text-gray-400">{o.customer.city}</p>
                </td>
                <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
                  {new Date(o.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${PAYMENT_STATUS_CLASS[o.paymentStatus]}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{formatINR(o.total)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${ORDER_STATUS_CLASS[o.orderStatus]}`}>{o.orderStatus}</span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
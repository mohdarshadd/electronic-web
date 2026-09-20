"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { formatINR } from "@/lib/format";
import OrdersTable from "./OrdersTable";

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">At a glance snapshot of store activity.</p>
        </div>
        <button
          onClick={reload}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          Refresh
        </button>
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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Recent orders</h2>
          <span className="text-xs text-gray-500">showing latest 8</span>
        </div>
        <OrdersTable orders={orders} limit={8} />
      </div>
    </div>
  );
}
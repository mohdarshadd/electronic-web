"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Order } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { computeMetrics, countBy, dailyStats, topProducts } from "@/lib/admin-metrics";
import { ORDER_STATUSES, PAYMENT_STATUSES, ORDER_STATUS_CLASS, PAYMENT_STATUS_CLASS } from "./status";

function KpiCard({ label, value, sub, tone = "gray" }: { label: string; value: string; sub?: string; tone?: "gray" | "emerald" | "amber" | "red" | "indigo" }) {
  const tones: Record<string, string> = {
    gray: "text-gray-900",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
    indigo: "text-indigo-600",
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-2 truncate text-xl font-extrabold sm:text-2xl ${tones[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs font-medium text-gray-400">{sub}</p>}
    </div>
  );
}

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

  const reload = useCallback(() => {
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const m = useMemo(() => (orders ? computeMetrics(orders) : null), [orders]);
  const days = useMemo(() => (orders ? dailyStats(orders, 14) : []), [orders]);
  const statusCounts = useMemo(() => (orders ? countBy(orders, (o) => o.orderStatus, ORDER_STATUSES) : []), [orders]);
  const paymentCounts = useMemo(() => (orders ? countBy(orders, (o) => o.paymentStatus, PAYMENT_STATUSES) : []), [orders]);
  const top = useMemo(() => (orders ? topProducts(orders, 5) : []), [orders]);
  const maxDay = days.reduce((max, d) => Math.max(max, d.paid), 0) || 1;

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

  if (!orders || !m) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Sales, fulfilment and stock at a glance.</p>
        </div>
        <button
          onClick={reload}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total orders" value={String(m.totalOrders)} sub={`${m.itemsSold} items sold`} />
        <KpiCard label="Paid revenue" value={formatINR(m.paidRevenue)} tone="emerald" sub="online + demo paid" />
        <KpiCard label="COD expected" value={formatINR(m.codExpected)} tone="amber" sub={formatINR(m.pendingAmount) + " all pending"} />
        <KpiCard label="Average order value" value={formatINR(m.aov)} />
        <KpiCard label="Customers" value={String(m.distinctCustomers)} tone="indigo" />
        <KpiCard label="Cancellation rate" value={`${m.cancellationRate}%`} sub={`${m.cancelledOrders} cancelled`} tone={m.cancellationRate > 10 ? "red" : "gray"} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Revenue — last 14 days</h2>
          <span className="text-xs font-medium text-gray-400">paid orders</span>
        </div>
        {days.every((d) => d.paid === 0) ? (
          <p className="py-8 text-center text-sm text-gray-400">No paid revenue yet in the last 14 days.</p>
        ) : (
          <div className="flex h-40 items-end gap-1.5">
            {days.map((d) => (
              <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.label}: ${formatINR(d.paid)} (${d.orders} orders)`}>
                <span className="mb-1 hidden text-center text-[10px] font-bold text-gray-400 group-hover:block">
                  {d.paid > 0 ? "₹" + Math.round(d.paid / 100) : "—"}
                </span>
                <div
                  style={{ height: `${d.paid > 0 ? Math.max((d.paid / maxDay) * 100, 4) : 2}%` }}
                  className={`w-full rounded-t-md ${d.paid > 0 ? "bg-gradient-to-t from-indigo-600 to-violet-500" : "bg-gray-200"}`}
                />
                <span className="mt-1.5 text-center text-[10px] font-semibold text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Orders by status</h2>
          <ul className="mt-4 space-y-3">
            {statusCounts.map(({ key, count }) => (
              <li key={key}>
                <div className="flex items-center justify-between text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ORDER_STATUS_CLASS[key]}`}>{key}</span>
                  <span className="font-bold text-gray-900">{count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    style={{ width: `${orders.length > 0 ? (count / orders.length) * 100 : 0}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Payments</h2>
          <ul className="mt-4 space-y-3">
            {paymentCounts.map(({ key, count }) => (
              <li key={key}>
                <div className="flex items-center justify-between text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${PAYMENT_STATUS_CLASS[key]}`}>{key}</span>
                  <span className="font-bold text-gray-900">{count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    style={{ width: `${orders.length > 0 ? (count / orders.length) * 100 : 0}%` }}
                    className={`h-full rounded-full ${key === "PAID" ? "bg-emerald-500" : key === "FAILED" ? "bg-red-500" : "bg-amber-400"}`}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
            <span className="text-gray-500">COD orders</span>
            <span className="font-bold text-gray-900">{orders.filter((o) => o.paymentMethod === "cod").length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-500">Online orders</span>
            <span className="font-bold text-gray-900">{orders.filter((o) => o.paymentMethod === "cashfree").length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Top products</h2>
            <Link href="/admin/inventory" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              Inventory →
            </Link>
          </div>
          {top.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Nothing sold yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {top.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3 py-2.5">
                  <span className="w-5 text-center text-sm font-extrabold text-gray-300">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${p.slug}`} className="block truncate text-sm font-semibold text-gray-900 hover:text-indigo-600">
                      {p.name}
                    </Link>
                    <p className="text-xs text-gray-400">{p.qty} sold · {formatINR(p.revenue)}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatINR(p.qty * (p.revenue / Math.max(p.qty, 1)))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              All orders →
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {orders.slice(0, 6).map((o) => (
                <li key={o.orderId} className="flex items-center gap-3 py-2.5">
                  <Link href={`/admin/orders/${o.orderId}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 hover:text-indigo-600">
                      {o.customer.fullName}
                      <span className="ml-2 font-mono text-xs font-bold text-indigo-600">{o.orderId}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </Link>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${ORDER_STATUS_CLASS[o.orderStatus]}`}>{o.orderStatus}</span>
                  <span className="w-20 text-right text-sm font-bold text-gray-900">{formatINR(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
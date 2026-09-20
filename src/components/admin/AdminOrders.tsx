"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Order } from "@/lib/types";
import OrdersTable from "./OrdersTable";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "./status";

type SortKey = "newest" | "oldest" | "amount_desc" | "amount_asc";

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState<string>("ALL");
  const [paymentStatus, setPaymentStatus] = useState<string>("ALL");
  const [paymentMethod, setPaymentMethod] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  const load = useCallback(() => {
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
  }, [router]);

  useEffect(() => load(), [load, reloadKey]);
  const reload = useCallback(() => {
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const q = search.trim().toLowerCase();
    const list = orders.filter((o) => {
      if (orderStatus !== "ALL" && o.orderStatus !== orderStatus) return false;
      if (paymentStatus !== "ALL" && o.paymentStatus !== paymentStatus) return false;
      if (paymentMethod !== "ALL" && o.paymentMethod !== paymentMethod) return false;
      if (!q) return true;
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.city.toLowerCase().includes(q)
      );
    });
    return list.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "amount_desc":
          return b.total - a.total;
        case "amount_asc":
          return a.total - b.total;
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
  }, [orders, search, orderStatus, paymentStatus, paymentMethod, sortBy]);

  const hasFilters = search !== "" || orderStatus !== "ALL" || paymentStatus !== "ALL" || paymentMethod !== "ALL";

  const selectCls =
    "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

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
        <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-12 animate-pulse rounded-2xl border border-gray-200 bg-white" />
        <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Orders</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {filtered.length} of {orders.length} order{orders.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export/orders"
            download
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Export CSV
          </a>
          <button
            onClick={reload}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-2 rounded-2xl border border-gray-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order / customer / phone…"
          className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 sm:col-span-2"
        />
        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className={selectCls}>
          <option value="ALL">Any status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={selectCls}>
          <option value="ALL">Any payment</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={selectCls}>
          <option value="ALL">Any method</option>
          <option value="cashfree">Online</option>
          <option value="cod">COD</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className={selectCls}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="amount_desc">Amount high→low</option>
          <option value="amount_asc">Amount low→high</option>
        </select>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Filtered view.</span>
          <button
            onClick={() => {
              setSearch("");
              setOrderStatus("ALL");
              setPaymentStatus("ALL");
              setPaymentMethod("ALL");
            }}
            className="font-bold text-indigo-600 hover:text-indigo-700"
          >
            Clear filters
          </button>
        </div>
      )}

      <OrdersTable orders={filtered} />
    </div>
  );
}
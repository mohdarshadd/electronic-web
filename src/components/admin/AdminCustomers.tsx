"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Order } from "@/lib/types";
import type { Customer } from "@/lib/admin-metrics";
import { formatINR } from "@/lib/format";
import { ORDER_STATUS_CLASS } from "./status";

export default function AdminCustomers() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/admin/customers").then(async (res) => {
        if (res.status === 401) return null;
        if (!res.ok) throw new Error("customers");
        return res.json();
      }),
      fetch("/api/admin/orders").then(async (res) => {
        if (res.status === 401) return null;
        if (!res.ok) throw new Error("orders");
        return res.json();
      }),
    ])
      .then(([c, o]) => {
        if (!c || !o) {
          router.refresh();
          return;
        }
        if (!cancelled) {
          setCustomers(c.customers);
          setTotalRevenue(c.totalRevenue);
          setOrders(o.orders);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load customers");
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
    if (!customers) return [];
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, search]);

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

  if (!customers || !orders) {
    return <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-white" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Customers</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {customers.length} customer{customers.length === 1 ? "" : "s"} · lifetime value {formatINR(totalRevenue)}
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, email, city…"
          className="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-gray-400">
            {customers.length === 0 ? "No customers yet — they appear after the first order." : "No customers match your search."}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((c) => {
              const isOpen = expanded === c.key;
              const customerOrders = orders
                .filter((o) => `${o.customer.phone.trim()}::${o.customer.email.trim().toLowerCase()}` === c.key)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
              return (
                <li key={c.key}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : c.key)}
                    className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-extrabold text-indigo-600">
                      {c.fullName
                        .split(" ")
                        .map((x) => x[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">{c.fullName}</p>
                      <p className="text-xs text-gray-400">
                        {c.phone} · {c.email}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-bold text-gray-900">{formatINR(c.totalSpent)}</p>
                      <p className="text-xs text-gray-400">
                        {c.ordersCount} order{c.ordersCount === 1 ? "" : "s"} · {c.city}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-400">
                      last {new Date(c.lastOrderAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 text-gray-400 transition ${isOpen ? "rotate-180" : ""}`}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4 sm:px-6">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Orders</p>
                      <ul className="mt-2 divide-y divide-gray-200">
                        {customerOrders.map((o) => (
                          <li key={o.orderId} className="flex flex-wrap items-center gap-3 py-2.5">
                            <Link href={`/admin/orders/${o.orderId}`} className="font-mono text-xs font-bold text-indigo-600 hover:text-indigo-700">
                              {o.orderId}
                            </Link>
                            <span className="text-xs text-gray-400">
                              {new Date(o.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ORDER_STATUS_CLASS[o.orderStatus]}`}>{o.orderStatus}</span>
                            <span className="ml-auto text-sm font-bold text-gray-900">{formatINR(o.total)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
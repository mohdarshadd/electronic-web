"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { RestockRequest } from "@/lib/restock-requests";

type Filter = "pending" | "notified" | "all";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  notified: "bg-emerald-50 text-emerald-700",
};

export default function AdminRestockRequests() {
  const router = useRouter();
  const [items, setItems] = useState<RestockRequest[] | null>(null);
  const [filter, setFilter] = useState<Filter>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    fetch("/api/admin/restock-requests")
      .then(async (res) => {
        if (res.status === 401) {
          router.refresh();
          return;
        }
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled && Array.isArray(data.requests)) {
          setItems(data.requests);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load restock requests");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => load(), [load]);

  const filtered = useMemo(() => {
    if (!items) return [];
    return filter === "all" ? items : items.filter((r) => r.status === filter);
  }, [items, filter]);

  const pendingCount = useMemo(() => (items ? items.filter((r) => r.status === "pending").length : 0), [items]);

  async function markNotified(r: RestockRequest) {
    setBusyId(r.id);
    setError(null);
    const res = await fetch(`/api/admin/restock-requests?id=${r.id}`, { method: "PATCH" }).catch(() => null);
    if (res?.ok) {
      const { request } = await res.json();
      setItems((prev) => (prev ? prev.map((x) => (x.id === request.id ? request : x)) : prev));
    } else {
      setError("Could not mark as notified");
    }
    setBusyId(null);
  }

  async function remove(r: RestockRequest) {
    if (!window.confirm(`Delete the restock request from ${r.email}?`)) return;
    setError(null);
    const res = await fetch(`/api/admin/restock-requests?id=${r.id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      setItems((prev) => (prev ? prev.filter((x) => x.id !== r.id) : prev));
    } else {
      setError("Could not delete the request");
    }
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: "pending", label: `Pending (${pendingCount})` },
    { key: "notified", label: "Notified" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Restock alerts</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Customers waiting to be told an out-of-stock product is available again.
        </p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${
              filter === t.key ? "bg-indigo-600 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {items === null ? (
        <div className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-white" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-14 text-center">
          <span className="text-4xl">🔔</span>
          <p className="mt-3 text-sm font-bold text-gray-900">
            {filter === "pending" ? "No pending restock requests" : "Nothing here"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {filter === "pending"
              ? "When a customer asks to be notified about an out-of-stock product, it appears here."
              : "Change the filter above to see other requests."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <ul className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-6">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {r.email}
                    <a
                      href={`/product/${r.productSlug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      {r.productName}
                    </a>
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(r.requestedAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${STATUS_CLASS[r.status]}`}>
                  {r.status}
                </span>
                <div className="flex items-center gap-1.5">
                  {r.status === "pending" && (
                    <button
                      onClick={() => markNotified(r)}
                      disabled={busyId === r.id}
                      className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                    >
                      {busyId === r.id ? "Saving…" : "Mark notified"}
                    </button>
                  )}
                  <button
                    onClick={() => remove(r)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-500 transition hover:border-red-200 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
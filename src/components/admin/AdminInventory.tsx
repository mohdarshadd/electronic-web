"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { formatINR, calcDiscount } from "@/lib/format";

interface Draft {
  price: string;
  mrp: string;
  stock: string;
  inStock: boolean;
}

function draftsFrom(items: Product[]): Record<string, Draft> {
  const out: Record<string, Draft> = {};
  for (const p of items) {
    out[p.id] = { price: String(p.price), mrp: String(p.mrp), stock: String(p.stock), inStock: p.inStock };
  }
  return out;
}

export default function AdminInventory() {
  const router = useRouter();
  const [items, setItems] = useState<Product[] | null>(null);
  const [overridesOnly, setOverridesOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(() => {
    let cancelled = false;
    fetch(`/api/admin/inventory${overridesOnly ? "?overridesOnly=1" : ""}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.refresh();
          return;
        }
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled) {
          setItems(data.inventory);
          setDrafts(draftsFrom(data.inventory));
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load inventory");
      });
    return () => {
      cancelled = true;
    };
  }, [router, overridesOnly]);

  useEffect(() => load(), [load, reloadKey]);
  const reload = useCallback(() => {
    setError(null);
    setDrafts({});
    setReloadKey((k) => k + 1);
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    return q
      ? items.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      : items;
  }, [items, search]);

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

  if (!items) {
    return <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-white" />;
  }

  function setDraft(id: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { price: "", mrp: "", stock: "", inStock: true }), ...patch } }));
  }

  async function save(p: Product) {
    const d = drafts[p.id];
    if (!d) return;
    setBusyId(p.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inventory/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: d.price.trim() === "" ? undefined : Number(d.price),
          mrp: d.mrp.trim() === "" ? undefined : Number(d.mrp),
          stock: d.stock.trim() === "" ? undefined : Number(d.stock),
          inStock: d.inStock,
        }),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Save failed");
      }
      const data = await res.json();
      setItems((prev) => (prev ? prev.map((x) => (x.id === p.id ? data.product : x)) : prev));
      setSavedId(p.id);
      setTimeout(() => setSavedId(null), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusyId(null);
    }
  }

  function reset(p: Product) {
    setDraft(p.id, { price: String(p.price), mrp: String(p.mrp), stock: String(p.stock), inStock: p.inStock });
  }

  const inputCls =
    "w-24 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-right text-sm font-semibold text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
  const toggleCls =
    "relative inline-flex h-5 w-9 items-center rounded-full transition";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Inventory</h1>
          <p className="mt-0.5 text-sm text-gray-500">{items.length} products · prices in ₹ (paise)</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU…"
            className="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
          <button
            onClick={reload}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
          <span>Product catalogue</span>
          <label className="flex cursor-pointer items-center gap-2 normal-case tracking-normal">
            <input
              type="checkbox"
              checked={overridesOnly}
              onChange={(e) => {
                setOverridesOnly(e.target.checked);
                setSearch("");
              }}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Only overridden
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-gray-400">No products {overridesOnly ? "with overrides yet — edit a value below to create one." : "match."}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((p) => {
              const d = drafts[p.id] ?? { price: String(p.price), mrp: String(p.mrp), stock: String(p.stock), inStock: p.inStock };
              const dirty =
                d.price !== String(p.price) || d.mrp !== String(p.mrp) || d.stock !== String(p.stock) || d.inStock !== p.inStock;
              const lowStock = p.stock <= 10;
              const discount = calcDiscount(p.price, p.mrp);
              return (
                <li key={p.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gray-100 text-base">{p.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.sku} · {p.categorySlug}
                        {lowStock && <span className="ml-2 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">low stock</span>}
                        {p.stock === 0 && <span className="ml-2 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700">out of stock</span>}
                      </p>
                      <p className="text-xs text-gray-400">
                        base {formatINR(p.price)} · MRP {formatINR(p.mrp)} · {discount}% off
                      </p>
                    </div>

                    <div className="flex items-end gap-2">
                      <label className="text-center">
                        <span className="block text-[10px] font-bold uppercase text-gray-400">Price ₹</span>
                        <input value={d.price} onChange={(e) => setDraft(p.id, { price: e.target.value })} className={inputCls} inputMode="decimal" />
                      </label>
                      <label className="text-center">
                        <span className="block text-[10px] font-bold uppercase text-gray-400">MRP ₹</span>
                        <input value={d.mrp} onChange={(e) => setDraft(p.id, { mrp: e.target.value })} className={inputCls} inputMode="decimal" />
                      </label>
                      <label className="text-center">
                        <span className="block text-[10px] font-bold uppercase text-gray-400">Stock</span>
                        <input value={d.stock} onChange={(e) => setDraft(p.id, { stock: e.target.value })} className={inputCls} inputMode="numeric" />
                      </label>
                      <label className="flex flex-col items-center gap-1">
                        <span className="block text-[10px] font-bold uppercase text-gray-400">Active</span>
                        <button
                          type="button"
                          onClick={() => setDraft(p.id, { inStock: !d.inStock })}
                          className={`${toggleCls} ${d.inStock ? "bg-emerald-500" : "bg-gray-300"} ${busyId === p.id ? "cursor-wait" : "cursor-pointer"}`}
                          aria-label={`Toggle availability for ${p.name}`}
                        >
                          <span className={`h-4 w-4 transform rounded-full bg-white shadow transition ${d.inStock ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      {savedId === p.id && <span className="text-xs font-bold text-emerald-600">Saved ✓</span>}
                      {dirty && (
                        <>
                          <button
                            onClick={() => save(p)}
                            disabled={busyId === p.id}
                            className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {busyId === p.id ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={() => reset(p)}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                          >
                            Reset
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatINR } from "@/lib/format";

interface Settings {
  announcementEnabled: boolean;
  announcement: string;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  shippingFee: number;
  coupons: Record<string, { name: string; pct: number; enabled: boolean }>;
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(() => {
    let cancelled = false;
    fetch("/api/admin/settings")
      .then(async (res) => {
        if (res.status === 401) {
          router.refresh();
          return;
        }
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled) setSettings(data.settings);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load settings");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => load(), [load, reloadKey]);

  async function save() {
    if (!settings || busy) return;
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) throw new Error("save failed");
      const data = await res.json();
      setSettings(data.settings);
      setNotice("Settings saved — the store reflects them immediately.");
    } catch {
      setError("Could not save settings");
    } finally {
      setBusy(false);
    }
  }

  function patch(p: Partial<Settings>) {
    setSettings((prev) => (prev ? { ...prev, ...p } : prev));
  }

  function patchCoupon(code: string, enabled: boolean) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            coupons: { ...prev.coupons, [code]: { ...prev.coupons[code], enabled } },
          }
        : prev
    );
  }

  if (error && !settings) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setReloadKey((k) => k + 1);
          }}
          className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!settings) {
    return <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-white" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Settings</h1>
          <p className="mt-0.5 text-sm text-gray-500">Storefront configuration live from the admin panel.</p>
        </div>
        <button
          onClick={save}
          disabled={busy}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>

      {notice && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Announcement bar</h2>
        <div className="mt-3 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={settings.announcementEnabled}
              onChange={(e) => patch({ announcementEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Show announcement on every page
          </label>
        </div>
        <textarea
          value={settings.announcement}
          onChange={(e) => patch({ announcement: e.target.value })}
          rows={2}
          className={`${inputCls} mt-3 disabled:opacity-50`}
          disabled={!settings.announcementEnabled}
        />
        <p className="mt-2 text-xs text-gray-400">Shown in the dark strip at the top of the header.</p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Shipping</h2>
        <div className="mt-3 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={settings.freeShippingEnabled}
              onChange={(e) => patch({ freeShippingEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Free shipping above threshold
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wide text-gray-400">
              Free shipping threshold (₹, in full rupees)
            </span>
            <input
              type="number"
              min={0}
              value={Math.round(settings.freeShippingThreshold / 100)}
              onChange={(e) => patch({ freeShippingThreshold: Math.max(0, Number(e.target.value) * 100) })}
              className={`${inputCls} mt-1.5`}
              disabled={!settings.freeShippingEnabled}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wide text-gray-400">Shipping fee (₹)</span>
            <input
              type="number"
              min={0}
              value={Math.round(settings.shippingFee / 100)}
              onChange={(e) => patch({ shippingFee: Math.max(0, Number(e.target.value) * 100) })}
              className={`${inputCls} mt-1.5`}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Current config: {settings.freeShippingEnabled ? `free above ${formatINR(settings.freeShippingThreshold)}` : "free shipping disabled"} · fee{" "}
          {formatINR(settings.shippingFee)}.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Coupons</h2>
        <ul className="mt-3 divide-y divide-gray-100">
          {Object.entries(settings.coupons).map(([code, c]) => (
            <li key={code} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {code} <span className="ml-1 font-semibold text-gray-400">· {c.name} · {c.pct}% off</span>
                </p>
              </div>
              <button
                onClick={() => patchCoupon(code, !c.enabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${c.enabled ? "bg-emerald-500" : "bg-gray-300"}`}
                aria-label={`Toggle ${code}`}
              >
                <span className={`h-4 w-4 transform rounded-full bg-white shadow transition ${c.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-gray-400">
          Disabled coupons are rejected at checkout and hidden from the storefront.
        </p>
      </section>
    </div>
  );
}
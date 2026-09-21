"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product, Spec } from "@/lib/types";
import { categories } from "@/lib/products";
import { EMOJI_OPTIONS, HUE_OPTIONS } from "@/lib/product-visual";
import { formatINR, calcDiscount } from "@/lib/format";

interface FormState {
  name: string;
  slug: string;
  slugTouched: boolean;
  sku: string;
  brand: string;
  categorySlug: string;
  price: string;
  mrp: string;
  stock: string;
  rating: string;
  reviewCount: string;
  featured: boolean;
  isNew: boolean;
  webOnly: boolean;
  onlineOnly: boolean;
  description: string;
  highlights: string;
  tags: string;
  specs: Spec[];
  imageHue: string;
  emoji: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "");
}

function emptyForm(): FormState {
  return {
    name: "",
    slug: "",
    slugTouched: false,
    sku: "",
    brand: "",
    categorySlug: categories[0]?.slug ?? "sensor-modules",
    price: "",
    mrp: "",
    stock: "",
    rating: "4.5",
    reviewCount: "0",
    featured: false,
    isNew: true,
    webOnly: false,
    onlineOnly: false,
    description: "",
    highlights: "",
    tags: "",
    specs: [{ label: "", value: "" }],
    imageHue: "from-teal-400 to-emerald-600",
    emoji: "📦",
  };
}

function formFromProduct(p: Product): FormState {
  return {
    name: p.name,
    slug: p.slug,
    slugTouched: true,
    sku: p.sku,
    brand: p.brand,
    categorySlug: p.categorySlug,
    price: (p.price / 100).toString(),
    mrp: (p.mrp / 100).toString(),
    stock: String(p.stock),
    rating: String(p.rating),
    reviewCount: String(p.reviewCount),
    featured: Boolean(p.featured),
    isNew: Boolean(p.isNew),
    webOnly: Boolean(p.webOnly),
    onlineOnly: Boolean(p.onlineOnly),
    description: p.description,
    highlights: p.highlights.join(", "),
    tags: p.tags.join(", "),
    specs: p.specs.length ? p.specs : [{ label: "", value: "" }],
    imageHue: p.imageHue,
    emoji: p.emoji || "📦",
  };
}

export default function AdminProducts() {
  const router = useRouter();
  const [items, setItems] = useState<Product[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    fetch("/api/admin/products")
      .then(async (res) => {
        if (res.status === 401) {
          router.refresh();
          return;
        }
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled && Array.isArray(data.products)) {
          setItems(data.products);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load products");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => load(), [load]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: prev.slugTouched ? prev.slug : slugify(value),
    }));
  }

  const preview = useMemo(() => ({ emoji: form.emoji, hue: form.imageHue, name: form.name }), [form.emoji, form.imageHue, form.name]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
    setNotice(null);
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm(formFromProduct(p));
    setError(null);
    setNotice(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    const price = Math.round((Number(form.price) || 0) * 100);
    const mrp = Math.round((Number(form.mrp) || 0) * 100);
    const stock = Math.round(Number(form.stock) || 0);
    const rating = Number(form.rating);
    const reviewCount = Math.round(Number(form.reviewCount) || 0);
    const slug = slugify(form.slug) || slugify(form.name);

    const payload = {
      name: form.name,
      slug,
      sku: form.sku,
      brand: form.brand,
      categorySlug: form.categorySlug,
      price,
      mrp,
      stock,
      rating,
      reviewCount,
      featured: form.featured,
      isNew: form.isNew,
      webOnly: form.webOnly,
      onlineOnly: form.onlineOnly,
      description: form.description,
      highlights: form.highlights.split(",").map((h) => h.trim()).filter(Boolean),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      specs: form.specs.filter((s) => s.label.trim() && s.value.trim()),
      imageHue: form.imageHue,
      emoji: form.emoji,
    };

    try {
      const res = editingId
        ? await fetch(`/api/admin/products/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save product");
        return;
      }
      setNotice(editingId ? "Product updated." : `"${data.product?.name ?? form.name}" added to the catalogue.`);
      closeForm();
      load();
    } catch {
      setError("Could not reach the server");
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: Product) {
    if (!window.confirm(`Delete "${p.name}"? This removes it from the store.`)) return;
    setError(null);
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      load();
    } else {
      setError("Could not delete the product");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400";
  const labelClass = "text-xs font-bold uppercase tracking-wide text-gray-400";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add new items to the VoltCart catalogue — with image, pricing, specs and badges. They go live on the store immediately.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Add product
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</div>
      )}

      {items === null ? (
        <p className="py-12 text-center text-sm text-gray-400">Loading products…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <span className="text-5xl">📦</span>
          <p className="mt-4 text-base font-bold text-gray-900">No custom products yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Click “Add product” to publish your first item — image, price, specs and all.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <ul className="divide-y divide-gray-100">
            {items.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3.5 sm:px-6">
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${p.imageHue} text-2xl shadow-sm`}>
                  {p.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {p.name}
                    {p.featured && <span className="ml-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">Featured</span>}
                    {p.isNew && <span className="ml-1.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">New</span>}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {p.sku} · {p.brand} · {categories.find((c) => c.slug === p.categorySlug)?.name ?? p.categorySlug} · <span className="text-gray-500">/product/{p.slug}</span>
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-extrabold text-gray-900">{formatINR(p.price)}</p>
                  <p className="text-xs text-gray-400 line-through">{formatINR(p.mrp)}</p>
                </div>
                <span
                  className={`hidden rounded-md px-2 py-1 text-[11px] font-bold md:inline ${
                    p.inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {p.inStock ? `${p.stock} in stock` : "Out of stock"}
                </span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`/product/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-50 hover:text-indigo-600"
                    title="View in store"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" /></svg>
                  </a>
                  <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-50 hover:text-indigo-600" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  </button>
                  <button onClick={() => remove(p)} className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 9 13H8L7 7" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label={editingId ? "Edit product" : "Add product"}>
          <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-gray-900">{editingId ? "Edit product" : "Add a new product"}</h2>
              <button type="button" onClick={closeForm} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            {/* Image */}
            <section className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Product image</p>
              <div className="mt-4 flex flex-wrap items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className={`grid aspect-square w-40 place-items-center rounded-2xl bg-gradient-to-br ${preview.hue} shadow`}>
                    <span className="text-6xl drop-shadow">{preview.emoji}</span>
                  </div>
                  <p className="max-w-[10rem] truncate text-center text-xs font-semibold text-gray-500">{preview.name || "Product name"}</p>
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Emoji</p>
                    <div className="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-6">
                      {EMOJI_OPTIONS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => set("emoji", em)}
                          className={`grid h-10 w-10 place-items-center rounded-xl border text-lg transition ${
                            form.emoji === em ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200" : "border-gray-200 bg-white hover:border-indigo-300"
                          }`}
                          aria-label={`Use ${em}`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Colours</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {HUE_OPTIONS.map((hue) => (
                        <button
                          key={hue}
                          type="button"
                          onClick={() => set("imageHue", hue)}
                          className={`h-8 w-8 rounded-full bg-gradient-to-br ${hue} transition ${
                            form.imageHue === hue ? "ring-2 ring-indigo-500 ring-offset-2" : "hover:scale-110"
                          }`}
                          aria-label={`Use ${hue}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] leading-5 text-gray-400">
                    An on-brand image is generated automatically from the emoji + colours and used across the store, cart and orders.
                  </p>
                </div>
              </div>
            </section>

            {/* Identity */}
            <section className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className={labelClass}>Name *</span>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="e.g. SG90 TowerPro Micro Servo"
                  required
                />
              </label>
              <label className="space-y-1.5">
                <span className={labelClass}>URL slug</span>
                <input
                  className={inputClass}
                  value={form.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                  onFocus={() => set("slugTouched", true)}
                  placeholder="auto-generated from name"
                />
              </label>
              <label className="space-y-1.5">
                <span className={labelClass}>SKU *</span>
                <input className={inputClass} value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. MOT-SRV-SG90" required />
              </label>
              <label className="space-y-1.5">
                <span className={labelClass}>Brand *</span>
                <input className={inputClass} value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. TowerPro" required />
              </label>
              <label className="space-y-1.5">
                <span className={labelClass}>Category *</span>
                <select className={inputClass} value={form.categorySlug} onChange={(e) => set("categorySlug", e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </label>
            </section>

            {/* Pricing & stock */}
            <section className="grid gap-4 sm:grid-cols-4">
              <label className="space-y-1.5">
                <span className={labelClass}>Price (₹) *</span>
                <input className={inputClass} type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="249" required />
              </label>
              <label className="space-y-1.5">
                <span className={labelClass}>MRP (₹) *</span>
                <input className={inputClass} type="number" min="0" step="0.01" value={form.mrp} onChange={(e) => set("mrp", e.target.value)} placeholder="399" required />
              </label>
              <label className="space-y-1.5">
                <span className={labelClass}>Stock *</span>
                <input className={inputClass} type="number" min="0" step="1" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="50" required />
              </label>
              <label className="space-y-1.5">
                <span className={labelClass}>Rating</span>
                <input className={inputClass} type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)} />
              </label>
            </section>

            {(() => {
              const pricePaise = Math.round((Number(form.price) || 0) * 100);
              const mrpPaise = Math.round((Number(form.mrp) || 0) * 100);
              const disc = calcDiscount(pricePaise, mrpPaise);
              return (
                <p className="text-sm text-gray-500">
                  Sell price <span className="font-bold text-gray-900">{formatINR(pricePaise)}</span>
                  {mrpPaise > pricePaise && (
                    <>
                      {" "}· MRP <span className="text-gray-400 line-through">{formatINR(mrpPaise)}</span>
                      {" "}· <span className="font-semibold text-emerald-600">{disc}% off</span>
                    </>
                  )}
                </p>
              );
            })()}

            {/* Badges */}
            <section className="flex flex-wrap gap-2">
              {(
                [
                  { key: "featured", label: "Featured" },
                  { key: "isNew", label: "New arrival" },
                  { key: "webOnly", label: "Web only" },
                  { key: "onlineOnly", label: "Online only" },
                ] as const
              ).map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => set(b.key, !form[b.key])}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    form[b.key] ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-500 hover:border-indigo-300"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </section>

            {/* Description */}
            <section className="space-y-1.5">
              <span className={labelClass}>Description *</span>
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What is it, who is it for, and what does it do?"
                required
              />
            </section>

            {/* Highlights */}
            <section className="space-y-1.5">
              <span className={labelClass}>Highlights (comma separated)</span>
              <input
                className={inputClass}
                value={form.highlights}
                onChange={(e) => set("highlights", e.target.value)}
                placeholder="e.g. 9g, 1.8kg-cm torque, PWM control"
              />
            </section>

            {/* Tags */}
            <section className="space-y-1.5">
              <span className={labelClass}>Tags (comma separated, used in search)</span>
              <input className={inputClass} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="e.g. servo, sg90, robot arm" />
            </section>

            {/* Specs */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={labelClass}>Specifications</span>
                <button
                  type="button"
                  onClick={() => set("specs", [...form.specs, { label: "", value: "" }])}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  + Add row
                </button>
              </div>
              {form.specs.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    value={s.label}
                    onChange={(e) => {
                      const next = [...form.specs];
                      next[i] = { ...next[i], label: e.target.value };
                      set("specs", next);
                    }}
                    placeholder="Label (e.g. Torque)"
                  />
                  <input
                    className={inputClass}
                    value={s.value}
                    onChange={(e) => {
                      const next = [...form.specs];
                      next[i] = { ...next[i], value: e.target.value };
                      set("specs", next);
                    }}
                    placeholder="Value (e.g. 1.8 kg-cm)"
                  />
                  <button
                    type="button"
                    onClick={() => set("specs", form.specs.filter((_, j) => j !== i))}
                    className="shrink-0 rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove spec row"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </section>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-5">
              <button type="button" onClick={closeForm} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {busy ? "Saving…" : editingId ? "Save changes" : "Add product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
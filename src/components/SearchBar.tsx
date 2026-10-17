"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatINR } from "@/lib/format";

interface SuggestionProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  inStock: boolean;
  emoji: string;
  imageHue: string;
  image: "jpg" | "webp" | null;
  categorySlug: string;
}

interface SuggestionCategory {
  slug: string;
  name: string;
  emoji: string;
}

interface SuggestionsData {
  query: string;
  products: SuggestionProduct[];
  categories: SuggestionCategory[];
  brands: string[];
}

function Highlight({ text, q }: { text: string; q: string }) {
  const needle = q.trim().toLowerCase();
  if (!needle) return <>{text}</>;
  const i = text.toLowerCase().indexOf(needle);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-bold text-coral-700">{text.slice(i, i + needle.length)}</span>
      {text.slice(i + needle.length)}
    </>
  );
}

export function SearchBar({ onNavigate }: { onNavigate?: () => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    if (!term) return;
    debounceRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error("suggestions failed");
        const data = await res.json();
        if (!ctrl.signal.aborted) {
          setSuggestions(data);
          setPending(false);
        }
      } catch {
        if (!ctrl.signal.aborted) {
          setSuggestions(null);
          setPending(false);
        }
      }
    }, 160);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [q]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onNavigate?.();
  }

  function go(href: string) {
    setOpen(false);
    router.push(href);
    onNavigate?.();
  }

  const term = q.trim();
  const show = open && term.length > 0;

  return (
    <div
      className="relative flex-1 max-w-2xl"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <form onSubmit={submit} className="relative">
        <input
          value={q}
          onChange={(e) => {
            const value = e.target.value;
            setQ(value);
            if (value.trim()) {
              setPending(true);
            } else {
              setPending(false);
              setSuggestions(null);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setOpen(false);
            }
          }}
          placeholder="Search sensors, boards, kits… (try “esp32”)"
          className="w-full rounded-full border border-white/20 bg-white py-2.5 pl-4 pr-11 text-sm text-navy-900 placeholder-navy-400 outline-none transition focus:border-coral-400 focus:bg-white focus:shadow-soft focus:ring-4 focus:ring-coral-500/15"
          aria-label="Search products"
          autoComplete="off"
          role="combobox"
          aria-expanded={show}
          aria-controls="search-suggestions"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-coral-500 p-2 text-navy-950 shadow-sm shadow-coral-500/30 transition hover:bg-coral-400 active:scale-95"
          aria-label="Search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </form>

      {show && (
        <div
          id="search-suggestions"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-lift ring-1 ring-navy-900/5"
        >
          <div
            className={`max-h-[60vh] overflow-y-auto overscroll-contain p-2 transition-opacity duration-150 ${pending ? "opacity-60" : "opacity-100"}`}
            aria-busy={pending}
          >
            {suggestions === null && pending && (
              <p className="px-3 py-2.5 text-sm text-navy-400">Searching…</p>
            )}

            {suggestions !== null && suggestions.products.length === 0 && suggestions.brands.length === 0 && suggestions.categories.length === 0 && (
              <p className="px-3 py-2.5 text-sm text-navy-400">
                No matches for “<span className="font-semibold text-navy-600">{term}</span>”.
              </p>
            )}

            {suggestions !== null && suggestions.products.length > 0 && (
              <div>
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-navy-400">Products</p>
                <ul className="space-y-0.5">
                  {suggestions.products.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={() => go(`/product/${p.slug}`)}
                        className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-cream-100"
                      >
                        {p.image === "jpg" || p.image === "webp" ? (
                          // eslint-disable-next-line @next/next/no-img-element -- product photos are plain <img> by design
                          <img
                            src={p.image === "jpg" ? `/api/product-images/${p.slug}` : `/products/${p.slug}.webp`}
                            alt=""
                            width={36}
                            height={36}
                            decoding="async"
                            className="h-9 w-9 shrink-0 rounded-lg bg-cream-100 object-contain"
                          />
                        ) : (
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${p.imageHue} text-base`}>
                            {p.emoji}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-navy-900">
                            <Highlight text={p.name} q={term} />
                          </span>
                          <span className="block truncate text-xs text-navy-400">{p.brand}</span>
                        </span>
                        <span className={`text-sm font-bold ${p.inStock ? "text-navy-900" : "text-navy-400"}`}>{formatINR(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions !== null && suggestions.brands.length > 0 && (
              <div>
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-navy-400">Brands</p>
                <ul className="flex flex-wrap gap-1.5 px-2.5 pb-0.5">
                  {suggestions.brands.map((b) => (
                    <li key={b}>
                      <Link
                        href={`/search?q=${encodeURIComponent(b)}`}
                        onClick={() => go(`/search?q=${encodeURIComponent(b)}`)}
                        className="inline-block rounded-full border border-navy-200 px-3 py-1 text-xs font-semibold text-navy-600 transition hover:border-coral-300 hover:text-coral-700"
                      >
                        <Highlight text={b} q={term} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions !== null && suggestions.categories.length > 0 && (
              <div>
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-navy-400">Categories</p>
                <ul className="space-y-0.5">
                  {suggestions.categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/category/${c.slug}`}
                        onClick={() => go(`/category/${c.slug}`)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-navy-700 transition hover:bg-cream-100"
                      >
                        <span>{c.emoji}</span>
                        <Highlight text={c.name} q={term} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions !== null && (
              <Link
                href={`/search?q=${encodeURIComponent(term)}`}
                onClick={() => go(`/search?q=${encodeURIComponent(term)}`)}
                className="mt-1 block border-t border-navy-100 px-3 py-2.5 text-sm font-semibold text-coral-700 transition hover:bg-coral-50"
              >
                See all results for “<Highlight text={term} q={term} />”
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
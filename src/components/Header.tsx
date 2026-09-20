"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { site } from "@/lib/site";
import { categories } from "@/lib/products";
import { useCart } from "@/context/CartContext";

function SearchBar({ onNavigate }: { onNavigate?: () => void }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  function submit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onNavigate?.();
  }

  return (
    <form onSubmit={submit} className="relative flex-1 max-w-2xl">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search sensors, boards, kits… (try “esp32”)"
        className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        aria-label="Search products"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-indigo-600 p-2 text-white transition hover:bg-indigo-700"
        aria-label="Search"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}

export default function Header() {
  const { count, openCart } = useCart();
  const [mobileNav, setMobileNav] = useState(false);
  const [announcement, setAnnouncement] = useState(site.announcement);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site/settings")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          const s = data.settings;
          if (s?.announcementEnabled && typeof s.announcement === "string") setAnnouncement(s.announcement);
        }
      })
      .catch(() => {
        // keep the default announcement
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="bg-indigo-950 px-4 py-2 text-center text-xs font-medium text-indigo-100">
        <span className="inline-flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.6 6.9L22 11l-7.4 2.1L12 20l-2.6-6.9L2 11l7.4-2.1L12 2z" />
          </svg>
          {announcement}
        </span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileNav((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileNav ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={site.name}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2 3.5 13.5H11L9.5 22 19 10.5H11.5L13 2z" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">
            Volt<span className="text-indigo-600">Cart</span>
          </span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Link href="/shop" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900">
            All Products
          </Link>
          <Link href="/student-offers" className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>🎓</span> Student Offers
            </span>
          </Link>
        </nav>

        <button
          onClick={openCart}
          className="relative rounded-xl border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
          aria-label="Open cart"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1.6" />
            <circle cx="19" cy="21" r="1.6" />
            <path d="M2.5 3h2l2.4 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L22 7H6" />
          </svg>
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-indigo-600 px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </div>

      <div className="hidden border-t border-gray-100 lg:block">
        <nav className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {categories.slice(0, 8).map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="shrink-0 rounded-md px-2 py-1 text-[13px] font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <span className="mr-1.5">{c.emoji}</span>
              {c.name}
            </Link>
          ))}
          <Link href="/shop" className="shrink-0 px-2 py-1 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700">
            View all →
          </Link>
        </nav>
      </div>

      {mobileNav && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          <div className="mb-3 md:hidden">
            <SearchBar onNavigate={() => setMobileNav(false)} />
          </div>
          <div className="grid grid-cols-1 gap-1">
            <Link href="/shop" onClick={() => setMobileNav(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100">
              All Products
            </Link>
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={() => setMobileNav(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span className="mr-2">{c.emoji}</span>
                {c.name}
              </Link>
            ))}
            <Link href="/student-offers" onClick={() => setMobileNav(false)} className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              🎓 Student Offers
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
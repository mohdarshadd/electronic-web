"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { categories } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { SearchBar } from "./SearchBar";

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
    <>
      <div className="bg-indigo-950 px-4 py-2 text-center text-xs font-medium text-indigo-100">
        <span className="inline-flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.6 6.9L22 11l-7.4 2.1L12 20l-2.6-6.9L2 11l7.4-2.1L12 2z" />
          </svg>
          {announcement}
        </span>
      </div>

      <header className="sticky top-3 z-40 px-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center gap-3 rounded-full border border-white/40 bg-gradient-to-b from-white/80 to-white/50 px-3 py-2 shadow-lg shadow-indigo-950/5 ring-1 ring-black/5 backdrop-blur-xl transition-shadow hover:shadow-xl hover:shadow-indigo-950/10 sm:px-5">
        <button
          className="rounded-full p-2 text-gray-600 transition hover:bg-white/80 lg:hidden"
          onClick={() => setMobileNav((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileNav ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={site.name}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-white/60">
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

        <nav className="ml-auto hidden items-center gap-1.5 lg:flex">
          <Link href="/shop" className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/80 hover:text-gray-900">
            All Products
          </Link>
          <Link href="/student-offers" className="rounded-full border border-emerald-200/70 bg-emerald-100/50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100/80">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>🎓</span> Student Offers
            </span>
          </Link>
        </nav>

        <button
          onClick={openCart}
          className="relative shrink-0 rounded-full border border-white/60 bg-white/70 p-2.5 text-gray-700 shadow-sm shadow-indigo-950/5 transition hover:border-indigo-300 hover:bg-white hover:text-indigo-600"
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

      <div className="mt-3 hidden lg:block">
        <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto overscroll-x-contain rounded-full border border-white/40 bg-gradient-to-b from-white/60 to-white/30 px-4 py-1.5 shadow-lg shadow-indigo-950/5 ring-1 ring-black/5 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.slice(0, 8).map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium text-gray-600 transition hover:bg-white/80 hover:text-gray-900"
            >
              <span className="mr-1.5">{c.emoji}</span>
              {c.name}
            </Link>
          ))}
          <Link href="/shop" className="shrink-0 rounded-full bg-indigo-600/10 px-3 py-1.5 text-[13px] font-semibold text-indigo-700 transition hover:bg-indigo-600/20">
            View all →
          </Link>
        </nav>
      </div>

      {mobileNav && (
        <div className="mt-3 space-y-3 rounded-3xl border border-white/40 bg-white/70 p-4 shadow-xl shadow-indigo-950/10 ring-1 ring-black/5 backdrop-blur-xl lg:hidden">
          <div className="md:hidden">
            <SearchBar onNavigate={() => setMobileNav(false)} />
          </div>
          <div className="grid grid-cols-1 gap-1">
            <Link href="/shop" onClick={() => setMobileNav(false)} className="rounded-full px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-white/80">
              All Products
            </Link>
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={() => setMobileNav(false)}
                className="rounded-full px-3 py-2 text-sm text-gray-700 transition hover:bg-white/80"
              >
                <span className="mr-2">{c.emoji}</span>
                {c.name}
              </Link>
            ))}
            <Link href="/student-offers" onClick={() => setMobileNav(false)} className="rounded-full bg-emerald-100/60 px-3 py-2 text-sm font-semibold text-emerald-700">
              🎓 Student Offers
            </Link>
          </div>
        </div>
      )}
      </header>
    </>
  );
}
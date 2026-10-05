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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={`sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "shadow-lg shadow-gray-200/70" : "shadow-sm"
      }`}
    >
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
          className="rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-90 lg:hidden"
          onClick={() => setMobileNav((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="relative block h-[22px] w-[22px]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`absolute inset-0 transition-all duration-300 ${
                mobileNav ? "-rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`}
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`absolute inset-0 transition-all duration-300 ${
                mobileNav ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
              }`}
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
        </button>

        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={site.name}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2 3.5 13.5H11L9.5 22 19 10.5H11.5L13 2z" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-gray-900 transition-colors duration-200 group-hover:text-indigo-700">
            Volt<span className="text-indigo-600">Cart</span>
          </span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Link
            href="/shop"
            className="group relative rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2"
          >
            All Products
            <span
              aria-hidden
              className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-indigo-600 transition-transform duration-300 group-hover:scale-x-100"
            />
          </Link>
          <Link
            href="/student-offers"
            className="group relative rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 transition-colors duration-200 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5">
                🎓
              </span>
              Student Offers
            </span>
            <span
              aria-hidden
              className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-emerald-500 transition-transform duration-300 group-hover:scale-x-100"
            />
          </Link>
        </nav>

        <button
          onClick={openCart}
          className="group relative rounded-xl border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          aria-label="Open cart"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110"
          >
            <circle cx="9" cy="21" r="1.6" />
            <circle cx="19" cy="21" r="1.6" />
            <path d="M2.5 3h2l2.4 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L22 7H6" />
          </svg>
          {count > 0 && (
            <span
              key={count}
              className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 animate-[badge-pop_0.4s_ease-out] place-items-center rounded-full bg-indigo-600 px-1 text-[11px] font-bold text-white"
            >
              {count}
            </span>
          )}
        </button>
      </div>

      <div className="hidden border-t border-gray-100 lg:block">
        <nav className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {categories.slice(0, 6).map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group relative shrink-0 rounded-lg px-2 py-1 text-[13px] font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2"
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-left scale-x-0 rounded-lg bg-gray-100/80 transition-transform duration-200 group-hover:scale-x-100"
              />
              <span className="relative z-10">
                <span className="mr-1.5 inline-block transition-transform duration-200 group-hover:-translate-y-0.5">{c.emoji}</span>
                {c.name}
              </span>
            </Link>
          ))}
          <Link href="/shop" className="group shrink-0 rounded-lg px-2 py-1 text-[13px] font-semibold text-indigo-600 transition-colors duration-200 hover:text-indigo-700">
            <span className="relative z-10">
              View all{" "}
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        </nav>
      </div>

      {mobileNav && (
        <div className="animate-[menu-in_0.25s_ease-out] border-t border-gray-100 bg-white px-4 pb-4 pt-2 lg:hidden">
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
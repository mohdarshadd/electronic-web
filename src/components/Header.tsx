"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { categories } from "@/lib/products";
import { loadSiteSettings } from "@/lib/site-settings";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { useCart } from "@/context/CartContext";
import { SearchBar } from "./SearchBar";

export default function Header() {
  const { count, openCart } = useCart();
  const [mobileNav, setMobileNav] = useState(false);
  const [announcement, setAnnouncement] = useState(site.announcement);
  const [scrolled, setScrolled] = useState(false);
  const scrollFrame = useRef(0);

  useEffect(() => {
    const update = () => {
      scrollFrame.current = 0;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (scrollFrame.current) return;
      scrollFrame.current = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadSiteSettings().then((s) => {
      if (!cancelled && s?.announcementEnabled && typeof s.announcement === "string") {
        setAnnouncement(s.announcement);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mobileNav) return;
    const release = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNav(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      release();
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNav]);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-navy-900/20 bg-navy-900/95 transition-shadow duration-300 ${
        scrolled ? "shadow-soft" : "shadow-none"
      }`}
    >
      <div className="bg-gradient-to-r from-coral-600 via-coral-500 to-coral-400 px-4 py-1.5 text-center text-[11px] font-semibold tracking-wide text-navy-950">
        <span className="inline-flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-navy-900">
            <path d="M12 2l2.6 6.9L22 11l-7.4 2.1L12 20l-2.6-6.9L2 11l7.4-2.1L12 2z" />
          </svg>
          {announcement}
        </span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          className="rounded-lg p-2 text-cream-100/80 transition-colors duration-200 hover:bg-white/10 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 lg:hidden"
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
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral-500 text-navy-950 shadow-glow ring-1 ring-white/20 transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2 3.5 13.5H11L9.5 22 19 10.5H11.5L13 2z" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-cream-100 transition-colors duration-200 group-hover:text-cream-50">
            Volt<span className="text-coral-400">Cart</span>
          </span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Link
            href="/shop"
            className="group relative rounded-lg px-3 py-2 text-sm font-medium text-cream-100/75 transition-colors duration-200 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
          >
            All Products
            <span
              aria-hidden
              className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-coral-400 transition-transform duration-300 group-hover:scale-x-100"
            />
          </Link>
          <Link
            href="/student-offers"
            className="group relative rounded-lg px-3 py-2 text-sm font-medium text-coral-300 transition-colors duration-200 hover:text-coral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
          >
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5">
                🎓
              </span>
              Student Offers
            </span>
            <span
              aria-hidden
              className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-coral-500 transition-transform duration-300 group-hover:scale-x-100"
            />
          </Link>
        </nav>

        <button
          onClick={openCart}
          className="group relative rounded-xl border border-white/15 bg-white/5 p-2.5 text-cream-100 transition-colors duration-200 hover:border-coral-400/60 hover:bg-white/10 hover:text-coral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
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
              className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 animate-[badge-pop_0.4s_ease-out] place-items-center rounded-full bg-coral-500 px-1 text-[11px] font-bold text-navy-950 ring-2 ring-navy-900"
            >
              {count}
            </span>
          )}
        </button>
      </div>

      <div className="hidden border-t border-white/10 bg-navy-950/60 lg:block">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-1 gap-y-1 px-4 py-1.5 sm:px-6 lg:px-8">
          {categories.slice(0, 6).map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group relative shrink-0 rounded-full px-2.5 py-1.5 text-xs font-medium text-cream-100/60 transition-colors duration-200 hover:bg-white/10 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
            >
              <span className="relative z-10">
                <span className="mr-1.5 inline-block transition-transform duration-200 group-hover:-translate-y-0.5">{c.emoji}</span>
                {c.name}
              </span>
            </Link>
          ))}
          <Link href="/shop" className="group ml-auto shrink-0 rounded-full bg-coral-500/15 px-3 py-1.5 text-xs font-semibold text-coral-300 transition-colors duration-200 hover:bg-coral-500/25">
            <span className="relative z-10">
              View all{" "}
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        </nav>
      </div>

      {mobileNav && (
        <div className="animate-[menu-in_0.25s_ease-out] border-t border-white/10 bg-navy-900 px-4 pb-4 pt-2 lg:hidden">
          <div className="mb-3 md:hidden">
            <SearchBar onNavigate={() => setMobileNav(false)} />
          </div>
          <div className="grid grid-cols-1 gap-1">
            <Link href="/shop" onClick={() => setMobileNav(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-cream-100 hover:bg-white/10">
              All Products
            </Link>
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={() => setMobileNav(false)}
                className="rounded-lg px-3 py-2 text-sm text-cream-100/75 hover:bg-white/10"
              >
                <span className="mr-2">{c.emoji}</span>
                {c.name}
              </Link>
            ))}
            <Link href="/student-offers" onClick={() => setMobileNav(false)} className="rounded-lg bg-coral-500/15 px-3 py-2 text-sm font-semibold text-coral-300">
              🎓 Student Offers
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
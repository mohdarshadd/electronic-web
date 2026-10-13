import Link from "next/link";
import { getCategories } from "@/lib/products";
import { getCatalogFeatured, getCatalogNew } from "@/lib/catalog";
import { site } from "@/lib/site";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";

export default function HomePage() {
  const categories = getCategories();
  const featured = getCatalogFeatured();
  const fresh = getCatalogNew();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900 text-cream-100">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 8%, rgba(255,107,91,0.42) 0, transparent 42%), radial-gradient(circle at 88% 18%, rgba(80,100,142,0.5) 0, transparent 40%), radial-gradient(circle at 58% 96%, rgba(244,237,224,0.16) 0, transparent 48%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, #000 35%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, #000 35%, transparent 78%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-cream-100/20 bg-cream-100/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream-100/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-coral-400 shadow-[0_0_8px_rgba(255,107,91,0.9)]" />
              Built for students, makers & hackathons
            </p>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Your ideas.{" "}
              <span className="bg-gradient-to-r from-coral-300 via-coral-400 to-cream-200 bg-clip-text text-transparent">
                Our parts.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-cream-100/70 sm:text-lg">
              Sensors, boards, motors and robot kits — stocked for competitions, exhibitions and
              hackathons. Enjoy student pricing, fast delivery and UPI-friendly checkout built
              around how India&apos;s students actually build.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 rounded-xl bg-coral-500 px-6 py-3.5 text-sm font-bold text-navy-950 shadow-glow transition hover:-translate-y-0.5 hover:bg-coral-400"
              >
                Shop all products
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/student-offers"
                className="inline-flex items-center gap-2 rounded-xl border border-cream-100/20 bg-cream-100/5 px-6 py-3.5 text-sm font-bold text-cream-100 backdrop-blur transition hover:-translate-y-0.5 hover:border-coral-300/50 hover:bg-cream-100/10"
              >
                🎓 Student offers
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              {[
                { icon: "📦", label: "5000+ parts" },
                { icon: "🚚", label: "1–3 day delivery" },
                { icon: "🎓", label: "10% student off" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="inline-flex items-center gap-2 rounded-full border border-cream-100/10 bg-cream-100/5 px-3.5 py-1.5 backdrop-blur"
                >
                  <span className="text-base leading-none">{s.icon}</span>
                  <span className="text-xs font-medium text-cream-100/75">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating product chips */}
          <div className="relative hidden animate-fade-up lg:block" style={{ animationDelay: "120ms" }}>
            <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-gradient-to-tr from-coral-500/30 via-navy-500/10 to-cream-200/15 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {featured.slice(0, 2).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className={`group rounded-2xl border border-white/40 bg-white/95 p-3.5 shadow-lift ring-1 ring-navy-900/5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-glow ${
                    i % 2 ? "mt-10" : ""
                  }`}
                >
                  <div className="overflow-hidden rounded-xl">
                    <ProductImage product={p} className="h-32 w-full transition duration-300 group-hover:scale-105" />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-bold text-navy-900">{p.name}</p>
                  <p className="mt-1 text-sm font-extrabold text-coral-700">
                    ₹{(p.price / 100).toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>
            <div className="absolute -right-4 -top-6 rounded-2xl bg-coral-500 px-4 py-3 text-sm font-bold text-navy-950 shadow-lift ring-1 ring-white/30">
              Free shipping over ₹499
            </div>
            <div className="absolute -bottom-5 left-6 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-navy-900 shadow-lift ring-1 ring-navy-900/5">
              ⚡ Hackathon-ready kits
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-navy-900/10 bg-cream-100">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { icon: "⚡", title: "Same-day dispatch", desc: "Order before 4 PM, ships today" },
            { icon: "🛡️", title: "Tested & genuine", desc: "Quality-checked at 3 stages" },
            { icon: "👨‍🎓", title: "Student-first", desc: "Discounts on college IDs" },
            { icon: "🤝", title: "Live support", desc: "Real humans on chat & phone" },
          ].map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900/5 text-xl ring-1 ring-navy-900/5">{t.icon}</span>
              <div>
                <p className="text-sm font-bold text-navy-900">{t.title}</p>
                <p className="mt-0.5 text-xs text-navy-500">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">Shop by category</h2>
            <p className="mt-2 text-sm text-navy-500">Everything you need to build, prototype and compete.</p>
          </div>
          <Link href="/shop" className="hidden shrink-0 items-center gap-1 rounded-full border border-navy-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 shadow-soft transition hover:border-coral-300 hover:text-coral-700 sm:inline-flex">
            View all <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="border-y border-navy-900/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Bestsellers</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">Bestsellers for builders</h2>
              <p className="mt-2 text-sm text-navy-500">Most-loved parts among students & makers.</p>
            </div>
            <Link href="/shop" className="inline-flex shrink-0 items-center gap-1 rounded-full border border-navy-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 shadow-soft transition hover:border-coral-300 hover:text-coral-700">
              View all <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {featured.slice(0, 10).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* STUDENT BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-coral-600 via-coral-500 to-coral-400 px-6 py-12 text-navy-950 shadow-soft ring-1 ring-navy-900/10 sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage: "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.9) 0, transparent 40%)",
            }}
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-navy-900/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                🎓 Students save more
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Flat 10% off on your first build.
              </h2>
              <p className="mt-3 max-w-md text-navy-900/80">
                Verify your college ID, use code{" "}
                <code className="rounded bg-white/40 px-1.5 py-0.5 font-mono text-sm font-bold">STUDENT10</code>{" "}
                at checkout. Hackathon teams and college clubs get volume pricing too.
              </p>
              <Link
                href="/student-offers"
                className="mt-6 inline-block rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-cream-100 shadow-lift transition hover:-translate-y-0.5 hover:bg-navy-800"
              >
                Claim student discount
              </Link>
            </div>
            <div className="rounded-2xl bg-navy-900/10 p-6 backdrop-blur">
              <p className="text-sm font-semibold text-navy-900">How it works</p>
              <ol className="mt-4 space-y-3 text-sm text-navy-900/85">
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-white/40 text-xs font-bold">1</span>Sign in with your college email</li>
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-white/40 text-xs font-bold">2</span>Verify with student ID or {site.contactEmail}</li>
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-white/40 text-xs font-bold">3</span>Get STUDENT10 & team pricing</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* NEW MERCH */}
      <section className="border-t border-navy-900/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8">
            <p className="eyebrow">Fresh drops</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">Just in</h2>
            <p className="mt-2 text-sm text-navy-500">Fresh arrivals for your next project.</p>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {fresh.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
import Link from "next/link";
import { getCategories, getFeaturedProducts, getNewProducts } from "@/lib/products";
import { site } from "@/lib/site";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const categories = getCategories();
  const featured = getFeaturedProducts();
  const fresh = getNewProducts();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-indigo-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 10%, rgba(99,102,241,0.55) 0, transparent 40%), radial-gradient(circle at 85% 20%, rgba(16,185,129,0.35) 0, transparent 40%), radial-gradient(circle at 60% 90%, rgba(168,85,247,0.4) 0, transparent 45%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-100 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Built for students, makers & hackathons
            </p>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Your ideas.{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-amber-200 to-violet-300 bg-clip-text text-transparent">
                Our parts.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-indigo-100/80 sm:text-lg">
              Sensors, boards, motors and robot kits — stocked for competitions, exhibitions and
              hackathons. Enjoy student pricing, fast delivery and UPI-friendly checkout built
              around how India&apos;s students actually build.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-indigo-950 shadow-lg transition hover:bg-indigo-50"
              >
                Shop all products
              </Link>
              <Link
                href="/student-offers"
                className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                🎓 Student offers
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                { icon: "📦", label: "5000+ parts" },
                { icon: "🚚", label: "1–3 day delivery" },
                { icon: "🎓", label: "10% student off" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-xs font-medium text-indigo-100/80">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating product chips */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 2).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className={`rounded-2xl border border-white/10 bg-white p-4 shadow-2xl backdrop-blur transition hover:-translate-y-1 ${
                    i % 2 ? "mt-10" : ""
                  }`}
                >
                  <div className={`grid h-32 place-items-center rounded-xl bg-gradient-to-br ${p.imageHue}`}>
                    <span className="text-5xl drop-shadow">{p.emoji}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-bold text-gray-900">{p.name}</p>
                  <p className="mt-1 text-sm font-extrabold text-indigo-600">
                    ₹{(p.price / 100).toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>
            <div className="absolute -right-4 -top-6 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-xl">
              Free shipping over ₹499
            </div>
            <div className="absolute -bottom-5 left-6 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-xl">
              ⚡ Hackathon-ready kits
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { icon: "⚡", title: "Same-day dispatch", desc: "Order before 4 PM, ships today" },
            { icon: "🛡️", title: "Tested & genuine", desc: "Quality-checked at 3 stages" },
            { icon: "👨‍🎓", title: "Student-first", desc: "Discounts on college IDs" },
            { icon: "🤝", title: "Live support", desc: "Real humans on chat & phone" },
          ].map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-900">{t.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Shop by category</h2>
            <p className="mt-2 text-sm text-gray-500">Everything you need to build, prototype and compete.</p>
          </div>
          <Link href="/shop" className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:block">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Bestsellers for builders</h2>
              <p className="mt-2 text-sm text-gray-500">Most-loved parts among students & makers.</p>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View all →
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
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-12 text-white sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.9) 0, transparent 40%)",
            }}
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                🎓 Students save more
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Flat 10% off on your first build.
              </h2>
              <p className="mt-3 max-w-md text-emerald-50/90">
                Verify your college ID, use code{" "}
                <code className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-sm font-bold">STUDENT10</code>{" "}
                at checkout. Hackathon teams and college clubs get volume pricing too.
              </p>
              <Link
                href="/student-offers"
                className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
              >
                Claim student discount
              </Link>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
              <p className="text-sm font-semibold text-emerald-50">How it works</p>
              <ol className="mt-4 space-y-3 text-sm text-emerald-50/90">
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-white/20 text-xs font-bold">1</span>Sign in with your college email</li>
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-white/20 text-xs font-bold">2</span>Verify with student ID or {site.contactEmail}</li>
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-white/20 text-xs font-bold">3</span>Get STUDENT10 & team pricing</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* NEW MERCH */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Just in</h2>
            <p className="mt-2 text-sm text-gray-500">Fresh arrivals for your next project.</p>
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